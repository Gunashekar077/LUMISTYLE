import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import Products from "./components/Products";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import AdminDashboard from "./components/AdminDashboard";
import Notification from "./components/Notification";
import SignIn from "./components/SignIn";
import CartDrawer from "./components/CartDrawer";
import Deals from "./components/Deals";
import About from "./components/About";
import Profile from "./components/Profile";
import { authService, cartService } from "./services/api";
import { OrderProvider } from "./context/OrderContext";
import { PulseLoader } from "react-spinners";
import { FaArrowUp, FaHeadphones } from "react-icons/fa6";
import "./App.css";

const NotFound = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "70vh",
    textAlign: "center",
    padding: "40px"
  }}>
    <h1 style={{ fontSize: "6rem", fontWeight: "800", background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>404</h1>
    <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>Page Not Found</h2>
    <p style={{ color: "var(--text-muted)", marginBottom: "32px", maxWidth: "480px" }}>The luxury page you are looking for does not exist or has been moved to another coordinate.</p>
    <a href="/home" style={{ padding: "14px 28px", background: "var(--accent-gradient)", color: "white", textDecoration: "none", borderRadius: "12px", fontWeight: "600", boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)" }}>Back to Home</a>
  </div>
);

// Route Guard component for logged-in users
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Route Guard component for Admin users only
const AdminRoute = ({ isAuthenticated, currentUser, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (currentUser && currentUser.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const App = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true" && !!localStorage.getItem("token");
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Premium Custom States
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! I am your AI Style Assistant. How can I help you elevate your wardrobe today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  // Device Detection
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Sync Theme class
  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync Wishlist store
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  // Load user profile if authenticated
  const handleChatSubmit = (textToSend = '') => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    const newMessages = [...chatMessages, { sender: "user", text }];
    setChatMessages(newMessages);
    if (!textToSend) setChatInput("");

    setTimeout(() => {
      let botResponse = "I'm still learning the art of couture! Try asking one of the quick suggestions above for immediate guidance.";
      const query = text.toLowerCase();
      
      if (query.includes("coat") || query.includes("winter") || query.includes("trench")) {
        botResponse = "Our signature piece is the LUMISTYLE 'AURA' Obsidian Trench Coat (₹19,999), featuring premium water-resistant technical cotton and an architectural magnetic clasp.";
      } else if (query.includes("sunglass") || query.includes("accessory") || query.includes("audio") || query.includes("kronos")) {
        botResponse = "Explore the LUMISTYLE 'KRONOS' Audio Sunglasses (₹14,399) or the LUMISTYLE 'VORTEX' 18k Crescent Gold Pendant (₹10,399) for peak luxury styling.";
      } else if (query.includes("discount") || query.includes("coupon") || query.includes("code") || query.includes("welcome")) {
        botResponse = "Apply the code WELCOME10 during checkout to save an exclusive 10% on your entire order!";
      } else if (query.includes("ship") || query.includes("deliver") || query.includes("return") || query.includes("refund")) {
        botResponse = "Orders over ₹7,999 enjoy free express shipping. We offer a complimentary 14-day premium collection service for all returns.";
      } else if (query.includes("crop") || query.includes("top") || query.includes("knit") || query.includes("nova")) {
        botResponse = "Check out the LUMISTYLE 'NOVA' Electric Pink Knit Crop Top (₹7,199) - a vibrant knitwear piece crafted from organic mercerized cotton.";
      } else if (query.includes("puffer") || query.includes("jacket") || query.includes("valence")) {
        botResponse = "Stay warm with the LUMISTYLE 'VALENCE' Cropped Obsidian Puffer Jacket (₹17,599) insulated with high-gloss premium down fill.";
      } else if (query.includes("boots") || query.includes("chelsea") || query.includes("noir")) {
        botResponse = "The LUMISTYLE 'NOIR' Luxury Leather Chelsea Boots (₹15,199) are handcrafted in Italy from full-grain calfskin leather.";
      } else if (query.includes("pearl") || query.includes("earring") || query.includes("luna")) {
        botResponse = "The LUMISTYLE 'LUNA' Pearl Drop Earrings (₹7,999) feature cultured freshwater pearls suspended below starburst CZ studs.";
      } else if (query.includes("earbud") || query.includes("headphone") || query.includes("eclipse")) {
        botResponse = "Listen in style with the LUMISTYLE 'ECLIPSE' Active Hybrid Sport Earbuds (₹11,999) featuring hybrid noise cancellation.";
      }

      setChatMessages(prev => [...prev, { sender: "bot", text: botResponse }]);
    }, 800);
  };

  const loadUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = await authService.getProfile();
        // Merge with local storage profile updates if they exist
        const localOverride = localStorage.getItem("user_profile_override");
        if (localOverride) {
          try {
            const parsed = JSON.parse(localOverride);
            user.name = parsed.name || user.name;
            user.email = parsed.email || user.email;
          } catch(e) {
            console.error("Error loading local override profile", e);
          }
        }
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Sync cart after profile is loaded
        const cart = await cartService.getCart();
        setCartItems(cart);
      } catch (err) {
        console.error("Profile load failed, logging out:", err);
        handleLogout();
      } finally {
        setIsLoadingProfile(false);
      }
    } else {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdateProfile = (updatedData) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        name: updatedData.name || prev.name,
        email: updatedData.email || prev.email
      };
    });
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Fetch cart details on auth state changes
  useEffect(() => {
    if (isAuthenticated && localStorage.getItem("token")) {
      if (!currentUser) {
        loadUserProfile();
      } else {
        cartService.getCart()
          .then(cart => setCartItems(cart))
          .catch(err => console.error("Error fetching cart:", err));
      }
    }
  }, [isAuthenticated]);

  // Listeners for Cursor and Scroll
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth <= 768 || ('ontouchstart' in window));
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);

    const splashTimeout = setTimeout(() => {
      setIsSplashLoading(false);
    }, 1200);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(splashTimeout);
    };
  }, []);

  const addToCart = async (product) => {
    try {
      const updatedCart = await cartService.addCartItem(product.id, 1);
      setCartItems(updatedCart);
      setNotification({
        message: `${product.title} added to cart!`,
        type: "success",
      });
      // Automatically open the cart drawer for premium user experience
      setIsCartDrawerOpen(true);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setNotification({
        message: "Failed to add item to cart. Please try again.",
        type: "error",
      });
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      let updatedCart;
      if (newQuantity <= 0) {
        updatedCart = await cartService.removeCartItem(productId);
        setNotification({
          message: "Item removed from cart",
          type: "success",
        });
      } else {
        updatedCart = await cartService.updateCartItem(productId, newQuantity);
      }
      setCartItems(updatedCart);
    } catch (err) {
      console.error("Error updating quantity:", err);
      setNotification({
        message: err.response?.data?.message || "Failed to update quantity.",
        type: "error",
      });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = await cartService.removeCartItem(productId);
      setCartItems(updatedCart);
      setNotification({
        message: "Item removed from cart",
        type: "success",
      });
    } catch (err) {
      console.error("Error removing from cart:", err);
      setNotification({
        message: "Failed to remove item. Please try again.",
        type: "error",
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleWishlist = (product) => {
    const exists = wishlistItems.some((item) => item.id === product.id);
    if (exists) {
      setWishlistItems(wishlistItems.filter((item) => item.id !== product.id));
      setNotification({
        message: `${product.title} removed from wishlist`,
        type: "info",
      });
    } else {
      setWishlistItems([...wishlistItems, product]);
      setNotification({
        message: `${product.title} added to wishlist!`,
        type: "success",
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCartItems([]);
    setIsCartDrawerOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Full Screen Startup Loader
  if (isSplashLoading || isLoadingProfile) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: theme === "dark" ? "#09090b" : "#f5f5f7",
        gap: "24px"
      }}>
        <h1 style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "3rem",
          fontWeight: "800",
          background: "linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-1.5px",
          margin: 0
        }}>
          LUMISTYLE
        </h1>
        <PulseLoader color="#d4af37" size={12} margin={4} />
      </div>
    );
  }

  return (
    <OrderProvider>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress-container">
        <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      </div>



      {/* Floating Header */}
      <Header 
        cartItems={cartItems} 
        isAuthenticated={isAuthenticated} 
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        wishlistItems={wishlistItems}
        isCartDrawerOpen={isCartDrawerOpen}
        setIsCartDrawerOpen={setIsCartDrawerOpen}
      />

      {/* Toast Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Side Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
      />

      <main className={`main-content ${["/", "/signin", "/home", "/about", "/deals"].includes(location.pathname) ? "no-header-spacer" : "with-header-spacer"}`}>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <SignIn setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          <Route 
            path="/signin" 
            element={
              isAuthenticated ? <Navigate to="/home" replace /> : <SignIn setIsAuthenticated={setIsAuthenticated} />
            } 
          />
          
          <Route 
            path="/home" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Home 
                  onAddToCart={addToCart}
                  wishlistItems={wishlistItems}
                  toggleWishlist={toggleWishlist}
                />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Products 
                  onAddToCart={addToCart} 
                  wishlistItems={wishlistItems}
                  toggleWishlist={toggleWishlist}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deals"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Deals 
                  onAddToCart={addToCart} 
                  wishlistItems={wishlistItems}
                  toggleWishlist={toggleWishlist}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Cart 
                  cartItems={cartItems} 
                  onRemoveFromCart={removeFromCart} 
                  onUpdateQuantity={updateQuantity}
                  onClearCart={clearCart}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Checkout cartItems={cartItems} onClearCart={clearCart} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success/:orderId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Navigate to="/profile" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute isAuthenticated={isAuthenticated} currentUser={currentUser}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Floating Chatbot Assistant */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="chatbot-float-btn"
        title="Style Assistant"
      >
        <FaHeadphones />
      </button>

      <div className={`chatbot-panel ${isChatOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <h4>Style Assistant</h4>
          <button onClick={() => setIsChatOpen(false)} className="chatbot-close-btn">
            &times;
          </button>
        </div>

        <div className="chatbot-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="chat-suggestions">
          <button onClick={() => handleChatSubmit("Show me Winter Coats 🧥")} className="chat-suggestion-chip">Winter Coats 🧥</button>
          <button onClick={() => handleChatSubmit("Show me Accessories 🕶️")} className="chat-suggestion-chip">Accessories 🕶️</button>
          <button onClick={() => handleChatSubmit("Can I get a discount code? 🏷️")} className="chat-suggestion-chip">Discounts 🏷️</button>
          <button onClick={() => handleChatSubmit("Track my delivery status 📦")} className="chat-suggestion-chip">Shipping 📦</button>
        </div>

        <div className="chatbot-input-row">
          <input 
            type="text" 
            placeholder="Type a message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
            className="chatbot-input"
          />
          <button onClick={() => handleChatSubmit()} className="chatbot-send-btn">
            &rarr;
          </button>
        </div>
      </div>

      {/* Back to top float button */}
      <button 
        onClick={scrollToTop} 
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        title="Back to Top"
      >
        <FaArrowUp />
      </button>
    </OrderProvider>
  );
};

export default App;
