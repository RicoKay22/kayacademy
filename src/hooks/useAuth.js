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

  // Check if email is registered by attempting OTP with shouldCreateUser: false
  // If user doesn't exist, Supabase returns an error
  async function resetPassword(email) {
    setLoading(true)
    try {
      // First check if email is registered using signInWithOtp
      // shouldCreateUser: false means it will error if user doesn't exist
      const { error: checkError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      })

      // If error contains "user not found" or similar — email not registered
      if (checkError) {
        const msg = checkError.message?.toLowerCase() ?? ''
        if (
          msg.includes('user not found') ||
          msg.includes('no user') ||
          msg.includes('not found') ||
          msg.includes('signup disabled') ||
          msg.includes('email not confirmed') === false && msg.includes('invalid')
        ) {
          toast.error('No account found with this email. Please use the email you signed up with.')
          setLoading(false)
          return { exists: false }
        }
      }

      // Email exists — send actual password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent!')
      return { exists: true }
    } catch (error) {
      // If the error is specifically about user not existing
      const msg = error.message?.toLowerCase() ?? ''
      if (msg.includes('user') && (msg.includes('not found') || msg.includes('no user'))) {
        toast.error('No account found with this email. Please use the email you signed up with.')
        return { exists: false }
      }
      toast.error(error.message || 'Could not send reset email.')
      return { exists: false }
    } finally {
      setLoading(false)
    }
  }

  return { signUp, signIn, signInWithProvider, signOut, resetPassword, loading }
}
