import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import CreatePoll from './pages/CreatePoll'
import PollResponse from './pages/PollResponse'
import PollAnalytics from './pages/PollAnalytics'
import PollResults from './pages/PollResults'
import ProtectedRoute from './components/ProtectedRoute'
import Admin from './pages/Admin'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/poll/:slug" element={<PollResponse />} />
        <Route path="/results/:id" element={<PollResults />} />
        <Route path="/admin" element={<Admin />} />

        {/* App (authenticated) */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreatePoll />} />
          <Route path="analytics/:id" element={<PollAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
