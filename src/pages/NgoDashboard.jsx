import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Alert, Toast, ToastContainer, Nav, Navbar } from 'react-bootstrap';
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
  X
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

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { fullName: 'NGO User', role: 'NGO' });
  const [activeTab, setActiveTab] = useState('overview');
  const [tabLoading, setTabLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifLoading, setNotifLoading] = useState(true);

  const [availableDonations, setAvailableDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [viewingListing, setViewingListing] = useState(null);
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
      const res = await axios.get(API_URL);
      const allListings = res.data.data.listings;

      if (prevListingsRef.current.length > 0) {
        const newAvailable = allListings.filter(l => l.status === 'Pending' && !prevListingsRef.current.find(pl => pl._id === l._id && pl.status === 'Pending'));
        
        newAvailable.forEach(item => {
          addNotification(`New donation available: ${item.quantity} of ${item.item}!`);
        });

        const myPrevAccepted = prevListingsRef.current.filter(l => l.status === 'Assigned' || l.status === 'In Transit' || l.status === 'Picked Up');
        allListings.forEach(item => {
          const oldItem = myPrevAccepted.find(pl => pl._id === item._id);
          if (oldItem && oldItem.status !== item.status) {
            addNotification(`Update: ${item.item} is now ${item.status}.`);
          }
        });
      }

      prevListingsRef.current = allListings;
      setAvailableDonations(allListings.filter(l => l.status === 'Pending'));
      setMyRequests(allListings.filter(l => l.status === 'Assigned' || l.status === 'In Transit' || l.status === 'Picked Up'));
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

  const handleAcceptDonation = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: 'Assigned', volunteer: 'Pending Assignment' });
      fetchListings();
    } catch (err) {
      console.error('Error accepting donation:', err);
      alert('Failed to accept donation');
    }
  };

  const handleRejectDonation = async (id) => {
    if (window.confirm("Are you sure you want to reject this donation?")) {
      try {
        await axios.put(`${API_URL}/${id}`, { status: 'Rejected', volunteer: 'Not Assigned' });
        fetchListings();
      } catch (err) {
        console.error('Error rejecting donation:', err);
        alert('Failed to reject donation');
      }
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="app-navbar d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center text-primary fw-bold fs-5">
          <Heart className="me-2 text-danger" fill="currentColor" /> SurplusFood NGO
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
                className={`sidebar-link ${activeTab === 'available' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('available')}
              >
                <ListOrdered className="me-3" size={20} /> Available Food
              </div>
              <div 
                className={`sidebar-link ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => handleTabSwitch('requests')}
              >
                <CheckCircle className="me-3" size={20} /> Tracking
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
                    <h4 className="section-title mb-4">Dashboard Overview</h4>
                    <Row className="g-4 mb-4">
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap green">
                            <ListOrdered size={24} />
                          </div>
                          <div className="metric-value">{availableDonations.length}</div>
                          <div className="metric-label">Available Now</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap orange">
                            <Clock size={24} />
                          </div>
                          <div className="metric-value">{myRequests.filter(r => r.status === 'Assigned' || r.status === 'In Transit').length}</div>
                          <div className="metric-label">Pending Pickup</div>
                        </div>
                      </Col>
                      <Col md={4}>
                        <div className="metric-card">
                          <div className="metric-icon-wrap blue">
                            <CheckCircle size={24} />
                          </div>
                          <div className="metric-value">{myRequests.filter(r => r.status === 'Picked Up').length}</div>
                          <div className="metric-label">Completed</div>
                        </div>
                      </Col>
                    </Row>

                    <Card className="border-0 shadow-sm rounded-4">
                      <Card.Header className="bg-white py-3 border-0">
                        <h5 className="section-title mb-0">Recent Available Donations</h5>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          {availableDonations.length === 0 ? (
                            <EmptyState icon={Heart} title="No donations right now" sub="We'll notify you when new food becomes available." />
                          ) : (
                            <table className="app-table">
                              <thead>
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
                                    <td>
                                      <div className="item-name">{item.item}</div>
                                      <div className="item-sub">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</div>
                                    </td>
                                    <td className="fw-medium">{item.quantity}</td>
                                    <td className="small text-muted">{new Date(item.expiry).toLocaleString()}</td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        <button className="action-btn accept" onClick={() => handleAcceptDonation(item._id)}>
                                          <Check size={14} /> Accept
                                        </button>
                                        <button className="action-btn view" onClick={() => setViewingListing(item)}>
                                          <Eye size={14} /> View
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

                {activeTab === 'available' && (
                  <div className="animate-in">
                    <h4 className="section-title mb-4">All Available Food Requests</h4>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="table-responsive">
                        {availableDonations.length === 0 ? (
                          <EmptyState icon={Heart} title="Nothing here yet" sub="There are no pending donations to review." />
                        ) : (
                          <table className="app-table">
                            <thead>
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
                                    <div className="item-name">{item.item}</div>
                                    <div className="item-sub">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</div>
                                  </td>
                                  <td className="fw-medium">{item.quantity}</td>
                                  <td className="small text-muted">{new Date(item.expiry).toLocaleString()}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button className="action-btn accept" onClick={() => handleAcceptDonation(item._id)}>
                                        <Check size={14} /> Accept
                                      </button>
                                      <button className="action-btn reject" onClick={() => handleRejectDonation(item._id)}>
                                        <X size={14} /> Reject
                                      </button>
                                      <button className="action-btn view" onClick={() => setViewingListing(item)}>
                                        <Eye size={14} />
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

                {activeTab === 'requests' && (
                  <div className="animate-in">
                    <h4 className="section-title mb-4">Tracking Received Donations</h4>
                    <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                      <div className="table-responsive">
                        {myRequests.length === 0 ? (
                          <EmptyState icon={Truck} title="No active requests" sub="You haven't accepted any donations that need tracking." />
                        ) : (
                          <table className="app-table">
                            <thead>
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
                                    <div className="item-name">{item.item}</div>
                                    <div className="item-sub">ID: SF-{item._id ? item._id.substring(item._id.length - 4) : 'N/A'}</div>
                                  </td>
                                  <td className="fw-medium">{item.quantity}</td>
                                  <td><StatusBadge status={item.status} /></td>
                                  <td>
                                    <button className="action-btn primary" onClick={() => setTrackingItem(item)}>
                                      <Truck size={14} /> Track Pickup
                                    </button>
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
                      <EmptyState icon={Bell} title="All caught up" sub="No notifications at the moment." />
                    )}
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* View Listing Modal */}
      <Modal show={!!viewingListing} onHide={() => setViewingListing(null)} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-primary">Donation Details</Modal.Title>
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
                <Col xs={12}>
                  <div className="text-muted small fw-bold">Donor ID</div>
                  <div className="fw-medium">{viewingListing.donor}</div>
                  <div className="small text-muted mt-1 fst-italic">Contact details shared upon acceptance.</div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted small fw-bold mt-2">Expiry / Best Before</div>
                  <div className="fw-medium text-danger">{new Date(viewingListing.expiry).toLocaleString()}</div>
                </Col>
              </Row>
            </div>
          )}
          <Row className="px-2 gx-3 mt-4">
             <Col xs={6}>
               <button 
                 className="action-btn accept w-100 py-2 text-center" 
                 onClick={() => { handleAcceptDonation(viewingListing._id); setViewingListing(null); }}
               >
                 Accept
               </button>
             </Col>
             <Col xs={6}>
               <button className="action-btn view w-100 py-2 text-center" onClick={() => setViewingListing(null)}>
                 Close
               </button>
             </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* Tracking Modal */}
      <Modal show={!!trackingItem} onHide={() => setTrackingItem(null)} centered size="lg" className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="section-title text-primary">
            Pickup Tracker
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {trackingItem && (
            <div className="mb-4">
               <div className="mb-3 d-flex justify-content-between align-items-center">
                <div>
                   <div className="fw-bold">{trackingItem.item}</div>
                   <span className="text-muted small">ID: SF-TK-{trackingItem._id?.substring(0, 8)}</span>
                </div>
                <StatusBadge status={trackingItem.status} />
              </div>
              <TrackingMap status={trackingItem.status} />
              <div className="mt-3 bg-light p-3 rounded-3 border">
                <div className="d-flex align-items-center mb-1">
                   <Truck size={16} className="me-2 text-primary" />
                   <span className="fw-bold small">Courier: {trackingItem.volunteer || 'In Process'}</span>
                </div>
                <p className="small text-muted mb-0">Live tracking from donor to your center. ETA approx 15-20m.</p>
              </div>
            </div>
          )}
          <button className="action-btn view w-100 py-2 mt-2" onClick={() => setTrackingItem(null)}>
            Close Tracking
          </button>
        </Modal.Body>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide className="border-0 shadow">
          <Toast.Header className="border-bottom-0 pt-3 px-3">
            <Heart className="me-2 text-danger" size={16} fill="currentColor" />
            <strong className="me-auto text-dark">Notification</strong>
          </Toast.Header>
          <Toast.Body className="px-3 pb-3 text-muted">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default NgoDashboard;
