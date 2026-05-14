import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiUserLine,
  RiPulseLine,
  RiEyeLine,
  RiTimeLine,
  RiArrowRightUpLine,
} from 'react-icons/ri'

/* ---- Data ---- */
const barData = [
  { name: 'Mon', responses: 420 },
  { name: 'Tue', responses: 580 },
  { name: 'Wed', responses: 350 },
  { name: 'Thu', responses: 720 },
  { name: 'Fri', responses: 650 },
  { name: 'Sat', responses: 890 },
  { name: 'Sun', responses: 540 },
]

const areaData = [
  { time: '9AM', live: 45, total: 120 },
  { time: '10AM', live: 78, total: 210 },
  { time: '11AM', live: 120, total: 380 },
  { time: '12PM', live: 95, total: 450 },
  { time: '1PM', live: 150, total: 580 },
  { time: '2PM', live: 200, total: 720 },
  { time: '3PM', live: 180, total: 840 },
  { time: '4PM', live: 240, total: 980 },
  { time: '5PM', live: 310, total: 1150 },
]

const pieData = [
  { name: 'Mobile', value: 45, color: '#8B5CF6' },
  { name: 'Desktop', value: 35, color: '#6366F1' },
  { name: 'Tablet', value: 12, color: '#3B82F6' },
  { name: 'Other', value: 8, color: '#27272A' },
]

function StatCard({ icon: Icon, label, value, change, positive, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="rounded-lg border border-border-subtle bg-bg-elevated p-4 hover:bg-bg-secondary transition-colors duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-md bg-bg-secondary flex items-center justify-center group-hover:bg-bg-tertiary transition-colors">
          <Icon className="w-3.5 h-3.5 text-text-faint" />
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
          {positive ? <RiArrowUpLine className="w-3 h-3" /> : <RiArrowDownLine className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <div className="text-xl font-semibold text-text-primary mb-0.5">{value}</div>
      <div className="text-[11px] text-text-faint">{label}</div>
    </motion.div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border-subtle bg-bg-secondary px-3 py-2 text-[11px]">
      <p className="text-text-faint mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-medium" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <section id="analytics" className="relative py-32">
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
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent-indigo mb-4">
            Analytics
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-b from-text-primary to-text-faint bg-clip-text text-transparent">
              Insights that drive better decisions
            </span>
          </h2>
          <p className="text-text-muted leading-relaxed">
            Beautiful, real-time analytics dashboards that transform raw responses into actionable insights.
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
          {/* Dashboard header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
            <div className="flex items-center gap-4">
              <h3 className="text-[13px] font-medium text-text-primary">Analytics Dashboard</h3>
              <div className="flex items-center gap-0.5 bg-bg-secondary rounded-lg p-0.5">
                {['overview', 'responses', 'audience'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-[11px] font-medium capitalize transition-all ${
                      activeTab === tab ? 'bg-bg-tertiary text-text-primary' : 'text-text-faint hover:text-text-muted'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-text-faint">
              <RiTimeLine className="w-3 h-3" />
              Updated just now
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5">
            <StatCard icon={RiPulseLine} label="Total Responses" value="4,821" change="+12.5%" positive delay={0} />
            <StatCard icon={RiUserLine} label="Active Participants" value="1,247" change="+8.3%" positive delay={0.05} />
            <StatCard icon={RiEyeLine} label="Poll Views" value="12.4K" change="+23.1%" positive delay={0.1} />
            <StatCard icon={RiArrowUpLine} label="Completion Rate" value="89.2%" change="-2.1%" positive={false} delay={0.15} />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-4 px-5 pb-5">
            {/* Bar */}
            <div className="lg:col-span-2 rounded-lg border border-border-subtle bg-bg-elevated p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-[13px] font-medium text-text-primary">Responses Over Time</h4>
                  <p className="text-[11px] text-text-faint mt-0.5">Daily this week</p>
                </div>
                <button className="flex items-center gap-1 text-[11px] text-accent-indigo font-medium hover:text-accent-violet transition-colors">
                  Details <RiArrowRightUpLine className="w-3 h-3" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="responses" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie */}
            <div className="rounded-lg border border-border-subtle bg-bg-elevated p-5">
              <div className="mb-5">
                <h4 className="text-[13px] font-medium text-text-primary">Device Breakdown</h4>
                <p className="text-[11px] text-text-faint mt-0.5">Response sources</p>
              </div>
              <div className="flex justify-center">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-text-faint">{d.name}</span>
                    <span className="text-[11px] font-medium text-text-muted ml-auto">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Area */}
            <div className="lg:col-span-3 rounded-lg border border-border-subtle bg-bg-elevated p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-[13px] font-medium text-text-primary">Live Activity</h4>
                  <p className="text-[11px] text-text-faint mt-0.5">Concurrent users & cumulative responses</p>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-violet" />
                    <span className="text-text-faint">Live users</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo" />
                    <span className="text-text-faint">Total</span>
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="aGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717A', fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="live" stroke="#8B5CF6" fill="url(#aGrad1)" strokeWidth={1.5} name="Live Users" />
                  <Area type="monotone" dataKey="total" stroke="#6366F1" fill="url(#aGrad2)" strokeWidth={1.5} name="Total" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
