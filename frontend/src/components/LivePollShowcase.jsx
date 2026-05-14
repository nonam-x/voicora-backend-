import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiUserLine,
  RiTimeLine,
  RiBarChartBoxLine,
  RiCheckboxCircleLine,
  RiLink,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiArrowRightSLine,
  RiChat3Line,
  RiHashtag,
  RiImageLine,
  RiToggleLine,
} from 'react-icons/ri'

/* ---- Poll type options ---- */
const pollTypes = [
  { icon: RiBarChartBoxLine, label: 'Multiple Choice', active: true },
  { icon: RiChat3Line, label: 'Open Ended', active: false },
  { icon: RiHashtag, label: 'Rating Scale', active: false },
  { icon: RiImageLine, label: 'Image Poll', active: false },
  { icon: RiToggleLine, label: 'Yes / No', active: false },
]

/* ---- Initial data ---- */
const initialResponses = [
  { id: 1, label: 'TypeScript', votes: 347, color: '#8B5CF6' },
  { id: 2, label: 'JavaScript', votes: 289, color: '#6366F1' },
  { id: 3, label: 'Python', votes: 198, color: '#3B82F6' },
  { id: 4, label: 'Rust', votes: 156, color: '#06B6D4' },
  { id: 5, label: 'Go', votes: 124, color: '#EC4899' },
]

function ResponseBar({ label, votes, total, color, rank }) {
  const pct = Math.round((votes / total) * 100)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.04 }}
      className="flex items-center gap-4"
    >
      <span className="text-[11px] font-mono text-text-faint w-4 text-right">{rank + 1}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-medium text-text-secondary">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-text-faint">{votes}</span>
            <span className="text-[11px] font-medium text-text-muted">{pct}%</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function LivePollShowcase() {
  const [responses, setResponses] = useState(initialResponses)
  const [selectedType, setSelectedType] = useState(0)
  const [copied, setCopied] = useState(false)
  const total = responses.reduce((a, b) => a + b.votes, 0)

  useEffect(() => {
    const id = setInterval(() => {
      setResponses(prev => {
        const copy = prev.map(r => ({ ...r }))
        const idx = Math.floor(Math.random() * copy.length)
        copy[idx].votes += Math.floor(Math.random() * 5) + 1
        return copy.sort((a, b) => b.votes - a.votes)
      })
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="live-polls" className="relative py-20 sm:py-32">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />

      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mb-16"
        >
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-violet mb-4">
            Live Polls
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-b from-text-primary to-text-faint bg-clip-text text-transparent">
              Create polls that feel alive
            </span>
          </h2>
          <p className="text-text-muted leading-relaxed">
            Build engaging polls in seconds. Share them anywhere. Watch responses arrive in real time.
          </p>
        </motion.div>

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-border-subtle bg-bg-base overflow-hidden"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-border-default" />
                <div className="w-2.5 h-2.5 rounded-full bg-border-default" />
                <div className="w-2.5 h-2.5 rounded-full bg-border-default" />
              </div>
              <div className="hidden sm:flex h-6 px-3 rounded-md bg-bg-secondary items-center">
                <span className="text-[11px] text-text-faint font-mono">voicora.app/poll/tech-stack-2026</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                <span className="text-[11px] font-medium">Live</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-secondary text-text-faint">
                <RiUserLine className="w-3 h-3" />
                <span className="text-[11px] font-medium">{total}</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[260px_1fr] divide-x divide-border-subtle">
            {/* Sidebar */}
            <div className="hidden lg:block p-5 space-y-6">
              <div>
                <h4 className="text-[11px] font-medium tracking-wider uppercase text-text-faint mb-3">Question Type</h4>
                <div className="space-y-0.5">
                  {pollTypes.map((type, i) => (
                    <button
                      key={type.label}
                      onClick={() => setSelectedType(i)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                        selectedType === i
                          ? 'bg-accent-violet/10 text-accent-violet'
                          : 'text-text-faint hover:text-text-secondary hover:bg-bg-secondary'
                      }`}
                    >
                      <type.icon className="w-3.5 h-3.5" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-medium tracking-wider uppercase text-text-faint mb-3">Settings</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Anonymous voting', on: true },
                    { label: 'Show results live', on: true },
                    { label: 'Allow multiple votes', on: false },
                    { label: 'Require auth', on: false },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-[12px] text-text-faint">{s.label}</span>
                      <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${s.on ? 'bg-accent-violet' : 'bg-bg-muted'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${s.on ? 'translate-x-3' : ''}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-medium tracking-wider uppercase text-text-faint mb-3">Share</h4>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-bg-secondary text-[11px] text-text-faint font-mono overflow-hidden">
                    <RiLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">voicora.app/p/x8kq</span>
                  </div>
                  <button
                    onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    className="p-1.5 rounded-md bg-bg-secondary hover:bg-bg-tertiary text-text-faint hover:text-text-primary transition-colors"
                  >
                    {copied ? <RiCheckboxCircleLine className="w-3.5 h-3.5 text-emerald-400" /> : <RiFileCopyLine className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="p-6 lg:p-8">
              <div className="mb-8">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-text-primary">
                    What's your primary programming language in 2026?
                  </h3>
                  <button className="p-1.5 rounded-md hover:bg-bg-secondary text-text-faint hover:text-text-primary transition-colors">
                    <RiExternalLinkLine className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-text-faint">
                  <span className="flex items-center gap-1"><RiTimeLine className="w-3 h-3" />Started 12 min ago</span>
                  <span className="flex items-center gap-1"><RiUserLine className="w-3 h-3" />{total} responses</span>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {responses.map((r, i) => (
                    <ResponseBar key={r.id} label={r.label} votes={r.votes} total={total} color={r.color} rank={i} />
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8 pt-5 border-t border-border-subtle">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-base font-semibold text-text-primary">{total}</div>
                    <div className="text-[10px] text-text-faint uppercase tracking-wider">Total Votes</div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-text-primary">5</div>
                    <div className="text-[10px] text-text-faint uppercase tracking-wider">Options</div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-emerald-400">Active</div>
                    <div className="text-[10px] text-text-faint uppercase tracking-wider">Status</div>
                  </div>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent-violet/10 text-accent-violet text-[12px] font-medium hover:bg-accent-violet/15 transition-colors">
                  View Results <RiArrowRightSLine className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
