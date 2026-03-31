const base = () => (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(t) {
  if (t) localStorage.setItem('token', t)
  else localStorage.removeItem('token')
}

async function request(path, options = {}) {
  const headers = { ...options.headers }
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${base()}${path}`, { ...options, headers })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { error: text || 'Invalid response' }
  }
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  problems: () => request('/api/problems/'),
  progress: () => request('/api/progress/'),
  setProgress: (problemId, completed) =>
    request(`/api/progress/${problemId}`, {
      method: 'PUT',
      body: JSON.stringify({ completed }),
    }),
}
