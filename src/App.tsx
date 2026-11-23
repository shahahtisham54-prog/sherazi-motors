import { useMemo, useState } from 'react';
import { api } from './lib/api';
import VehicleShowcase from './VehicleShowcase';
import { HeroCarExperience, DetailStudio } from './ImmersiveExperience';
import './vehicle-showcase.css';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  CarFront,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

const categories = [
  { name: 'Sedans', detail: 'Comfortable everyday driving', icon: '01' },
  { name: 'SUVs & Crossovers', detail: 'Space for every journey', icon: '02' },
  { name: 'Hatchbacks', detail: 'Practical city companions', icon: '03' },
  { name: 'Family Cars', detail: 'Room for what matters', icon: '04' },
];

const steps = [
  {
    number: '01',
    title: 'Tell us what you need',
    body: 'Share your preferred body type, budget and must-have features.',
  },
  {
    number: '02',
    title: 'Explore available options',
    body: 'Ask our team about current vehicles and arrange a viewing.',
  },
  {
    number: '03',
    title: 'Make an informed choice',
    body: 'Take your time, inspect the car and confirm the details before purchase.',
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All types');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('I am looking to buy a car');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailNotified, setEmailNotified] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const filtered = useMemo(
    () =>
      categories.filter(
        item =>
          (category === 'All types' || item.name === category) &&
          (item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.detail.toLowerCase().includes(query.toLowerCase()))
      ),
    [category, query]
  );

  const submitEnquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || submitting) return;

    setSubmitting(true);
    setFormError('');
    try {
      const response = await api.post('/api/enquiries', {
        name: name.trim(),
        phone: phone.trim(),
        interest,
        message: message.trim(),
      });
      setEmailNotified(Boolean(response.data.emailNotified));
      setWhatsappUrl(response.data.whatsappUrl || '');
      setSent(true);
    } catch (error) {
      console.error('Enquiry submission failed', error);
      setFormError('We could not save your enquiry just now. Please try again or contact us directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <div className="topline">
        <span>
          <MapPin size={13} /> Rawalpindi, Pakistan
        </span>
        <span className="topline-note">
          A better way to find your next car.
        </span>
      </div>
      <header className="header">
        <a
          className="brand"
          href="#home"
          onClick={closeMenu}
          aria-label="Sherazi Motors home"
        >
          <span className="brand-mark">
            <CarFront size={25} strokeWidth={1.8} />
          </span>
          <span>
            <strong>SHERAZI MOTORS</strong>
            <small>DRIVE WITH CONFIDENCE</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? 'nav nav-open' : 'nav'}>
          <a href="#home" onClick={closeMenu}>
            Home
          </a>
          <a href="#browse" onClick={closeMenu}>
            Explore cars
          </a>
          <a href="#process" onClick={closeMenu}>
            How it works
          </a>
          <a href="#about" onClick={closeMenu}>
            About us
          </a>
          <a className="nav-cta" href="#contact" onClick={closeMenu}>
            Get in touch <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div
            className="hero-image"
            role="img"
            aria-label="Premium car on a scenic road"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="eyebrow light">
              <span /> YOUR NEXT JOURNEY STARTS HERE
            </div>
            <h1>
              Find the car
              <br />
              that feels <em>right.</em>
            </h1>
            <p>
              Thoughtful car choices. Straightforward conversations. Your next
              drive begins with Sherazi Motors, Rawalpindi.
            </p>
            <div className="hero-actions">
              <a className="button button-gold" href="#browse">
                Explore car types <ArrowRight size={17} />
              </a>
              <a className="text-link light-link" href="#contact">
                Talk to our team <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
          <div className="hero-stamp">
            <span>SHERAZI</span>
            <b>MOTORS</b>
            <small>RAWALPINDI · PAKISTAN</small>
          </div>
          <div className="hero-bottom">
            <span>PRE-OWNED VEHICLES</span>
            <span>01 / 03</span>
          </div>
        </section>

        <section className="intro-strip">
          <div className="intro-label">THE SHERAZI MOTORS APPROACH</div>
          <p>
            A car is more than a purchase. It is part of your everyday life. We
            make it easier to find an option that fits yours.
          </p>
          <a href="#about" aria-label="Learn about Sherazi Motors">
            <ArrowUpRight size={21} />
          </a>
        </section>

        <section className="hero-car-showcase" aria-label="Interactive 3D car concept">
          <div className="hero-car-showcase-copy">
            <div className="eyebrow light"><span /> INTERACTIVE DESIGN STUDIO</div>
            <h2>Take a closer<br /><em>look around.</em></h2>
            <p>Explore our interactive car concept below. Move your pointer or tap the controls to change its view and lighting.</p>
          </div>
          <HeroCarExperience />
        </section>

        <section className="section browse-section" id="browse">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span /> EXPLORE YOUR OPTIONS
              </div>
              <h2>
                What are you
                <br />
                <em>looking for?</em>
              </h2>
            </div>
            <p>
              Browse by the kind of car that suits your lifestyle. Ask us about
              current availability, specifications and viewing arrangements.
            </p>
          </div>
          <div className="browse-tools">
            <label className="search-box">
              <Search size={17} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search car types..."
              />
            </label>
            <label className="select-box">
              <span className="sr-only">Filter by vehicle type</span>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option>All types</option>
                {categories.map(c => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </label>
          </div>
          <div className="category-grid">
            {filtered.map(item => (
              <article className="category-card" key={item.name}>
                <div className="category-number">{item.icon}</div>
                <div className="category-art">
                  <CarFront size={57} strokeWidth={1.05} />
                </div>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                </div>
                <a href="#contact" aria-label={'Ask about ' + item.name}>
                  <ArrowUpRight size={19} />
                </a>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                No matching categories. Try another search.
              </div>
            )}
          </div>
          <div className="inventory-note">
            <Sparkles size={17} />
            <span>
              <strong>Looking for a specific model?</strong> Get in touch to ask
              about the latest availability. Vehicle listings and prices are
              shared after confirmation.
            </span>
          </div>
        </section>

        <VehicleShowcase />
        <DetailStudio />

        <section className="dark-band" id="about">
          <div className="dark-band-image" />
          <div className="dark-band-copy">
            <div className="eyebrow light">
              <span /> LOCAL KNOWLEDGE, PERSONAL SERVICE
            </div>
            <h2>
              Your search.
              <br />
              <em>A clearer road ahead.</em>
            </h2>
            <p>
              Sherazi Motors is here to help car buyers in Rawalpindi explore
              pre-owned vehicle options with clear communication and a personal
              approach.
            </p>
            <a className="button button-outline" href="#contact">
              Start a conversation <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="band-index">SM / RWP</div>
        </section>

        <section className="section process-section" id="process">
          <div className="eyebrow">
            <span /> SIMPLE FROM THE START
          </div>
          <div className="section-heading process-heading">
            <h2>
              A smoother way
              <br />
              to <em>choose.</em>
            </h2>
            <p>
              Buying a used car should feel considered, not complicated. Start
              with what matters to you.
            </p>
          </div>
          <div className="steps-grid">
            {steps.map(step => (
              <article className="step" key={step.number}>
                <span>{step.number}</span>
                <div className="step-rule" />
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-icon">
            <ShieldCheck size={29} />
          </div>
          <div>
            <div className="eyebrow light">
              <span /> BUY WITH CLARITY
            </div>
            <h2>Ask. Inspect. Decide.</h2>
            <p>
              We encourage buyers to review vehicle documents, inspect condition
              and confirm all terms before making a decision.
            </p>
          </div>
          <div className="trust-side">
            A considered choice
            <br />
            <em>is a confident choice.</em>
          </div>
        </section>

        <section className="section contact-section" id="contact">
          <div className="contact-copy">
            <div className="eyebrow">
              <span /> LET'S FIND YOUR NEXT CAR
            </div>
            <h2>
              Tell us what
              <br />
              you <em>have in mind.</em>
            </h2>
            <p>
              Share a few details and our team can follow up with you. You can
              also visit us in Rawalpindi after confirming the location with our
              team.
            </p>
            <div className="contact-detail">
              <MapPin size={18} />
              <span>
                <strong>Sherazi Motors</strong>
                <small>Rawalpindi, Pakistan</small>
              </span>
            </div>
            <div className="contact-detail">
              <Phone size={18} />
              <span>
                <strong>Phone & WhatsApp</strong>
                <small>0319 6982676 · +92 319 6982676</small>
              </span>
            </div>
            <a
              className="button button-dark whatsapp-contact"
              href="https://wa.me/923196982676?text=Hello%20Sherazi%20Motors%2C%20I%20am%20interested%20in%20a%20used%20car."
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp <ArrowUpRight size={16} />
            </a>
          </div>
          <form className="enquiry-form" onSubmit={submitEnquiry}>
            <div className="form-top">
              <span>YOUR ENQUIRY</span>
              <span>01 — 03</span>
            </div>
            {sent ? (
              <div className="success-state">
                <CheckCircle2 size={34} />
                <h3>Thank you, {name}.</h3>
                <p>
                  Your enquiry has been saved. {emailNotified
                    ? 'An email alert has been sent to the Sherazi Motors account.'
                    : 'The enquiry is saved, but the email alert could not be confirmed. Please use WhatsApp as well.'}
                </p>
                {whatsappUrl && (
                  <a
                    className="button button-dark whatsapp-followup"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Send these details on WhatsApp <ArrowUpRight size={16} />
                  </a>
                )}
                <button
                  type="button"
                  className="button button-outline submit-another"
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setPhone('');
                    setMessage('');
                    setInterest('I am looking to buy a car');
                  }}
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <>
                <label>
                  Your name
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </label>
                <label>
                  Phone number
                  <input
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="03XX XXXXXXX"
                  />
                </label>
                <label>
                  How can we help?
                  <select
                    value={interest}
                    onChange={e => setInterest(e.target.value)}
                  >
                    <option>I am looking to buy a car</option>
                    <option>I want to sell my car</option>
                    <option>I have a question</option>
                  </select>
                </label>
                <label>
                  Additional details (optional)
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us which car, budget or details you have in mind..."
                    rows={4}
                    maxLength={1000}
                  />
                </label>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <button
                  className="button button-dark form-submit"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Saving your enquiry...' : 'Submit enquiry'} <ArrowRight size={17} />
                </button>
                <small className="form-disclaimer">
                  Your enquiry is saved securely. Email notifications are not enabled yet. You can send the same details directly to Sherazi Motors on WhatsApp after submitting.
                </small>
              </>
            )}
          </form>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">
            <CarFront size={24} />
          </span>
          <span>
            <strong>SHERAZI MOTORS</strong>
            <small>DRIVE WITH CONFIDENCE</small>
          </span>
        </a>
        <span>
          © {new Date().getFullYear()} Sherazi Motors. All rights reserved.
        </span>
        <a href="/admin" className="back-top">ADMIN</a>
        <a href="#home" className="back-top">
          BACK TO TOP ↑
        </a>
      </footer>
    </div>
  );
}

export default App;
