import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Nav, Navbar, Alert, Toast, ToastContainer } from 'react-bootstrap';
import {
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  Bell,
  LogOut,
  Clock,
  CheckCircle,
  Truck,
  Trash2,
  Edit3,
  User as UserIcon,
  MapPin,
  LocateFixed
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import MapComponent from '../components/MapComponent';
import { TableSkeleton } from '../components/Skeleton';

const API_URL = 'http://localhost:5000/api/listings';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')) || { fullName: 'Donor' });
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingListing, setViewingListing] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    type: 'Cooked Meal',
    expiry: '',
    location: {
      coordinates: [79.8612, 6.9271], // Default coordinates (Colombo)
      address: ''
    }
  });

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
      const res = await API.get(`${API_URL}?donorId=${user.id}`);
      const newListings = res.data.data.listings;

      if (prevListingsRef.current.length > 0) {
        newListings.forEach(newListing => {
          const oldListing = prevListingsRef.current.find(l => l._id === newListing._id);
          if (oldListing && oldListing.status !== newListing.status) {
            const msg = `Update on "${newListing.item}": Status is now ${newListing.status}.`;
            addNotification(msg);
          }
        });
      }

      prevListingsRef.current = newListings;
      setListings(newListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(); // Initial config hook
    fetchNotifications();
    const interval = setInterval(() => {
      fetchListings();
      fetchNotifications();
    }, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, [user.id]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingListing) {
        // Update existing listing
        const res = await API.put(`${API_URL}/${editingListing._id}`, formData);
         setListings(listings.map(l => l._id === editingListing._id ? res.data.data.listing : l));
      } else {
        // Add new listing
        const res = await API.post(API_URL, { ...formData, donor: user.id });
        setListings([res.data.data.listing, ...listings]);
      }
      setShowModal(false);
      setEditingListing(null);
      setFormData({ item: '', quantity: '', type: 'Cooked Meal', expiry: '', location: { coordinates: [79.8612, 6.9271], address: '' } });
    } catch (err) {
      console.error('Error saving listing:', err);
      alert('Failed to save listing');
    }
  };

  const handleEditClick = (listing) => {
    setEditingListing(listing);
    setFormData({
      item: listing.item,
      quantity: listing.quantity,
      type: listing.type || 'Cooked Meal',
      expiry: listing.expiry,
      location: listing.location || { coordinates: [79.8612, 6.9271], address: '' }
    });
    setShowModal(true);
  };

   const handleCreateClick = () => {
    setEditingListing(null);
    setFormData({ item: '', quantity: '', type: 'Cooked Meal', expiry: '', location: { coordinates: [79.8612, 6.9271], address: '' } });
    setShowModal(true);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { longitude, latitude } = pos.coords;
        setFormData({ ...formData, location: { ...formData.location, coordinates: [longitude, latitude] } });
      }, (err) => {
        console.error('Geolocation Error:', err);
        alert('Allow access to location to use this feature.');
      });
    } else {
      alert('Geolocation not supported.');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await API.delete(`${API_URL}/${id}`);
        setListings(listings.filter(listing => listing._id !== id));
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'Assigned': return <Badge bg="info">Assigned</Badge>;
      case 'In Transit': return <Badge bg="primary">In Transit</Badge>;
      case 'Picked Up': return <Badge bg="success">Picked Up</Badge>;
      case 'Rejected': return <Badge bg="danger">Rejected</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <Navbar bg="white" className="shadow-sm px-4 py-3 sticky-top">
        <Navbar.Brand className="d-flex align-items-center text-success fw-bold">
          <CheckCircle className="me-2" /> SurplusFood Donor
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
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'overview' ? 'bg-success text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <LayoutDashboard className="me-3" size={20} /> Dashboard
                  </Nav.Link>
                  <Nav.Link
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'listings' ? 'bg-success text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('listings')}
                  >
                    <ListOrdered className="me-3" size={20} /> My Listings
                  </Nav.Link>
                  <Nav.Link
                    className={`p-3 d-flex align-items-center border-bottom ${activeTab === 'notifications' ? 'bg-success text-white' : 'text-dark'}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <Bell className="me-3" size={20} /> Notifications
                    <Badge pill bg="danger" className="ms-auto">{notifications.length}</Badge>
                  </Nav.Link>
                </Nav>
              </Card.Body>
            </Card>

            <Button
              variant="success"
              className="w-100 mt-4 py-3 rounded-4 shadow-sm fw-bold d-flex align-items-center justify-content-center"
              onClick={handleCreateClick}
            >
              <PlusCircle className="me-2" /> Create New Listing
            </Button>
          </Col>

          {/* Main Content Area */}
          <Col lg={9}>
            {activeTab === 'overview' && (
              <div className="animate-in">
                <h4 className="fw-bold mb-4">Dashboard Overview</h4>
                <Row className="g-4 mb-4">
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <LayoutDashboard className="mx-auto mb-3 text-success" size={32} />
                      <h3 className="fw-bold mb-0">{listings.length}</h3>
                      <p className="text-muted mb-0">Total Donations</p>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <Clock className="mx-auto mb-3 text-warning" size={32} />
                      <h3 className="fw-bold mb-0">{listings.filter(l => l.status === 'Pending').length}</h3>
                      <p className="text-muted mb-0">Pending Pickups</p>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="border-0 shadow-sm rounded-4 p-3 h-100 bg-white text-center">
                      <CheckCircle className="mx-auto mb-3 text-info" size={32} />
                      <h3 className="fw-bold mb-0">{Math.floor(listings.filter(l => l.status === 'Picked Up').reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) / 0.5)}</h3>
                      <p className="text-muted mb-0">Meals Saved</p>
                    </Card>
                  </Col>
                </Row>

                <Card className="border-0 shadow-sm rounded-4">
                  <Card.Header className="bg-white py-3 border-0">
                    <h5 className="fw-bold mb-0">Recent Activity</h5>
                  </Card.Header>
                   <Card.Body>
                    {isLoading ? (
                      <TableSkeleton rows={3} />
                    ) : (
                      <Table responsive hover borderless className="align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Volunteer</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listings.slice(0, 5).map(item => (
                            <tr key={item._id}>
                              <td className="fw-bold">{item.item}</td>
                              <td>{getStatusBadge(item.status)}</td>
                              <td>
                                {item.status === 'Pending' ? (
                                  <span className="text-muted italic">Not Assigned Yet</span>
                                ) : (
                                  <div className="d-flex align-items-center">
                                    <Truck size={14} className="me-2 text-primary" /> {item.volunteer}
                                  </div>
                                )}
                              </td>
                              <td>
                                <Button variant="link" className="p-0 text-success me-3" onClick={() => setViewingListing(item)}>View</Button>
                                <Button variant="link" className="p-0 text-primary" onClick={() => setViewingListing(item)}>Track</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="animate-in">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0">All Food Listings</h4>
                  <Button variant="success" size="sm" onClick={handleCreateClick}>+ New Listing</Button>
                </div>
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                  <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Listing</th>
                        <th>Quantity</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map(item => (
                        <tr key={item._id}>
                          <td>
                            <div className="fw-bold">{item.item}</div>
                            <small className="text-muted">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</small>
                          </td>
                          <td>{item.quantity}</td>
                          <td>{new Date(item.expiry).toLocaleString()}</td>
                          <td>{getStatusBadge(item.status)}</td>
                          <td>
                            <div className="d-flex">
                              <Button
                                variant="light"
                                size="sm"
                                className="me-2 text-primary"
                                onClick={() => handleEditClick(item)}
                              >
                                <Edit3 size={14} />
                              </Button>
                              {item.status !== 'Picked Up' && (
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="text-danger"
                                  onClick={() => handleDeleteClick(item._id)}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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
                    <Bell className="text-success me-3" size={20} />
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

      {/* Create/Edit Listing Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingListing(null); }} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-success">
            {editingListing ? 'Edit Food Listing' : 'List Surplus Food'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted small mb-4">
            {editingListing ? 'Update the details for this donation.' : 'Provide details about the edible food you want to donate.'}
          </p>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Food Item Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Rice Bowls, sandwiches"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option>Cooked Meal</option>
                    <option>Groceries</option>
                    <option>Fruits</option>
                    <option>Bakery</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

             <Form.Group className="mb-4">
               <Form.Label>Expiry/Best Before</Form.Label>
               <Form.Control
                type="datetime-local"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                required
              />
              <Form.Text className="text-muted">Select the date and time of expiry.</Form.Text>
            </Form.Group>

             <Form.Group className="mb-4">
              <Form.Label className="d-flex align-items-center justify-content-between">
                <span><MapPin size={16} className="me-2" /> Pick Pickup Location</span>
                <Button variant="link" size="sm" className="text-primary p-0 text-decoration-none" onClick={handleUseCurrentLocation}>
                  <LocateFixed size={14} className="me-1" /> Use My Current Location
                </Button>
              </Form.Label>
              <div style={{ height: '300px', backgroundColor: '#f8f9fa' }} className="rounded-4 mb-2 overflow-hidden border">
                <MapComponent 
                  center={formData.location.coordinates} 
                  onLocationSelect={(coords) => setFormData({ ...formData, location: { ...formData.location, coordinates: coords } })} 
                  zoom={14}
                />
              </div>
              <Form.Control
                type="text"
                placeholder="Enter Address/Notes"
                value={formData.location.address}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
              />
              <Form.Text className="text-muted small">Click on the map or drag the green marker to set your location.</Form.Text>
            </Form.Group>

            <Button variant="success" type="submit" className="w-100 py-2 fw-bold">
              {editingListing ? 'Update Listing' : 'Publish Listing'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Track Listing Modal */}
      <Modal show={!!viewingListing} onHide={() => setViewingListing(null)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-success">Donation & Live Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {viewingListing && (
            <Row>
              <Col md={5}>
                <div className="mb-4">
                  <h5 className="fw-bold">{viewingListing.item}</h5>
                  <p className="text-muted small mb-3">ID: SF-{viewingListing._id ? viewingListing._id.substring(viewingListing._id.length - 4) : 'N/A'}</p>
                  
                  <Row className="mb-3">
                    <Col xs={6}>
                      <div className="text-muted small">Quantity</div>
                      <div className="fw-bold">{viewingListing.quantity}</div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-muted small">Type</div>
                      <div className="fw-bold">{viewingListing.type || 'Cooked Meal'}</div>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col xs={6}>
                      <div className="text-muted small">Status</div>
                      <div className="mt-1">{getStatusBadge(viewingListing.status)}</div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-muted small">Volunteer</div>
                      <div className="fw-bold">{viewingListing.volunteer}</div>
                    </Col>
                  </Row>
                  
                  {viewingListing.location && viewingListing.location.address && (
                    <div className="mb-3">
                      <div className="text-muted small">Address</div>
                      <div className="fw-bold small">{viewingListing.location.address}</div>
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="text-muted small">Expiry / Best Before</div>
                    <div className="fw-bold small">{new Date(viewingListing.expiry).toLocaleString()}</div>
                  </div>
                </div>
              </Col>
               <Col md={7}>
                <div style={{ height: '400px' }} className="rounded-4 overflow-hidden border">
                  {viewingListing.location && viewingListing.location.coordinates && (
                    <MapComponent 
                      center={viewingListing.location.coordinates}
                      zoom={15}
                      interactive={false}
                      markers={[
                        {
                          coordinates: viewingListing.location.coordinates,
                          title: "Donation Pickup",
                          subtitle: viewingListing.item,
                          color: "#198754"
                        },
                        ...(viewingListing.status === 'In Transit' && viewingListing.volunteerLocation?.coordinates?.[0] !== 0 ? [{
                          coordinates: viewingListing.volunteerLocation.coordinates,
                          title: "Volunteer in Transit",
                          subtitle: `Driver: ${viewingListing.volunteer}`,
                          color: "#0d6efd"
                        }] : [])
                      ]}
                    />
                  )}
                </div>
                {viewingListing.status === 'In Transit' && (
                  <div className="mt-3 p-2 bg-info bg-opacity-10 rounded-3 text-start small">
                    <span className="fw-bold">Volunteer tracking active:</span> Blue pulse shows volunteer's current progress.
                  </div>
                )}
              </Col>
            </Row>
          )}
          <Button variant="secondary" onClick={() => setViewingListing(null)} className="w-100 py-2 fw-bold mt-2">
            Close
          </Button>
        </Modal.Body>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide>
          <Toast.Header>
            <Bell className="me-2 text-success" size={16} />
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default DonorDashboard;
