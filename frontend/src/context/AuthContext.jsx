import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('voicora_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('voicora_token')
    if (!token) {
      setLoading(false)
      return
    }
    authApi.getProfile()
      .then((res) => {
        const profile = res.data.data
        setUser(profile)
        localStorage.setItem('voicora_user', JSON.stringify(profile))
      })
      .catch(() => {
        // Token invalid — clear everything
        localStorage.removeItem('voicora_token')
        localStorage.removeItem('voicora_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials)
    const { user: userData, token } = res.data.data
    localStorage.setItem('voicora_token', token)
    localStorage.setItem('voicora_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authApi.register(data)
    const { user: userData, token } = res.data.data
    localStorage.setItem('voicora_token', token)
    localStorage.setItem('voicora_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('voicora_token')
    localStorage.removeItem('voicora_user')
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
