import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug, getRelatedProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const { addItem, cartCount, openCart } = useCart();

  const [selectedSize, setSelectedSize] = useState('M');
  const [addedStatus, setAddedStatus] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    material: false,
    shipping: false,
  });

  // Scroll to top whenever slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[1] || product.sizes[0]);
    }
  }, [slug, product]);

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // If invalid product slug
  if (!product) {
    return (
      <main className="pdp" aria-label="Product Not Found">
        <header className="pdp-nav" aria-label="Product Navigation">
          <div className="pdp-nav__container">
            <Link to="/" className="pdp-nav__logo">
              PEHNAAVA
            </Link>
            <div className="pdp-nav__actions">
              <Link to="/" className="pdp-nav__link">
                COLLECTION
              </Link>
              <button
                type="button"
                className="pdp-nav__link"
                onClick={openCart}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                BAG ({cartCount})
              </button>
            </div>
          </div>
        </header>

        <section className="pdp__container pdp__not-found">
          <h1 className="pdp__not-found-title">PRODUCT NOT FOUND</h1>
          <p className="pdp__not-found-copy">
            The piece you are looking for is unavailable or has been archived from
            this season's editorial catalogue.
          </p>
          <Link to="/" className="pdp__return-link">
            RETURN TO SHOP &rarr;
          </Link>
        </section>
      </main>
    );
  }

  const related = getRelatedProducts(product.id, 4);

  const handleAddToBag = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAddedStatus(true);
    setTimeout(() => {
      setAddedStatus(false);
    }, 2200);
  };

  const formattedPrice =
    product.priceFormatted ||
    (typeof product.price === 'number'
      ? `₹${product.price.toLocaleString('en-IN')}`
      : product.price);

  return (
    <main className="pdp" aria-label={`${product.name} Product Details`}>
      {/* 1. MINIMAL TOP NAVIGATION */}
      <header className="pdp-nav" aria-label="Product Page Header">
        <div className="pdp-nav__container">
          <Link to="/" className="pdp-nav__logo" aria-label="PEHNAAVA Home">
            PEHNAAVA
          </Link>
          <nav className="pdp-nav__actions" aria-label="Product Actions">
            <Link to="/" className="pdp-nav__link">
              COLLECTION
            </Link>
            <button
              type="button"
              className="pdp-nav__link"
              onClick={openCart}
              aria-label={`Open shopping bag, ${cartCount} items`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              BAG <span className="pdp-nav__bag-count">({cartCount})</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="pdp__container">
        {/* 2. BREADCRUMB */}
        <nav className="pdp__breadcrumb" aria-label="Breadcrumb">
          <Link to="/">HOME</Link>
          <span className="pdp__breadcrumb-sep">/</span>
          <span>{product.category}</span>
          <span className="pdp__breadcrumb-sep">/</span>
          <span className="pdp__breadcrumb-current">{product.name}</span>
        </nav>

        {/* 3. 60 / 40 ASYMMETRICAL EDITORIAL SPLIT */}
        <div className="pdp__layout">
          {/* LEFT: Large Product Image Gallery */}
          <section className="pdp__gallery" aria-label="Product Image Gallery">
            {product.images?.map((imgSrc, idx) => (
              <figure key={idx} className="pdp__gallery-frame">
                <img
                  src={imgSrc}
                  alt={`${product.name} — view ${idx + 1}`}
                  className="pdp__gallery-image"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </figure>
            ))}
          </section>

          {/* RIGHT: Sticky Product Information Panel */}
          <aside className="pdp__info" aria-label="Product Ordering Information">
            <span className="pdp__category">{product.category}</span>
            <h1 className="pdp__title">{product.name}</h1>
            <p className="pdp__price">{formattedPrice}</p>

            <p className="pdp__description">{product.description}</p>

            <div className="pdp__meta-line">
              COLOR: <span>{product.color}</span>
            </div>

            <div className="pdp__meta-line">
              FIT: <span>{product.fit}</span>
            </div>

            {/* Size Selector */}
            <div className="pdp__size-section">
              <label id="size-label" className="pdp__size-label">
                SELECT SIZE
              </label>
              <div
                className="pdp__size-options"
                role="radiogroup"
                aria-labelledby="size-label"
              >
                {product.sizes?.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`pdp__size-btn ${
                        isSelected ? 'pdp__size-btn--selected' : ''
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to Bag CTA */}
            <button
              type="button"
              className={`pdp__add-to-bag ${
                addedStatus ? 'pdp__add-to-bag--success' : ''
              }`}
              onClick={handleAddToBag}
              aria-label={`Add ${product.name} in size ${selectedSize} to bag`}
            >
              {addedStatus ? 'ADDED TO BAG ✓' : 'ADD TO BAG'}
            </button>

            {/* Product Details Expandable Accordions */}
            <div className="pdp__accordions">
              {/* DESCRIPTION */}
              <div className="pdp__accordion-item">
                <button
                  type="button"
                  className="pdp__accordion-header"
                  onClick={() => toggleAccordion('description')}
                  aria-expanded={openAccordions.description}
                  aria-controls="accordion-desc"
                >
                  <span>DESCRIPTION &amp; DETAILS</span>
                  <span className="pdp__accordion-icon">
                    {openAccordions.description ? '—' : '+'}
                  </span>
                </button>
                {openAccordions.description && (
                  <div id="accordion-desc" className="pdp__accordion-content">
                    <ul className="pdp__accordion-list">
                      {product.details?.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* MATERIAL & CARE */}
              <div className="pdp__accordion-item">
                <button
                  type="button"
                  className="pdp__accordion-header"
                  onClick={() => toggleAccordion('material')}
                  aria-expanded={openAccordions.material}
                  aria-controls="accordion-material"
                >
                  <span>MATERIAL &amp; CARE</span>
                  <span className="pdp__accordion-icon">
                    {openAccordions.material ? '—' : '+'}
                  </span>
                </button>
                {openAccordions.material && (
                  <div id="accordion-material" className="pdp__accordion-content">
                    <p style={{ margin: '0 0 8px 0' }}>
                      <strong>Fabric:</strong> {product.material}
                    </p>
                    <p style={{ margin: 0 }}>
                      Dry clean or professional specialist wash recommended to
                      preserve garment drape, texture, and structural seams.
                    </p>
                  </div>
                )}
              </div>

              {/* SHIPPING & RETURNS */}
              <div className="pdp__accordion-item">
                <button
                  type="button"
                  className="pdp__accordion-header"
                  onClick={() => toggleAccordion('shipping')}
                  aria-expanded={openAccordions.shipping}
                  aria-controls="accordion-shipping"
                >
                  <span>SHIPPING &amp; RETURNS</span>
                  <span className="pdp__accordion-icon">
                    {openAccordions.shipping ? '—' : '+'}
                  </span>
                </button>
                {openAccordions.shipping && (
                  <div id="accordion-shipping" className="pdp__accordion-content">
                    <p style={{ margin: '0 0 8px 0' }}>
                      Complimentary express courier shipping across India on all
                      orders. International priority shipping available at checkout.
                    </p>
                    <p style={{ margin: 0 }}>
                      Returns and exchanges accepted within 14 days of delivery in
                      original, unworn condition with designer garment tags intact.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* 4. RELATED PRODUCTS ("YOU MAY ALSO LIKE") */}
        {related.length > 0 && (
          <section className="pdp__related" aria-label="Related Recommendations">
            <header className="pdp__related-header">
              <p className="pdp__related-eyebrow">CURATED SELECTION</p>
              <h2 className="pdp__related-title">YOU MAY ALSO LIKE</h2>
            </header>

            <div className="pdp__related-grid">
              {related.map((item) => (
                <article key={item.id}>
                  <Link
                    to={`/product/${item.slug}`}
                    className="pdp__related-card-link"
                    aria-label={`View ${item.name}, ${item.priceFormatted || item.price}`}
                  >
                    <div className="pdp__related-card-image-wrap">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="pdp__related-card-image"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span className="pdp__related-card-cat">{item.category}</span>
                    <h3 className="pdp__related-card-name">{item.name}</h3>
                    <span className="pdp__related-card-price">
                      {item.priceFormatted || `₹${item.price.toLocaleString('en-IN')}`}
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
