import { Linkedin, Mail } from "lucide-react";

const Team = () => {
  const teamMembers = [
    {
      name: "James Mitchell",
      title: "Chief Executive Officer",
      bio: "25+ years of experience in energy sector leadership and strategic development.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Sarah Chen",
      title: "Chief Operating Officer",
      bio: "Expert in operational excellence with a track record of optimizing complex energy assets.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Michael Thompson",
      title: "Chief Financial Officer",
      bio: "Former investment banker with deep expertise in energy sector finance and M&A.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    },
    {
      name: "Emily Rodriguez",
      title: "VP of Engineering",
      bio: "Leading our technical teams with 20+ years of petroleum engineering experience.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    },
  ];

  return (
    <section id="team" className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-accent rounded-full" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Our Leadership
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the experienced team driving our vision forward
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="bg-card rounded-lg overflow-hidden shadow-lg hover-lift group"
            >
              {/* Photo */}
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300" />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-card-foreground mb-1">
                  {member.name}
                </h3>
                <p className="text-accent font-medium mb-3">{member.title}</p>
                <p className="text-muted-foreground text-sm mb-4">
                  {member.bio}
                </p>
                
                {/* Social Links */}
                <div className="flex gap-3">
                  <button className="p-2 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
