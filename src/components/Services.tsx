import { Drill, Factory, Truck, Leaf, BarChart3, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Services = () => {
  const services = [
    {
      icon: Drill,
      title: "Exploration & Production",
      description: "Advanced exploration technologies and sustainable extraction methods for optimal resource recovery.",
    },
    {
      icon: Factory,
      title: "Refining & Processing",
      description: "State-of-the-art refining facilities delivering high-quality petroleum products with maximum efficiency.",
    },
    {
      icon: Truck,
      title: "Distribution & Logistics",
      description: "Comprehensive supply chain management ensuring reliable delivery of energy products worldwide.",
    },
    {
      icon: Leaf,
      title: "Environmental Management",
      description: "Committed to sustainable practices and minimizing environmental impact across all operations.",
    },
    {
      icon: BarChart3,
      title: "Energy Analytics",
      description: "Data-driven insights and predictive analytics to optimize operations and reduce costs.",
    },
    {
      icon: Wrench,
      title: "Technical Services",
      description: "Expert maintenance, engineering support, and technical solutions for energy infrastructure.",
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
              className="hover-lift hover:shadow-lift border-border transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-[hsl(var(--energy-orange))] flex items-center justify-center mb-4">
                  <service.icon className="w-7 h-7 text-primary" />
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
