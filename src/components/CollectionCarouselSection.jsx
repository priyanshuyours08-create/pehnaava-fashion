import React, { useState } from "react";
import { LiquidGlassCarousel } from "./LiquidGlassCarousel";
import { collectionItems } from "../data/collectionItems";
import "./CollectionCarouselSection.css";

export function CollectionCarouselSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section
      id="collection"
      className="collection-section"
      aria-label="Autumn / Winter 26 Collection Exploration"
    >
      <div className="collection-section__header">
        <div className="collection-section__headings">
          <p className="collection-section__eyebrow">
            THE COLLECTION / AUTUMN / WINTER 26
          </p>
          <h2 className="collection-section__title">
            SELECTED FORMS
          </h2>
        </div>
        <p className="collection-section__statement">
          An exploration of architectural silhouettes, disciplined tailoring, and sculptural geometry in monochrome.
        </p>
      </div>

      <div className="collection-section__carousel-wrap">
        <LiquidGlassCarousel
          items={collectionItems}
          panelHeight={450}
          gap={22}
          background="#f3f3ef"
          entry={true}
          onActiveChange={setActiveIdx}
          onFocusChange={setIsFocused}
        />
      </div>
    </section>
  );
}

export default CollectionCarouselSection;
