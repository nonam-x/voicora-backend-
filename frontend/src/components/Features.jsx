import React from 'react'
import { motion } from 'framer-motion'
import {
  RiFlashlightLine,
  RiBarChartBoxLine,
  RiGlobalLine,
  RiShieldCheckLine,
  RiLineChartLine,
  RiShareLine,
} from 'react-icons/ri'

const features = [
  {
    icon: RiFlashlightLine,
    title: 'Real-Time Polling',
    description: 'Launch live polls and watch responses flow in instantly with sub-second latency.',
    color: '#8B5CF6',
  },
  {
    icon: RiBarChartBoxLine,
    title: 'Beautiful Analytics',
    description: 'Dynamic charts and visual insights that update live as your audience responds.',
    color: '#6366F1',
  },
  {
    icon: RiGlobalLine,
    title: 'Shareable Links',
    description: 'Generate public links anyone can access — no account required to participate.',
    color: '#3B82F6',
  },
  {
    icon: RiShieldCheckLine,
    title: 'Anonymous & Authenticated',
    description: 'Support both anonymous voting and authenticated responses with flexible controls.',
    color: '#06B6D4',
  },
  {
    icon: RiLineChartLine,
    title: 'Response Insights',
    description: 'Deep-dive into response patterns with time-series analysis and breakdowns.',
    color: '#EC4899',
  },
  {
    icon: RiShareLine,
    title: 'Audience Engagement',
    description: 'Interactive Q&A, word clouds, and live reactions that keep your audience connected.',
    color: '#8B5CF6',
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-32">
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
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-text-faint mb-4">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-b from-text-primary to-text-faint bg-clip-text text-transparent">
              Everything you need to engage audiences
            </span>
          </h2>
          <p className="text-text-muted leading-relaxed">
            A complete suite of tools for modern polling, feedback collection, and real-time audience interaction.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-subtle rounded-xl overflow-hidden border border-border-subtle"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="bg-bg-base p-6 sm:p-8 hover:bg-bg-elevated transition-colors duration-300 group"
            >
              <f.icon
                className="w-5 h-5 text-text-faint group-hover:text-current transition-colors mb-5"
                style={{ '--tw-text-opacity': 1 }}
                onMouseEnter={(e) => e.currentTarget.style.color = f.color}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              />
              <h3 className="text-[15px] font-medium text-text-primary mb-2">
                {f.title}
              </h3>
              <p className="text-[13px] text-text-faint leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
