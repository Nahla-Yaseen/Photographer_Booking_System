import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Camera, Award, Heart, Users, Star, CheckCircle, ArrowRight } from "lucide-react";

const team = [
  {
    name: "Ashan Fernando",
    role: "Lead Photographer & Founder",
    exp: "14 years experience",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    tags: ["Wedding", "Portrait", "Commercial"],
  },
  {
    name: "Nimesha Perera",
    role: "Senior Event Photographer",
    exp: "9 years experience",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    tags: ["Events", "Fashion", "Outdoor"],
  },
  {
    name: "Kasun Ranasinghe",
    role: "Videographer & Editor",
    exp: "7 years experience",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    tags: ["Videography", "Editing", "Drone"],
  },
  {
    name: "Dilani Wickramasinghe",
    role: "Pre-Wedding Specialist",
    exp: "6 years experience",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80",
    tags: ["Pre-Wedding", "Couple", "Outdoor"],
  },
];

const values = [
  { icon: <Heart size={24} />, title: "Passion First", desc: "We pour our hearts into every frame, treating each shoot as if it were our own precious moment." },
  { icon: <Award size={24} />, title: "Excellence Always", desc: "Award-winning standards in photography, editing, and client service — no compromises." },
  { icon: <Users size={24} />, title: "Client-Centric", desc: "Your vision drives everything. We listen deeply and craft stories uniquely yours." },
  { icon: <Star size={24} />, title: "Artistic Vision", desc: "Blending technical mastery with creative artistry to produce images that move people." },
];

const stats = [
  { val: "500+", label: "Happy Clients" },
  { val: "1,200+", label: "Events Covered" },
  { val: "12+", label: "Years of Excellence" },
  { val: "4.9\u2605", label: "Average Rating" },
];

