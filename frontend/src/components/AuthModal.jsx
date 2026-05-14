import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RiCloseLine, RiMailLine, RiLockLine, RiUserLine, RiLoader4Line } from 'react-icons/ri'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../lib/errors'
import toast from 'react-hot-toast'

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login', subtitle }) {
  const [mode, setMode] = useState(initialMode)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login, register } = useAuth()

  // Sync mode when initialMode changes (e.g. when parent reopens with different mode)
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode, isOpen])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
        toast.success('Welcome back!')
      } else {
        await register(form)
        toast.success('Account created!')
      }
      setForm({ name: '', email: '', password: '' })
      // If a success callback is provided (e.g. auto-submit vote), call it
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setForm({ name: '', email: '', password: '' })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm rounded-2xl border border-border-subtle bg-bg-base shadow-2xl p-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-text-faint hover:text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-[13px] text-text-faint mt-1">
              {subtitle || (mode === 'login'
                ? 'Sign in to manage your polls'
                : 'Get started with Voicora for free')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[12px] font-medium text-text-muted mb-1.5">Name</label>
                <div className="relative">
                  <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-secondary border border-border-subtle text-[14px] text-text-primary placeholder-text-faint outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1.5">Email</label>
              <div className="relative">
                <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-secondary border border-border-subtle text-[14px] text-text-primary placeholder-text-faint outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-text-muted mb-1.5">Password</label>
              <div className="relative">
                <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-secondary border border-border-subtle text-[14px] text-text-primary placeholder-text-faint outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-[14px] font-medium text-bg-primary bg-text-primary hover:bg-text-secondary disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading && <RiLoader4Line className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Switch mode */}
          <p className="mt-5 text-center text-[13px] text-text-faint">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="text-accent-violet hover:underline font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
