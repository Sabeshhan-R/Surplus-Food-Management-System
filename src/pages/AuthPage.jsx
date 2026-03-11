import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { LogIn, UserPlus, KeyRound, ArrowLeft, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/auth';

const AuthPage = () => {
  const navigate = useNavigate();
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
        
        const response = await axios.post(`${API_URL}/register`, {
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
          <Form.Label><Mail size={18} className="me-2" />Email Address</Form.Label>
          <Form.Control 
            type="email" 
            name="email"
            placeholder="name@example.com" 
            required 
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <div className="d-flex justify-content-between">
            <Form.Label><Lock size={18} className="me-2" />Password</Form.Label>
            <a href="#" className="auth-link small" onClick={() => setMode('forgot')}>Forgot?</a>
          </div>
          <Form.Control 
            type="password" 
            name="password"
            placeholder="••••••••" 
            required 
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 mb-3" disabled={status.loading}>
          {status.loading ? <Spinner animation="border" size="sm" className="me-2" /> : <LogIn size={20} className="me-2" />}
          Sign In
        </Button>
      </Form>
      
      <div className="auth-footer">
        <span>Don't have an account? </span>
        <a href="#" className="auth-link" onClick={() => setMode('register')}>Register Now</a>
      </div>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="animate-in">
      <h2 className="auth-title">Join the Mission</h2>
      <p className="auth-subtitle">Create an account to start your journey.</p>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label><User size={18} className="me-2" />Full Name</Form.Label>
          <Form.Control 
            type="text" 
            name="fullName"
            placeholder="John Doe" 
            required 
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><Mail size={18} className="me-2" />Email Address</Form.Label>
          <Form.Control 
            type="email" 
            name="email"
            placeholder="name@example.com" 
            required 
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><ShieldCheck size={18} className="me-2" />Select Role</Form.Label>
          <Form.Select name="role" onChange={handleChange}>
            <option value="Donor">Donor</option>
            <option value="NGO">NGO</option>
            <option value="Volunteer">Volunteer</option>
          </Form.Select>
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label><Lock size={18} className="me-2" />Password</Form.Label>
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
              <Form.Label>Confirm</Form.Label>
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

        <Button variant="primary" type="submit" className="w-100 mb-3" disabled={status.loading}>
          {status.loading ? <Spinner animation="border" size="sm" className="me-2" /> : <UserPlus size={20} className="me-2" />}
          Create Account
        </Button>
      </Form>
      
      <div className="auth-footer">
        <span>Already have an account? </span>
        <a href="#" className="auth-link" onClick={() => setMode('login')}>Sign In</a>
      </div>
    </div>
  );

  const renderForgotForm = () => (
    <div className="animate-in">
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">Enter your email to receive a reset link.</p>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-4">
          <Form.Label><Mail size={18} className="me-2" />Email Address</Form.Label>
          <Form.Control 
            type="email" 
            name="email"
            placeholder="name@example.com" 
            required 
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 mb-3" disabled={status.loading}>
          {status.loading ? <Spinner animation="border" size="sm" className="me-2" /> : <KeyRound size={20} className="me-2" />}
          Send Reset Link
        </Button>
      </Form>
      
      <div className="auth-footer">
        <a href="#" className="auth-link d-flex align-items-center justify-content-center" onClick={() => setMode('login')}>
          <ArrowLeft size={16} className="me-2" /> Back to Login
        </a>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle p-3 mb-3" style={{ width: '60px', height: '60px' }}>
            <LogIn size={30} />
          </div>
          <h1 className="h4" style={{ fontWeight: '800', letterSpacing: '-0.5px' }}>SurplusFood</h1>
        </div>

        {status.message && (
          <Alert variant={status.type} className="animate-in">
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
