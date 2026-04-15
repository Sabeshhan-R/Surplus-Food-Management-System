import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Alert, Toast, ToastContainer, Modal } from 'react-bootstrap';
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
import axios from 'axios';
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
}

const EmptyState = ({ icon: Icon, title, sub }) => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <Icon size={32} />
    </div>
    <div className="empty-state-title">{title}</div>
    <div className="empty-state-sub">{sub}</div>
  </div>
);

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { fullName: 'Volunteer Hero', role: 'Volunteer' });
  const [activeTab, setActiveTab] = useState('overview');
  const [tabLoading, setTabLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);

  const [availablePickups, setAvailablePickups] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [viewingMap, setViewingMap] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({ listingId: null, photoUrl: '' });
  const [viewingProof, setViewingProof] = useState(null);

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
      const res = await axios.get(API_URL);
      const allListings = res.data.data.listings;

      if (prevListingsRef.current.length > 0) {
        const newAvailable = allListings.filter(l => l.status === 'Assigned' && l.volunteer === 'Pending Assignment' && !prevListingsRef.current.find(pl => pl._id === l._id && pl.status === 'Assigned' && pl.volunteer === 'Pending Assignment'));

        newAvailable.forEach(item => {
          addNotification(`New rescue needed for: ${item.item}!`);
        });
      }

      prevListingsRef.current = allListings;
      setAvailablePickups(allListings.filter(l => l.status === 'Assigned' && l.volunteer === 'Pending Assignment'));
      setActiveTasks(allListings.filter(l => (l.status === 'Assigned' || l.status === 'In Transit') && l.volunteer === user.fullName));
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
    }, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  const updateStatus = async (id, newStatus, volunteerName = user.fullName, extraData = {}) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus, volunteer: volunteerName, ...extraData });
      fetchListings();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleDeliveryImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryData({ ...deliveryData, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const openDeliveryModal = (id) => {
    setDeliveryData({ listingId: id, photoUrl: '' });
    setShowDeliveryModal(true);
  };

  const submitDelivery = async (e) => {
    e.preventDefault();
    await updateStatus(deliveryData.listingId, 'Picked Up', user.fullName, { deliveryPhoto: deliveryData.photoUrl });
    setShowDeliveryModal(false);
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="app-navbar d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center text-primary fw-bold fs-5">
          <Truck className="me-2 text-warning" /> SurplusFood Volunteer
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
                className={`sidebar-link ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('active')}
              >
                <Navigation className="me-3" size={20} /> Active Pickups
              </div>
              <div 
                className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('history')}
              >
                <CheckCircle className="me-3" size={20} /> Pickup History
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
          </Col>

          <Col lg={9}>
            {tabLoading || isLoading ? (
              <DashboardOverviewSkeleton />
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="animate-in">
                    <h4 className="section-title mb-4">Volunteer Dashboard</h4>
                    <Row className="g-4 mb-4">
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap orange">
                            <MapPin size={24} />
                          </div>
                          <div className="metric-value">{availablePickups.length}</div>
                          <div className="metric-label">Open Pickups</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap blue">
                            <Truck size={24} />
                          </div>
                          <div className="metric-value">{activeTasks.length}</div>
                          <div className="metric-label">Active Tasks</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap green">
                            <CheckCircle size={24} />
                          </div>
                          <div className="metric-value">{history.length}</div>
                          <div className="metric-label">Lifetime Deliveries</div>
                        </div>
                      </Col>
                    </Row>

                    <Card className="border-0 shadow-sm rounded-4">
                      <Card.Header className="bg-white py-3 border-0">
                        <h5 className="section-title mb-0">Accept Open Pickups</h5>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          {availablePickups.length === 0 ? (
                            <EmptyState icon={Truck} title="No open pickups" sub="There are no pending rescues available right now." />
                          ) : (
                            <table className="app-table">
                              <thead>
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
                                    <td>
                                      <div className="item-name">{item.item}</div>
                                      <div className="item-sub">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</div>
                                    </td>
                                    <td className="fw-medium">{item.quantity}</td>
                                    <td><span className="status-badge status-pending">Looking for Driver</span></td>
                                    <td>
                                      <button className="action-btn accept" onClick={() => updateStatus(item._id, 'Assigned', user.fullName)}>
                                        <Check size={14} /> Accept
                                      </button>
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

                {activeTab === 'active' && (
                  <div className="animate-in">
                    <h4 className="section-title mb-4">My Active Rescues</h4>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="table-responsive">
                        {activeTasks.length === 0 ? (
                          <EmptyState icon={Navigation} title="No active tasks" sub="You have no active rescues right now. Accept one!" />
                        ) : (
                          <table className="app-table">
                            <thead>
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
                                    <div className="item-name">{item.item}</div>
                                    <div className="item-sub">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</div>
                                  </td>
                                  <td>
                                    <div className="fw-medium mb-1">Qty: {item.quantity}</div>
                                    <div className="small text-danger">Exp: {new Date(item.expiry).toLocaleString()}</div>
                                  </td>
                                  <td><StatusBadge status={item.status} /></td>
                                  <td>
                                    <div className="d-flex flex-wrap gap-2">
                                      {item.status === 'Assigned' && (
                                        <button className="action-btn edit" onClick={() => updateStatus(item._id, 'In Transit')}>
                                          <Play size={14} /> Start Pickup
                                        </button>
                                      )}
                                      {item.status === 'In Transit' && (
                                        <button className="action-btn accept" onClick={() => openDeliveryModal(item._id)}>
                                          <CheckCircle size={14} /> Complete
                                        </button>
                                      )}
                                      <button className="action-btn view" onClick={() => setViewingMap(item)}>
                                        <MapPin size={14} /> Map
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

                {activeTab === 'history' && (
                  <div className="animate-in">
                    <h4 className="section-title mb-4">My Impact History</h4>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="table-responsive">
                        {history.length === 0 ? (
                          <EmptyState icon={CheckCircle} title="No deliveries yet" sub="Complete a delivery to see your impact here." />
                        ) : (
                          <table className="app-table">
                            <thead>
                              <tr>
                                <th>Listing</th>
                                <th>Quantity Delivered</th>
                                <th>Final Status</th>
                                <th>Photo Proof</th>
                                <th>Date Completed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {history.map(item => (
                                <tr key={item._id}>
                                  <td>
                                    <div className="item-name">{item.item}</div>
                                    <div className="item-sub">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</div>
                                  </td>
                                  <td className="fw-medium">{item.quantity}</td>
                                  <td><StatusBadge status={item.status} /></td>
                                  <td>
                                    {item.deliveryPhoto ? (
                                      <button className="action-btn view" onClick={() => setViewingProof(item.deliveryPhoto)}>View Proof</button>
                                    ) : (
                                      <span className="small text-muted">No Proof</span>
                                    )}
                                  </td>
                                  <td className="small text-muted">{new Date(item.createdAt).toLocaleDateString()}</td>
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
                    <h4 className="section-title mb-4">Alerts & Routing Notifications</h4>
                    {notifLoading ? (
                      <>
                        <NotifSkeleton />
                        <NotifSkeleton />
                        <NotifSkeleton />
                      </>
                    ) : notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div key={notif._id} className="notif-card purple">
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
                      <EmptyState icon={Bell} title="No alerts" sub="You don't have any new routing or system alerts." />
                    )}
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Map / Route Placeholder Modal */}
      <Modal show={!!viewingMap} onHide={() => setViewingMap(null)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-primary">Live Route Tracking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {viewingMap && (
            <div className="text-center">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                   <div className="fw-bold">{viewingMap.item}</div>
                   <span className="text-muted small">SF-{viewingMap._id?.substring(0, 8)}</span>
                </div>
                <StatusBadge status={viewingMap.status} />
              </div>
              
              <div className="rounded-4 bg-light d-flex flex-column align-items-center justify-content-center border" style={{ height: '300px' }}>
                <div className="text-muted mb-3"><MapPin size={48} /></div>
                <h5 className="fw-bold">Map View Unavailable</h5>
                <p className="text-muted small mb-0 px-4">Interactive mapping is currently disabled in this view.</p>
              </div>

              <div className="mt-4 text-start bg-white border p-3 rounded-4 shadow-sm">
                <div className="d-flex align-items-center mb-3">
                  <Navigation size={20} className="me-2 text-primary" />
                  <span className="fw-bold fs-6">Routing Info</span>
                </div>
                <Row className="g-3">
                  <Col xs={4}>
                    <div className="text-muted small fw-bold">Est. Time</div>
                    <div className="fw-medium">15 mins</div>
                  </Col>
                  <Col xs={4}>
                    <div className="text-muted small fw-bold">Distance</div>
                    <div className="fw-medium">4.2 km</div>
                  </Col>
                  <Col xs={4}>
                    <div className="text-muted small fw-bold">Traffic</div>
                    <div className="fw-medium text-success">Light</div>
                  </Col>
                </Row>
              </div>
            </div>
          )}
          <button className="action-btn view w-100 py-2 mt-4 fs-6" onClick={() => setViewingMap(null)}>
            Close Navigation
          </button>
        </Modal.Body>
      </Modal>

      {/* Delivery Photo Modal */}
      <Modal show={showDeliveryModal} onHide={() => setShowDeliveryModal(false)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-primary">Complete Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted small mb-4">Upload a photo to confirm your drop-off.</p>
          <form onSubmit={submitDelivery}>
            <div className="mb-4">
              <label className="small fw-bold text-muted mb-2">Photo Proof</label>
              <input 
                type="file" 
                accept="image/*"
                className="form-control py-2" 
                onChange={handleDeliveryImageUpload}
              />
              {deliveryData.photoUrl && (
                <div className="mt-3 text-center bg-light p-2 rounded border">
                  <img src={deliveryData.photoUrl} alt="Delivery Proof Preview" style={{ maxHeight: '150px', objectFit: 'contain' }} className="rounded shadow-sm" />
                </div>
              )}
            </div>
            <button type="submit" className="action-btn accept w-100 py-2 fs-6">Mark as Completed</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* View Proof Modal */}
      <Modal show={!!viewingProof} onHide={() => setViewingProof(null)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-success">Delivery Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center pb-4">
          {viewingProof && (
            <img src={viewingProof} alt="Delivery Proof" className="img-fluid rounded shadow-sm border" style={{ maxHeight: '400px' }} />
          )}
          <button className="action-btn view w-100 py-2 mt-4" onClick={() => setViewingProof(null)}>
            Close
          </button>
        </Modal.Body>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide className="border-0 shadow">
          <Toast.Header className="border-bottom-0 pt-3 px-3">
            <Bell className="me-2 text-warning" size={16} />
            <strong className="me-auto text-dark">Notification</strong>
          </Toast.Header>
          <Toast.Body className="px-3 pb-3 text-muted">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default VolunteerDashboard;
