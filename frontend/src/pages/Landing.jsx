import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import LivePollShowcase from '../components/LivePollShowcase'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import AudienceEngagement from '../components/AudienceEngagement'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-bg-primary">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <LivePollShowcase />
        <AnalyticsDashboard />
        <AudienceEngagement />
      </main>
      <Footer />
    </div>
  )
}
