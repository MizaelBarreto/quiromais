import NavMenu from "@/components/NavMenu";
import HeroSection from "@/components/HeroSection";
import SpineScrollSection from "@/components/SpineScrollSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <NavMenu />
      <main>
        <HeroSection />
        <SpineScrollSection />
        <ServicesSection />
        <TestimonialsCarousel />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
