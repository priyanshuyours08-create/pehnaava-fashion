import React from 'react';
import { useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import './ProductRail.css';

/**
 * ProductRail Component
 * 
 * Renders a bottom ecommerce track with compact luxury fashion product cards.
 * Initial state is hidden below the viewport (yPercent: 120, opacity: 0)
 * and animated smoothly into view via the master GSAP scroll timeline.
 */
export function ProductRail({ className = '', style = {} }) {
  const navigate = useNavigate();

  return (
    <section
      className={`product-rail ${className}`.trim()}
      style={style}
      aria-label="Autumn / Winter 26 Curated Products"
    >
      <div className="product-track" role="region" aria-label="Product Showcase Track">
        {products.map((product) => {
          const displayPrice = product.priceFormatted || (typeof product.price === 'number' ? `₹${product.price.toLocaleString('en-IN')}` : product.price);

          return (
            <button
              type="button"
              key={product.id}
              className="product-card"
              id={`product-${product.id}`}
              aria-label={`${product.name}, priced at ${displayPrice}`}
              onClick={() => {
                if (product.slug) {
                  navigate(`/product/${product.slug}`);
                }
              }}
            >
              <div className="product-card__visual">
                <picture className="product-card__picture">
                  {product.image && <source srcSet={product.image} type="image/webp" />}
                  <img
                    src={product.fallbackImage || product.image}
                    alt={product.alt || product.name}
                    className="product-card__image"
                    width="180"
                    height="180"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <div className="product-card__info">
                <span className="product-card__name">{product.name}</span>
                <span className="product-card__price">{displayPrice}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ProductRail;

