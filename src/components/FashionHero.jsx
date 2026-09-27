import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { models } from '../data/models';
import { useCart } from '../context/CartContext';
import { ModelCard } from './ModelCard';
import { ProductRail } from './ProductRail';
import './FashionHero.css';

// Register ScrollTrigger once
gsap.registerPlugin(ScrollTrigger);

/**
 * FashionHero - Fully Responsive Pinned Scroll Hero
 * 
 * Supports Desktop (>= 1024px), Tablet (768px–1023px), and Mobile (< 768px)
 * Choreography:
 * 1. Center Model Entry (0.0s–3.6s): Model 03 rises smoothly (top 120% -> center anchor)
 * 2. Center Model Focus Moment (2.8s–4.6s): Subtle push-in (1.00 -> 1.05 -> 1.00)
 * 3. 5-Card Staggered Assembly (4.6s–8.8s): Inner pair (02/04) glides in, outer pair (01/05) follows
 * 4. Dark Editorial Settle & Extended Hold (8.8s–10.6s): Five-card settle & steady dark hold
 * 5. Text Fade & Harmonized Dark-to-Light Transition (10.6s–13.8s): Gradual text fade, ambient background & header shift, card dissolve
 * 6. Clean Catalogue Lineup (13.8s–15.8s): Clear second movement into catalogue alignment & label reveal
 * 7. Product Rail Entrance & Upward Elevation (15.8s–17.6s): Rail glides up; models elevate for clearance
 * 8. Horizontal Catalogue Movement with Subtle Parallax (17.6s–22.8s): Scroll-driven translation
 * 9. Final Resting Settle & Hold (22.8s–23.6s): Subtle resting finish
 */
