import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  const load = useCallback(async () => {
    const t = getToken()
    if (!t) {
      setUser(null)
      setReady(true)
      return
    }
    try {
      const { user: u } = await api.me()
      setUser(u)
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await api.login({ email, password })
    setToken(token)
    setUser(u)
    return u
  }, [])

  const register = useCallback(async (email, password, name) => {
    const { token, user: u } = await api.register({ email, password, name })
    setToken(token)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, ready, login, register, logout, refresh: load }),
    [user, ready, login, register, logout, load]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
