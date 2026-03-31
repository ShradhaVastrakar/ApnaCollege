import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Sheet from './pages/Sheet'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, ready } = useAuth()
  if (!ready) {
    return (
      <div className="sheet-wrap">
        <p className="muted">Loading…</p>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PublicOnly({ children }) {
  const { user, ready } = useAuth()
  if (!ready) {
    return (
      <div className="sheet-wrap">
        <p className="muted">Loading…</p>
      </div>
    )
  }
  if (user) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Sheet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
