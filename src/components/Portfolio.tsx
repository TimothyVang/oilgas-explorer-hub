import { MapPin, Calendar, BarChart3 } from "lucide-react";

const Portfolio = () => {
  const projects = [
    {
      title: "Gulf Coast Operations",
      location: "Texas, USA",
      year: "2023",
      type: "Offshore Production",
      image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=400&fit=crop",
      stats: "15,000 bbl/day",
    },
    {
      title: "Permian Basin Development",
      location: "New Mexico, USA",
      year: "2022",
      type: "Onshore Drilling",
      image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop",
      stats: "25,000 bbl/day",
    },
    {
      title: "Eagle Ford Acquisition",
      location: "South Texas, USA",
      year: "2023",
      type: "Asset Acquisition",
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop",
      stats: "10,000 bbl/day",
    },
    {
      title: "Bakken Shale Project",
      location: "North Dakota, USA",
      year: "2021",
      type: "Horizontal Drilling",
      image: "https://images.unsplash.com/photo-1473081556163-2a17de81fc97?w=600&h=400&fit=crop",
      stats: "8,000 bbl/day",
    },
  ];

  return (
    <section id="portfolio" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-accent rounded-full" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Our Portfolio
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Strategic assets across premier North American basins
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.title}
              className="group relative overflow-hidden rounded-lg shadow-lg hover-lift"
            >
              {/* Image */}
              <div className="aspect-[3/2] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-90" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full mb-3">
                  {project.type}
                </span>
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                
                <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {project.year}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-4 h-4" />
                    {project.stats}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
