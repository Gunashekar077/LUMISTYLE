import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaCartShopping, 
  FaHeart, 
  FaMagnifyingGlass, 
  FaChevronLeft, 
  FaChevronRight, 
  FaStar,
  FaArrowRight,
  FaTruckFast,
  FaShieldHalved,
  FaArrowRotateLeft,
  FaHeadphones,
  FaEnvelope,
  FaInstagram
} from "react-icons/fa6";
import { productService } from "../services/api";
import ProductModal from "./ProductModal";
import fashionModelPink from "../assets/fashion_model_pink.png";
import "./Home.css";

const Home = ({ onAddToCart, wishlistItems = [], toggleWishlist }) => {
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // States
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [emailSub, setEmailSub] = useState("");
  const [saleTime, setSaleTime] = useState({ hours: 4, minutes: 34, seconds: 12 });
  const [activeFaq, setActiveFaq] = useState(null);

  // Preload featured products
  useEffect(() => {
    productService.getProducts({ limit: 8 })
      .then(data => setFeaturedProducts(data))
      .catch(err => console.error("Error loading home products:", err));
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSaleTime(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset countdown
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-play Testimonials
  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(testimonialTimer);
  }, []);

  // Mouse Parallax for Hero Product
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / 30;
    const y = (e.clientY - (rect.top + rect.height / 2)) / 30;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (emailSub.trim()) {
      alert(`Thank you for subscribing, ${emailSub}! Enjoy 10% off your first purchase with code WELCOME10.`);
      setEmailSub("");
    }
  };

  // Carousel Scroll
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmt = direction === "left" ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  const categories = [
    { name: "Electronics", key: "electronics", count: "12 Items", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
    { name: "Jewelery", key: "jewelery", count: "8 Items", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500" },
    { name: "Men's Clothing", key: "men's clothing", count: "24 Items", img: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500" },
    { name: "Women's Clothing", key: "women's clothing", count: "36 Items", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500" }
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      location: "New York, USA",
      text: "The minimalism and detail of their products is unmatched. Every delivery feels like opening a luxury gift.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      name: "Marcus Thorne",
      location: "London, UK",
      text: "Their customer support is extremely professional. Fast delivery and simple returns make it my go-to luxury portal.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      name: "Evelyn Zhao",
      location: "Singapore",
      text: "Outstanding quality. The headphones and accessories have a distinct weight and premium finish that I love.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  ];

  const instas = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
  ];

  const faqs = [
    {
      q: "What is LUMISTYLE's shipping duration?",
      a: "We provide free courier shipping across India on orders exceeding ₹7,999. Standard domestic shipping takes 3-5 business days, while express orders arrive within 24-48 hours."
    },
    {
      q: "Are the product catalog items original?",
      a: "Every item featured in our boutique is strictly authentic, sourced directly from verified ateliers, and accompanied by a serial number card of authenticity."
    },
    {
      q: "What is the return and exchange policy?",
      a: "We offer a complimentary 14-day premium collection service for returns. Simply submit a request under your orders profile, and our logistics partner will collect it from your doorstep."
    },
    {
      q: "How do smart tech features operate on audio apparel?",
      a: "Our wearable audio range utilizes Bluetooth 5.2 to connect effortlessly with iOS and Android devices. It features micro-acoustic drivers and touch-sensitive frame controls."
    }
  ];

  const brandLogos = [
    <svg key="1" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L27 17.5L15 30L3 17.5L15 5Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 11L21 17.5L15 24L9 17.5L15 11Z" fill="currentColor"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">AURA</text>
    </svg>,
    <svg key="2" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="17" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="22" cy="17" r="10" stroke="currentColor" strokeWidth="2"/>
      <text x="44" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">VALENCE</text>
    </svg>,
    <svg key="3" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 4L27 11V24L15 31L3 24V11L15 4Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="15" cy="17.5" r="4" fill="currentColor"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">NOVA</text>
    </svg>,
    <svg key="4" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 8V28" stroke="currentColor" strokeWidth="2"/>
      <text x="36" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="11" letterSpacing="3" fill="currentColor">KRONOS</text>
    </svg>,
    <svg key="5" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L26 27H4L15 5Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 13L21 24H9L15 13Z" fill="currentColor"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">VORTEX</text>
    </svg>,
    <svg key="6" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 17.5H25" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="15" cy="17.5" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">ECLIPS</text>
    </svg>,
    <svg key="7" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L27 17.5L15 30L3 17.5L15 5Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 11L21 17.5L15 24L9 17.5L15 11Z" fill="currentColor"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">AURA</text>
    </svg>,
    <svg key="8" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="17" r="10" stroke="currentColor" strokeWidth="2"/>
      <circle cx="22" cy="17" r="10" stroke="currentColor" strokeWidth="2"/>
      <text x="44" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">VALENCE</text>
    </svg>,
    <svg key="9" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 4L27 11V24L15 31L3 24V11L15 4Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="15" cy="17.5" r="4" fill="currentColor"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">NOVA</text>
    </svg>,
    <svg key="10" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 8V28" stroke="currentColor" strokeWidth="2"/>
      <text x="36" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="11" letterSpacing="3" fill="currentColor">KRONOS</text>
    </svg>,
    <svg key="11" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 5L26 27H4L15 5Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M15 13L21 24H9L15 13Z" fill="currentColor"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">VORTEX</text>
    </svg>,
    <svg key="12" width="120" height="35" viewBox="0 0 120 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 17.5H25" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="15" cy="17.5" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
      <text x="38" y="22" fontFamily="'Poppins', sans-serif" fontWeight="700" fontSize="12" letterSpacing="3" fill="currentColor">ECLIPS</text>
    </svg>
  ];

  return (
    <div style={{ position: "relative" }}>
      
      {/* 1. Hero Section */}
      <section 
        className="hero-gradient-wrapper"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="hero-mesh-gradient" />
        <div className="floating-blob floating-blob-1" />
        <div className="floating-blob floating-blob-2" />

        <div className="hero-grid">
          <div className="hero-left-content">
            <h1 className="hero-heading">
              <span className="hero-highlight-white">LET'S</span> <br />
              DISCOVER <br />
              <span className="hero-highlight-yellow">DIFFERENT</span> <br />
              STYLES.
            </h1>
            <p className="hero-subtitle">
              Live for Influential and Innovative fashion!
            </p>
            <div className="hero-cta-group">
              <Link to="/products" className="hero-cta-primary">
                Shop Now
              </Link>
            </div>
          </div>

          <div className="hero-right-visual">
            <div className="hero-circle-backlight" />
            <div 
              className="hero-product-container"
              style={{
                transform: `rotateX(${-mouseOffset.y}deg) rotateY(${mouseOffset.x}deg) translateZ(30px)`
              }}
            >
              <img 
                src={fashionModelPink} 
                alt="Fashion Model Pink fur jacket" 
                className="hero-product-image" 
              />
            </div>

            {/* Orbiting 3D Glass Badge 1 - Left Upper (Trench Coat Card) */}
            <div 
              className="floating-spline-badge badge-left"
              style={{
                transform: `rotateX(${-mouseOffset.y * 1.5}deg) rotateY(${mouseOffset.x * 1.5}deg) translateZ(80px)`
              }}
            >
              <span className="badge-tag">TRENDING</span>
              <span className="badge-name">AURA Trench Coat</span>
              <span className="badge-price">₹19,999</span>
            </div>

            {/* Orbiting 3D Glass Badge 2 - Right Lower (Rating Card) */}
            <div 
              className="floating-spline-badge badge-right"
              style={{
                transform: `rotateX(${-mouseOffset.y * 1.8}deg) rotateY(${mouseOffset.x * 1.8}deg) translateZ(120px)`
              }}
            >
              <div className="badge-rating-row">
                <span className="badge-star">★</span>
                <span>4.9 Rating</span>
              </div>
              <span className="badge-meta">Verified Luxury</span>
            </div>

            {/* Orbiting 3D Glass Badge 3 - Right Upper (Tech Sunglasses Status) */}
            <div 
              className="floating-spline-badge badge-tech"
              style={{
                transform: `rotateX(${-mouseOffset.y * 1.2}deg) rotateY(${mouseOffset.x * 1.2}deg) translateZ(50px)`
              }}
            >
              <span className="badge-name">KRONOS Audio</span>
              <span className="badge-status-dot"></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brand Logos Auto-Marquee */}
      <section className="brand-marquee-section">
        <div className="brand-marquee-track">
          {brandLogos.map((logo, idx) => (
            <div key={idx} className="brand-logo-item">
              {logo}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Categories Cards */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-header-left">
            <h2 className="section-title">Shop by Categories</h2>
          </div>
          <Link to="/products" className="section-see-all-link">See All</Link>
        </div>

        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              className="category-card"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.key)}`)}
            >
              <div className="category-card-overlay" />
              <img src={cat.img} alt={cat.name} className="category-card-img" />
              <div className="category-card-info">
                <h3 className="category-card-title">{cat.name}</h3>
                <span className="category-card-count">{cat.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Infinite Scroll Carousel / Featured Products */}
      <section className="home-section" style={{ backgroundColor: "var(--bg-surface)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="section-header">
          <div className="section-header-left">
            <h2 className="section-title">NEW ARRIVALS</h2>
          </div>
          <Link to="/products" className="section-see-all-link">See All</Link>
        </div>

        <div className="carousel-outer-wrapper">
          <button className="carousel-nav-btn left" onClick={() => scrollCarousel("left")} title="Scroll Left">
            <FaChevronLeft />
          </button>
          
          <div className="carousel-viewport" ref={carouselRef}>
            {featuredProducts.map((prod, idx) => {
              const isWishlisted = wishlistItems.some(w => w.id === prod.id);
              return (
                <div key={`${prod.id}-${idx}`} className="premium-product-card">
                  
                  {/* Badges */}
                  {prod.price > 100 && (
                    <span className="card-badge sale">Best Seller</span>
                  )}
                  {prod.price < 50 && (
                    <span className="card-badge new">New</span>
                  )}

                  <div className="card-img-wrapper">
                    <img 
                      src={prod.image} 
                      alt={prod.title} 
                      className="card-img-main" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300';
                      }}
                    />
                    
                    {/* Hover Action Overlay */}
                    <div className="card-action-overlay">
                      <button 
                        onClick={() => toggleWishlist(prod)}
                        className={`card-overlay-btn ${isWishlisted ? "wishlisted" : ""}`}
                        title="Wishlist"
                      >
                        <FaHeart />
                      </button>
                      <button 
                        onClick={() => setSelectedProduct(prod)}
                        className="card-overlay-btn"
                        title="Quick View"
                      >
                        <FaMagnifyingGlass />
                      </button>
                    </div>
                  </div>

                  <div className="card-details-panel">
                    <div className="card-rating">
                      <FaStar />
                      <span>{prod.rating?.rate || 4.5}</span>
                    </div>
                    <Link to="/products" className="card-product-title">
                      {prod.title}
                    </Link>
                    
                    <div className="card-price-row">
                      <span className="card-price-now">₹{(prod.price * 80).toLocaleString('en-IN')}</span>
                      {prod.price > 100 && (
                        <>
                          <span className="card-price-old">₹{(prod.price * 1.2 * 80).toLocaleString('en-IN')}</span>
                          <span className="card-price-discount">20% OFF</span>
                        </>
                      )}
                    </div>

                    <button 
                      onClick={() => onAddToCart(prod)}
                      className="card-add-btn btn-ripple"
                    >
                      <FaCartShopping /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="carousel-nav-btn right" onClick={() => scrollCarousel("right")} title="Scroll Right">
            <FaChevronRight />
          </button>
        </div>
      </section>

      {/* 5. Flash Sale */}
      <section className="home-section">
        <div className="flash-sale-panel">
          <div className="flash-sale-left">
            <span className="section-tag" style={{ color: "#ef4444" }}>Limited Offer</span>
            <h2 className="section-title" style={{ textAlign: "left", margin: "10px 0" }}>Premium Flash Sale</h2>
            <p className="section-desc" style={{ textAlign: "left", margin: 0 }}>
              Unlock massive exclusive discounts on luxury electronic goods. Act fast before our inventory sells out completely.
            </p>
            
            {/* Live Ticking Countdown */}
            <div className="flash-countdown-row">
              <div className="countdown-box">
                <span className="count-num">{String(saleTime.hours).padStart(2, "0")}</span>
                <span className="count-label">Hours</span>
              </div>
              <div className="countdown-box">
                <span className="count-num">{String(saleTime.minutes).padStart(2, "0")}</span>
                <span className="count-label">Mins</span>
              </div>
              <div className="countdown-box">
                <span className="count-num">{String(saleTime.seconds).padStart(2, "0")}</span>
                <span className="count-label">Secs</span>
              </div>
            </div>

            {/* Progress stock bar */}
            <div className="flash-progress-wrapper">
              <div className="flash-progress-info">
                <span>Stock Remaining</span>
                <span style={{ color: "#ef4444" }}>Only 8 Left!</span>
              </div>
              <div className="flash-progress-bar-bg">
                <div className="flash-progress-bar-fill" style={{ width: "84%" }}></div>
              </div>
            </div>
          </div>

          <div className="flash-sale-right">
            <img 
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500" 
              alt="Flash Sale Smartwatch" 
              className="flash-sale-right-img" 
            />
          </div>
        </div>
      </section>

      {/* 6. Trending alternating showcase splits */}
      <section className="home-section" style={{ backgroundColor: "var(--bg-surface)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="section-header">
          <div className="section-header-left">
            <h2 className="section-title">Trending Styles</h2>
          </div>
          <Link to="/products" className="section-see-all-link">See All</Link>
        </div>

        <div className="trending-split-row">
          <div className="trending-split-img-box">
            <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600" alt="Suits Lifestyle" className="trending-split-img" />
          </div>
          <div className="trending-split-info">
            <h3 className="trending-split-title">Precision Tailored</h3>
            <p className="trending-split-desc">
              Discover our collection of expertly structured jackets, sleek trousers, and premium dynamic garments constructed from organic combed wool and blends.
            </p>
            <Link to="/products" className="hero-cta-primary">
              View Apparel
            </Link>
          </div>
        </div>

        <div className="trending-split-row reverse">
          <div className="trending-split-img-box">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600" alt="Sneakers Lifestyle" className="trending-split-img" />
          </div>
          <div className="trending-split-info">
            <h3 className="trending-split-title">Everyday Ergonomics</h3>
            <p className="trending-split-desc">
              Featherlight premium footwear fitted with custom orthotic inserts, breathable meshes, and flexible vulcanized rubbers built to move fluidly.
            </p>
            <Link to="/products" className="hero-cta-primary">
              Explore Footwear
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Why Choose Us */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-header-left">
            <h2 className="section-title">Why Choose Us</h2>
          </div>
          <Link to="/products" className="section-see-all-link">See All</Link>
        </div>

        <div className="why-us-grid">
          <div className="why-us-card">
            <div className="why-us-icon-wrapper"><FaTruckFast /></div>
            <h4>Free Shipping</h4>
            <p>Completely free courier delivery on all domestic orders exceeding ₹7,999.</p>
          </div>
          <div className="why-us-card">
            <div className="why-us-icon-wrapper"><FaShieldHalved /></div>
            <h4>Secure Payments</h4>
            <p>Fully PCI-compliant transactions shielded with military-grade 256-bit encryption.</p>
          </div>
          <div className="why-us-card">
            <div className="why-us-icon-wrapper"><FaArrowRotateLeft /></div>
            <h4>Easy Returns</h4>
            <p>Unhappy with your purchase? Send it back in original packaging within 30 days.</p>
          </div>
          <div className="why-us-card">
            <div className="why-us-icon-wrapper"><FaHeadphones /></div>
            <h4>24/7 Support</h4>
            <p>An elite, dedicated customer care squad waiting to assist you day and night.</p>
          </div>
        </div>
      </section>

      {/* 8. Testimonials Section */}
      <section className="home-section" style={{ backgroundColor: "var(--bg-surface)", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="testimonials-viewport">
          <div className="testimonial-card-slide">
            <img 
              src={testimonials[activeTestimonial].avatar} 
              alt={testimonials[activeTestimonial].name} 
              className="testimonial-avatar" 
            />
            <p className="testimonial-text">
              "{testimonials[activeTestimonial].text}"
            </p>
            <div className="testimonial-author">
              {testimonials[activeTestimonial].name}
              <span>— {testimonials[activeTestimonial].location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Premium FAQ Accordion */}
      <section className="home-section">
        <div className="section-header">
          <div className="section-header-left">
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="faq-accordion-container">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className={`faq-accordion-item ${isOpen ? "open" : ""}`}
                onClick={() => setActiveFaq(isOpen ? null : idx)}
              >
                <div className="faq-accordion-question">
                  <span>{faq.q}</span>
                  <span className="faq-accordion-icon">{isOpen ? "−" : "+"}</span>
                </div>
                <div className="faq-accordion-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 10. Newsletter Card */}
      <section className="home-section">
        <div className="newsletter-wrapper">
          <h2>Join the Inner Circle</h2>
          <p>Subscribe to receive early catalog access, limited price updates, and luxury lifestyle guides directly in your inbox.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={emailSub}
              onChange={(e) => setEmailSub(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* 11. Multi-Column Footer */}
      <footer className="premium-footer">
        <div className="footer-columns-row">
          
          <div className="footer-brand-col">
            <div className="footer-brand-logo">LUMISTYLE</div>
            <p className="footer-brand-desc">
              Providing modern minimalism, exquisite high-end coordinates, and uncompromised acoustic luxury worldwide.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-icon"><FaInstagram /></a>
              <a href="#" className="footer-social-icon"><FaEnvelope /></a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Shop</h4>
            <ul className="footer-links">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=electronics">Electronics</Link></li>
              <li><Link to="/products?category=jewelery">Jewelery</Link></li>
              <li><Link to="/products">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><Link to="/home">Help Center</Link></li>
              <li><Link to="/home">Shipping & Handling</Link></li>
              <li><Link to="/home">Easy Returns</Link></li>
              <li><Link to="/home">Order Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/home">About Our Brand</Link></li>
              <li><Link to="/home">Careers</Link></li>
              <li><Link to="/home">Sustainability</Link></li>
              <li><Link to="/home">Press & Media</Link></li>
            </ul>
          </div>

        </div>

        <div className="footer-bottom-panel">
          <p>© 2026 LUMISTYLE Inc. All Rights Reserved. Designed for uncompromised luxury.</p>
          <div className="footer-payments">
            <span style={{ fontSize: "0.85rem", marginRight: "8px", fontWeight: "600" }}>We Accept:</span>
            <span>💳 PayPal, Apple Pay, Visa, Stripe</span>
          </div>
        </div>
      </footer>

      {/* Quick View Modal Overlay */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};

export default Home;
