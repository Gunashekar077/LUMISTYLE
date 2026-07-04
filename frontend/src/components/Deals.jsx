import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaCartShopping, 
  FaHeart, 
  FaEye, 
  FaStar,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaFire,
  FaTag
} from "react-icons/fa6";
import { productService } from "../services/api";
import ProductModal from "./ProductModal";
import "./Deals.css";

const Deals = ({ onAddToCart, wishlistItems = [], toggleWishlist }) => {
  const navigate = useNavigate();
  const flashSaleScrollRef = useRef(null);
  const recommendedScrollRef = useRef(null);

  // States
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 22, seconds: 45 });
  const [isLoading, setIsLoading] = useState(true);

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error loading deals:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  // Scroll Helpers
  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Helper to format prices
  const formatPrice = (price) => {
    return `₹${(price * 80).toLocaleString('en-IN')}`;
  };

  if (isLoading) {
    return (
      <div className="deals-loading">
        <div className="deals-spinner"></div>
        <p>Curating boutique deals...</p>
      </div>
    );
  }

  // Filter products for different sections
  // Let's take the first 4 for Flash Sale
  const flashSaleProducts = products.slice(0, 5).map((p, idx) => ({
    ...p,
    timeLeft: { minutes: 12 + idx * 8, seconds: 45 },
    stockLeft: 3 + (idx % 3),
    percentSold: 85 - (idx * 10)
  }));

  // Today's best deals - highest discount mock representation
  const featuredDeal = products[21] || products[0]; // Aura coat or first item
  const supportingDeals = products.slice(1, 5);

  // BOGO products
  const bogoProducts = products.slice(5, 7);

  // Categories metadata
  const discountCategories = [
    { name: "Apparel", key: "men's clothing", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", discount: "Up to 70% OFF" },
    { name: "Jewelery", key: "jewelery", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=150", discount: "Up to 50% OFF" },
    { name: "Electronics", key: "electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150", discount: "Up to 40% OFF" },
    { name: "Footwear", key: "men's clothing", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150", discount: "Flat 60% OFF" },
    { name: "Activewear", key: "women's clothing", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=150", discount: "Flat 50% OFF" }
  ];

  return (
    <div className="deals-page-container">
      {/* Background blobs */}
      <div className="deals-bg-blobs">
        <div className="deals-blob blob-purple"></div>
        <div className="deals-blob blob-pink"></div>
      </div>

      {/* SECTION 1: HERO DEALS BANNER */}
      <section className="deals-hero-section">
        <div className="deals-hero-grid">
          <div className="deals-hero-left">
            <div className="deals-badge-row">
              <span className="hero-offer-badge"><FaTag /> SEASONAL SPECIAL</span>
            </div>
            <h1 className="deals-hero-title">
              MEGA SALE <br />
              <span className="highlight-deals-text">UP TO 70% OFF</span>
            </h1>
            <p className="deals-hero-subtitle">
              Indulge in premium couture, active coordinates, and audio luxury at unparalleled pricing values.
            </p>
            
            {/* Live Countdown */}
            <div className="deals-timer-row">
              <span className="timer-label">ENDS IN:</span>
              <div className="deals-timer">
                <div className="timer-block">
                  <span className="timer-val">{String(countdown.hours).padStart(2, '0')}</span>
                  <span className="timer-unit">HRS</span>
                </div>
                <span className="timer-colon">:</span>
                <div className="timer-block">
                  <span className="timer-val">{String(countdown.minutes).padStart(2, '0')}</span>
                  <span className="timer-unit">MINS</span>
                </div>
                <span className="timer-colon">:</span>
                <div className="timer-block">
                  <span className="timer-val">{String(countdown.seconds).padStart(2, '0')}</span>
                  <span className="timer-unit">SECS</span>
                </div>
              </div>
            </div>

            <div className="deals-hero-cta">
              <button 
                onClick={() => navigate("/products")}
                className="deals-cta-btn btn-ripple"
              >
                Claim Deals Now <FaArrowRight />
              </button>
            </div>
          </div>

          <div className="deals-hero-right">
            {/* 3D floating graphic asset */}
            <div className="deals-floating-card">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600" 
                alt="Luxury Fashion Model" 
                className="deals-floating-card-img"
              />
              <div className="deals-floating-discount-tag">
                <span>70%</span>
                <span className="off-text">OFF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: TOP DISCOUNT CATEGORIES */}
      <section className="deals-section">
        <div className="deals-section-header">
          <h2 className="deals-section-title">Shop by Offer Categories</h2>
        </div>
        <div className="discount-categories-row">
          {discountCategories.map((cat, idx) => (
            <div 
              key={idx} 
              className="discount-cat-card"
              onClick={() => navigate(`/products?category=${encodeURIComponent(cat.key)}`)}
            >
              <div className="discount-cat-img-wrapper">
                <img src={cat.img} alt={cat.name} />
                <div className="discount-cat-badge">{cat.discount}</div>
              </div>
              <h4>{cat.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: FLASH SALE */}
      <section className="deals-section flash-sale-section">
        <div className="deals-section-header">
          <div className="deals-section-header-left">
            <span className="header-subtitle-pulse"><FaFire /> LIVE NOW</span>
            <h2 className="deals-section-title">Premium Flash Deals</h2>
          </div>
          <div className="scroll-navigation-btns">
            <button onClick={() => scrollContainer(flashSaleScrollRef, "left")} className="scroll-nav-btn"><FaChevronLeft /></button>
            <button onClick={() => scrollContainer(flashSaleScrollRef, "right")} className="scroll-nav-btn"><FaChevronRight /></button>
          </div>
        </div>

        <div className="flash-sale-scroller" ref={flashSaleScrollRef}>
          {flashSaleProducts.map((prod) => {
            const isWishlisted = wishlistItems.some(w => w.id === prod.id);
            return (
              <div key={prod.id} className="flash-sale-card">
                <div className="flash-card-img-wrapper">
                  <img src={prod.image} alt={prod.title} className="flash-product-img" />
                  <span className="flash-discount-badge">50% OFF</span>
                  
                  {/* Actions overlay */}
                  <div className="flash-card-actions">
                    <button 
                      onClick={() => toggleWishlist(prod)} 
                      className={`flash-action-btn ${isWishlisted ? "wishlisted" : ""}`}
                      title="Add to Wishlist"
                    >
                      <FaHeart />
                    </button>
                    <button 
                      onClick={() => setSelectedProduct(prod)} 
                      className="flash-action-btn"
                      title="Quick View"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>

                <div className="flash-card-details">
                  <div className="flash-meta-row">
                    <span className="flash-stock-badge">ONLY {prod.stockLeft} LEFT</span>
                    <span className="flash-timer-badge"><FaClock /> {prod.timeLeft.minutes}m left</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flash-sold-progress-wrapper">
                    <div className="flash-sold-progress-bar" style={{ width: `${prod.percentSold}%` }}></div>
                    <span className="progress-sold-text">{prod.percentSold}% Claimed</span>
                  </div>

                  <h4 className="flash-card-title">{prod.title}</h4>
                  
                  <div className="flash-card-price-row">
                    <span className="flash-price-now">{formatPrice(prod.price * 0.5)}</span>
                    <span className="flash-price-old">{formatPrice(prod.price)}</span>
                  </div>

                  <button 
                    onClick={() => onAddToCart(prod)}
                    className="flash-card-add-btn"
                  >
                    <FaCartShopping /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: TODAY'S BEST DEALS (MASONRY LAYOUT) */}
      <section className="deals-section">
        <div className="deals-section-header">
          <h2 className="deals-section-title">Today's Best Boutiques</h2>
        </div>

        <div className="masonry-deals-grid">
          {/* Featured Large Deal */}
          <div className="masonry-deal-card featured-masonry-card">
            <div className="masonry-img-side">
              <img src={featuredDeal.image} alt={featuredDeal.title} />
              <span className="masonry-discount-badge">60% OFF</span>
            </div>
            <div className="masonry-details-side">
              <span className="masonry-highlight-tag"><FaFire /> TOP OFFER</span>
              <h3>{featuredDeal.title}</h3>
              <p className="masonry-desc">{featuredDeal.description}</p>
              
              <div className="masonry-rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} style={{ color: i < 4 ? "#fbbf24" : "rgba(255,255,255,0.15)" }} />
                ))}
                <span>(4.8 rating)</span>
              </div>

              <div className="masonry-price-row">
                <span className="masonry-price-now">{formatPrice(featuredDeal.price * 0.4)}</span>
                <span className="masonry-price-old">{formatPrice(featuredDeal.price)}</span>
              </div>

              <div className="masonry-actions-row">
                <button onClick={() => onAddToCart(featuredDeal)} className="masonry-add-btn">
                  Add to Cart
                </button>
                <button onClick={() => setSelectedProduct(featuredDeal)} className="masonry-view-btn">
                  Quick View
                </button>
              </div>
            </div>
          </div>

          {/* Supporting Small Deals */}
          <div className="masonry-supporting-grid">
            {supportingDeals.map((prod) => {
              const isWishlisted = wishlistItems.some(w => w.id === prod.id);
              return (
                <div key={prod.id} className="supporting-deal-card">
                  <div className="supporting-img-wrapper">
                    <img src={prod.image} alt={prod.title} />
                    <span className="supporting-discount-badge">30% OFF</span>
                    
                    <button 
                      onClick={() => toggleWishlist(prod)} 
                      className={`supporting-wish-btn ${isWishlisted ? "wishlisted" : ""}`}
                    >
                      <FaHeart />
                    </button>
                  </div>
                  <div className="supporting-details">
                    <h4 className="supporting-title">{prod.title}</h4>
                    <div className="supporting-price-row">
                      <span className="supporting-price-now">{formatPrice(prod.price * 0.7)}</span>
                      <span className="supporting-price-old">{formatPrice(prod.price)}</span>
                    </div>
                    <button onClick={() => onAddToCart(prod)} className="supporting-add-btn">
                      + Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: BUY ONE GET ONE (BOGO) */}
      <section className="deals-section bogo-section">
        <div className="bogo-card-wrapper">
          <div className="bogo-offer-banner">
            <span className="bogo-ribbon">EXCLUSIVE BOGO</span>
            <h2>BUY 1 GET 1 FREE</h2>
            <p>Elevate your everyday wardrobe coordinates. Purchase any premium cotton tee or knitwear crop top and receive another item of equal value entirely free.</p>
            <button onClick={() => navigate("/products?category=women's%20clothing")} className="bogo-shop-btn">
              Explore BOGO Catalog
            </button>
          </div>
          
          <div className="bogo-products-showcase">
            {bogoProducts.map(prod => (
              <div key={prod.id} className="bogo-product-card">
                <img src={prod.image} alt={prod.title} />
                <div className="bogo-badge">BUY 1 GET 1</div>
                <h4>{prod.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: RECOMMENDED FOR YOU (CAROUSEL) */}
      <section className="deals-section">
        <div className="deals-section-header">
          <h2 className="deals-section-title">Recommended For You</h2>
          <div className="scroll-navigation-btns">
            <button onClick={() => scrollContainer(recommendedScrollRef, "left")} className="scroll-nav-btn"><FaChevronLeft /></button>
            <button onClick={() => scrollContainer(recommendedScrollRef, "right")} className="scroll-nav-btn"><FaChevronRight /></button>
          </div>
        </div>

        <div className="recommended-scroller" ref={recommendedScrollRef}>
          {products.slice(6, 12).map((prod) => {
            const isWishlisted = wishlistItems.some(w => w.id === prod.id);
            return (
              <div key={prod.id} className="rec-product-card">
                <div className="rec-img-wrapper">
                  <img src={prod.image} alt={prod.title} />
                  <button 
                    onClick={() => toggleWishlist(prod)} 
                    className={`rec-wishlist-btn ${isWishlisted ? "wishlisted" : ""}`}
                  >
                    <FaHeart />
                  </button>
                </div>
                <div className="rec-details">
                  <h4 className="rec-title">{prod.title}</h4>
                  <div className="rec-price-row">
                    <span className="rec-price">{formatPrice(prod.price)}</span>
                  </div>
                  <div className="rec-actions">
                    <button onClick={() => onAddToCart(prod)} className="rec-cart-btn">
                      Add to Cart
                    </button>
                    <button onClick={() => setSelectedProduct(prod)} className="rec-view-btn">
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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

export default Deals;
