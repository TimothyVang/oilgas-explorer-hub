import { Drill, Flame, Factory, Scale, Leaf } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: Drill,
      title: "Exploration & Production",
      description: "Advanced exploration technologies and sustainable extraction methods for optimal resource recovery.",
    },
    {
      icon: Flame,
      title: "EOR Driven Consulting",
      description: "Enhanced Oil Recovery consulting services providing expert guidance and innovative solutions to maximize reservoir production.",
    },
    {
      icon: Factory,
      title: "Operations - Owned and Operated",
      description: "Fully owned and operated energy facilities ensuring complete control, quality, and operational excellence.",
    },
    {
      icon: Scale,
      title: "Landmen & Legal",
      description: "Comprehensive land management and legal services for mineral rights, leases, and regulatory compliance.",
    },
    {
      icon: Leaf,
      title: "Environmental Management",
      description: "Expert guidance through environmental approvals, permits, and regulatory compliance for energy projects.",
    },
  ];

  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Comprehensive Energy Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From exploration to distribution, we deliver end-to-end services that power the world
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover-lift hover:shadow-lift border-border transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-[hsl(var(--energy-orange))] flex items-center justify-center mb-4">
                  <service.icon className={`w-7 h-7 text-primary transition-all duration-300 ${service.icon === Flame ? 'group-hover:animate-pulse-glow' : ''}`} />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
