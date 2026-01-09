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
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
