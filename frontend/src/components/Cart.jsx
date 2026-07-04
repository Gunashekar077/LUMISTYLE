import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCartShopping, FaTrash } from "react-icons/fa6";
import { orderService } from "../services/api";
import "../App.css";

const Cart = ({ cartItems, onRemoveFromCart, onUpdateQuantity, onClearCart }) => {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <FaCartShopping className="cart-icon" />
        <h2>Your Cart</h2>
        <p>Your cart is currently empty. Start shopping to add items!</p>
        <a href="/products" className="cta-button">
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="cart-container" style={{ justifyContent: "flex-start", minHeight: "calc(100vh - 120px)", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <h2 style={{ alignSelf: "flex-start", marginBottom: "24px", fontSize: "2rem", fontWeight: "800" }}>Your Cart</h2>
      
      {checkoutError && (
        <div style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          color: "#ef4444",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "0.9rem",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          width: "100%",
          textAlign: "center"
        }}>
          {checkoutError}
        </div>
      )}

      <div className="cart-items" style={{ width: "100%" }}>
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.title} />
            <div className="cart-item-details">
              <p className="item-title">{item.title}</p>
              <p className="item-price">₹{(item.price * 80).toLocaleString('en-IN')}</p>
              
              {/* Quantity selectors */}
              <div className="cart-quantity-selector">
                <span className="quantity-label">Quantity:</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  className="quantity-adjust-btn minus"
                >
                  -
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  className="quantity-adjust-btn plus"
                >
                  +
                </button>
              </div>

              <p className="item-total" style={{ marginTop: "8px" }}>
                Total: ₹{(item.price * item.quantity * 80).toLocaleString('en-IN')}
              </p>
            </div>
            <button
              className="remove-btn"
              onClick={() => onRemoveFromCart(item.id)}
              disabled={isCheckingOut}
            >
              <FaTrash /> Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary" style={{ width: "100%" }}>
        <h3>Total Amount: ₹{(totalAmount * 80).toLocaleString('en-IN')}</h3>
        <button 
          className="checkout-btn" 
          onClick={handleCheckout}
          disabled={isCheckingOut}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          {isCheckingOut ? (
            <>
              <div className="btn-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
              Processing...
            </>
          ) : (
            "Proceed to Checkout"
          )}
        </button>
      </div>
    </div>
  );
};

export default Cart;
