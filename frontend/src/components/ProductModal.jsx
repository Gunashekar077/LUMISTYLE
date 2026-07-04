import { useState } from "react";
import { FaStar, FaXmark, FaBagShopping } from "react-icons/fa6";
import "./ProductModal.css";

const ProductModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  // Custom Swatches States
  const [selectedColor, setSelectedColor] = useState("Royal Blue");
  const [selectedSize, setSelectedSize] = useState("M");

  // Reviews States
  const [reviews, setReviews] = useState([
    { name: "Aarav Sharma", rating: 5, comment: "Absolutely stunning quality. The materials feel premium and durable.", date: "2 days ago" },
    { name: "Mira Patel", rating: 4, comment: "Exquisite design. Fits perfectly and looks very elegant.", date: "1 week ago" }
  ]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");

  const handleAddReview = (e) => {
    e.preventDefault();
    if (newReviewName.trim() && newReviewComment.trim()) {
      setReviews([{
        name: newReviewName,
        rating: newReviewRating,
        comment: newReviewComment,
        date: "Just now"
      }, ...reviews]);
      setNewReviewName("");
      setNewReviewComment("");
      setNewReviewRating(5);
    }
  };

  const colors = [
    { name: "Royal Blue", hex: "#2563EB" },
    { name: "Luxury Purple", hex: "#8B5CF6" },
    { name: "Space Gray", hex: "#4B5563" }
  ];
  
  const sizes = ["S", "M", "L", "XL"];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay-custom" onClick={handleOverlayClick}>
      <div className="modal-card-custom">
        {/* Close button */}
        <button className="close-modal-btn-custom" onClick={onClose} aria-label="Close modal">
          <FaXmark />
        </button>

        {/* Left Side: Product Image */}
        <div className="modal-image-section-custom">
          <img src={product.image} alt={product.title} />
        </div>

        {/* Right Side: Product Details */}
        <div className="modal-details-section-custom">
          <span className="modal-category-custom">{product.category}</span>
          <h2 className="modal-title-custom">{product.title}</h2>
          
          {/* Rating */}
          <div className="modal-rating-row-custom">
            <div className="modal-stars-custom">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  style={{
                    color: i < Math.round(product.rating?.rate || 4.5) ? "#f59e0b" : "var(--border-color)"
                  }}
                />
              ))}
            </div>
            <span className="modal-rating-value-custom">{product.rating?.rate || 4.5}</span>
            <span className="modal-rating-count-custom">({product.rating?.count || 12} customer reviews)</span>
          </div>

          <p className="modal-description-custom">{product.description || "Indulge in uncompromised luxury. Meticulously designed with premium components and tailored for modern aesthetics, this piece effortlessly blends superior performance with clean ergonomics."}</p>
          
          {/* Interactive Color Selection */}
          <div className="modal-interactive-selector">
            <span className="selector-label">Color: <strong style={{ color: "var(--text-main)" }}>{selectedColor}</strong></span>
            <div className="color-swatches">
              {colors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(color.name)}
                  className={`color-swatch ${selectedColor === color.name ? "active" : ""}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Interactive Size Selection */}
          <div className="modal-interactive-selector">
            <span className="selector-label">Size: <strong style={{ color: "var(--text-main)" }}>{selectedSize}</strong></span>
            <div className="size-options">
              {sizes.map((size, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(size)}
                  className={`size-btn ${selectedSize === size ? "active" : ""}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="modal-reviews-section">
            <h4 className="reviews-section-title">Customer Reviews</h4>
            
            <div className="reviews-list">
              {reviews.map((rev, idx) => (
                <div key={idx} className="review-card">
                  <div className="review-card-header">
                    <span className="review-author">{rev.name}</span>
                    <span className="review-date">{rev.date}</span>
                  </div>
                  <div className="review-rating-row">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        style={{
                          color: i < rev.rating ? "#fbbf24" : "var(--border-color)",
                          fontSize: "0.8rem",
                          marginRight: "1px"
                        }}
                      />
                    ))}
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Write a review form */}
            <form onSubmit={handleAddReview} className="write-review-form">
              <h5>Write a Review</h5>
              <div className="review-form-group">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  required
                />
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <textarea
                placeholder="Share your experience with this item..."
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                required
                rows="2"
              ></textarea>
              <button type="submit" className="submit-review-btn btn-ripple">
                Submit Review
              </button>
            </form>
          </div>

          {/* Footer: Price and Add To Cart */}
          <div className="modal-price-btn-row-custom">
            <span className="modal-price-custom">₹{(product.price * 80).toLocaleString('en-IN')}</span>
            <button
              className="modal-add-btn-custom btn-ripple"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              <FaBagShopping style={{ marginRight: "8px" }} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
