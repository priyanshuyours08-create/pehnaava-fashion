import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    items,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCart();

  const navigate = useNavigate();
  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Open / Close Animation & Scroll Lock
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const duration = prefersReducedMotion ? 0.05 : 0.6;

    if (isCartOpen) {
      // Save previously focused element
      previousFocusRef.current = document.activeElement;

      // Lock body scroll cleanly without resetting scroll position
      document.body.style.overflow = 'hidden';

      // Animate open
      gsap.killTweensOf([backdropRef.current, panelRef.current]);
      gsap.to(backdropRef.current, {
        opacity: 1,
        duration: duration * 0.8,
        ease: 'power2.out',
      });
      gsap.to(panelRef.current, {
        xPercent: 0,
        duration,
        ease: 'power3.inOut',
        onComplete: () => {
          closeBtnRef.current?.focus();
        },
      });
    } else {
      // Restore body scroll
      document.body.style.overflow = '';

      // Animate close
      gsap.killTweensOf([backdropRef.current, panelRef.current]);
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: duration * 0.7,
        ease: 'power2.in',
      });
      gsap.to(panelRef.current, {
        xPercent: 100,
        duration: duration * 0.9,
        ease: 'power3.inOut',
        onComplete: () => {
          // Return focus to trigger element if available
          if (
            previousFocusRef.current &&
            typeof previousFocusRef.current.focus === 'function'
          ) {
            previousFocusRef.current.focus();
          }
        },
      });
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Keyboard navigation & Focus Trap
  useEffect(() => {
    if (!isCartOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCart();
        return;
      }

      // Trap Tab key inside drawer
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  const handleItemClick = (slug) => {
    closeCart();
    if (slug) {
      navigate(`/product/${slug}`);
    }
  };

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleExploreClick = () => {
    closeCart();
    navigate('/#shop');
  };

  return (
    <div
      ref={rootRef}
      className={`cart-drawer-root ${
        isCartOpen ? 'cart-drawer-root--open' : ''
      }`}
      aria-hidden={!isCartOpen}
    >
      {/* 1. BACKDROP */}
      <div
        ref={backdropRef}
        className="cart-drawer__backdrop"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* 2. DRAWER PANEL */}
      <aside
        ref={panelRef}
        className="cart-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
      >
        {/* HEADER */}
        <header className="cart-drawer__header">
          <h2 id="cart-drawer-title" className="cart-drawer__title">
            SHOPPING BAG ({cartCount})
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="cart-drawer__close-btn"
            onClick={closeCart}
            aria-label="Close shopping bag"
          >
            CLOSE [ESC]
          </button>
        </header>

        {/* BODY / ITEMS LIST */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            /* EMPTY STATE */
            <div className="cart-drawer__empty">
              <p className="cart-drawer__empty-title">YOUR BAG IS EMPTY.</p>
              <p className="cart-drawer__empty-copy">
                Discover the latest forms from Autumn / Winter 26.
              </p>
              <button
                type="button"
                className="cart-drawer__empty-cta"
                onClick={handleExploreClick}
              >
                EXPLORE COLLECTION &rarr;
              </button>
            </div>
          ) : (
            /* ITEMS LIST */
            items.map((item) => {
              const itemTotal =
                (Number(item.price) || 0) * (Number(item.quantity) || 1);
              return (
                <article key={`${item.id}-${item.size}`} className="cart-item">
                  {/* Thumbnail */}
                  <div className="cart-item__image-wrap">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item__image"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* Info */}
                  <div className="cart-item__info">
                    <div className="cart-item__top">
                      <span className="cart-item__category">
                        {item.category}
                      </span>
                      <a
                        href={`/product/${item.slug}`}
                        className="cart-item__name"
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(item.slug);
                        }}
                      >
                        {item.name}
                      </a>
                      <span className="cart-item__size">
                        SIZE: {item.size}
                      </span>
                      <span className="cart-item__price">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Bottom: Quantity Controls & Remove Link */}
                    <div className="cart-item__bottom">
                      <div className="cart-item__quantity">
                        <button
                          type="button"
                          className="cart-item__qty-btn"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.size
                            )
                          }
                          disabled={item.quantity <= 1}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          &minus;
                        </button>
                        <span className="cart-item__qty-val" aria-live="polite">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="cart-item__qty-btn"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.size
                            )
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-item__remove-btn"
                        onClick={() => removeItem(item.id, item.size)}
                        aria-label={`Remove ${item.name}, size ${item.size} from bag`}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* STICKY FOOTER / SUBTOTAL & CHECKOUT */}
        {items.length > 0 && (
          <footer className="cart-drawer__footer">
            <div className="cart-drawer__subtotal-row">
              <span className="cart-drawer__subtotal-label">SUBTOTAL</span>
              <span className="cart-drawer__subtotal-value">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="cart-drawer__shipping-note">
              Shipping and taxes calculated at checkout.
            </p>

            <button
              type="button"
              className="cart-drawer__checkout-btn"
              onClick={handleCheckoutClick}
            >
              CHECKOUT &rarr;
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
