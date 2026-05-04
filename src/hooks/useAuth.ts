import type { User } from '@supabase/supabase-js'
import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import {
  getCurrentUser,
  onAuthStateChange,
  signInWithEmail,
  signOut as signOutUser,
} from '../services/authService'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()

        if (!isActive) {
          return
        }

        setUser(currentUser)
      } catch {
        if (!isActive) {
          return
        }

        setUser(null)
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void initializeAuth()

    const unsubscribe = onAuthStateChange((nextUser) => {
      if (!isActive) {
        return
      }

      setUser(nextUser)
      setLoading(false)
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: user !== null,
    signIn: async (email: string, password: string) => {
      setLoading(true)

      try {
        const signedInUser = await signInWithEmail(email, password)
        setUser(signedInUser)
      } finally {
        setLoading(false)
      }
    },
    signOut: async () => {
      setLoading(true)

      try {
        await signOutUser()
        setUser(null)
      } finally {
        setLoading(false)
      }
    },
  }

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
