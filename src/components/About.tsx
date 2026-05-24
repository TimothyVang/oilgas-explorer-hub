import { FileCheck, LockKeyhole, ShieldCheck, Users } from "lucide-react";
import pumpJacksImage from "@/assets/pump-jacks.jpg";

const About = () => {
  const highlights = [
    {
      icon: FileCheck,
      title: "Opportunity Review",
      description: "BAH reviews private upstream opportunities before investor materials are assigned.",
    },
    {
      icon: LockKeyhole,
      title: "Private Portal",
      description: "Detailed files remain inside the controlled investor portal workflow.",
    },
    {
      icon: ShieldCheck,
      title: "Controlled Release",
      description: "BAH controls which materials each approved account can review.",
    },
    {
      icon: Users,
      title: "Investor Coordination",
      description: "Approved investors review only the materials released to their account.",
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
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 glass-effect rounded-2xl p-6 max-w-xs border border-border shadow-card">
              <p className="text-4xl font-bold text-accent mb-1">Private</p>
              <p className="text-muted-foreground">Controlled investor materials</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Houston-Based Oil and Gas Project Review
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              BAH Oil LLC coordinates private upstream opportunity review with petroleum
              engineering, geology, operating context, and assigned investor materials.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Public pages stay high-level. Detailed technical, financial, mapping, and media
              files stay inside the portal for approved accounts.
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
