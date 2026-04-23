/**
 * App.jsx
 * --------
 * Root component — defines all the routes for the application.
 *
 * ROUTE STRUCTURE:
 * /track               — Public package tracking (home page)
 * /container           — Public sea freight container tracking (NEW)
 * /about               — About page
 * /services            — Services page (NEW)
 * /contact             — Contact page (NEW)
 * /login               — Main admin login
 * /dashboard           — Admin dashboard (logistics)
 * /port-admin/login    — Port admin login (NEW)
 * /port-admin/dashboard— Port admin dashboard (NEW)
 * /chat/:chatId        — Public customer chat
 *
 * For junior devs:
 * - AuthProvider wraps the whole app so any component can call useAuth()
 * - Each "area" (public, logistics admin, port admin) has separate login flows
 * - Routes are matched top-to-bottom — more specific routes should come first
 */

import { Routes, Route, Navigate } from 'react-router-dom'

// Context
import { AuthProvider } from './lib/auth-context'

// Layout components
import MainLayout from '@/components/layout/MainLayout'

// ── Public pages ─────────────────────────────────────────────────────────
import PublicTrack from '@/pages/public/PublicTrack'
import PublicChat from '@/pages/public/PublicChat'
import PublicLayout from '@/pages/public/PublicLayout'
import ContainerTrack from '@/pages/public/ContainerTrack'      // NEW: sea freight container tracking
import ServicesPage from '@/pages/public/ServicesPage'           // NEW
import ContactPage from '@/pages/public/ContactPage'             // NEW
import About from '@/components/layout/About'

// ── Auth pages ────────────────────────────────────────────────────────────
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'

// ── Logistics admin dashboard pages ──────────────────────────────────────
import Dashboard from '@/pages/dashboard/Dashboard'
import AdminPackages from '@/pages/dashboard/AdminPackage'
import CreatePackage from '@/pages/dashboard/CreatePackage'
import PackageDetail from '@/pages/dashboard/PackageDetail'
import AdminChat from '@/pages/dashboard/AdminChat'

// ── Port admin pages (NEW) ────────────────────────────────────────────────
import PortAdminLogin from '@/pages/port-admin/PortAdminLogin'
import PortAdminDashboard from '@/pages/port-admin/PortAdminDashboard'

export default function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Routes>

          {/* ── Default redirect ── */}
          <Route path="/" element={<Navigate to="/track" replace />} />

          {/* ── Public tracking pages ── */}
          <Route path="/track" element={<PublicTrack />} />
          <Route path="/container" element={<ContainerTrack />} />    {/* NEW */}
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<ServicesPage />} />        {/* NEW */}
          <Route path="/contact" element={<ContactPage />} />          {/* NEW */}

          {/* ── Customer chat ── */}
          <Route path="/chat/:chatId" element={<PublicChat />} />

          {/* Public layout wrapper (for any pages that need the public shell) */}
          <Route element={<PublicLayout />}>
            <Route path="/chat/:id" element={<PublicChat />} />
          </Route>

          {/* ── Logistics admin auth ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ── Logistics admin dashboard ── */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="packages" replace />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="packages/new" element={<CreatePackage />} />
            <Route path="packages/:id" element={<PackageDetail />} />
            <Route path="chat/:chatId" element={<AdminChat />} />
          </Route>

          {/* ── Port admin area (NEW) ── */}
          <Route path="/port-admin/login" element={<PortAdminLogin />} />
          <Route path="/port-admin/dashboard" element={<PortAdminDashboard />} />

          {/* ── 404 catch-all ── */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center text-center p-10">
                <div>
                  <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
                  <p className="text-gray-500 mb-6">Page not found</p>
                  <a href="/track" className="text-aramexRed hover:underline">← Back to tracking</a>
                </div>
              </div>
            }
          />
        </Routes>
      </MainLayout>
    </AuthProvider>
  )
}
