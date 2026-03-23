import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './store/AuthContext'
import { AppProvider } from './store/AppContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'

// Pages
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

// Layout with Navbar
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

// Lesson player has its own full-screen layout (no navbar)
function PlayerLayout() {
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
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
            {/* Main layout — with Navbar */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/catalog" element={<CatalogPage />} />

              {/* Course detail */}
              <Route path="/course/:courseId" element={<CourseDetailPage />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />
              <Route path="/certificate/:courseId" element={
                <ProtectedRoute><CertificatePage /></ProtectedRoute>
              } />
            </Route>

            {/* Lesson player — full screen, no navbar */}
            <Route element={<PlayerLayout />}>
              <Route path="/course/:courseId/lesson/:lessonId" element={
                <ProtectedRoute><LessonPlayerPage /></ProtectedRoute>
              } />
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-center px-4">
                <h1 className="font-display text-8xl font-bold text-gradient mb-4">404</h1>
                <p className="text-slate-400 mb-6">This page doesn't exist.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            } />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
