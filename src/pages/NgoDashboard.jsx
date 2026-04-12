import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Nav, Navbar, Alert, Toast, ToastContainer } from 'react-bootstrap';
import {
  LayoutDashboard,
  ListOrdered,
  Bell,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  Heart,
  Eye,
  Check,
  X,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import MapComponent from '../components/MapComponent';
import { TableSkeleton } from '../components/Skeleton';

const API_URL = 'http://localhost:5000/api/listings';

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')) || { fullName: 'NGO User' });
  const [activeTab, setActiveTab] = useState('overview');
  const [availableDonations, setAvailableDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingListing, setViewingListing] = useState(null);
  const [trackingListing, setTrackingListing] = useState(null);

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
        const newAvailable = allListings.filter(l => l.status === 'Pending' && !prevListingsRef.current.find(pl => pl._id === l._id && pl.status === 'Pending'));
        
        newAvailable.forEach(item => {
          addNotification(`New donation available: ${item.quantity} of ${item.item}!`);
        });

        // Track updates to our accepted/in-progress donations
        const myPrevAccepted = prevListingsRef.current.filter(l => l.status === 'Assigned' || l.status === 'In Transit' || l.status === 'Picked Up');
        allListings.forEach(item => {
          const oldItem = myPrevAccepted.find(pl => pl._id === item._id);
          if (oldItem && oldItem.status !== item.status) {
            addNotification(`Update: ${item.item} is now ${item.status}.`);
          }
        });
      }

      prevListingsRef.current = allListings;

      // Filter for available (Pending)
      setAvailableDonations(allListings.filter(l => l.status === 'Pending'));
      // In a real app, myRequests would be filtered where requestedBy === user.id
      setMyRequests(allListings.filter(l => l.status === 'Assigned' || l.status === 'In Transit' || l.status === 'Picked Up'));
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(); // Initial fetch
    fetchNotifications();
    const interval = setInterval(() => {
      fetchListings();
      fetchNotifications();
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [user.id]);

  const handleAcceptDonation = async (id) => {
    try {
      await API.put(`${API_URL}/${id}`, { status: 'Assigned', volunteer: 'Pending Assignment' });
      fetchListings();
    } catch (err) {
      console.error('Error accepting donation:', err);
      alert('Failed to accept donation');
    }
  };

  const handleRejectDonation = async (id) => {
    if (window.confirm("Are you sure you want to reject this donation?")) {
      try {
        await API.put(`${API_URL}/${id}`, { status: 'Rejected', volunteer: 'Not Assigned' });
        fetchListings();
      } catch (err) {
        console.error('Error rejecting donation:', err);
        alert('Failed to reject donation');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge bg="warning" text="dark">Available</Badge>;
      case 'Assigned': return <Badge bg="info">Requested / Assigned</Badge>;
      case 'In Transit': return <Badge bg="primary">In Transit</Badge>;
      case 'Picked Up': return <Badge bg="success">Completed</Badge>;
      case 'Rejected': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar bg="white" className="shadow-sm px-4 py-3 sticky-top">
        <Navbar.Brand className="d-flex align-items-center text-primary fw-bold">
          <Heart className="me-2" /> SurplusFood NGO
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
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'available' ? 'bg-primary text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('available')}
                  >
                    <ListOrdered className="me-3" size={20} /> Food Requests
                  </Nav.Link>
                  <Nav.Link
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'requests' ? 'bg-primary text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('requests')}
                  >
                    <CheckCircle className="me-3" size={20} /> My Received Donations
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
                <h4 className="fw-bold mb-4">Dashboard Overview</h4>
                <Row className="g-4 mb-4">
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <ListOrdered className="mx-auto mb-3 text-primary" size={32} />
                      <h3 className="fw-bold mb-0">{availableDonations.length}</h3>
                      <p className="text-muted mb-0">Donations Available</p>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <Clock className="mx-auto mb-3 text-warning" size={32} />
                      <h3 className="fw-bold mb-0">{myRequests.filter(r => r.status === 'Assigned').length}</h3>
                      <p className="text-muted mb-0">Pending Deliveries</p>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <CheckCircle className="mx-auto mb-3 text-success" size={32} />
                      <h3 className="fw-bold mb-0">{myRequests.filter(r => r.status === 'Picked Up').length}</h3>
                      <p className="text-muted mb-0">Completed Requests</p>
                    </Card>
                  </Col>
                </Row>

                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Header className="bg-white py-3 border-0">
                    <h5 className="fw-bold mb-0">Recent Available Donations</h5>
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
                            <th>Expiry</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableDonations.slice(0, 5).map(item => (
                            <tr key={item._id}>
                              <td className="fw-bold">{item.item}</td>
                              <td>{item.quantity}</td>
                              <td>{new Date(item.expiry).toLocaleString()}</td>
                              <td>
                                <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleAcceptDonation(item._id)}>
                                  <Check size={14} className="me-1" /> Accept
                                </Button>
                                <Button variant="link" size="sm" className="p-0 text-primary" onClick={() => setViewingListing(item)}>
                                  <Eye size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {availableDonations.length === 0 && (
                            <tr>
                              <td colSpan="4" className="text-center py-4 text-muted">No donations currently available.</td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'available' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">Available Food Requests / Donations</h4>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Listing</th>
                        <th>Quantity</th>
                        <th>Expiry</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableDonations.map(item => (
                        <tr key={item._id}>
                          <td>
                            <div className="fw-bold">{item.item}</div>
                            <small className="text-muted">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</small>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{new Date(item.expiry).toLocaleString()}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Button variant="success" size="sm" className="me-2 d-flex align-items-center" onClick={() => handleAcceptDonation(item._id)}>
                                <Check size={14} className="me-1" /> Accept
                              </Button>
                              <Button variant="danger" size="sm" className="me-2 d-flex align-items-center" onClick={() => handleRejectDonation(item._id)}>
                                <X size={14} className="me-1" /> Reject
                              </Button>
                              <Button variant="light" size="sm" className="text-primary" onClick={() => setViewingListing(item)}>
                                <Eye size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {availableDonations.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">No donations currently available.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">Tracking Received Donations</h4>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                      <tr>
                        <th>Listing</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.map(item => (
                        <tr key={item._id}>
                          <td>
                            <div className="fw-bold">{item.item}</div>
                            <small className="text-muted">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</small>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2 d-flex align-items-center" onClick={() => setTrackingListing(item)}>
                              <Truck size={14} className="me-1" /> Track Pickup
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {myRequests.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4 text-muted">You haven't accepted any donations yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">Alerts & Notifications</h4>
                {notifications.map(notif => (
                  <Alert key={notif._id} variant="light" className="shadow-sm border-0 rounded-4 mb-3 d-flex align-items-center">
                    <Bell className="text-primary me-3" size={20} />
                    <div className="flex-grow-1">
                      <div className="fw-bold">{notif.text}</div>
                      <small className="text-muted">{notif.time || 'Just now'}</small>
                    </div>
                    <Button variant="link" className="text-muted p-0 ms-3" onClick={() => clearNotification(notif._id)}>Dismiss</Button>
                  </Alert>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    <Bell size={48} className="mb-3 opacity-50 mx-auto" />
                    <p>No new notifications.</p>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* View Listing/Donor Info Modal */}
      <Modal show={!!viewingListing} onHide={() => setViewingListing(null)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Donation & Donor Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {viewingListing && (
            <div className="mb-4">
              <h5 className="fw-bold">{viewingListing.item}</h5>
              <p className="text-muted small mb-3">Listing ID: SF-{viewingListing._id ? viewingListing._id.substring(viewingListing._id.length - 4) : 'N/A'}</p>
              
              <Row className="mb-3">
                <Col md={6}>
                  <div className="text-muted small">Quantity</div>
                  <div className="fw-bold">{viewingListing.quantity}</div>
                </Col>
                <Col md={6}>
                  <div className="text-muted small">Type</div>
                  <div className="fw-bold">{viewingListing.type || 'Cooked Meal'}</div>
                </Col>
              </Row>
              
              <div className="mb-3 border-top pt-3">
                <h6 className="fw-bold mb-2">Donor Information</h6>
                <div className="text-muted small">Donor ID</div>
                <div className="fw-bold mb-2">{viewingListing.donor}</div>
                <p className="small text-muted mb-0">Contact details and exact location would be shared upon acceptance.</p>
              </div>

              <div className="mb-3 border-top pt-3">
                <div className="text-muted small">Expiry / Best Before</div>
                <div className="text-danger fw-bold">{new Date(viewingListing.expiry).toLocaleString()}</div>
              </div>
            </div>
          )}
          <Row className="gx-2">
             <Col md={6}>
              <Button variant="success" onClick={() => { handleAcceptDonation(viewingListing._id); setViewingListing(null); }} className="w-100 py-2 fw-bold">
                 Accept
              </Button>
             </Col>
             <Col md={6}>
               <Button variant="secondary" onClick={() => setViewingListing(null)} className="w-100 py-2 fw-bold">
                Close
              </Button>
             </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* Tracking Modal */}
      <Modal show={!!trackingListing} onHide={() => setTrackingListing(null)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Live Food Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {trackingListing && (
            <div className="text-center">
              <div className="rounded-4 overflow-hidden border mb-3" style={{ height: '400px' }}>
                <MapComponent 
                  center={trackingListing.location?.coordinates || [79.8612, 6.9271]}
                  zoom={15}
                  markers={[
                    {
                      coordinates: trackingListing.location?.coordinates || [79.8612, 6.9271],
                      title: "Pickup Point",
                      subtitle: trackingListing.item,
                      color: "#198754"
                    },
                    ...(trackingListing.status === 'In Transit' && trackingListing.volunteerLocation?.coordinates?.[0] !== 0 ? [{
                      coordinates: trackingListing.volunteerLocation.coordinates,
                      title: "Moving Volunteer",
                      subtitle: `Courier: ${trackingListing.volunteer}`,
                      color: "#0d6efd"
                    }] : [])
                  ]}
                />
              </div>
              <div className="text-start p-3 bg-light rounded-4">
                <Row>
                  <Col md={6}>
                    <p className="mb-1"><strong>Food Item:</strong> {trackingListing.item}</p>
                    <p className="mb-1"><strong>Status:</strong> {trackingListing.status}</p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-1"><strong>Volunteer:</strong> {trackingListing.volunteer || 'Searching...'}</p>
                    <p className="mb-1"><strong>Pickup Point:</strong> {trackingListing.location?.address || 'See map'}</p>
                  </Col>
                </Row>
              </div>
            </div>
          )}
          <Button variant="secondary" onClick={() => setTrackingListing(null)} className="w-100 py-2 fw-bold mt-3">
            Close Tracking
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

export default NgoDashboard;
