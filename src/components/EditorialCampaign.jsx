import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './EditorialCampaign.css';

gsap.registerPlugin(ScrollTrigger);

export default function EditorialCampaign() {
  const sectionRef = useRef(null);
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headlineRef = useRef(null);
  const bodyRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Immediate reveal for reduced-motion users
        gsap.set(
          [
            frameRef.current,
            eyebrowRef.current,
            headlineRef.current,
            bodyRef.current,
            ctaRef.current,
          ],
          {
            clipPath: 'inset(0% 0 0 0)',
            opacity: 1,
            y: 0,
            clearProps: 'all',
          }
        );
        return;
      }

      // Initial visual states
      gsap.set(frameRef.current, { clipPath: 'inset(100% 0 0 0)' });
      gsap.set(eyebrowRef.current, { opacity: 0, y: 16 });
      gsap.set(headlineRef.current, { opacity: 0, y: 30 });
      gsap.set(bodyRef.current, { opacity: 0, y: 20 });
      gsap.set(ctaRef.current, { opacity: 0, y: 12 });

      // Main entrance reveal timeline (unpinned)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      });

      // 1. Image clip-path reveal from bottom to top
      tl.to(frameRef.current, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.25,
        ease: 'power3.inOut',
      });

      // 2. Staggered typography reveal starting before image finish
      tl.to(
        eyebrowRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
        },
        '-=0.65'
      )
        .to(
          headlineRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
          },
          '-=0.6'
        )
        .to(
          bodyRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
          },
          '-=0.65'
        )
        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
          },
          '-=0.55'
        );

      // 3. Restrained subtle vertical image parallax (max 35px)
      gsap.fromTo(
        imageRef.current,
        { y: 0 },
        {
          y: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="campaign"
      ref={sectionRef}
      className="editorial-campaign"
      aria-label="Editorial Campaign"
    >
      <div className="editorial-campaign__container">
        <div className="editorial-campaign__layout">
          {/* LEFT: 55-60% large campaign image */}
          <figure className="editorial-campaign__media">
            <div ref={frameRef} className="editorial-campaign__image-frame">
              <img
                ref={imageRef}
                src="/collection/look-07.jpg"
                alt="Autumn Winter 26 Campaign — Midnight Column Gown in motion"
                className="editorial-campaign__image"
                loading="lazy"
                decoding="async"
              />
            </div>
          </figure>

          {/* RIGHT: 40-45% campaign copy */}
          <div className="editorial-campaign__content">
            <header ref={eyebrowRef} className="editorial-campaign__eyebrow">
              <span className="editorial-campaign__eyebrow-item">
                CAMPAIGN / 01
              </span>
              <span className="editorial-campaign__eyebrow-item">
                AUTUMN — WINTER 26
              </span>
            </header>

            <h2 ref={headlineRef} className="editorial-campaign__headline">
              {'FORM\nFOLLOWS\nMOVEMENT.'}
            </h2>

            <p ref={bodyRef} className="editorial-campaign__body">
              A study in proportion, restraint and movement. Designed around
              silhouettes that shift between structure and ease.
            </p>

            <div>
              <a
                ref={ctaRef}
                href="#collection"
                className="editorial-campaign__cta-link"
                id="discover-campaign-cta"
                aria-label="Discover the campaign collection"
              >
                DISCOVER THE CAMPAIGN{' '}
                <span
                  className="editorial-campaign__cta-arrow"
                  aria-hidden="true"
                >
                  &rarr;
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
