import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiAddLine,
  RiSearchLine,
  RiMoreLine,
  RiBarChartBoxLine,
  RiUserLine,
  RiTimeLine,
  RiExternalLinkLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiArrowRightSLine,
  RiLoader4Line,
} from 'react-icons/ri'
import { pollApi } from '../services/api'
import { getErrorMessage } from '../lib/errors'
import toast from 'react-hot-toast'

const statusConfig = {
  draft: { label: 'Draft', dot: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  active: { label: 'Live', dot: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  closed: { label: 'Closed', dot: 'bg-text-faint', text: 'text-text-faint', bg: 'bg-bg-muted' },
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.draft
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.text} ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  )
}

function PollCard({ poll, index, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await pollApi.delete(poll._id)
      toast.success('Poll deleted')
      onDelete(poll._id)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    setMenuOpen(false)
  }

  const copyLink = () => {
    const url = `${window.location.origin}/poll/${poll.publicSlug}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
    setMenuOpen(false)
  }

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group rounded-xl border border-border-subtle bg-bg-base hover:bg-bg-elevated hover:border-border-default transition-all duration-200"
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <StatusBadge status={poll.status} />
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-md text-text-faint hover:text-text-primary hover:bg-bg-secondary transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
              <RiMoreLine className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-bg-secondary border border-border-subtle rounded-lg shadow-xl py-1 z-10">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                  <RiExternalLinkLine className="w-3 h-3" /> Share Link
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[12px] text-red-400 hover:bg-bg-tertiary transition-colors"
                >
                  <RiDeleteBinLine className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <Link to={`/app/analytics/${poll._id}`} className="block mb-1.5">
          <h3 className="text-[15px] font-medium text-text-primary group-hover:text-white transition-colors">
            {poll.title}
          </h3>
        </Link>
        <p className="text-[12px] text-text-faint leading-relaxed line-clamp-2 mb-4">
          {poll.description || 'No description'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] text-text-faint">
          <span className="flex items-center gap-1">
            <RiUserLine className="w-3 h-3" />
            {poll.totalResponses || 0}
          </span>
          <span className="flex items-center gap-1">
            <RiBarChartBoxLine className="w-3 h-3" />
            {poll.questions?.length || 0} questions
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
        <span className="text-[11px] text-text-faint flex items-center gap-1">
          <RiTimeLine className="w-3 h-3" />
          {timeAgo(poll.createdAt)}
        </span>
        <Link
          to={`/app/analytics/${poll._id}`}
          className="flex items-center gap-0.5 py-1.5 px-2 text-[12px] font-medium text-text-faint hover:text-accent-violet transition-colors"
        >
          View <RiArrowRightSLine className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    pollApi.getMyPolls()
      .then((res) => setPolls(res.data.data || []))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = (id) => {
    setPolls(polls.filter((p) => p._id !== id))
  }

  const filtered = polls.filter((p) => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: polls.length,
    live: polls.filter((p) => p.status === 'active').length,
    responses: polls.reduce((a, p) => a + (p.totalResponses || 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <RiLoader4Line className="w-6 h-6 text-accent-violet animate-spin" />
          <span className="text-[13px] text-text-faint">Loading your polls...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Polls</h1>
          <p className="text-[13px] text-text-faint mt-1">Manage and monitor your live polls.</p>
        </div>
        <Link
          to="/app/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium text-bg-primary bg-text-primary rounded-lg hover:bg-text-secondary transition-colors w-full sm:w-auto"
        >
          <RiAddLine className="w-4 h-4" />
          Create Poll
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'Total Polls', value: stats.total },
          { label: 'Live Now', value: stats.live, highlight: true },
          { label: 'Total Responses', value: stats.responses.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border-subtle bg-bg-base p-4 flex sm:block items-center justify-between">
            <p className="text-[11px] text-text-faint uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-semibold ${s.highlight ? 'text-emerald-400' : 'text-text-primary'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-faint" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search polls..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-[13px] text-text-secondary placeholder-text-faint outline-none focus:border-border-default focus:ring-1 focus:ring-border-default transition-all"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0.5 bg-bg-secondary rounded-lg p-0.5 border border-border-subtle overflow-x-auto scrollbar-none">
          {[
            { label: 'All', value: 'all' },
            { label: 'Live', value: 'active' },
            { label: 'Draft', value: 'draft' },
            { label: 'Closed', value: 'closed' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                filter === f.value
                  ? 'bg-bg-tertiary text-text-primary'
                  : 'text-text-faint hover:text-text-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Poll grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((poll, i) => (
            <PollCard key={poll._id} poll={poll} index={i} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-faint text-sm mb-4">
            {polls.length === 0 ? "You haven't created any polls yet." : 'No polls found.'}
          </p>
          {polls.length === 0 && (
            <Link
              to="/app/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-white bg-accent-violet rounded-lg hover:bg-accent-violet/90 transition-colors"
            >
              <RiAddLine className="w-4 h-4" />
              Create your first poll
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
