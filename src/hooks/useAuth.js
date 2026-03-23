import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function signUp({ email, password, fullName }) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      toast.success('Account created! Check your email to verify.')
      navigate('/verify-email')
    } catch (error) {
      toast.error(error.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function signIn({ email, password }) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  async function signInWithProvider(provider) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) throw error
    } catch (error) {
      toast.error(`Could not sign in with ${provider}. Please try again.`)
    }
  }

  async function signOut() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigate('/')
      toast.success('Signed out successfully.')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(email) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent!')
    } catch (error) {
      toast.error(error.message || 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return { signUp, signIn, signInWithProvider, signOut, resetPassword, loading }
}
