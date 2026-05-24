import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import KineticMarquee from "@/components/KineticMarquee";
import ProjectReviewPreview from "@/components/ProjectReviewPreview";

import Services from "@/components/Services";
import Team from "@/components/Team";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F8F6F0] text-secondary">
      <Navigation />
      <main>
        <Hero />
        <KineticMarquee />
        <Services />
        <ProjectReviewPreview />
        <Team />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
