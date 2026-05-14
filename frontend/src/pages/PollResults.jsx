import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiUserLine, RiTimeLine, RiShareLine, RiLoader4Line } from 'react-icons/ri'
import { pollApi, responseApi } from '../services/api'
import { getErrorMessage } from '../lib/errors'
import { connectSocket, joinPollRoom, leavePollRoom, getSocket } from '../lib/socket'
import toast from 'react-hot-toast'

const barColors = ['#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#EC4899']

export default function PollResults() {
  const { id } = useParams()
  const [poll, setPoll] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pollRes, analyticsRes] = await Promise.all([
          pollApi.getById(id),
          responseApi.getAnalytics(id),
        ])
        setPoll(pollRes.data.data)
        setAnalytics(analyticsRes.data.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Socket.io live updates for active polls
  useEffect(() => {
    if (!id || !poll || poll.status !== 'active') return

    const socket = connectSocket()
    joinPollRoom(id)

    const handleVoteUpdate = () => {
      // Refresh analytics on live vote
      responseApi.getAnalytics(id)
        .then((res) => setAnalytics(res.data.data))
        .catch(() => {})
    }

    socket.on('vote:update', handleVoteUpdate)

    return () => {
      socket.off('vote:update', handleVoteUpdate)
      leavePollRoom(id)
    }
  }, [id, poll?.status])

  const shareResults = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RiLoader4Line className="w-6 h-6 text-accent-violet animate-spin" />
          <span className="text-[13px] text-text-faint">Loading results...</span>
        </div>
      </div>
    )
  }

  if (error || !poll || !analytics) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Results unavailable</h2>
          <p className="text-[14px] text-text-muted">{error || 'Results may not have been published yet.'}</p>
        </div>
      </div>
    )
  }

  const questions = analytics.questions || []

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-subtle bg-bg-base">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/voicora-logo.png" alt="Voicora" className="w-4 h-4 invert" />
            <span className="text-[13px] font-semibold text-text-primary">Voicora</span>
          </div>
          <button
            onClick={shareResults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-text-faint border border-border-subtle hover:text-text-primary hover:border-border-default transition-all"
          >
            <RiShareLine className="w-3 h-3" />
            Share
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Poll info */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight mb-2">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-[14px] text-text-muted mb-4">{poll.description}</p>
          )}
          <div className="flex items-center gap-5 text-[12px] text-text-faint">
            <span className="flex items-center gap-1.5">
              <RiUserLine className="w-3.5 h-3.5" />
              {analytics.totalResponses} responses
            </span>
            <span className="flex items-center gap-1.5">
              <RiTimeLine className="w-3.5 h-3.5" />
              {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {poll.status === 'active' && (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live — updates in real-time
              </span>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((q, qi) => (
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
                  const isTop = oi === 0 || opt.votes === Math.max(...q.options.map(o => o.votes))
                  return (
                    <div key={opt.optionId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[14px] ${isTop ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                          {opt.optionText}
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

              {/* Total for this question */}
              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[11px] text-text-faint">Total votes</span>
                <span className="text-[12px] font-medium text-text-muted">
                  {q.totalVotes}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

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
