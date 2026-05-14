import React, { useState, useEffect, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiArrowUpLine,
  RiUserLine,
  RiPulseLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiLoader4Line,
  RiPlayLine,
  RiStopLine,
  RiShareForwardLine,
} from 'react-icons/ri'
import { pollApi, responseApi } from '../services/api'
import { getErrorMessage } from '../lib/errors'
import { connectSocket, joinPollRoom, leavePollRoom, getSocket } from '../lib/socket'
import toast from 'react-hot-toast'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border-subtle bg-bg-secondary px-3 py-1.5 text-[11px]">
      <p className="text-text-faint">{label}</p>
      <p className="font-medium text-text-primary">{payload[0].value}</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-base p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-text-faint" />
        </div>
        {accent && (
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-emerald-400">
            <RiPulseLine className="w-3 h-3" />
            Live
          </span>
        )}
      </div>
      <p className="text-xl font-semibold text-text-primary">{value}</p>
      <p className="text-[11px] text-text-faint mt-0.5">{label}</p>
    </div>
  )
}

export default function PollAnalytics() {
  const { id } = useParams()
  const [poll, setPoll] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [pollRes, analyticsRes] = await Promise.all([
        pollApi.getById(id),
        responseApi.getAnalytics(id),
      ])
      setPoll(pollRes.data.data)
      setAnalytics(analyticsRes.data.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Socket.io live updates
  useEffect(() => {
    if (!id) return

    const socket = connectSocket()
    joinPollRoom(id)

    const handleVoteUpdate = (update) => {
      // Refresh analytics on live vote
      responseApi.getAnalytics(id)
        .then((res) => setAnalytics(res.data.data))
        .catch(() => {})

      // Update poll total responses
      setPoll(prev => prev ? { ...prev, totalResponses: update.totalResponses } : prev)
    }

    socket.on('vote:update', handleVoteUpdate)

    return () => {
      socket.off('vote:update', handleVoteUpdate)
      leavePollRoom(id)
    }
  }, [id])

  const copyLink = () => {
    if (poll?.publicSlug) {
      navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.publicSlug}`)
    }
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleActivate = async () => {
    setActionLoading(true)
    try {
      await pollApi.activate(id)
      toast.success('Poll activated!')
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handleClose = async () => {
    setActionLoading(true)
    try {
      await pollApi.close(id)
      toast.success('Poll closed')
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  const handlePublishResults = async () => {
    setActionLoading(true)
    try {
      await pollApi.publishResults(id)
      toast.success('Results published!')
      fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <RiLoader4Line className="w-6 h-6 text-accent-violet animate-spin" />
          <span className="text-[13px] text-text-faint">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="text-center py-32">
        <p className="text-text-faint text-sm">Poll not found.</p>
        <Link to="/app" className="text-accent-violet text-sm hover:underline mt-2 inline-block">Back to Dashboard</Link>
      </div>
    )
  }

  const statusConfig = {
    draft: { label: 'Draft', color: 'text-yellow-400', bg: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
    active: { label: 'Live', color: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    closed: { label: 'Closed', color: 'text-text-faint', bg: 'bg-bg-muted', dot: 'bg-text-faint' },
  }
  const status = statusConfig[poll.status] || statusConfig.draft
  const questions = analytics?.questions || []

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <Link to="/app" className="p-1.5 rounded-lg text-text-faint hover:text-text-primary hover:bg-bg-secondary transition-colors mt-0.5">
            <RiArrowLeftLine className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold text-text-primary tracking-tight">{poll.title}</h1>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${poll.status === 'active' ? 'animate-pulse' : ''}`} />
                {status.label}
              </span>
            </div>
            <p className="text-[12px] text-text-faint">
              Created {new Date(poll.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Actions based on status */}
          {poll.status === 'draft' && (
            <button onClick={handleActivate} disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
            >
              <RiPlayLine className="w-3.5 h-3.5" /> Activate
            </button>
          )}
          {poll.status === 'active' && (
            <button onClick={handleClose} disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 transition-all"
            >
              <RiStopLine className="w-3.5 h-3.5" /> Close Poll
            </button>
          )}
          {!poll.resultsPublished && (
            <button onClick={handlePublishResults} disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-accent-violet bg-accent-violet/10 hover:bg-accent-violet/20 disabled:opacity-50 transition-all"
            >
              <RiShareForwardLine className="w-3.5 h-3.5" /> Publish Results
            </button>
          )}

          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-faint border border-border-subtle hover:text-text-primary hover:border-border-default transition-all"
          >
            {copied ? <RiCheckboxCircleLine className="w-3.5 h-3.5 text-emerald-400" /> : <RiFileCopyLine className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          {poll.resultsPublished && (
            <Link
              to={`/results/${id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-text-faint border border-border-subtle hover:text-text-primary hover:border-border-default transition-all"
            >
              <RiExternalLinkLine className="w-3.5 h-3.5" />
              Public Results
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard icon={RiPulseLine} label="Total Responses" value={(poll.totalResponses || 0).toLocaleString()} accent={poll.status === 'active'} />
        <StatCard icon={RiUserLine} label="Questions" value={poll.questions?.length || 0} />
        <StatCard icon={RiTimeLine} label="Status" value={status.label} />
      </div>

      {/* Question breakdowns */}
      <div className="space-y-5">
        <h3 className="text-[14px] font-medium text-text-primary">Response Breakdown</h3>
        {questions.length > 0 ? questions.map((q, qi) => (
          <motion.div
            key={q.questionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: qi * 0.1 }}
            className="rounded-xl border border-border-subtle bg-bg-base p-5"
          >
            <p className="text-[13px] font-medium text-text-primary mb-4">{q.questionText}</p>
            <div className="space-y-3">
              {q.options.map((opt, oi) => (
                <div key={opt.optionId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-text-secondary">{opt.optionText}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-text-faint">{opt.votes}</span>
                      <span className="text-[11px] font-medium text-text-muted">{opt.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-accent-violet"
                      initial={{ width: 0 }}
                      animate={{ width: `${opt.percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + oi * 0.05 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-text-faint">Total votes</span>
              <span className="text-[12px] font-medium text-text-muted">{q.totalVotes}</span>
            </div>
          </motion.div>
        )) : (
          <div className="rounded-xl border border-border-subtle bg-bg-base p-8 text-center">
            <p className="text-text-faint text-sm">No responses yet. Share your poll to start collecting data.</p>
          </div>
        )}
      </div>
    </div>
  )
}
