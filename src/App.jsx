import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import DonorDashboard from './pages/DonorDashboard'
import NgoDashboard from './pages/NgoDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/ngo" element={<NgoDashboard />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
