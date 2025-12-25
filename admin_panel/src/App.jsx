import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // セッションチェック
    const session = sessionStorage.getItem('pc_check_auth')
    if (session === 'authenticated') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    sessionStorage.setItem('pc_check_auth', 'authenticated')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('pc_check_auth')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return <Dashboard onLogout={handleLogout} />
}

export default App
