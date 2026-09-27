import React, { forwardRef } from 'react';
import './ModelCard.css';

/**
 * Reusable ModelCard Component
 * 
 * Supports:
 * - Transparent PNG rendering with object-fit: contain & object-position: center bottom
 * - Editorial warm off-white card wrapper with rounded corners and no heavy shadow
 * - Visual normalization via per-model scale factor
 * - Absolute positioning capability for GSAP animation orchestration
 */
export const ModelCard = forwardRef(function ModelCard(
  {
    model,
    className = '',
    style = {},
    isAbsolute = false,
    showLabel = true,
    ...rest
  },
  ref
) {
  if (!model) return null;

  const {
    id,
    image,
    imageWebp,
    alt,
    label,
    productName,
    category,
    price,
    scale = 1.0,
    width = 669,
    height = 373,
  } = model;

  const cardStyle = {
    ...style,
    '--model-scale': scale,
  };

  const isPrimaryOpeningModel = id === 'model-03';

  return (
    <div
      ref={ref}
      id={`card-${id}`}
      data-model-id={id}
      className={`model-card ${isAbsolute ? 'model-card--absolute' : ''} ${className}`.trim()}
      style={cardStyle}
      {...rest}
    >
      <div className="model-card__backdrop" aria-hidden="true" />
      
      <div className="model-card__visual">
        <picture className="model-card__picture">
          <img
            src={image}
            alt={alt || label || `Fashion Model ${id}`}
            className="model-card__image"
            width={width}
            height={height}
            style={{
              transform: scale !== 1.0 ? `scale(${scale})` : undefined,
              transformOrigin: 'center bottom',
            }}
            loading="eager"
            decoding="async"
            fetchPriority={isPrimaryOpeningModel ? 'high' : 'auto'}
          />
        </picture>
      </div>

      {/* Model-specific fashion product metadata for the light catalogue phase */}
      {productName && (
        <div className="model-label" id={`label-${id}`}>
          <span className="model-label__category">{category}</span>
          <h3 className="model-label__name">{productName}</h3>
          <span className="model-label__price">{price}</span>
        </div>
      )}

      {showLabel && label && (
        <div className="model-card__footer">
          <span className="model-card__tag">{id.toUpperCase()}</span>
          <span className="model-card__label">{label}</span>
        </div>
      )}
    </div>
  );
});

export default ModelCard;
