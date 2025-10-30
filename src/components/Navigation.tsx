import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-lg" : "bg-primary/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <h1 className={`text-2xl font-bold ${isScrolled ? "text-gradient" : "text-accent"}`}>
              BAH Energy
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className={`${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              } hover:text-accent transition-colors font-medium`}
            >
              Contact
            </button>
            <Button variant="hero" size="lg" onClick={() => scrollToSection("contact")}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={!isScrolled ? "text-primary-foreground hover:text-accent" : ""}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("home")}
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-left text-foreground hover:text-accent transition-colors font-medium py-2"
            >
              Contact
            </button>
            <Button variant="hero" className="w-full" onClick={() => scrollToSection("contact")}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
