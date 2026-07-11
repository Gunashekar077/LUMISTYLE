import { useState, useEffect } from 'react';
import { useOrders } from '../context/OrderContext';
import { PulseLoader } from 'react-spinners';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLocationDot, 
  FaBagShopping, 
  FaReceipt, 
  FaClock, 
  FaCheck, 
  FaPen, 
  FaFloppyDisk,
  FaArrowRotateLeft
} from 'react-icons/fa6';
import '../App.css';
import './Profile.css';

const Profile = ({ currentUser, onUpdateProfile }) => {
  const { orders, isLoading, error, fetchOrders } = useOrders();
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'orders'

  // Editable Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchOrders();
    
    // Load local storage override or current user data
    const localProfile = localStorage.getItem('user_profile_override');
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        setName(parsed.name || currentUser?.name || '');
        setEmail(parsed.email || currentUser?.email || '');
        setPhone(parsed.phone || '');
        setAddressLine1(parsed.addressLine1 || '');
        setAddressLine2(parsed.addressLine2 || '');
        setCity(parsed.city || '');
        setState(parsed.state || '');
        setPincode(parsed.pincode || '');
      } catch (e) {
        console.error("Failed to parse local profile override", e);
      }
    } else {
      setName(currentUser?.name || '');
      setEmail(currentUser?.email || '');
    }
  }, [currentUser]);

  const handleSave = (e) => {
    e.preventDefault();
    const updatedProfile = {
      name,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode
    };
    
    // Save to local storage
    localStorage.setItem('user_profile_override', JSON.stringify(updatedProfile));
    
    // Callback to update parent App.jsx states if any
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
    
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const formatDate = (isoString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(isoString).toLocaleDateString(undefined, options);
  };

  const getOrderStatusTimeline = (status) => {
    const steps = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
    let activeIdx = 1; // default processing
    
    const lowerStatus = status?.toLowerCase() || '';
    if (lowerStatus === 'delivered') activeIdx = 3;
    else if (lowerStatus === 'shipped' || lowerStatus === 'out for delivery') activeIdx = 2;
    else if (lowerStatus === 'cancelled') return [{ name: 'Cancelled', active: true, error: true }];
    
    return steps.map((step, idx) => ({
      name: step,
      active: idx <= activeIdx,
      completed: idx < activeIdx
    }));
  };

  return (
    <div className="profile-container">
      {/* Upper Premium Profile Card */}
      <div className="profile-header-card glass-panel">
        <div className="profile-avatar-section">
          <div className="profile-avatar-circle">
            <FaUser />
          </div>
          <div className="profile-avatar-text">
            <h2>{name || currentUser?.name || 'Guest Member'}</h2>
            <span className="profile-rank-badge">LUXURY CLUB ELITE</span>
          </div>
        </div>

        <div className="profile-tab-navigation">
          <button 
            className={`profile-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <FaUser style={{ marginRight: '8px' }} /> Account Details
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaReceipt style={{ marginRight: '8px' }} /> Order History & Timeline
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="profile-alert success">
          <FaCheck style={{ marginRight: '8px' }} /> Account information updated successfully!
        </div>
      )}

      {/* Tab Contents */}
      <div className="profile-content-area">
        {activeTab === 'info' ? (
          <div className="profile-info-card glass-panel">
            <div className="card-header-row">
              <h3>Personal Profile Details</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="profile-edit-btn">
                  <FaPen style={{ marginRight: '6px' }} /> Edit Info
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="profile-details-form">
              <div className="profile-form-grid">
                <div className="form-group-custom">
                  <label><FaUser /> Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label><FaEnvelope /> Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label><FaPhone /> Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group-custom address-full-row">
                  <label><FaLocationDot /> Shipping Address Line 1</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street Address, P.O. box, company name"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group-custom address-full-row">
                  <label><FaLocationDot /> Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group-custom">
                  <label>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group-custom">
                  <label>State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group-custom">
                  <label>Pincode / Postal Code</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="profile-form-actions">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      // Reset values to local storage state
                      const localProfile = localStorage.getItem('user_profile_override');
                      if (localProfile) {
                        const parsed = JSON.parse(localProfile);
                        setName(parsed.name || currentUser?.name || '');
                        setEmail(parsed.email || currentUser?.email || '');
                        setPhone(parsed.phone || '');
                        setAddressLine1(parsed.addressLine1 || '');
                        setAddressLine2(parsed.addressLine2 || '');
                        setCity(parsed.city || '');
                        setState(parsed.state || '');
                        setPincode(parsed.pincode || '');
                      }
                    }} 
                    className="profile-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="profile-save-btn">
                    <FaFloppyDisk style={{ marginRight: '6px' }} /> Save Updates
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="profile-orders-list">
            {isLoading && orders.length === 0 ? (
              <div className="loader-container">
                <PulseLoader color="var(--accent-purple)" size={12} margin={3} />
              </div>
            ) : error && orders.length === 0 ? (
              <div className="orders-error-panel glass-panel">
                <p>{error}</p>
                <button onClick={fetchOrders} className="profile-retry-btn">
                  <FaArrowRotateLeft style={{ marginRight: '6px' }} /> Reload Orders
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="orders-empty-panel glass-panel">
                <FaBagShopping className="orders-empty-icon" />
                <h3>No Orders Yet</h3>
                <p>Your luxury collection is waiting. Elevate your style today!</p>
                <a href="/products" className="profile-browse-btn">
                  Explore Products
                </a>
              </div>
            ) : (
              <div className="orders-history-container">
                {orders.map((order) => (
                  <div key={order.id} className="profile-order-card glass-panel">
                    
                    {/* Order header row */}
                    <div className="profile-order-card-header">
                      <div className="order-main-info">
                        <span className="order-id-tag">ORDER #{order.id.slice(-8).toUpperCase()}</span>
                        <span className="order-date-tag">Placed on {formatDate(order.createdAt)}</span>
                      </div>
                      <div className="order-total-info">
                        <span className="total-label">Total Amount</span>
                        <span className="total-amount">₹{((order.grandTotal || order.subtotal || 0) * 80).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="order-timeline-tracker">
                      {getOrderStatusTimeline(order.orderStatus).map((step, sIdx) => (
                        <div 
                          key={sIdx} 
                          className={`timeline-step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''} ${step.error ? 'error' : ''}`}
                        >
                          <div className="timeline-node">
                            {step.completed ? <FaCheck /> : <FaClock />}
                          </div>
                          <span className="timeline-label">{step.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order products expand collapsible */}
                    <div className="profile-order-items-grid">
                      {order.products?.map((item, pIdx) => (
                        <div key={pIdx} className="profile-order-item-row">
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="order-item-thumb" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300';
                            }}
                          />
                          <div className="order-item-details">
                            <p className="order-item-name">{item.title}</p>
                            <span className="order-item-qty">Qty: {item.quantity}</span>
                          </div>
                          <span className="order-item-price">₹{(item.price * item.quantity * 80).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping info footer preview */}
                    <div className="profile-order-shipping-preview">
                      <FaLocationDot style={{ color: 'var(--accent-purple)', fontSize: '0.9rem' }} />
                      <span className="shipping-text">
                        Delivered to: <strong>{order.shippingDetails?.fullName}</strong>, {order.shippingDetails?.addressLine1}, {order.shippingDetails?.city}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
