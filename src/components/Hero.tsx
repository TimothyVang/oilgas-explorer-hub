import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-oil-rigs.jpg";

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Darker Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Offshore oil rigs at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/80 to-primary/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Accent Line */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1 bg-accent rounded-full" />
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Powering <em className="not-italic font-light">Tomorrow's</em>
            <span className="block text-gradient mt-2">Energy Solutions</span>
          </h1>
          <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Leading the energy industry with innovation, sustainability, and unwavering commitment to excellence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="hero"
              size="lg"
              className="text-lg px-8 py-6 h-auto"
              onClick={() => scrollToSection("services")}
            >
              Our Services
              <ArrowRight className="ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 h-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => scrollToSection("contact")}
            >
              Get in touch
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-foreground rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
