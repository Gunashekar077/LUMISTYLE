import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaArrowRight, 
  FaEnvelope, 
  FaTwitter, 
  FaLinkedin, 
  FaGlobe,
  FaAward,
  FaLeaf,
  FaHeart,
  FaStar,
  FaInstagram,
  FaFacebookF,
  FaShieldHalved,
  FaCircleCheck,
  FaLightbulb
} from "react-icons/fa6";
import "./About.css";

const About = () => {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sophia Loren",
      role: "Fashion Lead",
      text: "LUMISTYLE is redefining what tech-wear and couture mean. The integration of audio sunglasses with bespoke trench coats is revolutionary.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    },
    {
      name: "Arjun Mehta",
      role: "Luxury Consultant",
      text: "Their customer experience and attention to detail are world-class. It feels like engaging with a boutique atelier in Milan.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      name: "Clara Oswald",
      role: "Apparel Critic",
      text: "Organic cotton blended with technical fibers. LUMISTYLE proves that fashion-forward design doesn't have to cost the planet.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  ];

  // Auto-play Testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const timeline = [
    { year: "2022", title: "Founded", desc: "LUMISTYLE launched its digital flagship store and premium custom design studio." },
    { year: "2023", title: "Expanded", desc: "Crossed our first major milestone of serving 10,000 fashion enthusiasts globally and opening fulfillment centers." },
    { year: "2024", title: "Premium Collections", desc: "Launched our smart technical wearables and acoustic fashion coordinates." },
    { year: "2025", title: "Trusted Brand", desc: "Awarded as the most innovative DTC apparel label for tech-fashion integrations." }
  ];

  const team = [
    { name: "Devika Goel", role: "Founder", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300" },
    { name: "Vikram Malhotra", role: "Creative Director", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300" },
    { name: "Sanya Sen", role: "Fashion Designer", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300" },
    { name: "Aman Verma", role: "Customer Support Manager", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300" }
  ];



  const partners = ["Nike", "Puma", "Levi's", "Adidas", "H&M", "Zara"];

  return (
    <div className="about-page-container">
      {/* Background blobs */}
      <div className="about-bg-blobs">
        <div className="about-blob blob-primary"></div>
        <div className="about-blob blob-secondary"></div>
      </div>

      {/* SECTION 1: LARGE HERO SECTION */}
      <section className="about-hero-section">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <span className="about-subtitle">LUMISTYLE ATELIER</span>
          <h1 className="about-title">Fashion Beyond <br /><span className="text-glow-gradient">Trends</span></h1>
          <p className="about-hero-desc">
            We create premium fashion experiences designed for confidence, elegance, and individuality.
          </p>
          <div className="about-hero-cta-group">
            <button onClick={() => navigate("/products")} className="about-hero-btn">
              Explore Collection <FaArrowRight />
            </button>
            
          </div>
        </div>
      </section>

      {/* SECTION 2: OUR STORY */}
      <section className="about-section brand-story-section">
        <div className="about-story-grid">
          <div className="about-story-left">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600" 
              alt="Atelier Tailoring Story" 
              className="about-story-img"
            />
          </div>
          <div className="about-story-right">
            <span className="section-small-tag">HERITAGE</span>
            <h2 className="about-section-heading">Our Story</h2>
            <div className="about-story-card-wrapper">
              <p className="about-story-text">
                LUMISTYLE was born out of a desire to create apparel coordinates with true architectural drapes. We merge structural tailoring lines with clean tech coordinates to craft styles that speak volumes.
              </p>
              <p className="about-story-text" style={{ marginTop: '16px' }}>
                We reject transience, designing custom pieces that offer comfort, confidence, and modern distinction. Every cut is curated to help you make an effortless statement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: BRAND JOURNEY TIMELINE */}
      <section className="about-section company-timeline-section">
        <div className="about-section-header">
          <span className="section-small-tag">CHRONOLOGY</span>
          <h2 className="about-section-heading">Brand Journey Timeline</h2>
        </div>
        <div className="about-timeline-horizontal">
          {timeline.map((item, idx) => (
            <div key={idx} className="about-timeline-card-col">
              <div className="timeline-node">
                <div className="timeline-node-circle"></div>
                <div className="timeline-node-line"></div>
              </div>
              <div className="timeline-content-card">
                <span className="timeline-year">{item.year}</span>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: MISSION & VISION */}
      <section className="about-section mission-section">
        <div className="mission-grid">
          <div className="mission-vision-card">
            <div className="mv-icon-wrapper"><FaCircleCheck /></div>
            <h3>Mission</h3>
            <p>
              To democratize technical luxury, creating apparel coordinates that fit our unified obsidian design tokens while utilizing organic, sustainable fabrics.
            </p>
          </div>
          <div className="mission-vision-card">
            <div className="mv-icon-wrapper"><FaGlobe /></div>
            <h3>Vision</h3>
            <p>
              To lead the smart technical apparel space globally, showing that luxury wearables and eco-conscious fibers make the ultimate statement.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: CORE VALUES */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="section-small-tag">ETHOS</span>
          <h2 className="about-section-heading">Core Values</h2>
        </div>
        <div className="why-choose-grid">
          <div className="choose-card">
            <div className="choose-icon-wrapper"><FaAward /></div>
            <h4>Quality</h4>
            <p>Sartorial excellence using premium cotton coordinates, reinforced drapes, and high-performance technical fabric checks.</p>
          </div>
          <div className="choose-card">
            <div className="choose-icon-wrapper"><FaLeaf /></div>
            <h4>Sustainability</h4>
            <p>We source certified eco-friendly organic yarn, implement low-impact supply tracks, and use biodegradable compost packaging elements.</p>
          </div>
          <div className="choose-card">
            <div className="choose-icon-wrapper"><FaLightbulb /></div>
            <h4>Innovation</h4>
            <p>Pioneering built-in Bluetooth audio sunglasses and breathable sports coordinating structures for active city dwellers.</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: MEET OUR TEAM */}
      <section className="about-section">
        <div className="about-section-header">
          <span className="section-small-tag">CREATIVE MINDS</span>
          <h2 className="about-section-heading">Meet Our Team</h2>
        </div>
        <div className="team-grid">
          {team.map((member, idx) => (
            <div key={idx} className="team-card">
              <div className="team-img-wrapper">
                <img src={member.img} alt={member.name} />
                <div className="team-socials-overlay">
                  <a href="#"><FaLinkedin /></a>
                  <a href="#"><FaTwitter /></a>
                  <a href="#"><FaEnvelope /></a>
                </div>
              </div>
              <h4>{member.name}</h4>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: FASHION GALLERY */}
      

      {/* SECTION 8: ACHIEVEMENTS */}
      <section className="about-section stats-section">
        <div className="about-section-header">
          <span className="section-small-tag">MILESTONES</span>
          <h2 className="about-section-heading">Achievements</h2>
        </div>
        <div className="stats-grid">
          <div className="stats-card">
            <h3>25K+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stats-card">
            <h3>50K+</h3>
            <p>Orders Delivered</p>
          </div>
          <div className="stats-card">
            <h3>120+</h3>
            <p>Fashion Brands</p>
          </div>
          <div className="stats-card">
            <h3>15+</h3>
            <p>Countries Served</p>
          </div>
        </div>
      </section>

      {/* SECTION 9: BRAND PARTNERS */}
      <section className="brand-partners-section">
        <div className="brand-partners-track">
          {partners.concat(partners).map((partner, idx) => (
            <div key={idx} className="brand-partner-item">
              {partner}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: CUSTOMER TESTIMONIALS */}
      <section className="about-section testimonial-slider-section">
        <div className="testimonial-slider-container">
          <span className="testimonial-quotes">“</span>
          <p className="about-testimonial-text">
            {testimonials[activeTestimonial].text}
          </p>
          
          <div className="testimonial-stars">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} style={{ color: "#fbbf24", marginRight: "3px" }} />
            ))}
          </div>

          <div className="testimonial-meta">
            <img 
              src={testimonials[activeTestimonial].avatar} 
              alt={testimonials[activeTestimonial].name} 
              className="about-testimonial-avatar"
            />
            <div className="about-testimonial-info">
              <h4>{testimonials[activeTestimonial].name}</h4>
              <p>{testimonials[activeTestimonial].role}</p>
            </div>
          </div>

          <div className="testimonial-indicators">
            {testimonials.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveTestimonial(idx)}
                className={`testimonial-dot ${activeTestimonial === idx ? "active" : ""}`}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: CONTACT CALL-TO-ACTION */}
      <section className="about-cta-section">
        <div className="about-cta-card">
          <h2>Join the LUMISTYLE Community</h2>
          <p>Discover our signature technical coordinates and shop your ultimate luxury wardrobe fit today.</p>
          <button onClick={() => navigate("/products")} className="about-cta-btn">
            Shop Now <FaArrowRight />
          </button>
        </div>
      </section>

      {/* SECTION 12: PREMIUM FOOTER */}
      <footer className="about-premium-footer">
        <div className="footer-columns-grid">
          <div className="footer-brand-side">
            <h4>LUMISTYLE</h4>
            <p>Creating uncompromised minimal luxury coordinates and tech-wear coordinates globally.</p>
            <div className="footer-social-icons">
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaEnvelope /></a>
            </div>
          </div>
          <div>
            <h5>About</h5>
            <ul className="footer-links-list">
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/about">Designers</Link></li>
              <li><Link to="/about">Sustainability</Link></li>
            </ul>
          </div>
          <div>
            <h5>Support</h5>
            <ul className="footer-links-list">
              <li><Link to="/about">Help Desk</Link></li>
              <li><Link to="/about">Shipping Info</Link></li>
              <li><Link to="/about">Easy Returns</Link></li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul className="footer-links-list">
              <li><a href="mailto:support@lumistyle.com">support@lumistyle.com</a></li>
              <li><span>Mumbai, India</span></li>
              <li><span>+91 98765 43210</span></li>
            </ul>
          </div>
          <div>
            <h5>Policies</h5>
            <ul className="footer-links-list">
              <li><Link to="/about">Privacy Policy</Link></li>
              <li><Link to="/about">Terms of Use</Link></li>
              <li><Link to="/about">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom-panel-about">
          <p>© 2026 LUMISTYLE Inc. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
