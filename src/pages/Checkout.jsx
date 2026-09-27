import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cartCount, cartTotal, openCart } = useCart();

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f3ef',
        color: '#111111',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Minimal Top Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-distressed, serif)',
            fontSize: '18px',
            color: '#111111',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          PEHNAAVA
        </Link>
        <button
          type="button"
          onClick={openCart}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#111111',
            cursor: 'pointer',
          }}
        >
          BAG ({cartCount})
        </button>
      </header>

      {/* Placeholder Content */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-distressed, serif)',
            fontSize: 'clamp(40px, 6vw, 72px)',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          CHECKOUT
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '14px',
            color: '#666660',
            maxWidth: '420px',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          Checkout functionality is currently under preparation. Total payable for{' '}
          {cartCount} {cartCount === 1 ? 'item' : 'items'}: ₹
          {cartTotal.toLocaleString('en-IN')}.
        </p>
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-sans, sans-serif)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#111111',
            textDecoration: 'none',
            paddingBottom: '4px',
            borderBottom: '1px solid #111111',
          }}
        >
          &larr; RETURN TO SHOP
        </Link>
      </section>
    </main>
  );
}
