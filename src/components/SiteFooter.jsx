import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './SiteFooter.css';

gsap.registerPlugin(ScrollTrigger);

export default function SiteFooter() {
  const footerRef = useRef(null);
  const ctaRef = useRef(null);
  const newsletterRef = useRef(null);
  const navRef = useRef(null);

  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Final CTA light reveal
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // 2. Newsletter light reveal
      if (newsletterRef.current) {
        gsap.fromTo(
          newsletterRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: newsletterRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // 3. Footer navigation light stagger
      if (navRef.current) {
        const columns = navRef.current.querySelectorAll('.site-footer__nav-col, .site-footer__brand-col');
        gsap.fromTo(
          columns,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: navRef.current,
              start: 'top 88%',
              once: true,
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed) {
      setFeedback({ type: 'error', message: 'PLEASE ENTER AN EMAIL ADDRESS.' });
      return;
    }

    if (!emailRegex.test(trimmed)) {
      setFeedback({ type: 'error', message: 'PLEASE ENTER A VALID EMAIL ADDRESS.' });
      return;
    }

    // Success confirmation
    setFeedback({ type: 'success', message: "YOU'RE ON THE LIST." });
    setEmail('');
  };

  return (
    <footer ref={footerRef} id="menu" className="site-footer" aria-label="Site Footer">
      <div className="site-footer__container">
        {/* 1. FINAL BRAND CTA */}
        <section ref={ctaRef} className="site-footer__cta-section" aria-label="Closing Brand Statement">
          <p className="site-footer__cta-eyebrow">PEHNAAVA</p>
          <h2 className="site-footer__cta-headline">
            {'BUILT FOR\nTHE WAY YOU MOVE.'}
          </h2>
          <div>
            <a href="#collection" className="site-footer__shop-link" id="footer-shop-cta">
              SHOP THE COLLECTION{' '}
              <span className="site-footer__shop-arrow" aria-hidden="true">
                &rarr;
              </span>
            </a>
          </div>
        </section>

        {/* 2. NEWSLETTER SIGNUP */}
        <section ref={newsletterRef} className="site-footer__newsletter-section" aria-label="Newsletter Signup">
          <div className="site-footer__newsletter-info">
            <h3 className="site-footer__newsletter-title">JOIN THE EDIT</h3>
            <p className="site-footer__newsletter-copy">
              New drops, campaign releases and selected stories.
              <br />
              No noise.
            </p>
          </div>

          <div className="site-footer__newsletter-form-wrapper">
            <form className="site-footer__form" onSubmit={handleSubscribe} noValidate>
              <label htmlFor="newsletter-email" className="sr-only">
                Email Address
              </label>
              <div className="site-footer__form-row">
                <input
                  id="newsletter-email"
                  type="email"
                  className="site-footer__input"
                  placeholder="EMAIL ADDRESS"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (feedback.type === 'error') {
                      setFeedback({ type: '', message: '' });
                    }
                  }}
                  autoComplete="email"
                  required
                />
                <button type="submit" className="site-footer__submit-btn" id="newsletter-submit-btn">
                  SUBSCRIBE &rarr;
                </button>
              </div>

              {/* Feedback Message */}
              <div
                className={`site-footer__form-feedback ${
                  feedback.type === 'success'
                    ? 'site-footer__form-feedback--success'
                    : feedback.type === 'error'
                    ? 'site-footer__form-feedback--error'
                    : ''
                }`}
                role="status"
                aria-live="polite"
              >
                {feedback.message}
              </div>
            </form>
          </div>
        </section>

        {/* 3. FOOTER DIVIDER */}
        <hr className="site-footer__divider" />

        {/* 4. FOOTER NAVIGATION 4 COLUMNS */}
        <nav ref={navRef} className="site-footer__nav-grid" aria-label="Footer Navigation">
          {/* COLUMN 1 */}
          <div className="site-footer__brand-col">
            <p className="site-footer__brand-title">PEHNAAVA</p>
            <p className="site-footer__brand-desc">
              Independent forms for modern movement.
            </p>
          </div>

          {/* COLUMN 2 */}
          <div className="site-footer__nav-col">
            <h4 className="site-footer__nav-col-heading">SHOP</h4>
            <ul className="site-footer__nav-list">
              <li>
                <a href="#new-arrivals" className="site-footer__nav-link">
                  NEW ARRIVALS
                </a>
              </li>
              <li>
                <a href="#new-arrivals" className="site-footer__nav-link">
                  WOMENSWEAR
                </a>
              </li>
              <li>
                <a href="#new-arrivals" className="site-footer__nav-link">
                  MENSWEAR
                </a>
              </li>
              <li>
                <a href="#collection" className="site-footer__nav-link">
                  COLLECTIONS
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 3 */}
          <div className="site-footer__nav-col">
            <h4 className="site-footer__nav-col-heading">INFORMATION</h4>
            <ul className="site-footer__nav-list">
              <li>
                <a href="#campaign" className="site-footer__nav-link">
                  ABOUT
                </a>
              </li>
              <li>
                <a href="#contact" className="site-footer__nav-link">
                  CONTACT
                </a>
              </li>
              <li>
                <a href="#shipping" className="site-footer__nav-link">
                  SHIPPING
                </a>
              </li>
              <li>
                <a href="#returns" className="site-footer__nav-link">
                  RETURNS
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4 */}
          <div className="site-footer__nav-col">
            <h4 className="site-footer__nav-col-heading">FOLLOW</h4>
            <ul className="site-footer__nav-list">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__nav-link"
                >
                  INSTAGRAM
                </a>
              </li>
              <li>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__nav-link"
                >
                  PINTEREST
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__nav-link"
                >
                  TIKTOK
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* 5. OVERSIZED BRAND WORDMARK */}
        <div className="site-footer__wordmark-wrapper" aria-hidden="true">
          <p className="site-footer__wordmark">PEHNAAVA</p>
        </div>

        {/* 6. BOTTOM ROW */}
        <div className="site-footer__bottom-row">
          <div className="site-footer__copyright">
            &copy; 2026 PEHNAAVA
          </div>
          <div className="site-footer__legal-links">
            <a href="#privacy" className="site-footer__legal-link">
              PRIVACY
            </a>
            <a href="#terms" className="site-footer__legal-link">
              TERMS
            </a>
          </div>
          <div className="site-footer__region">INDIA / INR</div>
        </div>
      </div>
    </footer>
  );
}
