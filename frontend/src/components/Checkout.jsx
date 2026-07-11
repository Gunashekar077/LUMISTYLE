import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { 
  FaArrowLeft, 
  FaReceipt, 
  FaTag, 
  FaCreditCard, 
  FaBuildingColumns, 
  FaMobileScreen, 
  FaTruck,
  FaCheck
} from 'react-icons/fa6';
import './Checkout.css';

const Checkout = ({ cartItems, onClearCart }) => {
  const navigate = useNavigate();
  const { placeOrder, applyCoupon } = useOrders();

  // Checkout Progress Stepper State
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  // Shipping Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Form Validation & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Invoice Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 200 || subtotal === 0 ? 0 : 5.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const grandTotal = parseFloat((subtotal - discount + shippingFee + tax).toFixed(2));

  // Apply Coupon Logic
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = applyCoupon(couponCode, subtotal);
    setCouponSuccess(result.success);
    setCouponMessage(result.message);
    if (result.success) {
      setDiscount(result.discount);
      setAppliedCoupon(couponCode.trim().toUpperCase());
    } else {
      setDiscount(0);
      setAppliedCoupon('');
    }
  };

  // Validate Shipping Form
  const validateShipping = () => {
    const tempErrors = {};
    if (!fullName.trim()) tempErrors.fullName = 'Full Name is required';
    
    if (!email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Enter a valid email address';
    }

    if (!phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.trim().replace(/[-\s()]/g, ''))) {
      tempErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!addressLine1.trim()) tempErrors.addressLine1 = 'Address Line 1 is required';
    if (!city.trim()) tempErrors.city = 'City is required';
    if (!state.trim()) tempErrors.state = 'State is required';
    
    if (!pincode.trim()) {
      tempErrors.pincode = 'Pincode is required';
    } else if (!/^\d{5,6}$/.test(pincode.trim())) {
      tempErrors.pincode = 'Enter a valid 5 or 6 digit pincode';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Step Navigations
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateShipping()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Place final order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateShipping()) {
      setCurrentStep(1);
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');

    try {
      const shippingDetails = {
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode
      };

      const pricingDetails = {
        subtotal,
        shippingFee,
        tax,
        discount,
        grandTotal
      };

      const productsPayload = cartItems.map(item => ({
        productId: item.id || item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      // Place order via context hook
      const createdOrder = await placeOrder(
        productsPayload,
        pricingDetails,
        shippingDetails,
        paymentMethod
      );

      // Reset local cart state
      if (onClearCart) {
        onClearCart();
      }

      // Navigate to order success screen
      navigate(`/order-success/${createdOrder.id}`);
    } catch (err) {
      console.error('Checkout placing order error:', err);
      setApiError(err.message || 'Error occurred while placing the order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty Cart Checkout Screen
  if (cartItems.length === 0) {
    return (
      <div className="checkout-layout">
        <div className="checkout-empty-view glass-panel">
          <h2>No Items to Checkout</h2>
          <p>Your shopping cart is currently empty. Explore our trending catalog to discover luxury essentials.</p>
          <Link to="/products" className="hero-cta-primary" style={{ textDecoration: 'none' }}>
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Stepper completion width percentage
  const lineFillWidth = currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%';

  return (
    <div className="checkout-layout">
      
      {/* 1. Glassmorphism Progress Stepper */}
      <div className="checkout-stepper">
        <div className="stepper-progress-line">
          <div className="stepper-progress-line-fill" style={{ width: lineFillWidth }}></div>
        </div>
        
        <div className={`stepper-step ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 1 ? <FaCheck /> : "1"}</div>
          <span className="step-label">Shipping</span>
        </div>

        <div className={`stepper-step ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 2 ? <FaCheck /> : "2"}</div>
          <span className="step-label">Payment</span>
        </div>

        <div className={`stepper-step ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-circle">3</div>
          <span className="step-label">Review</span>
        </div>
      </div>

      {apiError && (
        <div style={{ color: '#ef4444', textAlign: 'center', fontWeight: '600' }}>
          {apiError}
        </div>
      )}

      {/* 2. Stepper Card Content & Invoice Grid */}
      <div className="checkout-split-grid">
        
        {/* Left: Stepper Step Forms */}
        <div className="checkout-left-column">
          
          {/* STEP 1: Shipping Form Card */}
          {currentStep === 1 && (
            <div className="checkout-panel-card">
              <h2 className="checkout-panel-title">Shipping Address</h2>
              
              <div className="checkout-form">
                <div className="checkout-form-row">
                  <div className="checkout-input-wrapper">
                    <label>Full Name *</label>
                    <input 
                      type="text" 
                      placeholder="Sarah Jenkins"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); if(errors.fullName) delete errors.fullName; }}
                      className={`checkout-input-field ${errors.fullName ? 'error' : ''}`}
                    />
                    {errors.fullName && <span className="form-error-msg">{errors.fullName}</span>}
                  </div>

                  <div className="checkout-input-wrapper">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      placeholder="sarah@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if(errors.email) delete errors.email; }}
                      className={`checkout-input-field ${errors.email ? 'error' : ''}`}
                    />
                    {errors.email && <span className="form-error-msg">{errors.email}</span>}
                  </div>
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-input-wrapper">
                    <label>Phone Number *</label>
                    <input 
                      type="tel" 
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); if(errors.phone) delete errors.phone; }}
                      className={`checkout-input-field ${errors.phone ? 'error' : ''}`}
                    />
                    {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
                  </div>

                  <div className="checkout-input-wrapper">
                    <label>Postal/Pin Code *</label>
                    <input 
                      type="text" 
                      placeholder="10001"
                      value={pincode}
                      onChange={(e) => { setPincode(e.target.value); if(errors.pincode) delete errors.pincode; }}
                      className={`checkout-input-field ${errors.pincode ? 'error' : ''}`}
                    />
                    {errors.pincode && <span className="form-error-msg">{errors.pincode}</span>}
                  </div>
                </div>

                <div className="checkout-input-wrapper">
                  <label>Address Line 1 *</label>
                  <input 
                    type="text" 
                    placeholder="Apartment, building, suite, unit"
                    value={addressLine1}
                    onChange={(e) => { setAddressLine1(e.target.value); if(errors.addressLine1) delete errors.addressLine1; }}
                    className={`checkout-input-field ${errors.addressLine1 ? 'error' : ''}`}
                  />
                  {errors.addressLine1 && <span className="form-error-msg">{errors.addressLine1}</span>}
                </div>

                <div className="checkout-input-wrapper">
                  <label>Address Line 2 (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Floor, landmark, street name"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="checkout-input-field"
                  />
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-input-wrapper">
                    <label>City *</label>
                    <input 
                      type="text" 
                      placeholder="New York"
                      value={city}
                      onChange={(e) => { setCity(e.target.value); if(errors.city) delete errors.city; }}
                      className={`checkout-input-field ${errors.city ? 'error' : ''}`}
                    />
                    {errors.city && <span className="form-error-msg">{errors.city}</span>}
                  </div>

                  <div className="checkout-input-wrapper">
                    <label>State *</label>
                    <input 
                      type="text" 
                      placeholder="NY"
                      value={state}
                      onChange={(e) => { setState(e.target.value); if(errors.state) delete errors.state; }}
                      className={`checkout-input-field ${errors.state ? 'error' : ''}`}
                    />
                    {errors.state && <span className="form-error-msg">{errors.state}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Selection Card */}
          {currentStep === 2 && (
            <div className="checkout-panel-card">
              <h2 className="checkout-panel-title">Payment Method</h2>
              
              <div className="payment-methods-selector">
                <div 
                  className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <FaTruck className="payment-icon" />
                  <span className="payment-title">Cash on Delivery</span>
                </div>

                <div 
                  className={`payment-card ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <FaCreditCard className="payment-icon" />
                  <span className="payment-title">Credit / Debit Card</span>
                </div>

                <div 
                  className={`payment-card ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('netbanking')}
                >
                  <FaBuildingColumns className="payment-icon" />
                  <span className="payment-title">Net Banking</span>
                </div>

                <div 
                  className={`payment-card ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <FaMobileScreen className="payment-icon" />
                  <span className="payment-title">UPI Payment</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Order Review Card */}
          {currentStep === 3 && (
            <div className="checkout-panel-card">
              <h2 className="checkout-panel-title">Review Your Order</h2>
              
              <div className="checkout-form" style={{ gap: '24px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>Shipping Address</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {fullName}<br />
                    {addressLine1}, {addressLine2 ? addressLine2 + ', ' : ''}{city}, {state} - {pincode}<br />
                    Phone: {phone}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>Payment Method</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'netbanking' ? 'Net Banking' : 'UPI'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="checkout-navigation-actions">
            {currentStep > 1 ? (
              <button onClick={handlePrevStep} className="checkout-back-btn">
                Back
              </button>
            ) : (
              <Link to="/products" className="checkout-back-btn" style={{ textDecoration: 'none' }}>
                Back to Shop
              </Link>
            )}

            {currentStep < 3 ? (
              <button onClick={handleNextStep} className="checkout-next-btn">
                Continue
              </button>
            ) : (
              <button 
                onClick={handlePlaceOrder} 
                className="checkout-next-btn btn-ripple"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Sticky Order Invoice Details */}
        <aside className="checkout-summary-column">
          <div className="checkout-summary-panel">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>Order Invoice</h3>
            
            {/* Products Thumbnails list */}
            <div className="summary-items-list">
              {cartItems.map((item) => (
                <div key={item.productId || item.id} className="summary-item-row">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="summary-item-img" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300';
                    }}
                  />
                  <div className="summary-item-info">
                    <span className="summary-item-title">{item.title}</span>
                    <span className="summary-item-price">Qty: {item.quantity}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>₹{(item.price * item.quantity * 80).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Coupon codes box */}
            <div className="coupon-section">
              <label className="filter-label">Have a Coupon?</label>
              <div className="coupon-row">
                <input 
                  type="text" 
                  placeholder="WELCOME10 (10% off)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button onClick={handleApplyCoupon} className="coupon-apply-btn">Apply</button>
              </div>
              {couponMessage && (
                <span className="coupon-feedback" style={{ color: couponSuccess ? '#10b981' : '#ef4444' }}>
                  {couponMessage}
                </span>
              )}
            </div>

            {/* Pricing invoice subtotals */}
            <div className="invoice-section">
              <div className="invoice-row">
                <span>Subtotal</span>
                <span>₹{(subtotal * 80).toLocaleString('en-IN')}</span>
              </div>
              
              {discount > 0 && (
                <div className="invoice-row" style={{ color: '#10b981', fontWeight: '600' }}>
                  <span>Coupon Discount</span>
                  <span>-₹{(discount * 80).toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="invoice-row">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${(shippingFee * 80).toLocaleString('en-IN')}`}</span>
              </div>

              <div className="invoice-row">
                <span>Sales Tax (8%)</span>
                <span>₹{(tax * 80).toLocaleString('en-IN')}</span>
              </div>

              <div className="invoice-row grand-total-row">
                <span>Grand Total</span>
                <span>₹{(grandTotal * 80).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default Checkout;
