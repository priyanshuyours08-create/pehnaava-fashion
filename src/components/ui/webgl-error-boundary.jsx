import React, { Component } from "react";
import { cn } from "@/lib/utils";

export class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("WebGL Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <WebGLFallback items={this.props.items} />
      );
    }
    return this.props.children;
  }
}

/**
 * WebGLFallback
 * Renders a clean, accessible, luxury fashion horizontal scroll lookbook
 * when WebGL hardware acceleration is not supported or encounters an error.
 */
export function WebGLFallback({ items = [], className }) {
  return (
    <div
      className={cn("fashion-fallback-container", className)}
      style={{
        width: "100%",
        padding: "24px 0",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        backgroundColor: "#f3f3ef",
      }}
      role="region"
      aria-label="Collection Lookbook"
    >
      <div
        style={{
          display: "flex",
          gap: "24px",
          paddingInline: "max(32px, 4vw)",
          width: "max-content",
        }}
      >
        {items.map((item, index) => (
          <article
            key={item.id || index}
            style={{
              width: "280px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#ffffff",
              borderRadius: "2px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
              transition: "transform 0.3s ease",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "3 / 4",
                overflow: "hidden",
                backgroundColor: "#e8e8e4",
              }}
            >
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                onError={(e) => {
                  if (item.localSrc && e.currentTarget.src !== item.localSrc) {
                    e.currentTarget.src = item.localSrc;
                  }
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `center ${item.objectPositionY !== undefined ? Math.round(item.objectPositionY * 100) : 50}%`,
                  filter: "contrast(1.02) saturate(0.96)",
                  display: "block",
                }}
              />
            </div>
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#777770",
                  fontFamily: "var(--font-sans, sans-serif)",
                }}
              >
                {item.category}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: "#111111",
                  letterSpacing: "-0.01em",
                  fontFamily: "var(--font-sans, sans-serif)",
                }}
              >
                {item.title}
              </h3>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#111111",
                  fontFamily: "var(--font-sans, sans-serif)",
                }}
              >
                {item.price}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
