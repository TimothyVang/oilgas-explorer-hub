import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Linkedin, Mail } from "lucide-react";

const Team = () => {
  const [activeId, setActiveId] = useState<number | null>(1);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Parallax transforms
  const { scrollYProgress } = useScroll({ 
    target: sectionRef, 
    offset: ["start end", "end start"] 
  });
  const titleY = useTransform(scrollYProgress, [0, 0.4], [80, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const cardsY = useTransform(scrollYProgress, [0.1, 0.5], [100, 0]);
  const cardsOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  const team = [
    {
      id: 1,
      name: "James Mitchell",
      role: "CEO",
      bio: "Strategic visionary with 25 years leading global energy exploration intiatives.",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "COO",
      bio: "Operational expert specializing in sustainable extraction and AI integration.",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
    },
    {
      id: 3,
      name: "Michael Thompson",
      role: "CFO",
      bio: "Financial architect ensuring stability across volatile global markets.",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80"
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      role: "VP Engineering",
      bio: "Technical lead pioneering our proprietary geological neural networks.",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80"
    }
  ];

  return (
    <section ref={sectionRef} className="py-32 bg-midnight overflow-hidden">
      <div className="container mx-auto px-4 mb-20 text-center">
        <motion.h2 
          style={{ y: titleY, opacity: titleOpacity }}
          className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6"
        >
          The <span className="text-primary">Architects</span>
        </motion.h2>
        <motion.p 
          style={{ y: titleY, opacity: titleOpacity }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Meet the minds behind the machine.
        </motion.p>
      </div>

      <motion.div 
        style={{ y: cardsY, opacity: cardsOpacity }}
        className="container mx-auto px-4 h-[500px] flex gap-4"
      >
        {team.map((member) => (
          <motion.div
            key={member.id}
            layout
            onClick={() => setActiveId(member.id)}
            onHoverStart={() => setActiveId(member.id)}
            className={`relative h-full rounded-3xl overflow-hidden cursor-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeId === member.id ? 'flex-[3]' : 'flex-[1] grayscale hover:grayscale-0'
              }`}
          >
            <img
              src={member.img}
              alt={member.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 w-full">
              <motion.div layout className="overflow-hidden">
                <h3 className="text-3xl font-bold text-white mb-2 whitespace-nowrap">{member.name}</h3>
                <p className="text-accent font-bold uppercase tracking-wider mb-4">{member.role}</p>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: activeId === member.id ? 1 : 0, height: activeId === member.id ? 'auto' : 0 }}
                  className="text-gray-300"
                >
                  <p className="mb-6">{member.bio}</p>
                  <div className="flex gap-4">
                    <button className="p-3 bg-white/10 rounded-full hover:bg-primary hover:text-black transition-colors" aria-label="LinkedIn profile">
                      <Linkedin size={20} />
                    </button>
                    <button className="p-3 bg-white/10 rounded-full hover:bg-primary hover:text-black transition-colors" aria-label="Email contact">
                      <Mail size={20} />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Team;
