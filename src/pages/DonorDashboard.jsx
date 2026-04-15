import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Toast, ToastContainer } from 'react-bootstrap';
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
  TrendingUp,
  MapPin,
  Leaf
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TrackingMap from '../components/TrackingMap';
import { SkeletonBox, MetricCardSkeleton, TableSkeleton, NotifSkeleton, DashboardOverviewSkeleton } from '../components/Skeleton';

const API_URL = 'http://localhost:5000/api/listings';

const StatusBadge = ({ status }) => {
  let mappedClass = '';
  switch (status) {
    case 'Pending': mappedClass = 'status-pending'; break;
    case 'Assigned': mappedClass = 'status-assigned'; break;
    case 'In Transit': mappedClass = 'status-in-transit'; break;
    case 'Picked Up': mappedClass = 'status-picked-up'; break;
    case 'Rejected': mappedClass = 'status-rejected'; break;
    default: mappedClass = 'status-pending';
  }
  return <span className={`status-badge ${mappedClass}`}>{status}</span>;
};

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <Icon size={32} />
    </div>
    <div className="empty-state-title">{title}</div>
    <div className="empty-state-sub">{sub}</div>
  </div>
);

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { fullName: 'Donor', role: 'Donor' });
  const [activeTab, setActiveTab] = useState('overview');
  const [tabLoading, setTabLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [listings, setListings] = useState([]);
  const [viewingListing, setViewingListing] = useState(null);
  const [editingListing, setEditingListing] = useState(null);
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    type: 'Cooked Meal',
    expiry: '',
    donorPhoto: ''
  });
  const [trackingItem, setTrackingItem] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const prevListingsRef = useRef([]);

  const handleTabSwitch = (tab) => {
    if (tab === activeTab) return;
    setTabLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabLoading(false);
    }, 220);
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/notifications/${user.id}`);
      setNotifications(res.data.data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  const addNotification = async (text) => {
    try {
      await axios.post('http://localhost:5000/api/notifications', { userId: user.id, text });
      fetchNotifications();
      setToastMessage(text);
      setShowToast(true);
    } catch (err) {
      console.error('Error adding notification:', err);
    }
  };

  const clearNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Error clearing notification:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API_URL}?donorId=${user.id}`);
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
    fetchListings();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchListings();
      fetchNotifications();
    }, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingListing) {
        const res = await axios.put(`${API_URL}/${editingListing._id}`, formData);
        setListings(listings.map(l => l._id === editingListing._id ? res.data.data.listing : l));
      } else {
        const res = await axios.post(API_URL, { ...formData, donor: user.id });
        setListings([res.data.data.listing, ...listings]);
      }
      setShowModal(false);
      setEditingListing(null);
      setFormData({ item: '', quantity: '', type: 'Cooked Meal', expiry: '', donorPhoto: '' });
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
      donorPhoto: listing.donorPhoto || ''
    });
    setShowModal(true);
  };

  const handleCreateClick = () => {
    setEditingListing(null);
    setFormData({ item: '', quantity: '', type: 'Cooked Meal', expiry: '', donorPhoto: '' });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setListings(listings.filter(listing => listing._id !== id));
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing');
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, donorPhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getExpiringListings = () => {
    const now = new Date();
    const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return listings.filter(l => new Date(l.expiry) > now && new Date(l.expiry) <= next24 && (l.status === 'Pending' || l.status === 'Assigned'));
  };

  const expiringItems = getExpiringListings();

  return (
    <div className="bg-light min-vh-100">
      <div className="app-navbar d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center text-success fw-bold fs-5">
          <Leaf className="me-2" /> SurplusFood Donor
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="user-chip">
            <div className="avatar">{user.fullName.charAt(0)}</div>
            <div className="info d-none d-md-flex">
              <span className="name">{user.fullName}</span>
              <span className="role">{user.role}</span>
            </div>
          </div>
          <button className="action-btn reject" onClick={handleLogout} title="Logout">
            <LogOut size={16} /> <span className="d-none d-md-inline">Logout</span>
          </button>
        </div>
      </div>

      <Container>
        {expiringItems.length > 0 && (
          <Alert variant="warning" className="mb-4 d-flex align-items-center rounded-4 border-warning shadow-sm">
            <Clock className="me-3 text-warning" size={24} />
            <div>
              <h6 className="alert-heading mb-1 fw-bold">Expiry Alert!</h6>
              <p className="mb-0 small text-dark">
                You have {expiringItems.length} listing(s) expiring within the next 24 hours. 
                Please ensure they are picked up or check their status.
              </p>
            </div>
          </Alert>
        )}
        <Row>
          <Col lg={3} className="mb-4">
            <div className="sidebar-card">
              <div 
                className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('overview')}
              >
                <LayoutDashboard className="me-3" size={20} /> Dashboard
              </div>
              <div 
                className={`sidebar-link ${activeTab === 'listings' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('listings')}
              >
                <ListOrdered className="me-3" size={20} /> My Listings
              </div>
              <div 
                className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('notifications')}
              >
                <Bell className="me-3" size={20} /> Notifications
                {notifications.length > 0 && (
                  <span className="badge bg-danger rounded-pill ms-auto px-2 py-1 align-items-center">{notifications.length}</span>
                )}
              </div>
            </div>

            <div className="mt-4">
              <button className="create-btn" onClick={handleCreateClick}>
                <PlusCircle size={20} /> Create New Listing
              </button>
            </div>
          </Col>

          <Col lg={9}>
            {tabLoading || isLoading ? (
              <DashboardOverviewSkeleton />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="animate-in">
                    <h4 className="section-title mb-4">Dashboard Overview</h4>
                    <Row className="g-4 mb-4">
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap green">
                            <TrendingUp size={24} />
                          </div>
                          <div className="metric-value">{listings.length}</div>
                          <div className="metric-label">Total Donations</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap orange">
                            <Clock size={24} />
                          </div>
                          <div className="metric-value">{listings.filter(l => l.status === 'Pending').length}</div>
                          <div className="metric-label">Pending Pickups</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap blue">
                            <CheckCircle size={24} />
                          </div>
                          <div className="metric-value">
                            {Math.floor(listings.filter(l => l.status === 'Picked Up').reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) / 0.5)}
                          </div>
                          <div className="metric-label">Meals Saved</div>
                        </div>
                      </Col>
                    </Row>

                    <Card className="border-0 shadow-sm rounded-4">
                      <Card.Header className="bg-white py-3 border-0">
                        <h5 className="section-title mb-0">Recent Activity</h5>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          {listings.length === 0 ? (
                            <EmptyState icon={ListOrdered} title="No activity yet" sub="Create a new listing to see your activity here." />
                          ) : (
                            <table className="app-table">
                              <thead>
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
                                    <td>
                                      <div className="item-name">{item.item}</div>
                                      <div className="item-sub">Qty: {item.quantity}</div>
                                    </td>
                                    <td><StatusBadge status={item.status} /></td>
                                    <td>
                                      {item.status === 'Pending' ? (
                                        <span className="text-muted small fst-italic">Not Assigned Yet</span>
                                      ) : (
                                        <div className="d-flex align-items-center small fw-medium">
                                          <Truck size={14} className="me-2 text-primary" /> {item.volunteer}
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        <button className="action-btn view" onClick={() => setViewingListing(item)}>View</button>
                                        <button 
                                          className={`action-btn ${item.status === 'Pending' || item.status === 'Rejected' ? 'edit opacity-50' : 'edit'}`}
                                          onClick={() => setTrackingItem(item)}
                                          disabled={item.status === 'Pending' || item.status === 'Rejected'}
                                        >
                                          Track
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                )}

                {activeTab === 'listings' && (
                  <div className="animate-in">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="section-title mb-0">All Food Listings</h4>
                      <button className="action-btn primary d-none d-md-flex" onClick={handleCreateClick}>
                        <PlusCircle size={16} /> New Listing
                      </button>
                    </div>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="table-responsive">
                        {listings.length === 0 ? (
                          <EmptyState icon={ListOrdered} title="No listings found" sub="You haven't posted any food donations yet." />
                        ) : (
                          <table className="app-table">
                            <thead>
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
                                    <div className="item-name">{item.item}</div>
                                    <div className="item-sub">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</div>
                                  </td>
                                  <td className="fw-medium">{item.quantity}</td>
                                  <td className="small text-muted">{new Date(item.expiry).toLocaleString()}</td>
                                  <td><StatusBadge status={item.status} /></td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button className="action-btn edit" onClick={() => handleEditClick(item)} title="Edit">
                                        <Edit3 size={14} />
                                      </button>
                                      {item.status !== 'Picked Up' && (
                                        <button className="action-btn delete" onClick={() => handleDeleteClick(item._id)} title="Delete">
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                      <button 
                                        className={`action-btn ${item.status === 'Pending' || item.status === 'Rejected' ? 'accept opacity-50' : 'accept'}`}
                                        onClick={() => setTrackingItem(item)}
                                        disabled={item.status === 'Pending' || item.status === 'Rejected'}
                                        title="Track"
                                      >
                                        <Truck size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="animate-in">
                    <h4 className="section-title mb-4">Alerts & Notifications</h4>
                    {notifLoading ? (
                      <>
                        <NotifSkeleton />
                        <NotifSkeleton />
                        <NotifSkeleton />
                      </>
                    ) : notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif._id} className="notif-card">
                          <div className="notif-icon">
                            <Bell size={20} />
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold fs-6 text-dark">{notif.text}</div>
                            <div className="text-muted small mt-1">{notif.time || 'Just now'}</div>
                          </div>
                          <button className="notif-dismiss" onClick={() => clearNotification(notif._id)}>
                             Dismiss
                          </button>
                        </div>
                      ))
                    ) : (
                      <EmptyState icon={Bell} title="All caught up" sub="You don't have any new notifications at the moment." />
                    )}
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setEditingListing(null); }} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-success">
            {editingListing ? 'Edit Food Listing' : 'List Surplus Food'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted small mb-4">
            {editingListing ? 'Update the details for this donation.' : 'Provide details about the edible food you want to donate.'}
          </p>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Food Item Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Rice Bowls, sandwiches"
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                required
                className="py-2"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted">Type</Form.Label>
                  <Form.Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="py-2"
                  >
                    <option>Cooked Meal</option>
                    <option>Groceries</option>
                    <option>Fruits</option>
                    <option>Bakery</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">Food Photo (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="py-2"
              />
              {formData.donorPhoto && (
                <div className="mt-2 text-center bg-light p-2 rounded border">
                  <img src={formData.donorPhoto} alt="Food Preview" style={{ maxHeight: '120px', objectFit: 'contain' }} className="rounded shadow-sm" />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-bold text-muted">Expiry/Best Before</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                required
                className="py-2"
              />
            </Form.Group>

            <button type="submit" className="action-btn primary w-100 py-2 fs-6">
              {editingListing ? 'Update Listing' : 'Publish Listing'}
            </button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Modal */}
      <Modal show={!!viewingListing} onHide={() => setViewingListing(null)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-success">Listing Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {viewingListing && (
            <div className="mb-4">
              <h5 className="fw-bold mb-1">{viewingListing.item}</h5>
              <p className="text-muted small mb-4">ID: SF-{viewingListing._id ? viewingListing._id.substring(viewingListing._id.length - 4) : 'N/A'}</p>
              
              <Row className="mb-3 g-3">
                <Col xs={6}>
                  <div className="text-muted small fw-bold">Quantity</div>
                  <div className="fw-medium">{viewingListing.quantity}</div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted small fw-bold">Type</div>
                  <div className="fw-medium">{viewingListing.type || 'Cooked Meal'}</div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted small fw-bold mb-1">Status</div>
                  <div><StatusBadge status={viewingListing.status} /></div>
                </Col>
                <Col xs={6}>
                  <div className="text-muted small fw-bold mb-1">Volunteer</div>
                  <div className="fw-medium d-flex align-items-center">
                     <Truck size={14} className="me-1 text-primary"/> {viewingListing.volunteer}
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted small fw-bold mt-2">Expiry / Best Before</div>
                  <div className="fw-medium text-danger">{new Date(viewingListing.expiry).toLocaleString()}</div>
                </Col>
                {viewingListing.donorPhoto && (
                  <Col xs={12}>
                    <div className="text-muted small fw-bold mt-2 mb-2">Attached Photo</div>
                    <div className="text-center bg-light p-2 rounded border">
                      <img src={viewingListing.donorPhoto} alt="Food" style={{ maxHeight: '150px', objectFit: 'contain' }} className="rounded shadow-sm w-100" />
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}
          <button className="action-btn view w-100 py-2 fs-6" onClick={() => setViewingListing(null)}>
            Close
          </button>
        </Modal.Body>
      </Modal>

      {/* Tracking Modal */}
      <Modal show={!!trackingItem} onHide={() => setTrackingItem(null)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-success">
            Live Delivery Tracking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {trackingItem && (
            <div className="mb-4">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                   <div className="fw-bold">{trackingItem.item}</div>
                   <span className="text-muted small">SF-TK-{trackingItem._id?.substring(0, 8)}</span>
                </div>
                <StatusBadge status={trackingItem.status} />
              </div>
              <TrackingMap status={trackingItem.status} />
              <div className="mt-3 bg-light p-3 rounded-3 border">
                <div className="d-flex align-items-center mb-1">
                  <Truck size={16} className="me-2 text-primary" />
                  <span className="fw-bold small">Volunteer: {trackingItem.volunteer || 'Searching...'}</span>
                </div>
                <p className="small text-muted mb-0">The volunteer is currently {trackingItem.status === 'In Transit' ? 'on the way to the NGO.' : 'assigned and will pick up shortly.'}</p>
              </div>
            </div>
          )}
          <button className="action-btn view w-100 py-2 fs-6" onClick={() => setTrackingItem(null)}>
            Close Tracking
          </button>
        </Modal.Body>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide className="border-0 shadow">
          <Toast.Header className="border-bottom-0 pt-3 px-3">
            <Bell className="me-2 text-success" size={16} />
            <strong className="me-auto text-dark">Notification</strong>
          </Toast.Header>
          <Toast.Body className="px-3 pb-3 text-muted">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default DonorDashboard;
