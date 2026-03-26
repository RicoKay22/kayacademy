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
      // RELIABLE EMAIL CHECK:
      // Try signing in with a dummy password.
      // "Invalid login credentials" = email exists, wrong password ✅
      // "Email not confirmed" = email exists but unverified ✅
      // Anything else = email not registered ❌
      const { error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password: `__KA_CHECK_${Date.now()}__`, // intentionally wrong password
      })

      const errMsg = checkError?.message?.toLowerCase() ?? ''

      const emailExists =
        errMsg.includes('invalid login credentials') ||
        errMsg.includes('invalid credentials') ||
        errMsg.includes('email not confirmed') ||
        errMsg.includes('wrong password') ||
        errMsg.includes('password') // any password-related error means email IS found

      if (!emailExists) {
        toast.error('No account found with this email. Please use the email you signed up with.')
        setLoading(false)
        return { exists: false }
      }

      // Email is registered — send the actual reset link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Password reset email sent!')
      return { exists: true }

    } catch (error) {
      toast.error(error.message || 'Could not send reset email.')
      return { exists: false }
    } finally {
      setLoading(false)
    }
  }

  return { signUp, signIn, signInWithProvider, signOut, resetPassword, loading }
}
