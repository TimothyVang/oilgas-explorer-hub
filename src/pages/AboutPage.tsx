import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Team from "@/components/Team";
import { Target, Eye, Heart } from "lucide-react";
import heroImage from "@/assets/pump-jacks.jpg";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-[60vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Oil field operations"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/95" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-1 bg-accent rounded-full" />
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6">
            About Us
          </h1>
          <p className="text-xl sm:text-2xl text-primary-foreground/90 max-w-3xl mx-auto">
            Building a legacy of excellence in energy exploration and production
          </p>
        </div>
      </section>

      {/* Vision, Mission, Values */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Vision */}
            <div className="text-center p-8 bg-card rounded-lg shadow-lg hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Eye className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be the premier independent oil and gas company, recognized for operational excellence, sustainable practices, and creating lasting value for our stakeholders.
              </p>
            </div>

            {/* Mission */}
            <div className="text-center p-8 bg-card rounded-lg shadow-lg hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                We acquire, develop, and operate oil and gas assets with a focus on efficiency, safety, and environmental stewardship while delivering superior returns.
              </p>
            </div>

            {/* Values */}
            <div className="text-center p-8 bg-card rounded-lg shadow-lg hover-lift">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
                <Heart className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Our Values</h3>
              <p className="text-muted-foreground leading-relaxed">
                Integrity, safety, innovation, and environmental responsibility guide every decision we make and every action we take.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1 bg-accent rounded-full" />
            </div>
            <h2 className="text-4xl font-bold text-foreground text-center mb-8">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                Founded with a vision to transform the energy landscape, BAH Oil and Gas has grown from a small exploration company to a significant player in the North American oil and gas industry.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Our journey began with a commitment to operational excellence and a deep understanding of the energy sector. Over the years, we have built a diverse portfolio of assets across premier basins, establishing ourselves as a trusted partner in energy development.
              </p>
              <p className="text-lg leading-relaxed">
                Today, we continue to expand our operations while maintaining our core values of safety, integrity, and environmental responsibility. Our team of experienced professionals brings decades of combined expertise to every project, ensuring we deliver value to our investors, partners, and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <Team />

      <Footer />
    </div>
  );
};

export default AboutPage;
