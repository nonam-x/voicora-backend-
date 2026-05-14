import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RiHeart3Line,
  RiThumbUpLine,
  RiEmotionLine,
  RiFireLine,
  RiStarLine,
  RiSendPlaneLine,
  RiChat3Line,
  RiWifiLine,
  RiQrCodeLine,
  RiSmartphoneLine,
  RiUserLine,
  RiArrowRightLine,
} from 'react-icons/ri'

/* ---- Reaction icons ---- */
const reactionIcons = [
  { icon: RiHeart3Line, color: '#EC4899' },
  { icon: RiThumbUpLine, color: '#8B5CF6' },
  { icon: RiEmotionLine, color: '#F59E0B' },
  { icon: RiFireLine, color: '#F97316' },
  { icon: RiStarLine, color: '#6366F1' },
]

function LiveReactions() {
  const [bubbles, setBubbles] = useState([])

  useEffect(() => {
    const id = setInterval(() => {
      const r = reactionIcons[Math.floor(Math.random() * reactionIcons.length)]
      setBubbles(prev => [...prev.slice(-10), {
        id: Date.now() + Math.random(),
        x: 15 + Math.random() * 70,
        icon: r.icon,
        color: r.color,
      }])
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative h-40 overflow-hidden">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 1, y: 140, scale: 0.5 }}
          animate={{ opacity: 0, y: -10, scale: 1.1 }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
          className="absolute"
          style={{ left: `${b.x}%` }}
        >
          <b.icon className="w-4 h-4" style={{ color: b.color }} />
        </motion.div>
      ))}
    </div>
  )
}

/* ---- Q&A messages ---- */
const messages = [
  { name: 'Sarah K.', msg: 'When will the new feature be available?', time: '2m', likes: 12 },
  { name: 'Anonymous', msg: 'Can we integrate this with Slack?', time: '5m', likes: 8 },
  { name: 'Mike R.', msg: 'Love the real-time analytics!', time: '8m', likes: 24 },
  { name: 'Anonymous', msg: 'How does anonymous voting work?', time: '12m', likes: 6 },
]

export default function AudienceEngagement() {
  return (
    <section id="engagement" className="relative py-32">
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
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-cyan mb-4">
            Engagement
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-b from-text-primary to-text-faint bg-clip-text text-transparent">
              Keep your audience connected
            </span>
          </h2>
          <p className="text-text-muted leading-relaxed">
            Interactive reactions, live Q&A, and instant access that make every session memorable.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Live Reactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-border-subtle bg-bg-base p-6 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center">
                <RiHeart3Line className="w-4 h-4 text-accent-pink" />
              </div>
              <div>
                <h4 className="text-[13px] font-medium text-text-primary">Live Reactions</h4>
                <p className="text-[10px] text-text-faint">Real-time audience feedback</p>
              </div>
            </div>
            <LiveReactions />
            <div className="flex justify-center gap-2 mt-2">
              {reactionIcons.map((r, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-bg-secondary hover:bg-bg-tertiary flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                  <r.icon className="w-3.5 h-3.5" style={{ color: r.color }} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Live Q&A */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-xl border border-border-subtle bg-bg-base p-6"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center">
                <RiChat3Line className="w-4 h-4 text-accent-indigo" />
              </div>
              <div>
                <h4 className="text-[13px] font-medium text-text-primary">Live Q&A</h4>
                <p className="text-[10px] text-text-faint">Upvote-based question sorting</p>
              </div>
            </div>
            <div className="space-y-2">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-bg-elevated hover:bg-bg-secondary transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-[9px] font-bold text-text-muted shrink-0">
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-medium text-text-secondary">{m.name}</span>
                      <span className="text-[9px] text-text-faint">{m.time}</span>
                    </div>
                    <p className="text-[11px] text-text-faint leading-relaxed">{m.msg}</p>
                  </div>
                  <button className="flex items-center gap-0.5 text-[9px] text-text-faint hover:text-accent-violet transition-colors shrink-0 mt-1">
                    <RiThumbUpLine className="w-2.5 h-2.5" />
                    {m.likes}
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
              <input
                type="text"
                placeholder="Ask a question..."
                className="flex-1 bg-bg-secondary rounded-md px-3 py-1.5 text-[11px] text-text-secondary placeholder-text-faint outline-none focus:ring-1 focus:ring-accent-violet/30 border border-border-subtle"
                readOnly
              />
              <button className="p-1.5 rounded-md bg-accent-violet text-white hover:bg-accent-violet/80 transition-colors">
                <RiSendPlaneLine className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

          {/* Instant Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="rounded-xl border border-border-subtle bg-bg-base p-6 md:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-bg-secondary flex items-center justify-center">
                <RiWifiLine className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <h4 className="text-[13px] font-medium text-text-primary">Instant Access</h4>
                <p className="text-[10px] text-text-faint">Join from any device</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="w-28 h-28 rounded-xl bg-text-primary p-2 flex items-center justify-center">
                <div className="w-full h-full rounded-lg bg-bg-primary flex items-center justify-center">
                  <RiQrCodeLine className="w-12 h-12 text-text-faint" />
                </div>
              </div>
              <span className="text-[11px] text-text-faint">Scan to join the poll</span>
            </div>

            <div className="space-y-1">
              {[
                { icon: RiSmartphoneLine, label: 'Mobile-first responsive UI' },
                { icon: RiUserLine, label: 'No account required to vote' },
                { icon: RiQrCodeLine, label: 'QR code instant access' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-bg-elevated transition-colors">
                  <item.icon className="w-3.5 h-3.5 text-text-faint" />
                  <span className="text-[12px] text-text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-24"
        >
          <div className="rounded-xl border border-border-subtle bg-bg-elevated p-12 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-accent-violet/[0.04] rounded-full blur-[80px]" />
            <div className="relative">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-b from-text-primary to-text-faint bg-clip-text text-transparent">
                  Ready to engage your audience?
                </span>
              </h3>
              <p className="text-text-muted text-sm max-w-md mx-auto mb-8">
                Start creating beautiful, interactive polls in seconds. No credit card required.
              </p>
              <a
                href="#"
                className="group inline-flex items-center gap-2 px-6 py-2.5 text-[13px] font-medium text-bg-primary bg-text-primary rounded-full hover:bg-text-secondary transition-colors"
              >
                Get Started for Free
                <RiArrowRightLine className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
