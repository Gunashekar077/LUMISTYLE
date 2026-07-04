import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  FaStar, 
  FaMagnifyingGlass, 
  FaHeart, 
  FaEye, 
  FaCartShopping, 
  FaFilter,
  FaArrowRotateLeft
} from "react-icons/fa6";
import ProductModal from "./ProductModal";
import { productService } from "../services/api";
import "./Products.css";

const Products = ({ onAddToCart, wishlistItems = [], toggleWishlist }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Core States
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");
  const [priceRange, setPriceRange] = useState(80000);
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse URL search params on mount or when location changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlSearch = queryParams.get("search") || "";
    const urlCategory = queryParams.get("category") || "all";
    const urlSort = queryParams.get("sort") || "";
    const urlWishlist = queryParams.get("wishlist") === "true";

    setSearch(urlSearch);
    setCategory(urlCategory);
    setSort(urlSort);
    setShowOnlyWishlist(urlWishlist);
  }, [location.search]);

  // Fetch all products initially to support local multi-filtering (including price slider)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getProducts();
        setAllProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Unable to load products. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Apply filters locally in real-time
  useEffect(() => {
    let result = [...allProducts];

    // Wishlist filter
    if (showOnlyWishlist) {
      result = result.filter(prod => wishlistItems.some(w => w.id === prod.id));
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(prod => 
        prod.title.toLowerCase().includes(q) || 
        prod.category.toLowerCase().includes(q) ||
        (prod.description && prod.description.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category !== "all") {
      result = result.filter(prod => prod.category.toLowerCase() === category.toLowerCase());
    }

    // Price range slider
    result = result.filter(prod => (prod.price * 80) <= priceRange);

    // Sorting
    if (sort === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(result);
  }, [allProducts, search, category, sort, priceRange, showOnlyWishlist, wishlistItems]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("");
    setPriceRange(80000);
    setShowOnlyWishlist(false);
    navigate("/products");
  };

  const uniqueCategories = ["electronics", "jewelery", "men's clothing", "women's clothing"];

  return (
    <div className="shop-layout-container">
      
      {/* Title Header */}
      <div className="shop-title-section">
        {showOnlyWishlist ? (
          <h1 className="shop-main-heading">My <span>Wishlist</span></h1>
        ) : (
          <h1 className="shop-main-heading">Explore <span>Our Catalog</span></h1>
        )}
        <p className="shop-sub-heading">Browse our luxury selection of fine accessories, gear, and apparel.</p>
      </div>

      {/* Mobile Filter Toggle Button */}
      <button 
        className="mobile-filter-toggle-btn btn-ripple"
        onClick={() => setShowMobileFilters(!showMobileFilters)}
      >
        <FaFilter style={{ marginRight: '8px' }} /> {showMobileFilters ? "Hide Filters" : "Show Filters"}
      </button>

      <div className="shop-split-grid">
        
        {/* Left Side: Interactive Sidebar Filters */}
        <aside className={`shop-sidebar-filters glass-panel ${showMobileFilters ? "mobile-open" : ""}`}>
          <div className="sidebar-filter-header">
            <h3><FaFilter /> Filters</h3>
            <button onClick={resetFilters} className="sidebar-reset-btn" title="Reset Filters">
              <FaArrowRotateLeft /> Reset
            </button>
          </div>

          {/* Search filter */}
          <div className="filter-group">
            <label className="filter-label">Search Query</label>
            <div className="filter-search-box">
              <FaMagnifyingGlass className="filter-search-icon" />
              <input
                type="text"
                placeholder="Keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="filter-search-input"
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="filter-category-options">
              <button 
                onClick={() => setCategory("all")}
                className={`filter-category-btn ${category === "all" ? "active" : ""}`}
              >
                All Categories
              </button>
              {uniqueCategories.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCategory(cat)}
                  className={`filter-category-btn ${category === cat ? "active" : ""}`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range filter */}
          <div className="filter-group">
            <div className="price-label-row">
              <label className="filter-label">Max Price</label>
              <span className="price-val">₹{priceRange.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="80000" 
              step="1000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="filter-price-slider"
            />
            <div className="price-range-limits">
              <span>₹0</span>
              <span>₹80,000</span>
            </div>
          </div>

          {/* Sorting filter */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="filter-sort-select"
            >
              <option value="">Default Sort</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Wishlist toggle in sidebar */}
          <div className="filter-group-checkbox">
            <input 
              type="checkbox" 
              id="wishlist-checkbox"
              checked={showOnlyWishlist}
              onChange={(e) => setShowOnlyWishlist(e.target.checked)}
              className="filter-checkbox"
            />
            <label htmlFor="wishlist-checkbox">Show Wishlist Only ({wishlistItems.length})</label>
          </div>
        </aside>

        {/* Right Side: Products Output Area */}
        <div className="shop-products-column">
          
          {/* Loader skeleton state */}
          {isLoading ? (
            <div className="shop-products-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton-product-card">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-price"></div>
                  <div className="skeleton skeleton-btn"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="shop-error-state">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="sidebar-reset-btn">Reload</button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="shop-empty-state">
              <h3>No Products Match Your Criteria</h3>
              <p>Try easing your price range filter or resetting keyword filters to discover more items.</p>
              <button onClick={resetFilters} className="shop-empty-btn">Reset All Filters</button>
            </div>
          ) : (
            <div className="shop-products-grid">
              {filteredProducts.map((prod, idx) => {
                const isWishlisted = wishlistItems.some(w => w.id === prod.id);
                return (
                  <div key={`${prod.id}-${idx}`} className="premium-product-card" style={{ flex: "none" }}>
                    
                    {/* Badge */}
                    {prod.price > 120 && <span className="card-badge sale">Best Seller</span>}
                    {prod.price < 50 && <span className="card-badge new">New</span>}

                    <div className="card-img-wrapper">
                      <img src={prod.image} alt={prod.title} className="card-img-main" />
                      
                      {/* Action overlays */}
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
                          <FaEye />
                        </button>
                      </div>
                    </div>

                    <div className="card-details-panel">
                      <div className="card-rating">
                        <FaStar />
                        <span>{prod.rating?.rate || 4.5}</span>
                      </div>
                      
                      <h4 className="card-product-title">{prod.title}</h4>
                      
                      <div className="card-price-row">
                        <span className="card-price-now">₹{(prod.price * 80).toLocaleString('en-IN')}</span>
                        {prod.price > 120 && (
                          <>
                            <span className="card-price-old">₹{(prod.price * 1.25 * 80).toLocaleString('en-IN')}</span>
                            <span className="card-price-discount">25% OFF</span>
                          </>
                        )}
                      </div>

                      <button 
                        onClick={() => onAddToCart(prod)}
                        className="card-add-btn"
                      >
                        <FaCartShopping /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Dialog Modal */}
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

export default Products;
