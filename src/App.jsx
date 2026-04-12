import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import DonorDashboard from './pages/DonorDashboard'
import NgoDashboard from './pages/NgoDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
<<<<<<< HEAD
=======
import ProtectedRoute from './components/ProtectedRoute'
>>>>>>> Sabeshhan

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/auth" />} />
          <Route path="/auth" element={<AuthPage />} />
<<<<<<< HEAD
          <Route path="/donor" element={<DonorDashboard />} />
          {/* Placeholders for other roles */}
          <Route path="/ngo" element={<NgoDashboard />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
=======
          
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
>>>>>>> Sabeshhan
        </Routes>
      </div>
    </Router>
  )
}

export default App
