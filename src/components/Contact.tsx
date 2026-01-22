import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import { Send, MapPin, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/constants/siteConfig";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll-based parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const contentX = useTransform(scrollYProgress, [0, 0.5], [-60, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const formY = useTransform(scrollYProgress, [0.1, 0.5], [80, 0]);
  const formOpacity = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);

  // Mouse-based 3D effect - smoothed with spring
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (error) {
      toast.error(`Failed to send message. Please try again or email us directly at ${siteConfig.contact.email}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={sectionRef} id="contact" className="relative min-h-screen py-32 bg-midnight flex items-center justify-center overflow-hidden">
      {/* Background Ambience with Parallax Scale */}
      <motion.div 
        style={{ scale: bgScale }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-midnight to-midnight opacity-50" 
      />

      <div className="container mx-auto px-4 perspective-1000">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Text Content with Slide-in Parallax */}
          <motion.div 
            style={{ x: contentX, opacity: contentOpacity }}
            className="space-y-8 z-10"
          >
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50"
            >
              Let's <br /> Collaborate
            </motion.h2>
            <p className="text-xl text-gray-400 max-w-md">
              Ready to redefine your energy infrastructure?
              Connect with our expert team directly.
            </p>

            <div className="space-y-6 pt-8">
              {[
                { icon: Phone, text: siteConfig.contact.phoneDisplay },
                { icon: Mail, text: siteConfig.contact.email },
                { icon: MapPin, text: siteConfig.location.displayAddress }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="flex items-center gap-4 text-gray-300 group"
                >
                  <div className="p-3 rounded-full border border-white/10 bg-white/5 group-hover:bg-primary/20 group-hover:border-primary transition-colors">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg group-hover:text-white transition-colors">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 3D Holographic Form with Parallax */}
          <motion.div
            style={{ y: formY, opacity: formOpacity }}
            className="relative w-full max-w-md mx-auto"
          >
            <motion.div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse-glow" />

              <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl relative z-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm uppercase tracking-widest text-accent mb-2 block">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm uppercase tracking-widest text-accent mb-2 block">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:bg-white/20 transition-all"
                      placeholder="name@company.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm uppercase tracking-widest text-accent mb-2 block">Message</label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:bg-white/20 transition-all resize-none"
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-primary to-accent rounded-lg text-black font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isSubmitting ? "Sending..." : "Send Signal"}
                    {!isSubmitting && <Send className="w-4 h-4" />}
                  </button>
                </div>

                {/* Decorative Glass Elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-accent/20 rounded-full blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl" />
              </form>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Contact;
