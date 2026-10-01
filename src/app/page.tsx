import NavMenu from "@/components/NavMenu";
import HeroSection from "@/components/HeroSection";
import SpineScrollSection from "@/components/SpineScrollSection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import VideoSection from "@/components/VideoSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import MotionProvider from "@/components/MotionProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <MotionProvider>
      <NavMenu />
      <main>
        <HeroSection />
        <SpineScrollSection />
        <ServicesSection />
        <GallerySection />
        <VideoSection />
        <TestimonialsCarousel />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </MotionProvider>
  );
}
