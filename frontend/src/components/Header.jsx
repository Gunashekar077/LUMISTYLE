import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaCartShopping, 
  FaUser, 
  FaMagnifyingGlass, 
  FaSun, 
  FaMoon, 
  FaHeart, 
  FaBars, 
  FaXmark,
  FaReceipt,
  FaUserGear,
  FaArrowRightFromBracket,
  FaArrowRight
} from "react-icons/fa6";
import { productService } from "../services/api";
import "./Header.css";

const Header = ({ 
  cartItems = [], 
  isAuthenticated, 
  currentUser, 
  onLogout, 
  theme, 
  toggleTheme,
  wishlistItems = [],
  setIsCartDrawerOpen
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Nav States
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Search Autocomplete States
  const [searchVal, setSearchVal] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Avant-Garde Interaction States
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [activeMegaPanel, setActiveMegaPanel] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navRef = useRef(null);
  const linksRef = useRef([]);

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "Shop", path: "/products" },
    { name: "Categories", path: "#", hasMegaPanel: "categories" },
    { name: "Deals", path: "/deals" },
    { name: "About", path: "/about" }
  ];

  const setLinkRef = (el, idx) => {
    linksRef.current[idx] = el;
  };

  const updateIndicator = (element) => {
    if (element && navRef.current) {
      const rect = element.getBoundingClientRect();
      const parentRect = navRef.current.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
        opacity: 1
      });
    }
  };

  const handleMouseEnterLink = (e, hasMegaPanel) => {
    updateIndicator(e.currentTarget);
    if (hasMegaPanel) {
      setActiveMegaPanel(hasMegaPanel);
    } else {
      setActiveMegaPanel(null);
    }
  };

  const handleMouseLeaveNav = () => {
    const activeIndex = navLinks.findIndex(link => {
      if (link.hasMegaPanel === "categories") return false;
      if (link.path === "/home" && location.pathname === "/home") return true;
      if (link.path === "/products" && location.pathname === "/products" && !location.search) return true;
      if (link.path.includes("price_asc") && location.search.includes("sort=price_asc")) return true;
      return false;
    });

    if (activeIndex !== -1 && linksRef.current[activeIndex]) {
      updateIndicator(linksRef.current[activeIndex]);
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
    setActiveMegaPanel(null);
  };

  // Sync indicator with active path
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeIndex = navLinks.findIndex(link => {
        if (link.hasMegaPanel === "categories") return false;
        if (link.path === "/home" && location.pathname === "/home") return true;
        if (link.path === "/products" && location.pathname === "/products" && !location.search) return true;
        if (link.path.includes("price_asc") && location.search.includes("sort=price_asc")) return true;
        return false;
      });

      if (activeIndex !== -1 && linksRef.current[activeIndex]) {
        updateIndicator(linksRef.current[activeIndex]);
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  // Track page scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch products once to enable fast in-memory search autocomplete
  useEffect(() => {
    productService.getProducts()
      .then(data => setAllProducts(data))
      .catch(err => console.error("Error pre-fetching products for autocomplete:", err));
  }, []);

  // Auto-complete filtering
  useEffect(() => {
    if (searchVal.trim().length >= 2) {
      const filtered = allProducts.filter(p => 
        p.title.toLowerCase().includes(searchVal.toLowerCase()) ||
        p.category.toLowerCase().includes(searchVal.toLowerCase())
      ).slice(0, 5); // Max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchVal, allProducts]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setShowSuggestions(false);
      setIsSearchFocused(false);
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleSuggestionClick = (title) => {
    setSearchVal("");
    setShowSuggestions(false);
    setIsSearchFocused(false);
    navigate(`/products?search=${encodeURIComponent(title)}`);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`header-nav-floating ${scrolled ? "scrolled" : ""}`}>
        {/* Logo left */}
        <Link to="/home" className="header-logo-link" onClick={handleLinkClick}>
          <h1 className="header-logo-text">LUMISTYLE</h1>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="header-nav-links" ref={navRef} onMouseLeave={handleMouseLeaveNav}>
          {navLinks.map((link, idx) => {
            const isActive = link.path !== "#" && (
              (link.path === "/home" && location.pathname === "/home") ||
              (link.path === "/products" && location.pathname === "/products" && !location.search) ||
              (link.path.includes("price_asc") && location.search.includes("sort=price_asc"))
            );

            return (
              <Link
                key={link.name}
                ref={(el) => setLinkRef(el, idx)}
                to={link.path}
                className={isActive ? "active" : ""}
                onMouseEnter={(e) => handleMouseEnterLink(e, link.hasMegaPanel)}
                onClick={handleLinkClick}
              >
                {link.name}
              </Link>
            );
          })}
          {/* Dynamic Underline Tracker */}
          <div 
            className="nav-hover-indicator" 
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity
            }} 
          />
        </nav>

        {/* Center Search Autocomplete Bar (Desktop) */}
        {isAuthenticated && (
          <div className={`header-search-container ${isSearchFocused ? "focused" : ""}`} ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="header-search-input-wrapper">
                <FaMagnifyingGlass className="header-search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchVal.trim().length >= 2) setShowSuggestions(true);
                  }}
                  className="header-search-input"
                />
              </div>
            </form>

            {/* Suggestions Overlay */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                {suggestions.map((item) => (
                  <div 
                    key={item.id} 
                    className="search-suggestion-item"
                    onClick={() => handleSuggestionClick(item.title)}
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="search-suggestion-img" 
                    />
                    <div className="search-suggestion-info">
                      <span className="search-suggestion-title">{item.title}</span>
                      <span className="search-suggestion-price">₹{(item.price * 80).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions Menu Right */}
        <div className="header-actions">
          {/* Light/Dark Toggle */}
          <button onClick={toggleTheme} className="header-action-btn theme-toggle" title="Toggle Theme">
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>

          {/* Wishlist Link/Button */}
          {isAuthenticated && (
            <button onClick={() => navigate("/products?wishlist=true")} className="header-action-btn" title="Wishlist">
              <div className="header-action-icon-wrapper">
                <FaHeart />
                {wishlistCount > 0 && <span className="header-badge-count">{wishlistCount}</span>}
              </div>
              <span className="header-action-label">Wishlist</span>
            </button>
          )}

          {/* Cart Icon & Drawer Trigger */}
          {isAuthenticated && (
            <button onClick={() => setIsCartDrawerOpen(true)} className="header-action-btn" title="Open Cart">
              <div className="header-action-icon-wrapper">
                <FaCartShopping />
                {cartCount > 0 && <span className="header-badge-count">{cartCount}</span>}
              </div>
              <span className="header-action-label">Bag</span>
            </button>
          )}

          {/* Profile Dropdown */}
          {isAuthenticated && (
            <div className="header-user-wrapper" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)} 
                className="header-action-btn"
                title="Account"
              >
                <div className="header-action-icon-wrapper">
                  <FaUser />
                </div>
                <span className="header-action-label">Profile</span>
              </button>
              {showProfileDropdown && (
                <div className="header-user-dropdown">
                  <div className="header-user-dropdown-info">
                    Signed in as:
                    <strong>{currentUser?.name || "Guest User"}</strong>
                  </div>
                  <Link 
                    to="/orders" 
                    className="header-user-dropdown-link"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <FaReceipt /> My Orders
                  </Link>
                  {currentUser?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="header-user-dropdown-link"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <FaUserGear /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={onLogout} className="header-user-logout-btn">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="header-mobile-toggle"
            title="Menu"
          >
            {isMobileMenuOpen ? <FaXmark /> : <FaBars />}
          </button>
        </div>
      </header>

      {/* Contextual Mega-Panel Container */}
      <div 
        className={`header-mega-panel ${activeMegaPanel ? "open" : ""}`}
        onMouseEnter={() => setActiveMegaPanel(activeMegaPanel)}
        onMouseLeave={handleMouseLeaveNav}
      >
        <div className="mega-panel-grid">
          {activeMegaPanel === "categories" && (
            <>
              {/* Left Side: Highlighted Trending Category Card */}
              <div className="mega-panel-featured-card">
                <div className="featured-card-overlay"></div>
                <img 
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600" 
                  alt="Trending Couture" 
                  className="featured-card-image"
                />
                <div className="featured-card-content">
                  <span className="featured-card-tag">NEW SEASON</span>
                  <h3 className="featured-card-title">WOMEN'S COUTURE</h3>
                  <p className="featured-card-desc">Experience the avant-garde designs crafted for the energetic fashion identity.</p>
                  <Link to="/products?category=women's clothing" className="featured-card-btn" onClick={handleMouseLeaveNav}>
                    Explore Collection <FaArrowRight />
                  </Link>
                </div>
              </div>

              {/* Right Side: Columns with plenty of whitespace */}
              <div className="mega-panel-links-container">
                <div className="mega-panel-column">
                  <h4>Collections</h4>
                  <Link to="/products?category=men's clothing" onClick={handleMouseLeaveNav}>Men's Apparel</Link>
                  <Link to="/products?category=women's clothing" onClick={handleMouseLeaveNav}>Women's Apparel</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Unisex Essentials</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Limited Edition</Link>
                </div>
                <div className="mega-panel-column">
                  <h4>Accessories</h4>
                  <Link to="/products?category=jewelery" onClick={handleMouseLeaveNav}>Fine Jewelry</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Leather Goods</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Eyewear</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Footwear</Link>
                </div>
                <div className="mega-panel-column">
                  <h4>Tech-Fashion</h4>
                  <Link to="/products?category=electronics" onClick={handleMouseLeaveNav}>Smart Wearables</Link>
                  <Link to="/products?category=electronics" onClick={handleMouseLeaveNav}>Premium Audio</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Tech Accessories</Link>
                </div>
              </div>
            </>
          )}

          {activeMegaPanel === "deals" && (
            <>
              {/* Left Side: Highlighted Trending Deal Card */}
              <div className="mega-panel-featured-card">
                <div className="featured-card-overlay"></div>
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" 
                  alt="Exclusive Offers" 
                  className="featured-card-image"
                />
                <div className="featured-card-content">
                  <span className="featured-card-tag discount">LIMITED FLASH SALE</span>
                  <h3 className="featured-card-title">UP TO 50% OFF</h3>
                  <p className="featured-card-desc">Redefine your wardrobe with curated fashion pieces at exclusive outlet pricing.</p>
                  <Link to="/products?sort=price_asc" className="featured-card-btn" onClick={handleMouseLeaveNav}>
                    Shop Clearance <FaArrowRight />
                  </Link>
                </div>
              </div>

              {/* Right Side: Organized sub-links */}
              <div className="mega-panel-links-container">
                <div className="mega-panel-column">
                  <h4>Clearance</h4>
                  <Link to="/products?sort=price_asc" onClick={handleMouseLeaveNav}>Cleared Items</Link>
                  <Link to="/products?sort=price_asc" onClick={handleMouseLeaveNav}>Flash Discounts</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Seasonal Outlet</Link>
                </div>
                <div className="mega-panel-column">
                  <h4>Promotions</h4>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Buy 1 Get 1 Free</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>First Buy Welcome10</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Free Standard Shipping</Link>
                </div>
                <div className="mega-panel-column">
                  <h4>New Marks</h4>
                  <Link to="/products?sort=price_asc" onClick={handleMouseLeaveNav}>Lowest Price Items</Link>
                  <Link to="/products" onClick={handleMouseLeaveNav}>Member Perks</Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Immersive Search Backdrop Overlay */}
      <div 
        className={`search-viewport-overlay ${isSearchFocused ? "active" : ""}`} 
        onClick={() => {
          setIsSearchFocused(false);
          if (searchRef.current) {
            const input = searchRef.current.querySelector('input');
            if (input) input.blur();
          }
        }}
      />

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-nav-links">
          <Link to="/home" onClick={handleLinkClick}>Home</Link>
          <Link to="/products" onClick={handleLinkClick}>Shop</Link>
          <Link to="/products?category=electronics" onClick={handleLinkClick}>Electronics</Link>
          <Link to="/products?category=jewelery" onClick={handleLinkClick}>Jewelery</Link>
          <Link to="/orders" onClick={handleLinkClick}>My Orders</Link>
        </div>
      </div>

    </>
  );
};

export default Header;