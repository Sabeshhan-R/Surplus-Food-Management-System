import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import DonorDashboard from './pages/DonorDashboard'
import NgoDashboard from './pages/NgoDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
          
          <Route 
            path="/donor" 
            element={
              <ProtectedRoute allowedRoles={['Donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ngo" 
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <NgoDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/volunteer" 
            element={
              <ProtectedRoute allowedRoles={['Volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
