import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { newArrivals } from "../data/newArrivals";
import "./NewArrivals.css";

// Ensure ScrollTrigger is registered
gsap.registerPlugin(ScrollTrigger);

const FILTERS = ["ALL", "WOMENSWEAR", "MENSWEAR"];

export function NewArrivals() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const sectionRef = useRef(null);
  const gridRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const filteredProducts =
    activeFilter === "ALL"
      ? newArrivals
      : newArrivals.filter((item) => item.category === activeFilter);

  // Scroll reveal animation when grid enters viewport
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cards = grid.querySelectorAll(".new-arrivals__card");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    if (!hasAnimatedRef.current) {
      gsap.set(cards, { opacity: 0, y: 28 });

      const trigger = ScrollTrigger.create({
        trigger: grid,
        start: "top 85%",
        once: true,
        onEnter: () => {
          hasAnimatedRef.current = true;
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.06,
            ease: "power3.out",
          });
        },
      });

      return () => {
        trigger.kill();
      };
    } else {
      // Re-animating filtered cards smoothly
      gsap.fromTo(
        cards,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: "power2.out" }
      );
    }
  }, [filteredProducts, activeFilter]);

  return (
    <section
      id="shop"
      ref={sectionRef}
      className="new-arrivals"
      aria-label="New Arrivals Collection"
    >
      <div id="new-arrivals" style={{ position: "absolute", top: "-80px" }} aria-hidden="true" />
      <div className="new-arrivals__container">
        {/* Subtle horizontal separation line */}
        <div className="new-arrivals__divider" role="separator" />

        {/* Section Header */}
        <header className="new-arrivals__header">
          <div className="new-arrivals__headings">
            <p className="new-arrivals__eyebrow">NEW SEASON / 26</p>
            <h2 className="new-arrivals__title">NEW ARRIVALS</h2>
          </div>
          <a href="#shop" className="new-arrivals__view-all" aria-label="View all new arrivals">
            VIEW ALL &rarr;
          </a>
        </header>

        {/* Filter Navigation & Piece Count */}
        <nav className="new-arrivals__toolbar" aria-label="Filter products by category">
          <div className="new-arrivals__filters" role="tablist">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`new-arrivals__filter-btn ${
                    isActive ? "new-arrivals__filter-btn--active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              );
            })}
          </div>
          <span className="new-arrivals__count" aria-live="polite">
            {String(filteredProducts.length).padStart(2, "0")} PIECES
          </span>
        </nav>

        {/* Product Grid */}
        <div
          ref={gridRef}
          className="new-arrivals__grid"
          role="region"
          aria-label="New arrivals product list"
        >
          {filteredProducts.map((product) => (
            <article key={product.id} className="new-arrivals__item">
              <Link
                to={`/product/${product.slug}`}
                className="product-card-link"
                aria-label={`View ${product.name}, ${product.category}, ${product.price}`}
              >
                <div className="new-arrivals__card">
                  {/* Image Wrap */}
                  <div className="new-arrivals__image-wrap">
                    <img
                      src={product.image}
                      alt={product.alt}
                      loading="lazy"
                      decoding="async"
                      className="new-arrivals__image"
                      style={{
                        objectPosition: product.objectPosition || "center center",
                      }}
                    />

                    {/* Subtle dark tint overlay on hover */}
                    <div className="new-arrivals__image-overlay" aria-hidden="true" />

                    {/* Support hook for second/hover image if added in future */}
                    {product.hoverImage && (
                      <img
                        src={product.hoverImage}
                        alt={`${product.name} alternate view`}
                        loading="lazy"
                        decoding="async"
                        className="new-arrivals__image-hover"
                      />
                    )}

                    {/* Subtle hover discovery callout - bottom-left */}
                    <span className="new-arrivals__hover-cta" aria-hidden="true">
                      VIEW PRODUCT &rarr;
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="new-arrivals__meta">
                    <span className="new-arrivals__item-category">
                      {product.category}
                    </span>
                    <h3 className="new-arrivals__item-name">
                      <span className="new-arrivals__item-name-text">
                        {product.name}
                      </span>
                    </h3>
                    <span className="new-arrivals__item-price">
                      {product.price}
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
