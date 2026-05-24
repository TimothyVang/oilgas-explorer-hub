import { FileCheck, Gauge, LockKeyhole, ShieldCheck } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: FileCheck,
      title: "Well Record Control",
      description: "BAH builds project context from well history, production data, operating records, maps, and field evidence.",
    },
    {
      icon: Gauge,
      title: "Technical Development Path",
      description: "Engineering and geology input supports reserves context, production assumptions, and redevelopment planning.",
    },
    {
      icon: LockKeyhole,
      title: "Field Constraints",
      description: "BAH accounts for timing, vendors, field conditions, and operating constraints tied to the work plan.",
    },
    {
      icon: ShieldCheck,
      title: "Cost & Execution",
      description: "Cost support and execution sequence are checked before a project moves forward.",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Records, Costs, Field Work
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            BAH checks well records, technical assumptions, operating context, cost support, and field execution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-accent hover:shadow-lift transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-accent to-[hsl(var(--energy-orange))] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`w-8 h-8 text-primary transition-all duration-300 ${feature.icon === Gauge ? 'group-hover:animate-spin-slow' : ''}`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
