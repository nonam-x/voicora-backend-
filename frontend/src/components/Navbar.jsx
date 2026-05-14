import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RiMenuLine, RiCloseLine } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Live Polls', href: '#live-polls' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Engagement', href: '#engagement' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openLogin = () => setAuthModal({ open: true, mode: 'login' })
  const openRegister = () => setAuthModal({ open: true, mode: 'register' })
  const closeAuth = () => {
    setAuthModal({ ...authModal, open: false })
    // If user just logged in, redirect to dashboard
    if (localStorage.getItem('voicora_token')) {
      navigate('/app')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`flex items-center justify-between h-16 transition-all duration-300 ${
              scrolled ? 'border-b border-border-subtle' : 'border-b border-transparent'
            }`}
          >
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <img src="/voicora-logo.png" alt="Voicora" width="22" height="22" className="invert" />
              <span className="text-[15px] font-semibold text-text-primary tracking-tight">
                Voicora
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-1.5 text-[13px] text-text-faint hover:text-text-primary transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/app')}
                    className="text-[13px] text-text-faint hover:text-text-primary transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 text-[13px] font-medium text-text-faint border border-border-subtle rounded-full hover:text-text-primary hover:border-border-default transition-all"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={openLogin}
                    className="text-[13px] text-text-faint hover:text-text-primary transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={openRegister}
                    className="px-4 py-1.5 text-[13px] font-medium text-bg-primary bg-text-primary rounded-full hover:bg-text-secondary transition-colors"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-text-faint hover:text-text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {scrolled && (
          <div className="absolute inset-0 -z-10 bg-bg-primary/80 backdrop-blur-xl border-b border-border-subtle" />
        )}
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-bg-primary/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-lg text-text-faint hover:text-text-primary transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-6 border-t border-border-subtle flex flex-col items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <button onClick={() => { setMobileOpen(false); navigate('/app') }} className="text-sm text-text-faint hover:text-text-primary">
                      Dashboard
                    </button>
                    <button onClick={() => { setMobileOpen(false); handleLogout() }} className="px-6 py-2 text-sm font-medium text-text-faint border border-border-subtle rounded-full">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setMobileOpen(false); openLogin() }} className="text-sm text-text-faint hover:text-text-primary">Log in</button>
                    <button onClick={() => { setMobileOpen(false); openRegister() }} className="px-6 py-2 text-sm font-medium text-bg-primary bg-text-primary rounded-full">
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.open}
        onClose={closeAuth}
        initialMode={authModal.mode}
      />
    </>
  )
}
