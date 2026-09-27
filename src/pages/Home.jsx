import React from 'react';
import FashionHero from '../components/FashionHero';
import CollectionCarouselSection from '../components/CollectionCarouselSection';
import NewArrivals from '../components/NewArrivals';
import EditorialCampaign from '../components/EditorialCampaign';
import SiteFooter from '../components/SiteFooter';

export default function Home() {
  return (
    <main>
      <FashionHero />
      <CollectionCarouselSection />
      <NewArrivals />
      <EditorialCampaign />
      <SiteFooter />
    </main>
  );
}
