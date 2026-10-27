import { useState } from "react";
import { AuthContext } from "./authContext.js";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('creatorcircle_user') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('creatorcircle_token'))
  const [user, setUser] = useState(getStoredUser)

  const login = (authData) => {
    localStorage.setItem('creatorcircle_token', authData.token)
    localStorage.setItem('creatorcircle_user', JSON.stringify(authData.user))
    setToken(authData.token)
    setUser(authData.user)
  }

  const logout = () => {
    localStorage.removeItem('creatorcircle_token')
    localStorage.removeItem('creatorcircle_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updates) => {
    if (!user) return
    const nextUser = { ...user, ...updates }
    localStorage.setItem('creatorcircle_user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}