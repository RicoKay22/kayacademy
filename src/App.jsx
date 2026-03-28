import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './store/AuthContext'
import { AppProvider } from './store/AppContext'
import { ThemeProvider } from './store/ThemeContext'
import { NotificationProvider } from './store/NotificationContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import CatalogPage from './pages/CatalogPage'
import DashboardPage from './pages/DashboardPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonPlayerPage from './pages/LessonPlayerPage'
import CertificatePage from './pages/CertificatePage'
import BookmarksPage from './pages/BookmarksPage'
import OnboardingPage from './pages/OnboardingPage'

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function PlayerLayout() {
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#0f2040',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#1E90FF', secondary: '#fff' } },
                error: { iconTheme: { primary: '#f87171', secondary: '#fff' } },
              }}
            />

            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/course/:courseId" element={<CourseDetailPage />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute><DashboardPage /></ProtectedRoute>
                } />
                <Route path="/certificate/:courseId" element={
                  <ProtectedRoute><CertificatePage /></ProtectedRoute>
                } />
                <Route path="/bookmarks" element={
                  <ProtectedRoute><BookmarksPage /></ProtectedRoute>
                } />
                <Route path="/onboarding" element={
                  <ProtectedRoute><OnboardingPage /></ProtectedRoute>
                } />
              </Route>

              <Route element={<PlayerLayout />}>
                <Route path="/course/:courseId/lesson/:lessonId" element={
                  <ProtectedRoute><LessonPlayerPage /></ProtectedRoute>
                } />
              </Route>

              <Route path="*" element={
                <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-center px-4">
                  <h1 className="font-display text-8xl font-bold text-gradient mb-4">404</h1>
                  <p className="text-slate-400 mb-6">This page doesn't exist.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
            </NotificationProvider>
        </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
