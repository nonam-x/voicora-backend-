import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiArrowRightLine,
  RiCheckLine,
  RiLoader4Line,
  RiTimeLine,
  RiUserLine,
  RiLockLine,
  RiDashboardLine,
} from 'react-icons/ri'
import { pollApi, responseApi } from '../services/api'
import { getErrorMessage } from '../lib/errors'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import { connectSocket, joinPollRoom, leavePollRoom } from '../lib/socket'
import toast from 'react-hot-toast'

const barColors = ['#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#EC4899']

export default function PollResponse() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [pollData, setPollData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [liveResults, setLiveResults] = useState(null) // analytics data for live results view

  // ── Fetch poll data ──
  useEffect(() => {
    pollApi.getBySlug(slug)
      .then((res) => setPollData(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [slug])

  // ── Check if poll is expired (client-side) ──
  const isExpired = pollData?.expiresAt && new Date() > new Date(pollData.expiresAt)

  // ── Submit vote logic (reusable — called directly or after auth) ──
  const submitVote = useCallback(async () => {
    if (!pollData) return
    setSubmitting(true)
    setShowAuthModal(false)
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      }
      await responseApi.submit(pollData._id, payload)
      setSubmitted(true)

      // If showResultsAfterVoting, fetch analytics to show inline results
      if (pollData.showResultsAfterVoting) {
        try {
          // Re-fetch poll to get updated vote counts (public slug — no auth needed)
          const updatedPoll = await pollApi.getBySlug(slug)
          const poll = updatedPoll.data.data
          // Build analytics from poll data client-side
          const totalResponses = poll.totalResponses || 0
          const analyticsData = {
            totalResponses,
            questions: poll.questions.map((q) => {
              const totalVotes = q.options.reduce((sum, o) => sum + o.votes, 0)
              return {
                questionId: q._id,
                questionText: q.text,
                totalVotes,
                options: q.options.map((o) => ({
                  optionId: o._id,
                  optionText: o.text,
                  votes: o.votes,
                  percentage: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0,
                })),
              }
            }),
          }
          setLiveResults(analyticsData)
          setPollData(poll)
        } catch {
          // If we can't load results, still show thank-you
        }
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }, [pollData, answers, slug])

  // ── Socket.io for live result updates (only after voting, if showResults is on) ──
  useEffect(() => {
    if (!submitted || !pollData?.showResultsAfterVoting || !pollData?._id) return

    const socket = connectSocket()
    joinPollRoom(pollData._id)

    const handleVoteUpdate = async () => {
      try {
        const updatedPoll = await pollApi.getBySlug(slug)
        const poll = updatedPoll.data.data
        const totalResponses = poll.totalResponses || 0
        const analyticsData = {
          totalResponses,
          questions: poll.questions.map((q) => {
            const totalVotes = q.options.reduce((sum, o) => sum + o.votes, 0)
            return {
              questionId: q._id,
              questionText: q.text,
              totalVotes,
              options: q.options.map((o) => ({
                optionId: o._id,
                optionText: o.text,
                votes: o.votes,
                percentage: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0,
              })),
            }
          }),
        }
        setLiveResults(analyticsData)
        setPollData(poll)
      } catch {
        // silently fail
      }
    }

    socket.on('vote:update', handleVoteUpdate)

    return () => {
      socket.off('vote:update', handleVoteUpdate)
      leavePollRoom(pollData._id)
    }
  }, [submitted, pollData?._id, pollData?.showResultsAfterVoting, slug])

  // ── Handle "Next" / "Submit" click ──
  const handleNext = async () => {
    if (current < (pollData?.questions?.length || 0) - 1) {
      setCurrent(current + 1)
      return
    }

    // Last question — attempt submit
    // If poll requires auth and user is not logged in, show auth modal
    if (pollData.responseMode === 'authenticated' && !isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    await submitVote()
  }

  // ── After auth success callback — auto-submit the pending vote ──
  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Small delay to let the auth state propagate
    setTimeout(() => submitVote(), 100)
  }

  // ═══════════════════════════ RENDER STATES ═══════════════════════════

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RiLoader4Line className="w-6 h-6 text-accent-violet animate-spin" />
          <span className="text-[13px] text-text-faint">Loading poll...</span>
        </div>
      </div>
    )
  }

  // Error / Not found
  if (error || !pollData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Poll not found</h2>
          <p className="text-[14px] text-text-muted">{error || 'This poll may have been removed or the link is invalid.'}</p>
        </div>
      </div>
    )
  }

  // ── Expired poll ──
  if (isExpired) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-5">
            <RiTimeLine className="w-7 h-7 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Poll Expired</h2>
          <p className="text-[14px] text-text-muted mb-2">{pollData.title}</p>
          <p className="text-[13px] text-text-faint">
            This poll is no longer accepting responses.
          </p>
          {pollData.resultsPublished && (
            <a
              href={`/results/${pollData._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 text-[13px] font-medium text-bg-primary bg-text-primary rounded-lg hover:bg-text-secondary transition-colors"
            >
              View Results
              <RiArrowRightLine className="w-3.5 h-3.5" />
            </a>
          )}
        </motion.div>
      </div>
    )
  }

  // ── Non-active poll (draft or closed) ──
  if (pollData.status !== 'active') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-2">{pollData.title}</h2>
          <p className="text-[14px] text-text-muted">
            {pollData.status === 'draft' ? 'This poll is not yet active.' : 'This poll has been closed.'}
          </p>
          {pollData.resultsPublished && (
            <a
              href={`/results/${pollData._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 mt-6 text-[13px] font-medium text-bg-primary bg-text-primary rounded-lg hover:bg-text-secondary transition-colors"
            >
              View Results
              <RiArrowRightLine className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    )
  }

  const questions = pollData.questions || []
  const q = questions[current]
  const total = questions.length
  const progress = ((current + (answers[q?._id] !== undefined ? 1 : 0)) / total) * 100
  const canProceed = answers[q?._id] !== undefined

  // ═══════════════════════ POST-SUBMISSION VIEWS ═══════════════════════

  if (submitted) {
    // ── Show live results if enabled ──
    if (pollData.showResultsAfterVoting && liveResults) {
      return (
        <div className="min-h-screen bg-bg-primary">
          {/* Header */}
          <header className="border-b border-border-subtle bg-bg-base">
            <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/voicora-logo.png" alt="Voicora" className="w-4 h-4 invert" />
                <span className="text-[13px] font-semibold text-text-primary">Voicora</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live results
                </span>
              </div>
            </div>
          </header>

          {/* Results content */}
          <div className="max-w-3xl mx-auto px-6 py-10">
            {/* Success banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <RiCheckLine className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-emerald-400">Your vote has been recorded!</p>
                <p className="text-[12px] text-text-faint">Watch the results update in real-time below.</p>
              </div>
            </motion.div>

            {/* Poll info */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">
                {pollData.title}
              </h1>
              {pollData.description && (
                <p className="text-[14px] text-text-muted mb-3">{pollData.description}</p>
              )}
              <div className="flex items-center gap-4 text-[12px] text-text-faint">
                <span className="flex items-center gap-1.5">
                  <RiUserLine className="w-3.5 h-3.5" />
                  {liveResults.totalResponses} responses
                </span>
              </div>
            </div>

            {/* Question breakdowns */}
            <div className="space-y-6">
              {liveResults.questions.map((q, qi) => (
                <motion.div
                  key={q.questionId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: qi * 0.08 }}
                  className="rounded-xl border border-border-subtle bg-bg-base p-6"
                >
                  <p className="text-[11px] text-text-faint uppercase tracking-wider mb-1">
                    Question {qi + 1}
                  </p>
                  <h3 className="text-[15px] font-medium text-text-primary mb-5">{q.questionText}</h3>

                  <div className="space-y-3.5">
                    {q.options.map((opt, oi) => {
                      const isTop = opt.votes === Math.max(...q.options.map(o => o.votes)) && opt.votes > 0
                      // Highlight the option the user selected
                      const isUserChoice = Object.values(answers).includes(opt.optionId)
                      return (
                        <div key={opt.optionId}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[14px] flex items-center gap-1.5 ${isTop ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                              {opt.optionText}
                              {isUserChoice && (
                                <span className="text-[10px] text-accent-violet bg-accent-violet/10 px-1.5 py-0.5 rounded-full font-medium">
                                  Your vote
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-mono text-text-faint">{opt.votes}</span>
                              <span className={`text-[13px] font-semibold ${isTop ? 'text-accent-violet' : 'text-text-muted'}`}>
                                {opt.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 rounded-full bg-bg-muted overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: barColors[oi % barColors.length] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${opt.percentage}%` }}
                              transition={{ duration: 0.7, delay: 0.2 + qi * 0.1 + oi * 0.05 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-[11px] text-text-faint">Total votes</span>
                    <span className="text-[12px] font-medium text-text-muted">{q.totalVotes}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dashboard redirect for authenticated users */}
            {isAuthenticated && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/app')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-bg-primary bg-text-primary rounded-lg hover:bg-text-secondary transition-colors"
                >
                  <RiDashboardLine className="w-4 h-4" />
                  Go to Dashboard
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-[12px] text-text-faint mb-3">Powered by</p>
              <div className="flex items-center justify-center gap-1.5">
                <img src="/voicora-logo.png" alt="Voicora" className="w-3.5 h-3.5 invert" />
                <span className="text-[13px] font-semibold text-text-primary">Voicora</span>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // ── Simple thank-you screen (showResults disabled) ──
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
            <RiCheckLine className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Thank you!</h2>
          <p className="text-[14px] text-text-muted mb-6">Your response has been recorded.</p>

          {/* Authenticated user → dashboard redirect */}
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-bg-primary bg-text-primary rounded-lg hover:bg-text-secondary transition-colors"
            >
              <RiDashboardLine className="w-4 h-4" />
              Go to Dashboard
            </button>
          ) : pollData.resultsPublished ? (
            <a
              href={`/results/${pollData._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-bg-primary bg-text-primary rounded-lg hover:bg-text-secondary transition-colors"
            >
              View Results
              <RiArrowRightLine className="w-3.5 h-3.5" />
            </a>
          ) : null}
        </motion.div>
      </div>
    )
  }

  // ═══════════════════════ VOTING FORM ═══════════════════════

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-base">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/voicora-logo.png" alt="Voicora" className="w-4 h-4 invert" />
            <span className="text-[13px] font-semibold text-text-primary">Voicora</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Auth indicator for authenticated polls */}
            {pollData.responseMode === 'authenticated' && (
              <span className="flex items-center gap-1 text-[10px] text-text-faint bg-bg-secondary px-2 py-0.5 rounded-full">
                <RiLockLine className="w-3 h-3" />
                Login required
              </span>
            )}
            <span className="text-[11px] text-text-faint font-mono">
              {current + 1} / {total}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] bg-bg-secondary">
          <motion.div
            className="h-full bg-accent-violet"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Poll info (first question only) */}
          {current === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-xl font-semibold text-text-primary mb-2">{pollData.title}</h1>
              {pollData.description && (
                <p className="text-[13px] text-text-muted">{pollData.description}</p>
              )}
            </motion.div>
          )}

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={q._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-[11px] text-text-faint uppercase tracking-wider mb-2">
                Question {current + 1}
              </p>
              <h2 className="text-lg font-medium text-text-primary mb-6">{q.text}</h2>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((opt) => {
                  const selected = answers[q._id] === opt._id
                  return (
                    <button
                      key={opt._id}
                      onClick={() => setAnswers({ ...answers, [q._id]: opt._id })}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-[14px] transition-all duration-200 ${
                        selected
                          ? 'border-accent-violet bg-accent-violet/5 text-text-primary'
                          : 'border-border-subtle bg-bg-base text-text-muted hover:border-border-default hover:bg-bg-elevated'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          selected
                            ? 'border-accent-violet bg-accent-violet'
                            : 'border-border-default'
                        }`}
                      >
                        {selected && <RiCheckLine className="w-3 h-3 text-white" />}
                      </span>
                      {opt.text}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Next / Submit button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              disabled={!canProceed || submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-medium text-bg-primary bg-text-primary hover:bg-text-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />}
              {current < total - 1 ? 'Next' : 'Submit'}
              {!submitting && <RiArrowRightLine className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal — shown when unauthenticated user tries to submit on an auth-required poll */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="login"
        subtitle="Sign in to submit your vote"
      />
    </div>
  )
}
