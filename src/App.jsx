import { Routes, Route, Navigate } from 'react-router-dom'

import MainLayout from '@/components/layout/MainLayout'

// Public pages
import PublicTrack from '@/pages/public/PublicTrack'
import PublicChat from '@/pages/public/PublicChat'
import PublicLayout from '@/pages/public/PublicLayout'

// Auth pages
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'

// Dashboard + nested pages
import Dashboard from '@/pages/dashboard/Dashboard'
import AdminPackages from '@/pages/dashboard/AdminPackage'
import CreatePackage from '@/pages/dashboard/CreatePackage'
import PackageDetail from '@/pages/dashboard/PackageDetail'
import About from '@/components/layout/About'
import AdminChat from '@/pages/dashboard/AdminChat' 

import { AuthProvider } from './lib/auth-context'

export default function App() {
  return (
    <AuthProvider>
      <MainLayout>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Navigate to="/track" replace />} />
          <Route path="/track" element={<PublicTrack />} />
          <Route path="/about" element={<About />} />
          <Route path="/chat/:chatId" element={<PublicChat />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicTrack />} />
            <Route path="/chat/:id" element={<PublicChat />} />
          </Route>


          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="packages" replace />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="packages/new" element={<CreatePackage />} />
            <Route path="packages/:id" element={<PackageDetail />} />
            <Route path="chat/:chatId" element={<AdminChat />} /> 
          </Route>

          {/* 404 */}
          <Route path="*" element={<div className="p-10 text-center">Page Not Found</div>} />

        </Routes>
      </MainLayout>
    </AuthProvider>
  )
}
