import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Nav, Navbar, Alert, Toast, ToastContainer } from 'react-bootstrap';
import {
  LayoutDashboard,
  LogOut,
  MapPin,
  CheckCircle,
  Truck,
  Bell,
  Navigation,
  Check,
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import MapComponent from '../components/MapComponent';
import { TableSkeleton } from '../components/Skeleton';

const API_URL = 'http://localhost:5000/api/listings';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')) || { fullName: 'Volunteer Hero' });
  const [activeTab, setActiveTab] = useState('overview');
  const [availablePickups, setAvailablePickups] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [viewingMap, setViewingMap] = useState(null);
  const [currentUserLocation, setCurrentUserLocation] = useState([79.8612, 6.9271]);

  const [notifications, setNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const prevListingsRef = useRef([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get(`http://localhost:5000/api/notifications/${user.id}`);
      setNotifications(res.data.data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const addNotification = async (text) => {
    try {
      await API.post('http://localhost:5000/api/notifications', { userId: user.id, text });
      fetchNotifications();
      setToastMessage(text);
      setShowToast(true);
    } catch (err) {
      console.error('Error adding notification:', err);
    }
  };

  const clearNotification = async (id) => {
    try {
      await API.delete(`http://localhost:5000/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error clearing notification:', err);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    navigate('/auth');
  };

  const fetchListings = async () => {
    try {
      const res = await API.get(API_URL);
      const allListings = res.data.data.listings;

      if (prevListingsRef.current.length > 0) {
        // Detect new assignment looking for driver
        const newAvailable = allListings.filter(l => l.status === 'Assigned' && l.volunteer === 'Pending Assignment' && !prevListingsRef.current.find(pl => pl._id === l._id && pl.status === 'Assigned' && pl.volunteer === 'Pending Assignment'));

        newAvailable.forEach(item => {
          addNotification(`New rescue needed for: ${item.item}!`);
        });
      }

      prevListingsRef.current = allListings;

      // Available to accept: Assigned but no specific volunteer claimed it yet
      setAvailablePickups(allListings.filter(l => l.status === 'Assigned' && l.volunteer === 'Pending Assignment'));

      // Active tasks for this volunteer
      setActiveTasks(allListings.filter(l => (l.status === 'Assigned' || l.status === 'In Transit') && l.volunteer === user.fullName));

      // Completed pickups by this volunteer
      setHistory(allListings.filter(l => l.status === 'Picked Up' && l.volunteer === user.fullName));
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchListings();
      fetchNotifications();
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [user.id]);

  // Live Location Broadcast for "In Transit" tasks
  useEffect(() => {
    const activeTransitTask = activeTasks.find(t => t.status === 'In Transit');
    if (!activeTransitTask) return;

    const watchId = navigator.geolocation.watchPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setCurrentUserLocation([longitude, latitude]);
      try {
        await API.put(`${API_URL}/${activeTransitTask._id}`, {
          volunteerLocation: { coordinates: [longitude, latitude] }
        });
      } catch (err) {
        console.error('Error broadcasting location:', err);
      }
    }, (err) => console.error('Watch error:', err), {
      enableHighAccuracy: true,
      maximumAge: 5000
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [activeTasks]);

  // General location tracking for markers
  useEffect(() => {
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(pos => {
         setCurrentUserLocation([pos.coords.longitude, pos.coords.latitude]);
       });
    }
  }, []);

  const updateStatus = async (id, newStatus, volunteerName = user.fullName) => {
    try {
      await API.put(`${API_URL}/${id}`, { status: newStatus, volunteer: volunteerName });
      fetchListings();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Assigned': return <Badge bg="info">Pending Pickup</Badge>;
      case 'In Transit': return <Badge bg="primary">In Transit</Badge>;
      case 'Picked Up': return <Badge bg="success">Completed</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar bg="white" className="shadow-sm px-4 py-3 sticky-top">
        <Navbar.Brand className="d-flex align-items-center text-primary fw-bold">
          <Truck className="me-2" /> SurplusFood Volunteer
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Nav className="align-items-center">
            <span className="me-3 text-muted d-none d-md-block">Welcome, <strong>{user.fullName}</strong></span>
            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center">
              <LogOut size={16} className="me-2" /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="py-5">
        <Row>
          {/* Sidebar Tabs */}
          <Col lg={3} className="mb-4">
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Body className="p-0">
                <Nav className="flex-column">
                  <Nav.Link
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <LayoutDashboard className="me-3" size={20} /> Dashboard
                  </Nav.Link>
                  <Nav.Link
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'active' ? 'bg-primary text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('active')}
                  >
                    <Navigation className="me-3" size={20} /> Active Pickups
                  </Nav.Link>
                  <Nav.Link
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'history' ? 'bg-primary text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('history')}
                  >
                    <CheckCircle className="me-3" size={20} /> Pickup History
                  </Nav.Link>
                  <Nav.Link
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'notifications' ? 'bg-primary text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell className="me-3" size={20} /> Notifications
                    <Badge pill bg="danger" className="ms-auto">{notifications.length}</Badge>
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          {/* Main Content Area */}
          <Col lg={9}>
            {activeTab === 'overview' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">Volunteer Dashboard</h4>
                <Row className="g-4 mb-4">
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <MapPin className="mx-auto mb-3 text-warning" size={32} />
                      <h3 className="fw-bold mb-0">{availablePickups.length}</h3>
                      <p className="text-muted mb-0">Open Pickups Available</p>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <Truck className="mx-auto mb-3 text-primary" size={32} />
                      <h3 className="fw-bold mb-0">{activeTasks.length}</h3>
                      <p className="text-muted mb-0">My Active Tasks</p>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <CheckCircle className="mx-auto mb-3 text-success" size={32} />
                      <h3 className="fw-bold mb-0">{history.length}</h3>
                      <p className="text-muted mb-0">Lifetime Deliveries</p>
                    </Card>
                  </Col>
                </Row>

                <Card className="border-0 shadow-sm rounded-4 mb-4">
                  <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Live Rescue Map</h5>
                    <Badge bg="success">{availablePickups.length} Nearby</Badge>
                  </Card.Header>
                  <Card.Body>
                    <div style={{ height: '350px' }} className="rounded-4 overflow-hidden border">
                      <MapComponent 
                        center={[79.8612, 6.9271]}
                        zoom={12}
                        markers={availablePickups.map(item => ({
                          coordinates: item.location?.coordinates || [79.8612, 6.9271],
                          title: item.item,
                          color: "#ffc107"
                        }))}
                      />
                    </div>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm rounded-4">
                   <Card.Header className="bg-white py-3 border-0">
                    <h5 className="fw-bold mb-0">Accept Open Pickups</h5>
                  </Card.Header>
                  <Card.Body>
                    {isLoading ? (
                      <TableSkeleton rows={3} />
                    ) : (
                      <Table responsive hover borderless className="align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availablePickups.slice(0, 5).map(item => (
                            <tr key={item._id}>
                              <td className="fw-bold">{item.item}</td>
                              <td>{item.quantity}</td>
                              <td><Badge bg="warning" text="dark">Looking for Driver</Badge></td>
                              <td>
                                <Button variant="outline-primary" size="sm" onClick={() => updateStatus(item._id, 'Assigned', user.fullName)}>
                                  <Check size={14} className="me-1" /> Accept
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {availablePickups.length === 0 && (
                            <tr>
                              <td colSpan="4" className="text-center py-4 text-muted">No pending rescues available right now.</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'active' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">My Active Rescues</h4>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Listing</th>
                        <th>Details</th>
                        <th>Status</th>
                        <th>Live Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTasks.map(item => (
                        <tr key={item._id}>
                          <td>
                            <div className="fw-bold">{item.item}</div>
                            <small className="text-muted">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</small>
                          </td>
                          <td>
                            <div>Qty: {item.quantity}</div>
                            <small className="text-danger">Exp: {new Date(item.expiry).toLocaleString()}</small>
                          </td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              {item.status === 'Assigned' && (
                                <Button variant="primary" size="sm" className="d-flex align-items-center" onClick={() => updateStatus(item._id, 'In Transit')}>
                                  <Play size={14} className="me-1" /> Start Pickup
                                </Button>
                              )}
                              {item.status === 'In Transit' && (
                                <Button variant="success" size="sm" className="d-flex align-items-center" onClick={() => updateStatus(item._id, 'Picked Up')}>
                                  <CheckCircle size={14} className="me-1" /> Complete
                                </Button>
                              )}
                              <Button variant="light" size="sm" className="text-secondary border d-flex align-items-center" onClick={() => setViewingMap(item)}>
                                <MapPin size={14} className="me-1" /> View Map
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {activeTasks.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">You have no active rescues right now. Head to Dashboard to accept one!</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">My Impact History</h4>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Listing</th>
                        <th>Quantity Delivered</th>
                        <th>Final Status</th>
                        <th>Date Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(item => (
                        <tr key={item._id}>
                          <td>
                            <div className="fw-bold">{item.item}</div>
                            <small className="text-muted">SF-{item._id.substring(item._id.length - 4)}</small>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>{new Date(item.createdAt).toLocaleDateString()}</td> {/* Assuming createdAt acts as rough completion time since we lack a completedAt property */}
                        </tr>
                      ))}
                      {history.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">You haven't completed any rescues yet. Get started today!</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">Alerts & Routing Notifications</h4>
                {notifications.map(notif => (
                  <Alert key={notif._id} variant="light" className="shadow-sm border-0 rounded-4 mb-3 d-flex align-items-center">
                    <Bell className="text-primary me-3" size={20} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{notif.text}</div>
                      <small className="text-muted">{notif.time || 'Just now'}</small>
                    </div>
                    <Button variant="link" className="text-muted p-0 ms-3" onClick={() => clearNotification(notif._id)}>Clear</Button>
                  </Alert>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <Bell size={48} className="mb-3 opacity-50 mx-auto" />
                    <p>No new alerts.</p>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Map / Route Placeholder Modal */}
      <Modal show={!!viewingMap} onHide={() => setViewingMap(null)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Live Route Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
           {viewingMap && (
             <div className="text-center">
              <div className="rounded-4 overflow-hidden border mb-3" style={{ height: '400px' }}>
                <MapComponent 
                  center={currentUserLocation}
                  zoom={15}
                  markers={[
                    {
                      coordinates: viewingMap.location?.coordinates || [79.8612, 6.9271],
                      title: "Donation Pickup Site",
                      subtitle: viewingMap.item,
                      color: "#198754"
                    },
                    {
                      coordinates: currentUserLocation,
                      title: "Your Location",
                      subtitle: "Tracking you live...",
                      color: "#0d6efd"
                    }
                  ]}
                />
              </div>
              <div className="text-start p-3 bg-light rounded-4">
                <Row className="align-items-center">
                  <Col md={8}>
                    <p className="mb-1"><strong>Item:</strong> {viewingMap.item}</p>
                    <p className="mb-1"><strong>Address:</strong> {viewingMap.location?.address || 'N/A'}</p>
                    <p className="mb-0 text-primary small"><Navigation size={12} className="me-1" /> Dash-line shows path to destination.</p>
                  </Col>
                  <Col md={4} className="text-md-end mt-3 mt-md-0">
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        const [lng, lat] = viewingMap.location?.coordinates || [0,0];
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                      }}
                    >
                      <Navigation size={14} className="me-1" /> Navigate
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          )}
          <Button variant="primary" onClick={() => setViewingMap(null)} className="w-100 py-2 mt-4 fw-bold">
            Close Map
          </Button>
        </Modal.Body>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide>
          <Toast.Header>
            <Bell className="me-2 text-primary" size={16} />
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default VolunteerDashboard;
