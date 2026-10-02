import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  Camera, Star, Clock, Award, ChevronRight, ArrowRight,
  Heart, Zap, Shield, Play, Phone, Mail, MapPin, CheckCircle
} from "lucide-react";

const scrollToPackages = () => {
  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
};

const services = [
  { icon: "💍", title: "Wedding Photography", price: "Rs. 45,000", desc: "Capture your perfect day" },
  { icon: "🌿", title: "Outdoor Shoot", price: "Rs. 25,000", desc: "Natural light perfection" },
  { icon: "🎉", title: "Event Coverage", price: "Rs. 35,000", desc: "Every moment preserved" },
  { icon: "💑", title: "Pre-Wedding Shoot", price: "Rs. 30,000", desc: "Tell your love story" },
];

const addons = [
  { icon: "📸", title: "Photo Booth", price: "Rs. 16,000 / event" },
  { icon: "📚", title: "Photo Album", price: "Rs. 12,000 / album" },
  { icon: "🎨", title: "Decoration / Backdrop", price: "Rs. 18,000 / event" },
];

const whyUs = [
  { icon: <Award size={28} />, title: "Professional Team", desc: "Certified expert photographers" },
  { icon: <Camera size={28} />, title: "High Quality Photos", desc: "4K resolution, color-graded" },
  { icon: <Clock size={28} />, title: "On-Time Delivery", desc: "Photos delivered in 7 days" },
  { icon: <Shield size={28} />, title: "Affordable Packages", desc: "Packages for every budget" },
];

