import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import HowWeWork from "@/components/HowWeWork";
import Services from "@/components/Services";
import Portfolio from "@/components/Portfolio";
import Team from "@/components/Team";
import WhyChooseUs from "@/components/WhyChooseUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <About />
        <HowWeWork />
        <Services />
        <Portfolio />
        <Team />
        <WhyChooseUs />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
