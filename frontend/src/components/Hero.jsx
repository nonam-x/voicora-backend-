import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RiArrowRightLine, RiPlayLine } from 'react-icons/ri'

/* ---- Counter ---- */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / 60
    const id = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(id) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(id)
  }, [target])
  return <>{count.toLocaleString()}{suffix}</>
}

/* ---- Live poll card ---- */
function PollCard() {
  const [votes, setVotes] = useState([42, 31, 18, 9])
  const labels = ['React', 'Vue', 'Svelte', 'Angular']
  const total = votes.reduce((a, b) => a + b, 0)

  useEffect(() => {
    const id = setInterval(() => {
      setVotes(prev => {
        const copy = [...prev]
        copy[Math.floor(Math.random() * 4)] += Math.floor(Math.random() * 3) + 1
        return copy
      })
    }, 2500)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="rounded-xl border border-border-subtle bg-bg-elevated p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            <span className="text-[11px] font-medium text-emerald-500 uppercase tracking-wider">Live</span>
          </div>
          <span className="text-[11px] text-text-faint font-mono">{total} responses</span>
        </div>

        <p className="text-sm font-medium text-text-primary mb-5">
          What's your favorite frontend framework?
        </p>

        <div className="space-y-3">
          {labels.map((label, i) => {
            const pct = Math.round((votes[i] / total) * 100)
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] text-text-secondary">{label}</span>
                  <span className="text-[11px] font-mono text-text-faint">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent-violet"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border-subtle">
          <div className="flex -space-x-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-border-subtle bg-bg-tertiary" />
            ))}
          </div>
          <span className="text-[11px] text-text-faint">+{total - 4} voted</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-violet/[0.03] rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6 w-full py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle text-[11px] text-text-faint tracking-wide">
                <img src="/voicora-logo.png" alt="" className="w-3 h-3 invert" />
                Real-time polling platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
            >
              <span className="bg-gradient-to-b from-text-primary via-text-secondary to-text-faint bg-clip-text text-transparent">
                Engage your audience in real time
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base text-text-muted max-w-md leading-relaxed mb-8"
            >
              Create interactive polls, collect instant feedback, and visualize
              audience insights with beautiful real-time analytics.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 mb-12"
            >
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-[13px] font-medium text-bg-primary bg-text-primary rounded-full hover:bg-text-secondary transition-colors"
              >
                Start for Free
                <RiArrowRightLine className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#live-polls"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 text-[13px] font-medium text-text-muted rounded-full border border-border-subtle hover:border-border-default hover:text-text-primary transition-all"
              >
                <RiPlayLine className="w-3.5 h-3.5" />
                See it Live
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex gap-6 sm:gap-10"
            >
              {[
                { value: 12000, suffix: '+', label: 'Active Polls' },
                { value: 850, suffix: 'K', label: 'Responses' },
                { value: 99.9, suffix: '%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-lg sm:text-xl font-semibold text-text-primary">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[11px] text-text-faint mt-0.5 tracking-wide">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PollCard />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  )
}
