import { Compass, Crosshair, Gauge } from "lucide-react";

const HowWeWork = () => {
  const pillars = [
    {
      icon: Compass,
      title: "Identify",
      description: "We identify promising opportunities in the oil and gas sector through rigorous market analysis and industry expertise.",
    },
    {
      icon: Crosshair,
      title: "Execute",
      description: "Our experienced team executes strategic acquisitions and developments with precision and operational excellence.",
    },
    {
      icon: Gauge,
      title: "Optimize",
      description: "We optimize asset performance through innovative technologies and sustainable operational practices.",
    },
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-accent rounded-full" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            How We Work
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Our three-pillar approach to energy investment and development
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="text-center p-8 rounded-lg bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-all duration-300 group"
            >
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground text-xl font-bold mb-6">
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <pillar.icon className={`w-16 h-16 text-accent group-hover:scale-110 transition-transform duration-300 ${pillar.icon === Gauge ? 'group-hover:animate-spin-slow' : ''}`} />
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold mb-4">{pillar.title}</h3>
              <p className="text-primary-foreground/80 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
