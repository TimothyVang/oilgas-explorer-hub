import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";

import Services from "@/components/Services";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-midnight">
      <Navigation />
      <main>
        <Hero />
        {/* About Section replaced by Vision Teaser in Hero or separate page */}
        <Services />
        {/* Smooth transition gradient between Services and Team */}
        <div className="relative h-32 bg-gradient-to-b from-midnight via-midnight to-midnight z-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        </div>
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
