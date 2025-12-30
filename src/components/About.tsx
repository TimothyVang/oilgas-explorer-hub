import { HardHat, Award, Globe, Users } from "lucide-react";
import pumpJacksImage from "@/assets/pump-jacks.jpg";

const About = () => {
  const highlights = [
    {
      icon: HardHat,
      title: "Safety First",
      description: "Industry-leading safety standards and protocols",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Decades of proven expertise and innovation",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Operations across multiple continents",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Skilled professionals dedicated to success",
    },
  ];

  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-lift">
              <img
                src={pumpJacksImage}
                alt="Oil pump jacks at dawn"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 glass-effect rounded-2xl p-6 max-w-xs border border-border shadow-card">
              <p className="text-4xl font-bold text-accent mb-1">45+</p>
              <p className="text-muted-foreground">Years of Excellence</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Leading the Energy Industry Forward
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              BAH Oil and Gas has been at the forefront of the oil and gas industry for over four decades,
              delivering reliable energy solutions that power communities and industries worldwide.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Our commitment to operational excellence, environmental stewardship, and technological 
              innovation sets us apart as a trusted partner in the global energy landscape.
            </p>

            {/* Highlights Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {highlights.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