const galleryItems = [
  {
    id: 1,
    title: "Golden Hour Romance",
    category: "Weddings",
    photographer: "Alex Morgan",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    likes: 245,
  },
  {
    id: 2,
    title: "Editorial Fashion Portrait",
    category: "Portraits",
    photographer: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    likes: 189,
  },
  {
    id: 3,
    title: "Sunset Shoreline Magic",
    category: "Outdoor",
    photographer: "Alex Morgan",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    likes: 312,
  },
  {
    id: 4,
    title: "Grand Gala Night",
    category: "Events",
    photographer: "James Wilson",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    likes: 164,
  },
  {
    id: 5,
    title: "Eternal Vows in Kandy",
    category: "Weddings",
    photographer: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    likes: 288,
  },
  {
    id: 6,
    title: "Candid Urban Expression",
    category: "Portraits",
    photographer: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    likes: 142,
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeGalleryTab, setActiveGalleryTab] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Redirect to login if not authenticated; after login return to /book
  const handleBookNow = (e) => {
    if (!user) {
      e.preventDefault();
      navigate("/login?redirect=%2Fbook");
    } else {
      navigate("/book");
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: "smooth" });
        }, 150);
      }
    }
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  const filteredGallery = galleryItems.filter(
    (item) => activeGalleryTab === "All" || item.category.toLowerCase() === activeGalleryTab.toLowerCase()
  );
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        {/* ── Hero ── */}
        <section className="hero-section">
          <div className="hero-bg-grid" />
          <div className="container hero-content">
            <div className="hero-left animate-fade-up">
              <div className="hero-badge">
                <Star size={12} fill="currentColor" /> Premium Photography Services
              </div>
              <h1 className="hero-title">
                Capture Your<br />
                <span className="gradient-text">Best Moments</span>
              </h1>
              <p className="hero-desc">
                Book professional photographers and amazing add-on services for your events.
                Memories that last a lifetime.
              </p>
              <div className="hero-btns">
                <button className="btn btn-primary btn-lg" onClick={handleBookNow}>
                  Book Now <ArrowRight size={18} />
                </button>
                <button className="btn btn-secondary btn-lg" onClick={scrollToPackages}>
                  <Play size={16} fill="currentColor" /> View Services
                </button>
              </div>
              <div className="hero-stats">
                <div className="hero-stat"><span>500+</span><label>Happy Clients</label></div>
                <div className="hero-stat-divider" />
                <div className="hero-stat"><span>12+</span><label>Years Experience</label></div>
                <div className="hero-stat-divider" />
                <div className="hero-stat"><span>4.9★</span><label>Average Rating</label></div>
              </div>
            </div>
            <div className="hero-right animate-fade-up delay-2">
              <div className="hero-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80"
                  alt="Wedding Photography"
                  className="hero-img"
                />
                <div className="hero-img-overlay" />
                <div className="hero-float-card float-card-1">
                  <Camera size={16} className="float-card-icon" />
                  <div>
                    <div className="float-card-title">Confirm Booking</div>
                    <div className="float-card-sub">Capture your special moments with us</div>
                  </div>
                </div>
                <div className="hero-float-card float-card-2">
                  <Heart size={14} fill="var(--red-400)" color="var(--red-400)" />
                  <div>
                    <div className="float-card-title">4.9 / 5.0 Rating</div>
                    <div className="float-card-sub">10K+ reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section className="section" id="services">
          <div className="container">
            <div className="section-header animate-fade-up">
              <div className="section-eyebrow">What We Offer</div>
              <h2 className="section-title">Our Photography Services</h2>
              <p className="section-subtitle">Professional photography for every occasion</p>
            </div>
            <div className="services-grid">
              {services.map((s, i) => (
                <div key={i} className={`service-item card animate-fade-up delay-${i + 1}`}>
                  <div className="service-emoji">{s.icon}</div>
                  <h3 className="service-name">{s.title}</h3>
                  <p className="service-desc">{s.desc}</p>
                  <div className="service-price">{s.price} / session</div>
                  <button className="service-link" style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }} onClick={handleBookNow}>
                    Book Now <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
            
          </div>
        </section>

        {/* ── Additional Services ── */}
        <section className="section section-dark">
          <div className="container">
            <div className="section-header animate-fade-up">
              <div className="section-eyebrow">Enhance Your Experience</div>
              <h2 className="section-title">Additional Services</h2>
            </div>
            <div className="addons-grid">
              {addons.map((a, i) => (
                <div key={i} className={`addon-card animate-fade-up delay-${i + 1}`}>
                  <div className="addon-emoji">{a.icon}</div>
                  <div>
                    <div className="addon-title">{a.title}</div>
                    <div className="addon-price">{a.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="section" id="about">
          <div className="container">
            <div className="section-header animate-fade-up">
              <div className="section-eyebrow">Our Promise</div>
              <h2 className="section-title">Why Choose Us?</h2>
            </div>
            <div className="why-grid">
              {whyUs.map((w, i) => (
                <div key={i} className={`why-card animate-fade-up delay-${i + 1}`}>
                  <div className="why-icon">{w.icon}</div>
                  <h4 className="why-title">{w.title}</h4>
                  <p className="why-desc">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Gallery Section ── */}
        <section className="section" id="gallery">
          <div className="container">
            <div className="section-header animate-fade-up">
              <div className="section-eyebrow">Our Portfolio</div>
              <h2 className="section-title">Moments Captured in Perfection</h2>
              <p className="section-subtitle">
                Browse our recent work across weddings, portraits, outdoor sessions, and grand events
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="gallery-tabs animate-fade-up delay-1">
              {["All", "Weddings", "Portraits", "Outdoor", "Events"].map((tab) => (
                <button
                  key={tab}
                  className={`gallery-tab-btn ${activeGalleryTab === tab ? "active" : ""}`}
                  onClick={() => setActiveGalleryTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="gallery-grid animate-fade-up delay-2">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="gallery-card"
                  onClick={() => setSelectedPhoto(item)}
                >
                  <img src={item.image} alt={item.title} className="gallery-img" loading="lazy" />
                  <div className="gallery-overlay">
                    <span className="gallery-category-badge">{item.category}</span>
                    <h3 className="gallery-item-title">{item.title}</h3>
                    <div className="gallery-meta">
                      <span className="gallery-photographer">By {item.photographer}</span>
                      <span className="gallery-likes">
                        <Heart size={13} fill="currentColor" /> {item.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact Section ── */}
        <section className="section section-dark" id="contact">
          <div className="container">
            <div className="section-header animate-fade-up">
              <div className="section-eyebrow">Get In Touch</div>
              <h2 className="section-title">Let's Discuss Your Event</h2>
              <p className="section-subtitle">
                Have a question or custom inquiry? Our photography consultants are here to help
              </p>
            </div>

            <div className="contact-grid animate-fade-up delay-1">
              {/* Left Column: Contact Information */}
              <div className="contact-info-cards">
                <div className="contact-card">
                  <div className="contact-card-icon">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="contact-card-title">Call or WhatsApp</h4>
                    <p className="contact-card-desc">Mon-Sun, 8:00 AM – 8:00 PM</p>
                    <a href="tel:+94771234567" className="contact-card-link">+94 77 123 4567</a>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="contact-card-title">Email Us</h4>
                    <p className="contact-card-desc">We reply within 2 business hours</p>
                    <a href="mailto:info@shuttermoments.com" className="contact-card-link">info@shuttermoments.com</a>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="contact-card-title">Studio Location</h4>
                    <p className="contact-card-desc">45 Galle Road, Colombo 03, Sri Lanka</p>
                    <span className="contact-card-tag">Open for studio visits by appointment</span>
                  </div>
                </div>

                
              </div>

              {/* Right Column: Contact Inquiry Form */}
              <div className="contact-form-wrapper card">
                {contactSubmitted ? (
                  <div className="contact-success-state animate-fade-in">
                    <div className="contact-success-icon">
                      <CheckCircle size={36} color="var(--green-400)" />
                    </div>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>Message Sent Successfully!</h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: 20 }}>
                      Thank you! One of our lead photographers will get back to you within a few hours.
                    </p>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setContactSubmitted(false);
                        setContactForm({ name: "", email: "", phone: "", message: "" });
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 6 }}>Send Us an Inquiry</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 20 }}>
                      Fill out the form below and we'll reach out promptly.
                    </p>

                    <div className="form-group" style={{ marginBottom: 14 }}>
                      <label className="form-label">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Johnathan Smith"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="name@example.com"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="+94 7X XXX XXXX"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 20 }}>
                      <label className="form-label">Your Message or Event Details</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Tell us about your event, preferred date, and specific requests..."
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-full btn-lg">
                      Send Inquiry Message <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Photo Lightbox Modal */}
        {selectedPhoto && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedPhoto(null)}>
            <div className="modal-content gallery-modal-content animate-fade-up" onClick={(e) => e.stopPropagation()}>
              <div className="gallery-modal-header">
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{selectedPhoto.title}</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--gold-400)" }}>
                    Captured by {selectedPhoto.photographer} · {selectedPhoto.category}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedPhoto(null)}>✕</button>
              </div>
              <div className="gallery-modal-img-wrap">
                <img src={selectedPhoto.image} alt={selectedPhoto.title} className="gallery-modal-img" />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  High Resolution 4K Color-Graded Photograph
                </span>
                <button className="btn btn-primary btn-sm" onClick={(e) => { setSelectedPhoto(null); handleBookNow(e); }}>
                  Book Photographer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <section className="section cta-section">
          <div className="container">
            <div className="cta-box animate-fade-up">
              <div className="cta-glow" />
              <Zap size={32} color="var(--gold-400)" />
              <h2 className="cta-title">Ready to Book Your Photographer?</h2>
              <p className="cta-desc">Join 500+ happy clients who trusted us with their special moments.</p>
              <button className="btn btn-primary btn-lg" onClick={handleBookNow}>
                Book Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

      </div>

      <style>{`
        /* Hero */
        .hero-section {
          min-height: 100vh;
          display: flex; align-items: center;
          padding: 100px 0 60px;
          position: relative; overflow: hidden;
        }
        .hero-bg-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }
        .hero-content {
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
          align-items: center; position: relative; z-index: 1;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.35);
          color: #93c5fd; padding: 6px 14px; border-radius: var(--radius-full);
          font-size: 0.78rem; font-weight: 600; margin-bottom: 20px; letter-spacing: 0.04em;
        }
        .hero-title {
          font-size: clamp(2.4rem, 5vw, 3.6rem); font-weight: 900;
          line-height: 1.1; margin-bottom: 20px;
          font-family: 'Outfit', sans-serif;
        }
        .hero-desc {
          color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 32px;
          max-width: 440px; line-height: 1.7;
        }
        .hero-btns { display: flex; gap: 16px; margin-bottom: 40px; flex-wrap: wrap; }
        .hero-stats { display: flex; align-items: center; gap: 24px; }
        .hero-stat span {
          display: block; font-family: 'Outfit', sans-serif;
          font-size: 1.5rem; font-weight: 800; color: #60a5fa;
        }
        .hero-stat label { font-size: 0.78rem; color: var(--text-muted); }
        .hero-stat-divider { width: 1px; height: 36px; background: var(--glass-border); }
        .hero-img-wrapper {
          position: relative; border-radius: var(--radius-xl);
          overflow: visible; filter: drop-shadow(0 40px 60px rgba(0,0,0,0.5));
        }
        .hero-img {
          width: 100%; height: 480px; object-fit: cover;
          border-radius: var(--radius-xl);
          border: 1px solid var(--glass-border);
        }
        .hero-img-overlay {
          position: absolute; inset: 0; border-radius: var(--radius-xl);
          background: linear-gradient(to top, rgba(15,23,42,0.2) 0%, transparent 60%);
        }
        .hero-float-card {
          position: absolute; display: flex; align-items: center; gap: 10px;
          background: var(--navy-800);
          border: 1px solid var(--navy-600);
          border-radius: var(--radius-md); padding: 12px 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .float-card-1 { bottom: 32px; left: -32px; animation: float 3s ease-in-out infinite; }
        .float-card-2 { top: 32px; right: -24px; animation: float 4s ease-in-out infinite 1s; }
        .float-card-icon { color: var(--blue-400); }
        .float-card-title { font-size: 0.82rem; font-weight: 700; color: #ffffff; }
        .float-card-sub { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }

        /* Section */
        .section { padding: 80px 0; background: var(--navy-900); }
        .section-dark {
          background: var(--navy-800); border-top: 1px solid var(--navy-600); border-bottom: 1px solid var(--navy-600);
        }
        .section-header { text-align: center; margin-bottom: 50px; }
        .section-eyebrow {
          font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: #60a5fa; margin-bottom: 12px;
        }
        .section-title {
          font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; color: #ffffff; margin-bottom: 12px;
        }
        .section-subtitle { color: var(--text-secondary); font-size: 0.95rem; }

        /* Services Grid */
        .services-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        .service-item {
          padding: 28px; display: flex; flex-direction: column; gap: 10px;
          position: relative; overflow: hidden; background: var(--navy-800);
          border: 1px solid var(--navy-600); border-radius: var(--radius-lg);
          transition: var(--transition);
        }
        .service-item:hover {
          border-color: #3b82f6; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .service-item::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #3b82f6, transparent);
        }
        .service-emoji { font-size: 2rem; }
        .service-name { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700; color: #ffffff; }
        .service-desc { font-size: 0.82rem; color: var(--text-secondary); flex: 1; line-height: 1.6; }
        .service-price { font-size: 0.88rem; font-weight: 700; color: #60a5fa; }
        .service-link {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.8rem; font-weight: 600; color: #60a5fa;
          text-decoration: none; transition: var(--transition);
        }
        .service-link:hover { color: #93c5fd; gap: 8px; }
        .view-all-row { display: flex; justify-content: center; margin-top: 40px; }

        /* Addons */
        .addons-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .addon-card {
          display: flex; align-items: center; gap: 20px;
          padding: 24px 28px; border-radius: var(--radius-lg);
          background: var(--navy-800); border: 1px solid var(--navy-600);
          box-shadow: var(--shadow-sm); transition: var(--transition);
        }
        .addon-card:hover { border-color: #3b82f6; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
        .addon-emoji { font-size: 2.2rem; }
        .addon-title { font-weight: 700; font-size: 0.95rem; color: #ffffff; margin-bottom: 4px; }
        .addon-price { font-size: 0.8rem; color: #60a5fa; font-weight: 700; }

        /* Why Us */
        .why-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px;
        }
        .why-card {
          padding: 32px 24px; text-align: center;
          background: var(--navy-800); border: 1px solid var(--navy-600);
          border-radius: var(--radius-lg); transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .why-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-color: #3b82f6; }
        .why-icon {
          width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px;
          background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa;
        }
        .why-title { font-family: 'Outfit', sans-serif; font-size: 1rem; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
        .why-desc { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; }

        /* Gallery Section */
        .gallery-tabs {
          display: flex; justify-content: center; gap: 10px; margin-bottom: 40px; flex-wrap: wrap;
        }
        .gallery-tab-btn {
          padding: 8px 20px; border-radius: var(--radius-full);
          background: var(--navy-800); border: 1px solid var(--navy-600);
          color: var(--text-secondary); font-size: 0.85rem; font-weight: 600; cursor: pointer;
          transition: var(--transition);
        }
        .gallery-tab-btn:hover {
          background: var(--navy-700); color: #ffffff; border-color: #3b82f6;
        }
        .gallery-tab-btn.active {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          border-color: #2563eb; color: #ffffff;
          box-shadow: 0 4px 14px rgba(37,99,235,0.4);
        }
        .gallery-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .gallery-card {
          position: relative; border-radius: var(--radius-lg); overflow: hidden;
          height: 320px; cursor: pointer; border: 1px solid var(--navy-600);
          background: var(--navy-800);
        }
        .gallery-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .gallery-card:hover .gallery-img {
          transform: scale(1.08);
        }
        .gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(6,13,27,0.95) 0%, rgba(6,13,27,0.4) 50%, transparent 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 24px; transition: var(--transition);
        }
        .gallery-category-badge {
          display: inline-block; width: fit-content;
          background: rgba(37,99,235,0.6); border: 1px solid rgba(96,165,250,0.5);
          color: #ffffff; font-size: 0.7rem; font-weight: 700;
          padding: 3px 8px; border-radius: var(--radius-full); margin-bottom: 8px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .gallery-item-title {
          font-size: 1.1rem; font-weight: 700; color: #ffffff; margin-bottom: 6px;
        }
        .gallery-meta {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.78rem; color: #cbd5e1;
        }
        .gallery-photographer { color: #93c5fd; font-weight: 600; }
        .gallery-likes {
          display: inline-flex; align-items: center; gap: 4px; color: #fca5a5;
        }

        /* Gallery Modal */
        .gallery-modal-content {
          max-width: 800px; padding: 24px; background: var(--navy-800);
          border: 1px solid var(--navy-600); color: #ffffff;
        }
        .gallery-modal-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 16px;
        }
        .gallery-modal-img-wrap {
          width: 100%; max-height: 480px; overflow: hidden; border-radius: var(--radius-md);
          background: var(--navy-900); display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--navy-600);
        }
        .gallery-modal-img {
          max-width: 100%; max-height: 480px; object-fit: contain;
        }

        /* Contact Section */
        .contact-grid {
          display: grid; grid-template-columns: 1fr 1.3fr; gap: 40px; align-items: start;
        }
        .contact-info-cards {
          display: flex; flex-direction: column; gap: 16px;
        }
        .contact-card {
          display: flex; gap: 16px; padding: 20px;
          background: var(--navy-800); border: 1px solid var(--navy-600);
          border-radius: var(--radius-lg); transition: var(--transition);
          box-shadow: var(--shadow-sm);
        }
        .contact-card:hover {
          border-color: #3b82f6; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        .contact-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa; flex-shrink: 0;
        }
        .contact-card-title {
          font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 4px;
        }
        .contact-card-desc {
          font-size: 0.78rem; color: var(--text-muted); margin-bottom: 6px;
        }
        .contact-card-link {
          font-size: 0.88rem; font-weight: 600; color: #60a5fa; text-decoration: none;
          transition: var(--transition);
        }
        .contact-card-link:hover { color: #93c5fd; text-decoration: underline; }
        .contact-card-tag {
          display: inline-block; font-size: 0.72rem; color: #4ade80;
          background: rgba(34,197,94,0.15); border: 1px solid rgba(74,222,128,0.3); padding: 2px 8px; border-radius: var(--radius-full);
          font-weight: 600;
        }
        .contact-highlight-box {
          display: flex; gap: 14px; padding: 20px;
          background: rgba(37,99,235,0.1);
          border: 1px solid rgba(59,130,246,0.25); border-radius: var(--radius-lg);
        }
        .contact-form-wrapper {
          padding: 32px; background: var(--navy-800);
          border: 1px solid var(--navy-600); border-radius: var(--radius-xl);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .contact-success-state {
          text-align: center; padding: 40px 20px;
        }
        .contact-success-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(34,197,94,0.15); border: 1px solid rgba(74,222,128,0.4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: #4ade80;
        }

        /* CTA */
        .cta-section { padding: 80px 0; background: var(--navy-900); }
        .cta-box {
          background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
          border: 1px solid rgba(59,130,246,0.3);
          border-radius: var(--radius-xl); padding: 80px 40px;
          text-align: center; position: relative; overflow: hidden;
          color: #ffffff; box-shadow: var(--shadow-lg);
        }
        .cta-title { font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 800; margin: 16px 0 12px; color: #ffffff; }
        .cta-desc { color: rgba(255,255,255,0.9); margin-bottom: 32px; font-size: 0.95rem; }

        /* Footer */
        .footer {
          background: var(--navy-900);
          border-top: 1px solid var(--navy-600); padding: 60px 0 0;
        }
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 60px; padding-bottom: 48px; }
        .footer-brand {
          font-family: 'Outfit', sans-serif; font-size: 1.1rem;
          font-weight: 800; color: #ffffff; letter-spacing: 0.05em; margin-bottom: 12px;
        }
        .footer-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.7; }
        .footer-heading { font-weight: 700; color: #ffffff; margin-bottom: 16px; font-size: 0.9rem; }
        .footer-links { display: flex; flex-direction: column; gap: 10px; }
        .footer-links li, .footer-links a {
          font-size: 0.83rem; color: var(--text-secondary); transition: var(--transition);
          text-decoration: none; cursor: pointer;
        }
        .footer-links a:hover { color: #60a5fa; }
        .footer-bottom {
          border-top: 1px solid var(--navy-600); padding: 20px 0;
          text-align: center; font-size: 0.8rem; color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2, 1fr); }
          .why-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-content { grid-template-columns: 1fr; gap: 40px; }
          .hero-right { display: none; }
        }
        @media (max-width: 768px) {
          .services-grid { grid-template-columns: 1fr; }
          .addons-grid { grid-template-columns: 1fr; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </div>
  );
}
