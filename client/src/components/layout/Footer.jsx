import { Camera, Heart, Mail, Phone, MapPin, Globe, Share2, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Navigate to protected routes — redirect to login if not authenticated
  const handleProtectedLink = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
    }
  };

  return (
    <footer className="footer-root">
      <div className="container footer-content">
        <div className="footer-col brand-col">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div className="brand-logo-icon">
              <Camera size={20} />
            </div>
            <div>
              <span className="brand-logo-text">SHUTTER</span>
              <span className="brand-logo-sub">MOMENTS</span>
            </div>
          </div>
          <p className="footer-desc">
            Sri Lanka's premier photography booking platform. Connecting you with talented visual storytellers for weddings, events, portraits, and celebrations.
          </p>
          <div className="social-links">
            <a href="#website" className="social-icon" aria-label="Website"><Globe size={16} /></a>
            <a href="#share" className="social-icon" aria-label="Share"><Share2 size={16} /></a>
            <a href="#chat" className="social-icon" aria-label="Chat"><MessageCircle size={16} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li>
              <Link
                to="/book"
                onClick={(e) => handleProtectedLink(e, "/book")}
              >
                Book Photographer
              </Link>
            </li>
            <li>
              <Link
                to="/my-bookings"
                onClick={(e) => handleProtectedLink(e, "/my-bookings")}
              >
                My Bookings
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                onClick={(e) => handleProtectedLink(e, "/dashboard")}
              >
                Client Portal
              </Link>
            </li>
            <li><Link to="/admin/login">Admin Access</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Photography</h4>
          <ul className="footer-links">
            <li><span>Wedding Photography</span></li>
            <li><span>Pre-Wedding Shoots</span></li>
            <li><span>Birthday &amp; Celebrations</span></li>
            <li><span>Corporate &amp; Commercial</span></li>
            <li><span>Candid Portraits</span></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact &amp; Support</h4>
          <ul className="footer-contact">
            <li><MapPin size={15} color="var(--gold-400)" /> 45 Galle Road, Colombo 03, Sri Lanka</li>
            <li><Phone size={15} color="var(--gold-400)" /> +94 77 123 4567</li>
            <li><Mail size={15} color="var(--gold-400)" /> hello@shuttermoments.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} Shutter Moments. All rights reserved.</p>
          <p style={{ display: "flex", alignItems: "center", gap: 6 }}>
            Designed with <Heart size={14} color="var(--gold-400)" fill="var(--gold-400)" /> for unforgettable memories
          </p>
        </div>
      </div>

      <style>{`
        .footer-root {
          background: #040914;
          border-top: 1px solid var(--glass-border);
          margin-top: auto;
          color: var(--text-secondary);
        }
        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 40px;
          padding: 60px 24px 40px;
        }
        .brand-logo-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, var(--gold-500), #e8950f);
          display: flex; align-items: center; justify-content: center;
          color: var(--navy-900);
        }
        .brand-logo-text {
          font-family: 'Outfit', sans-serif; font-weight: 900; font-size: 1.1rem;
          letter-spacing: 0.05em; color: var(--white); display: block;
        }
        .brand-logo-sub {
          font-size: 0.65rem; letter-spacing: 0.2em; color: var(--gold-400); display: block;
        }
        .footer-desc {
          font-size: 0.83rem; line-height: 1.7; color: var(--text-muted);
          margin-bottom: 20px; max-width: 300px;
        }
        .social-links { display: flex; gap: 12px; }
        .social-icon {
          width: 34px; height: 34px; border-radius: 8px;
          background: rgba(255,255,255,0.04); border: 1px solid var(--glass-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); transition: var(--transition);
        }
        .social-icon:hover {
          color: var(--gold-400); border-color: var(--gold-400);
          transform: translateY(-2px);
        }
        .footer-heading {
          color: var(--white); font-size: 0.92rem; font-weight: 700;
          letter-spacing: 0.04em; margin-bottom: 20px;
        }
        .footer-links, .footer-contact {
          list-style: none; padding: 0; margin: 0; display: flex;
          flex-direction: column; gap: 10px; font-size: 0.83rem;
        }
        .footer-links a {
          color: var(--text-muted); transition: var(--transition);
        }
        .footer-links a:hover {
          color: var(--gold-400); transform: translateX(3px);
        }
        .footer-contact li {
          display: flex; align-items: center; gap: 10px; color: var(--text-muted);
        }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 20px 0; font-size: 0.78rem; color: var(--text-muted);
        }
        .footer-bottom-inner {
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        @media (max-width: 900px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