export function FashionHero() {
  const heroRef = useRef(null);
  const { cartCount, openCart } = useCart();

  useLayoutEffect(() => {
    const mm = gsap.matchMedia(heroRef);

    // =======================================================================
    // REDUCED MOTION ACCESSIBILITY FALLBACK
    // =======================================================================
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(heroRef.current, { backgroundColor: '#f3f3ef' });
      gsap.set(['.hero-header__logo', '.hero-header__link'], { color: '#111111' });
      gsap.set('.hero-header__logo-img', { filter: 'brightness(0)' });
      gsap.set('.hero-header__nav', {
        clearProps: 'all',
        background: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      });
      gsap.set('.hero-header__link', {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderColor: 'rgba(0, 0, 0, 0.10)',
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.04)',
      });
      gsap.set(['.hero-headline', '.hero-radial-glow'], { opacity: 0, display: 'none' });
      gsap.set('.product-rail', { yPercent: 0, y: 0, opacity: 1, clearProps: 'transform' });
      gsap.set('.product-card', { opacity: 1, y: 0 });
      gsap.set('.model-label', { opacity: 1, y: 0 });
      gsap.set('.model-card', {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderRadius: '0px',
        boxShadow: 'none',
        borderColor: 'rgba(0, 0, 0, 0)',
      });
      gsap.set('.model-card__backdrop', { opacity: 0 });
      gsap.set('.model-card__image', { filter: 'none' });
      gsap.set('.hero-stage-card', {
        rotation: 0,
        z: 0,
        y: 0,
        top: '49%',
        opacity: 1,
      });

      const isNarrow = window.matchMedia('(max-width: 767px)').matches;
      if (isNarrow) {
        gsap.set('.hero-stage-card--model-01', { left: '50%', xPercent: -50, yPercent: -50, x: '-72vw', scale: 0.88 });
        gsap.set('.hero-stage-card--model-02', { left: '50%', xPercent: -50, yPercent: -50, x: '-36vw', scale: 0.95 });
        gsap.set('.hero-stage-card--model-03', { left: '50%', xPercent: -50, yPercent: -50, x: '0vw', scale: 1.00 });
        gsap.set('.hero-stage-card--model-04', { left: '50%', xPercent: -50, yPercent: -50, x: '36vw', scale: 0.95 });
        gsap.set('.hero-stage-card--model-05', { left: '50%', xPercent: -50, yPercent: -50, x: '72vw', scale: 0.88 });
      } else {
        gsap.set('.hero-stage-card--model-01', { left: '50%', xPercent: -50, yPercent: -50, x: '-34vw', scale: 0.88 });
        gsap.set('.hero-stage-card--model-02', { left: '50%', xPercent: -50, yPercent: -50, x: '-17vw', scale: 0.95 });
        gsap.set('.hero-stage-card--model-03', { left: '50%', xPercent: -50, yPercent: -50, x: '0vw', scale: 1.00 });
        gsap.set('.hero-stage-card--model-04', { left: '50%', xPercent: -50, yPercent: -50, x: '17vw', scale: 0.95 });
        gsap.set('.hero-stage-card--model-05', { left: '50%', xPercent: -50, yPercent: -50, x: '34vw', scale: 0.88 });
      }
    });

    // =======================================================================
    // RESPONSIVE GSAP MASTER TIMELINES
    // =======================================================================
    mm.add({
      isDesktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      isTablet: '(min-width: 768px) and (max-width: 1023px) and (prefers-reduced-motion: no-preference)',
      isMobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
    }, (context) => {
      const { isTablet, isMobile } = context.conditions;

      // Responsive parameter sets
      const scrollEnd = isMobile ? '+=6200' : isTablet ? '+=7600' : '+=9000';
      const scrubVal = isMobile ? 0.75 : isTablet ? 0.9 : 1.1;

      const darkOffsets = isMobile
        ? { m01: '-72vw', m02: '-36vw', m03: '0vw', m04: '36vw', m05: '72vw' }
        : isTablet
        ? { m01: '-34vw', m02: '-17vw', m03: '0vw', m04: '17vw', m05: '34vw' }
        : { m01: '-34vw', m02: '-17vw', m03: '0vw', m04: '17vw', m05: '34vw' };

      const catOffsets = isMobile
        ? { m01: '-84vw', m02: '-42vw', m04: '42vw', m05: '84vw' }
        : isTablet
        ? { m01: '-34vw', m02: '-17vw', m04: '17vw', m05: '34vw' }
        : { m01: '-36vw', m02: '-18vw', m04: '18vw', m05: '36vw' };

      const catTravel = isMobile
        ? { model: '-84vw', product: '-65vw' }
        : isTablet
        ? { model: '-20vw', product: '-16vw' }
        : { model: '-22vw', product: '-18vw' };

      // Responsive vertical positioning calibrated for 60-80px black gap below headline
      const getModelCenterTop = () => {
        if (isMobile) return '62%';
        if (isTablet) return '60%';
        const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
        const cardH = Math.min(360, Math.max(280, vw * 0.23));
        const targetTop = 0.17 * vh + 177; // 308px at 768h, 330px at 900h, 361px at 1080h
        const centerPx = targetTop + cardH * 0.5;
        return `${((centerPx / vh) * 100).toFixed(2)}%`;
      };
      const modelCenterTop = getModelCenterTop();
      const modelElevateTop = isMobile ? '47%' : isTablet ? '47.5%' : '48%';

      // Initial positions for side cards & tracks
      gsap.set('.hero-stage-card--model-01', {
        left: '50%',
        top: modelCenterTop,
        xPercent: -50,
        yPercent: -50,
        x: '-105vw',
        scale: 0.80,
        rotation: -1.5,
        opacity: 0,
        z: -40,
      });

      gsap.set('.hero-stage-card--model-02', {
        left: '50%',
        top: modelCenterTop,
        xPercent: -50,
        yPercent: -50,
        x: '-72vw',
        scale: 0.90,
        rotation: -0.8,
        opacity: 0,
        z: -20,
      });

      gsap.set('.hero-stage-card--model-03', {
        left: '50%',
        top: '120%',
        xPercent: -50,
        yPercent: -50,
        x: '0vw',
        scale: 0.82,
        rotation: 0,
        opacity: 0.7,
        z: 0,
      });

      gsap.set('.hero-stage-card--model-03 .model-card__picture', {
        scale: 1,
        transformOrigin: 'center bottom',
      });

      gsap.set('.hero-stage-card--model-04', {
        left: '50%',
        top: modelCenterTop,
        xPercent: -50,
        yPercent: -50,
        x: '72vw',
        scale: 0.90,
        rotation: 0.8,
        opacity: 0,
        z: -20,
      });

      gsap.set('.hero-stage-card--model-05', {
        left: '50%',
        top: modelCenterTop,
        xPercent: -50,
        yPercent: -50,
        x: '105vw',
        scale: 0.80,
        rotation: 1.5,
        opacity: 0,
        z: -40,
      });

      gsap.set('.product-rail', {
        yPercent: 130,
        opacity: 0,
      });

      gsap.set('.product-card', {
        opacity: 0,
        y: 8,
      });

      gsap.set('.model-label', {
        opacity: 0,
        y: 10,
      });

      gsap.set('.model-track', {
        x: 0,
      });

      gsap.set('.product-track', {
        x: 0,
      });

      gsap.set('.hero-header__logo-img', {
        filter: 'brightness(1)',
      });

      gsap.set('.hero-header__nav', {
        clearProps: 'all',
        background: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      });

      gsap.set('.hero-header__link', {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.14)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      });

      // Master GSAP timeline with ONE ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: scrollEnd,
          scrub: scrubVal,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: false,
        },
      });

      // =====================================================================
      // 1. OPENING & CENTER RISE (0.0s to 3.6s)
      // =====================================================================
      // Center model rises into composition: top 120% -> modelCenterTop (~54%), scale 0.82 -> 1, opacity 0.7 -> 1
      tl.fromTo(
        '.hero-stage-card--model-03',
        {
          top: '120%',
          scale: 0.82,
          opacity: 0.7,
          rotation: 0,
          z: 0,
          x: '0vw',
        },
        {
          top: modelCenterTop,
          scale: 1.0,
          opacity: 1,
          rotation: 0,
          x: '0vw',
          ease: 'power2.out',
          duration: 3.6,
        },
        0
      );

      // Micro-animation 1: Center Model Focus Moment (2.8s to 4.6s)
      // Subtle push-in 1.00 -> 1.05 (2.8s to 3.8s, power2.out)
      // Return 1.05 -> 1.00 (3.8s to 4.6s, power2.inOut)
      tl.to(
        '.hero-stage-card--model-03 .model-card__picture',
        {
          scale: 1.05,
          ease: 'power2.out',
          duration: 1.0,
        },
        2.8
      );

      tl.to(
        '.hero-stage-card--model-03 .model-card__picture',
        {
          scale: 1.0,
          ease: 'power2.inOut',
          duration: 0.8,
        },
        3.8
      );

      // =====================================================================
      // 2. 5-CARD ASSEMBLY (4.6s to 8.8s) - Staggered entrance by groups
      // =====================================================================
      // Inner Pair: Models 02 and 04 glide in from farther out (-72vw / +72vw)
      // Duration: 3.2s (4.6s to 7.8s), ease: power3.out
      tl.fromTo(
        '.hero-stage-card--model-02',
        {
          x: '-72vw',
          scale: 0.90,
          rotation: -0.8,
          opacity: 0,
          z: -20,
        },
        {
          x: darkOffsets.m02,
          scale: 0.95,
          rotation: -0.4,
          opacity: 1,
          z: -8,
          ease: 'power3.out',
          duration: 3.2,
        },
        4.6
      );

      tl.fromTo(
        '.hero-stage-card--model-04',
        {
          x: '72vw',
          scale: 0.90,
          rotation: 0.8,
          opacity: 0,
          z: -20,
        },
        {
          x: darkOffsets.m04,
          scale: 0.95,
          rotation: 0.4,
          opacity: 1,
          z: -8,
          ease: 'power3.out',
          duration: 3.2,
        },
        4.6
      );

      // Outer Pair: Models 01 and 05 follow with 0.8s stagger (5.4s to 8.8s)
      // Start farther outside (-105vw / +105vw), Duration: 3.4s, ease: power3.out
      tl.fromTo(
        '.hero-stage-card--model-01',
        {
          x: '-105vw',
          scale: 0.80,
          rotation: -1.5,
          opacity: 0,
          z: -40,
        },
        {
          x: darkOffsets.m01,
          scale: 0.88,
          rotation: -1.0,
          opacity: 1,
          z: -16,
          ease: 'power3.out',
          duration: 3.4,
        },
        5.4
      );

      tl.fromTo(
        '.hero-stage-card--model-05',
        {
          x: '105vw',
          scale: 0.80,
          rotation: 1.5,
          opacity: 0,
          z: -40,
        },
        {
          x: darkOffsets.m05,
          scale: 0.88,
          rotation: 1.0,
          opacity: 1,
          z: -16,
          ease: 'power3.out',
          duration: 3.4,
        },
        5.4
      );

      // =====================================================================
      // 3. DARK EDITORIAL SETTLE & EXTENDED HOLD (8.8s to 10.6s)
      // =====================================================================
      // Subtle settle motion for side cards (8.8s to 9.6s)
      tl.to(
        ['.hero-stage-card--model-02', '.hero-stage-card--model-04'],
        {
          y: -3,
          duration: 0.7,
          ease: 'power1.out',
        },
        8.8
      );

      tl.to(
        ['.hero-stage-card--model-01', '.hero-stage-card--model-05'],
        {
          y: -1.5,
          duration: 0.7,
          ease: 'power1.out',
        },
        8.8
      );

      // Extended hold (1.0s) so users absorb full 5-card dark composition (9.6s to 10.6s)
      tl.to(
        {},
        {
          duration: 1.0,
        },
        9.6
      );

      // =====================================================================
      // 4. TEXT FADE, DARK-TO-LIGHT TRANSITION & CARD DISSOLVE (10.6s to 13.8s)
      // =====================================================================
      // Gradual text fade (10.6s to 12.2s): opacity 1 -> 0, y 0 -> -20px, duration 1.6s, power2.inOut
      tl.to(
        ['.hero-headline', '.hero-radial-glow'],
        {
          opacity: 0,
          y: -20,
          ease: 'power2.inOut',
          duration: 1.6,
        },
        10.6
      );

      // Cinematic ambient background transition: #070707 -> #f3f3ef (11.0s to 13.8s, duration 2.8s, power2.inOut)
      tl.to(
        heroRef.current,
        {
          backgroundColor: '#f3f3ef',
          ease: 'power2.inOut',
          duration: 2.8,
        },
        11.0
      );

      // Header typography & nav pills synchronized in sync: white -> #111111 (11.0s to 13.8s, duration 2.8s)
      tl.to(
        '.hero-header__logo',
        {
          color: '#111111',
          ease: 'power2.inOut',
          duration: 2.8,
        },
        11.0
      );

      tl.to(
        '.hero-header__link',
        {
          color: '#111111',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          borderColor: 'rgba(0, 0, 0, 0.10)',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.04)',
          ease: 'power2.inOut',
          duration: 2.8,
        },
        11.0
      );

      tl.to(
        '.hero-header__logo-img',
        {
          filter: 'brightness(0)',
          ease: 'power2.inOut',
          duration: 2.8,
        },
        11.0
      );

      // Card-background dissolve: cards clearly transform to cutouts (11.6s to 13.8s, duration 2.2s)
      tl.to(
        '.model-card',
        {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderRadius: '0px',
          boxShadow: 'none',
          borderColor: 'rgba(0, 0, 0, 0)',
          ease: 'power2.out',
          duration: 2.2,
        },
        11.6
      );

      tl.to(
        '.model-card__backdrop',
        {
          opacity: 0,
          ease: 'power2.out',
          duration: 2.2,
        },
        11.6
      );

      tl.to(
        '.model-card__image',
        {
          filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0))',
          ease: 'power2.out',
          duration: 2.2,
        },
        11.6
      );

      // Straighten rotations to 0deg, flatten depth to z: 0, reset micro-y to 0 (11.8s to 13.8s, duration 2.0s)
      tl.to(
        '.hero-stage-card',
        {
          rotation: 0,
          z: 0,
          y: 0,
          ease: 'power2.out',
          duration: 2.0,
        },
        11.8
      );

      // =====================================================================
      // 5. CATALOGUE REPOSITIONING (13.8s to 15.8s) - Distinct movement into lineup
      // =====================================================================
      // Models take clear second movement into catalogue alignment (duration: 2.0s, power3.inOut)
      tl.to(
        '.hero-stage-card--model-01',
        {
          x: catOffsets.m01,
          scale: 0.90,
          ease: 'power3.inOut',
          duration: 2.0,
        },
        13.8
      );

      tl.to(
        '.hero-stage-card--model-02',
        {
          x: catOffsets.m02,
          scale: 0.95,
          ease: 'power3.inOut',
          duration: 2.0,
        },
        13.8
      );

      tl.to(
        '.hero-stage-card--model-03',
        {
          x: '0vw',
          scale: 0.88,
          top: modelCenterTop,
          ease: 'power3.inOut',
          duration: 2.0,
        },
        13.8
      );

      tl.to(
        '.hero-stage-card--model-04',
        {
          x: catOffsets.m04,
          scale: 0.96,
          ease: 'power3.inOut',
          duration: 2.0,
        },
        13.8
      );

      tl.to(
        '.hero-stage-card--model-05',
        {
          x: catOffsets.m05,
          scale: 0.91,
          ease: 'power3.inOut',
          duration: 2.0,
        },
        13.8
      );

      // Reveal model product labels during catalogue positioning (14.8s to 15.6s)
      tl.fromTo(
        '.model-label',
        {
          opacity: 0,
          y: 10,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power2.out',
        },
        14.8
      );

      // =====================================================================
      // 6. PRODUCT RAIL ENTRANCE & ELEVATION (15.8s to 17.6s)
      // =====================================================================
      // Product rail glides up from yPercent: 130 to 0 (duration 1.8s, ease: power3.out)
      tl.to(
        '.product-rail',
        {
          yPercent: 0,
          opacity: 1,
          ease: 'power3.out',
          duration: 1.8,
        },
        15.8
      );

      // Models simultaneously elevate to modelElevateTop for clearance above rail
      tl.to(
        '.hero-stage-card',
        {
          top: modelElevateTop,
          ease: 'power3.out',
          duration: 1.8,
        },
        15.8
      );

      // Product card reveal stagger (0.06 stagger, duration 0.6s)
      tl.to(
        '.product-card',
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power2.out',
        },
        16.2
      );

      // =====================================================================
      // 7. HORIZONTAL CATALOGUE MOVEMENT (17.6s to 22.8s)
      // =====================================================================
      // Scroll-driven 1:1 translation with subtle parallax: 5.2s duration, ease: none
      tl.to(
        '.model-track',
        {
          x: catTravel.model,
          ease: 'none',
          duration: 5.2,
        },
        17.6
      );

      tl.to(
        '.product-track',
        {
          x: catTravel.product,
          ease: 'none',
          duration: 5.2,
        },
        17.6
      );

      // =====================================================================
      // 8. FINAL CATALOGUE SETTLE & RESTING HOLD (22.8s to 23.6s)
      // =====================================================================
      // Subtle final settle motion: -6px / -3px over 0.8s, power2.out
      tl.to(
        '.model-track',
        {
          x: '-=6px',
          ease: 'power2.out',
          duration: 0.8,
        },
        22.8
      );

      tl.to(
        '.product-track',
        {
          x: '-=3px',
          ease: 'power2.out',
          duration: 0.8,
        },
        22.8
      );

      tl.to(
        {},
        {
          duration: 0.8,
        },
        22.8
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={heroRef} className="fashion-hero" aria-label="PEHNAAVA Editorial Collection">
      {/* Subtle radial spotlight glow behind center model */}
      <div className="hero-radial-glow" aria-hidden="true" />

      {/* Minimal luxury fashion header */}
      <header className="hero-header">
        <a href="#" className="hero-header__logo" aria-label="PEHNAAVA Home">
          <img
            src="/pehnaava-logo.png"
            alt="PEHNAAVA"
            className="hero-header__logo-img"
            width="379"
            height="198"
          />
        </a>
        <nav className="hero-header__nav" aria-label="Main Navigation">
          <a href="#shop" className="hero-header__link">SHOP</a>
          <a href="#collection" className="hero-header__link hero-header__link--collection">COLLECTION</a>
          <button
            type="button"
            className="hero-header__link"
            onClick={openCart}
            aria-label={`Open shopping bag, ${cartCount} items`}
          >
            BAG ({cartCount})
          </button>
          <a href="#menu" className="hero-header__link">MENU</a>
        </nav>
      </header>

      {/* Main uppercase editorial headline in upper-right / right-center */}
      <div className="hero-headline" aria-label="Hero Title">
        <h1 className="hero-headline__title">
          DESIGNED TO MAKE<br />
          AN ENTRANCE.
        </h1>
      </div>

      {/* Model Stage hosting all 5 ModelCard components inside a shared ModelTrack */}
      <div className="model-stage" role="region" aria-label="Fashion Model Lineup">
        <div className="model-track">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              isAbsolute={true}
              showLabel={false}
              className={`hero-stage-card hero-stage-card--${model.id}`}
            />
          ))}
        </div>
      </div>

      {/* Product Rail along the bottom portion */}
      <ProductRail />
    </section>
  );
}

export default FashionHero;