export default function AboutUs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookNow = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login?redirect=%2Fbook");
    } else {
      navigate("/book");
    }
  };
  return (
    <div className="page-wrapper" style={{ background: "var(--navy-900)", minHeight: "100vh" }}>
      <Navbar />
      <div className="page-content">

        {/* Hero */}
        <section className="au-hero">
          <div className="au-hero-glow" />
          <div className="container au-hero-inner">
            <div className="au-eyebrow">Our Story</div>
            <h1 className="au-hero-title">
              Capturing Life&apos;s Most<br />
              <span className="au-gradient-text">Beautiful Moments</span>
            </h1>
            <p className="au-hero-desc">
              Founded in 2012, Shutter Moments has grown from a one-photographer studio to Sri Lanka&apos;s
              most trusted photography collective — bringing artistic vision and technical excellence
              together for over 500 happy clients.
            </p>
            <div className="au-hero-btns">
              <button className="btn btn-primary btn-lg" onClick={handleBookNow}>Book a Session <ArrowRight size={18} /></button>
              <a href="#team" className="btn btn-secondary btn-lg">Meet the Team</a>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="au-stats-bar">
          <div className="container">
            <div className="au-stats-row">
              {stats.map((s, i) => (
                <div key={i} className="au-stat">
                  <div className="au-stat-val">{s.val}</div>
                  <div className="au-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="au-section">
          <div className="container au-story-grid">
            <div className="au-story-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&q=80"
                alt="Shutter Moments Studio"
                className="au-story-img"
              />
              <div className="au-img-accent" />
              <div className="au-img-badge">
                <Camera size={20} color="#60a5fa" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "white" }}>Est. 2012</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Colombo, Sri Lanka</div>
                </div>
              </div>
            </div>
            <div className="au-story-text">
              <div className="au-eyebrow">Who We Are</div>
              <h2 className="au-section-title">A Passion for Storytelling Through the Lens</h2>
              <p className="au-para">
                Shutter Moments was born out of a simple belief — every life event deserves to be remembered
                beautifully. Our founder Ashan Fernando started with a single camera and an unwavering passion
                for capturing authentic human emotion.
              </p>
              <p className="au-para">
                Today, we are a team of eight dedicated professionals covering weddings, corporate events,
                pre-wedding shoots, outdoor sessions, and more across Sri Lanka. We&apos;ve built our reputation on
                trust, artistic integrity, and an obsessive attention to detail.
              </p>
              <div className="au-checklist">
                {[
                  "ISO-certified editing workflow",
                  "7-day delivery guarantee",
                  "Waterproof backup equipment",
                  "Raw files included in all packages",
                ].map((item) => (
                  <div key={item} className="au-check-item">
                    <CheckCircle size={16} color="#34d399" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="au-section au-section-alt">
          <div className="container">
            <div className="au-section-header">
              <div className="au-eyebrow">What Drives Us</div>
              <h2 className="au-section-title">Our Core Values</h2>
              <p className="au-section-sub">Everything we do is guided by a set of principles that put you first.</p>
            </div>
            <div className="au-values-grid">
              {values.map((v, i) => (
                <div key={i} className="au-value-card">
                  <div className="au-value-icon">{v.icon}</div>
                  <h3 className="au-value-title">{v.title}</h3>
                  <p className="au-value-desc">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="au-section" id="team">
          <div className="container">
            <div className="au-section-header">
              <div className="au-eyebrow">The People Behind the Lens</div>
              <h2 className="au-section-title">Meet Our Team</h2>
              <p className="au-section-sub">Talented, passionate professionals ready to make your event unforgettable.</p>
            </div>
            <div className="au-team-grid">
              {team.map((m, i) => (
                <div key={i} className="au-team-card">
                  <div className="au-team-img-wrap">
                    <img src={m.img} alt={m.name} className="au-team-img" />
                    <div className="au-team-img-overlay" />
                  </div>
                  <div className="au-team-info">
                    <div className="au-team-name">{m.name}</div>
                    <div className="au-team-role">{m.role}</div>
                    <div className="au-team-exp">{m.exp}</div>
                    <div className="au-team-tags">
                      {m.tags.map((t) => <span key={t} className="au-team-tag">{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="au-cta-section">
          <div className="container">
            <div className="au-cta-box">
              <div className="au-cta-glow" />
              <Camera size={36} color="#60a5fa" />
              <h2 className="au-cta-title">Let&apos;s Create Something Beautiful Together</h2>
              <p className="au-cta-desc">Book a session today and let our team bring your vision to life.</p>
              <button className="btn btn-primary btn-lg" onClick={handleBookNow}>
                Book Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        
      </div>

      <style>{`
        .au-hero { min-height: 60vh; display: flex; align-items: center; padding: 110px 0 60px; position: relative; overflow: hidden; background: var(--navy-900); border-bottom: 1px solid var(--navy-600); }
        .au-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%); pointer-events: none; }
        .au-hero-inner { position: relative; z-index: 1; max-width: 720px; margin: 0 auto; text-align: center; }
        .au-eyebrow { display: inline-block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #60a5fa; margin-bottom: 16px; background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.3); padding: 5px 14px; border-radius: 999px; }
        .au-hero-title { font-family: 'Outfit',sans-serif; font-size: clamp(2.2rem,5vw,3.4rem); font-weight: 900; line-height: 1.1; margin-bottom: 20px; color: #ffffff; }
        .au-gradient-text { background: linear-gradient(135deg,#60a5fa,#ffffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .au-hero-desc { color: var(--text-secondary); font-size: 1.05rem; line-height: 1.75; margin-bottom: 36px; max-width: 560px; margin-left: auto; margin-right: auto; }
        .au-hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

        .au-stats-bar { padding: 40px 0; border-top: 1px solid var(--navy-600); border-bottom: 1px solid var(--navy-600); background: var(--navy-800); }
        .au-stats-row { display: grid; grid-template-columns: repeat(4,1fr); }
        .au-stat { text-align: center; padding: 20px; border-right: 1px solid var(--navy-600); }
        .au-stat:last-child { border-right: none; }
        .au-stat-val { font-family: 'Outfit',sans-serif; font-size: 2rem; font-weight: 900; color: #60a5fa; margin-bottom: 4px; }
        .au-stat-label { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; }

        .au-section { padding: 80px 0; background: var(--navy-900); }
        .au-section-alt { background: var(--navy-800); border-top: 1px solid var(--navy-600); border-bottom: 1px solid var(--navy-600); }
        .au-section-header { text-align: center; margin-bottom: 56px; }
        .au-section-title { font-family: 'Outfit',sans-serif; font-size: clamp(1.6rem,3vw,2.2rem); font-weight: 800; color: #ffffff; margin: 12px 0; }
        .au-section-sub { font-size: 0.93rem; color: var(--text-secondary); }

        .au-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .au-story-img-wrap { position: relative; }
        .au-story-img { width: 100%; border-radius: 20px; border: 1px solid var(--navy-600); box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: block; }
        .au-img-accent { position: absolute; bottom: -16px; right: -16px; width: 180px; height: 180px; border-radius: 20px; background: rgba(37,99,235,0.12); border: 1px solid rgba(59,130,246,0.3); z-index: -1; }
        .au-img-badge { position: absolute; bottom: 24px; left: -20px; display: flex; align-items: center; gap: 10px; background: var(--navy-800); border: 1px solid var(--navy-600); border-radius: 12px; padding: 12px 18px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .au-para { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.8; margin-bottom: 18px; }
        .au-checklist { display: flex; flex-direction: column; gap: 10px; margin-top: 24px; }
        .au-check-item { display: flex; align-items: center; gap: 10px; font-size: 0.88rem; color: var(--text-secondary); }

        .au-values-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
        .au-value-card { background: var(--navy-800); border: 1px solid var(--navy-600); border-radius: 16px; padding: 30px 24px; text-align: center; box-shadow: var(--shadow-sm); transition: transform .25s, border-color .25s; }
        .au-value-card:hover { transform: translateY(-4px); border-color: #3b82f6; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .au-value-icon { width: 54px; height: 54px; border-radius: 14px; margin: 0 auto 16px; background: rgba(37,99,235,0.15); border: 1px solid rgba(59,130,246,0.3); display: flex; align-items: center; justify-content: center; color: #60a5fa; }
        .au-value-title { font-family: 'Outfit',sans-serif; font-weight: 700; font-size: 1rem; color: #ffffff; margin-bottom: 10px; }
        .au-value-desc { font-size: 0.83rem; color: var(--text-secondary); line-height: 1.6; }

        .au-team-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
        .au-team-card { background: var(--navy-800); border: 1px solid var(--navy-600); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform .25s, border-color .25s; }
        .au-team-card:hover { transform: translateY(-4px); border-color: #3b82f6; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
        .au-team-img-wrap { position: relative; }
        .au-team-img { width: 100%; height: 220px; object-fit: cover; display: block; }
        .au-team-info { padding: 18px 20px; }
        .au-team-name { font-family: 'Outfit',sans-serif; font-weight: 700; font-size: 0.98rem; color: #ffffff; margin-bottom: 4px; }
        .au-team-role { font-size: 0.8rem; color: #60a5fa; font-weight: 600; margin-bottom: 4px; }
        .au-team-exp { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; }
        .au-team-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .au-team-tag { font-size: 0.7rem; font-weight: 600; background: rgba(37,99,235,0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); padding: 3px 10px; border-radius: 999px; }

        .au-cta-section { padding: 80px 0; background: var(--navy-900); }
        .au-cta-box { background: linear-gradient(135deg, #1e3a8a, #1d4ed8); border: 1px solid rgba(59,130,246,0.3); border-radius: 24px; padding: 80px 40px; text-align: center; position: relative; overflow: hidden; color: #ffffff; box-shadow: var(--shadow-lg); }
        .au-cta-title { font-family: 'Outfit',sans-serif; font-size: clamp(1.5rem,3vw,2.2rem); font-weight: 800; color: #ffffff; margin: 18px 0 12px; }
        .au-cta-desc { color: rgba(255,255,255,0.9); margin-bottom: 32px; font-size: 0.95rem; }

        @media (max-width: 1024px) {
          .au-values-grid,.au-team-grid { grid-template-columns: repeat(2,1fr); }
          .au-story-grid { grid-template-columns: 1fr; }
          .au-stats-row { grid-template-columns: repeat(2,1fr); }
          .au-stat:nth-child(2) { border-right: none; }
        }
        @media (max-width: 640px) {
          .au-values-grid,.au-team-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1024px) {
          .au-values-grid,.au-team-grid { grid-template-columns: repeat(2,1fr); }
          .au-story-grid { grid-template-columns: 1fr; }
          .au-stats-row { grid-template-columns: repeat(2,1fr); }
          .au-stat:nth-child(2) { border-right: none; }
        }
        @media (max-width: 640px) {
          .au-values-grid,.au-team-grid { grid-template-columns: 1fr; }
        }
      `}
      
      
{/* Footer */}
        <footer style={{ borderTop: "1px solid var(--navy-600)", background: "var(--navy-900)", padding: "48px 0 0" }}>
          <div className="container">
          </div>
          <div style={{ borderTop: "1px solid var(--navy-600)", padding: "18px 0", textAlign: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
              &copy; 2025 Shutter Moments. All rights reserved.
            </div>
        </footer>


      </style>
    </div>
  );
}
