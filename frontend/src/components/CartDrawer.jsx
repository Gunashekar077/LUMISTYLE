import { useNavigate } from "react-router-dom";
import { FaXmark, FaMinus, FaPlus, FaTrashCan, FaBagShopping, FaArrowRight } from "react-icons/fa6";
import "./CartDrawer.css";

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart }) => {
  const navigate = useNavigate();
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Dimmed backdrop blur */}
      <div 
        className={`cart-drawer-overlay ${isOpen ? "open" : ""}`} 
        onClick={onClose}
      />

      {/* Sliding Drawer Container */}
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`}>
        <div className="cart-drawer-header">
          <h3>Shopping Cart ({totalItems})</h3>
          <button onClick={onClose} className="cart-drawer-close-btn" title="Close Cart">
            <FaXmark />
          </button>
        </div>

        {/* Content list */}
        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <div className="cart-drawer-empty">
              <FaBagShopping className="cart-drawer-empty-icon" />
              <h4>Your Cart is Empty</h4>
              <p>Discover our selection of luxury essentials and fill your cart with elegance.</p>
              <button onClick={onClose} className="cart-drawer-empty-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-drawer-item">
                <img 
                  src={item.image || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300"} 
                  alt={item.title} 
                  className="cart-drawer-item-img" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300';
                  }}
                />
                
                <div className="cart-drawer-item-details">
                  <span className="cart-drawer-item-title">{item.title}</span>
                  <span className="cart-drawer-item-price">₹{(item.price * item.quantity * 80).toLocaleString('en-IN')}</span>
                  
                  <div className="cart-drawer-quantity-selector">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="cart-drawer-qty-btn"
                      title="Decrease"
                    >
                      <FaMinus />
                    </button>
                    <span className="cart-drawer-qty-val">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="cart-drawer-qty-btn"
                      title="Increase"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => onRemoveFromCart(item.id)}
                  className="cart-drawer-item-remove"
                  title="Remove Item"
                >
                  <FaTrashCan />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-summary-row">
              <span>Subtotal</span>
              <span className="total-price">₹{(subtotal * 80).toLocaleString('en-IN')}</span>
            </div>
            <button onClick={handleCheckout} className="cart-drawer-checkout-btn">
              Checkout Now <FaArrowRight />
            </button>
            <button onClick={onClose} className="cart-drawer-continue-btn">
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
