import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { LogIn, UserPlus, KeyRound, ArrowLeft, Mail, Lock, User, Leaf } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/auth';

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (user.role === 'Donor') navigate('/donor');
      else if (user.role === 'NGO') navigate('/ngo');
      else if (user.role === 'Volunteer') navigate('/volunteer');
    }
  }, [navigate]);

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'Donor'
  });
  const [status, setStatus] = useState({ type: '', message: '', loading: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '', loading: true });

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        await axios.post(`${API_URL}/register`, {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        
        setStatus({ 
          type: 'success', 
          message: 'Registration successful! You can now log in.', 
          loading: false 
        });
        setTimeout(() => setMode('login'), 2000);
      } else if (mode === 'login') {
        const response = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password
        });
        
        const userData = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(userData));

        setStatus({ 
          type: 'success', 
          message: `Welcome back, ${userData.fullName}! Redirecting...`, 
          loading: false 
        });

        // Redirect based on role
        setTimeout(() => {
          if (userData.role === 'Donor') navigate('/donor');
          else if (userData.role === 'NGO') navigate('/ngo');
          else if (userData.role === 'Volunteer') navigate('/volunteer');
        }, 1500);
      } else {
        // Forgot password logic placeholder
        setStatus({ 
          type: 'success', 
          message: 'Reset link sent to your email.', 
          loading: false 
        });
      }
    } catch (err) {
      setStatus({ 
        type: 'danger', 
        message: err.response?.data?.message || err.message || 'An error occurred', 
        loading: false 
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const renderLoginForm = () => (
    <div className="animate-in">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Log in to keep saving food and lives.</p>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-muted"><Mail size={14} className="me-1" />Email Address</Form.Label>
          <Form.Control 
            type="email" 
            name="email"
            placeholder="name@example.com" 
            required 
            onChange={handleChange}
            className="py-2"
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <Form.Label className="small fw-bold text-muted mb-0"><Lock size={14} className="me-1" />Password</Form.Label>
            <span role="button" className="auth-link small" onClick={() => setMode('forgot')}>Forgot?</span>
          </div>
          <Form.Control 
            type="password" 
            name="password"
            placeholder="••••••••" 
            required 
            onChange={handleChange}
            className="py-2 mt-2"
          />
        </Form.Group>

        <button type="submit" className="action-btn primary w-100 py-2 mb-3" disabled={status.loading}>
          {status.loading ? <Spinner animation="border" size="sm" className="me-2" /> : <LogIn size={18} className="me-2" />}
          Sign In
        </button>
      </Form>
      
      <div className="text-center mt-4">
        <span className="text-muted small">Don't have an account? </span>
        <span role="button" className="auth-link small" onClick={() => setMode('register')}>Register Now</span>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="animate-in">
      <h2 className="auth-title">Join the Mission</h2>
      <p className="auth-subtitle">Create an account to start your journey.</p>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-muted"><User size={14} className="me-1" />Full Name</Form.Label>
          <Form.Control 
            type="text" 
            name="fullName"
            placeholder="John Doe" 
            required 
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-muted"><Mail size={14} className="me-1" />Email Address</Form.Label>
          <Form.Control 
            type="email" 
            name="email"
            placeholder="name@example.com" 
            required 
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="small fw-bold text-muted mb-2">Select Your Role</Form.Label>
          <Row className="g-2">
            {[
              { role: 'Donor', icon: '🍲', desc: 'Donate Food' },
              { role: 'NGO', icon: '❤️', desc: 'Receive Food' },
              { role: 'Volunteer', icon: '🚚', desc: 'Deliver Food' }
            ].map(r => (
              <Col key={r.role} xs={4}>
                <div 
                  className={`border rounded-3 p-2 text-center cursor-pointer h-100 d-flex flex-column justify-content-center align-items-center transition ${formData.role === r.role ? 'border-success bg-success bg-opacity-10 shadow-sm' : 'border-light-subtle bg-white'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setFormData({ ...formData, role: r.role })}
                >
                  <div className="fs-4 mb-1">{r.icon}</div>
                  <div className="fw-bold" style={{ fontSize: '0.75rem' }}>{r.role}</div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>{r.desc}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted"><Lock size={14} className="me-1" />Password</Form.Label>
              <Form.Control 
                type="password" 
                name="password"
                placeholder="••••••••" 
                required 
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted"><Lock size={14} className="me-1" />Confirm</Form.Label>
              <Form.Control 
                type="password" 
                name="confirmPassword"
                placeholder="••••••••" 
                required 
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <button type="submit" className="action-btn primary w-100 py-2 mb-3" disabled={status.loading}>
          {status.loading ? <Spinner animation="border" size="sm" className="me-2" /> : <UserPlus size={18} className="me-2" />}
          Create Account
        </button>
      </Form>
      
      <div className="text-center mt-3">
        <span className="text-muted small">Already have an account? </span>
        <span role="button" className="auth-link small" onClick={() => setMode('login')}>Sign In</span>
      </div>
    </div>
  );

  const renderForgotForm = () => (
    <div className="animate-in">
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">Enter your email to receive a reset link.</p>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label className="small fw-bold text-muted"><Mail size={14} className="me-1" />Email Address</Form.Label>
          <Form.Control 
            type="email" 
            name="email"
            placeholder="name@example.com" 
            required 
            onChange={handleChange}
            className="py-2"
          />
        </Form.Group>

        <button type="submit" className="action-btn primary w-100 py-2 mb-3" disabled={status.loading}>
          {status.loading ? <Spinner animation="border" size="sm" className="me-2" /> : <KeyRound size={18} className="me-2" />}
          Send Reset Link
        </button>
      </Form>
      
      <div className="text-center mt-4">
        <span role="button" className="auth-link small d-inline-flex align-items-center" onClick={() => setMode('login')}>
          <ArrowLeft size={14} className="me-1" /> Back to Login
        </span>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center text-white rounded-4 shadow-sm mb-3" style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}>
            <Leaf size={28} />
          </div>
          <h1 className="h4 section-title mb-1">SurplusFood</h1>
          <p className="text-muted small fw-medium">Rescue food. Feed lives.</p>
        </div>

        {status.message && (
          <Alert variant={status.type === 'danger' ? 'danger' : 'success'} className="animate-in shadow-sm rounded-3 py-2 px-3 small d-flex align-items-center border-0">
            {status.message}
          </Alert>
        )}

        {mode === 'login' && renderLoginForm()}
        {mode === 'register' && renderRegisterForm()}
        {mode === 'forgot' && renderForgotForm()}
      </div>
    </div>
  );
};

export default AuthPage;
