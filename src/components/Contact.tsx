import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/constants/siteConfig";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error(`Failed to send message. Please try again or email us directly at ${siteConfig.contact.email}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="border-y-2 border-secondary bg-primary text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="text-center">
          <p className="kinetic-label mb-4 text-sm">BAH Oil LLC / private investor communication</p>
          <h2 className="kinetic-heading mx-auto max-w-6xl text-[clamp(3.75rem,10vw,9rem)]">Talk With BAH</h2>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="mt-8 inline-flex min-h-[58px] items-center justify-center rounded-full border-2 border-secondary bg-secondary px-9 font-mono text-sm font-bold uppercase tracking-[-0.02em] text-white transition-transform hover:scale-105 hover:bg-white hover:text-secondary"
          >
            Email BAH Oil
          </a>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div className="border-2 border-secondary bg-white p-6">
            <h3 className="kinetic-heading text-5xl">Contact</h3>
            <div className="mt-8 space-y-5">
              {[
                { icon: Mail, text: siteConfig.contact.email },
                { icon: MapPin, text: siteConfig.location.displayAddress },
              ].map((item) => (
                <div key={item.text} className="group flex items-start gap-4 border-t-2 border-secondary pt-4">
                  <item.icon className="mt-1 h-5 w-5 text-secondary transition-transform group-hover:translate-x-2" />
                  <span className="font-mono text-sm font-bold uppercase tracking-[-0.02em]">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-2 border-secondary bg-secondary p-6 text-white md:p-8">
            <div className="grid gap-5">
              <Field label="Name">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-14 w-full border-2 border-white bg-[#08263F] px-4 font-body text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                  placeholder="Enter your name"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-14 w-full border-2 border-white bg-[#08263F] px-4 font-body text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                  placeholder="name@company.com"
                />
              </Field>
              <Field label="Message">
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-none border-2 border-white bg-[#08263F] px-4 py-3 font-body text-white placeholder:text-white/40 focus:border-primary focus:outline-none"
                  placeholder="Tell us who you are, your firm, and the reason for your inquiry"
                />
              </Field>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary px-8 font-mono text-sm font-bold uppercase tracking-[-0.02em] text-secondary transition-transform hover:scale-105 hover:bg-white disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSubmitting ? "Sending" : "Submit Inquiry"}
                {!isSubmitting && <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="kinetic-label mb-2 block text-xs text-primary">{label}</span>
    {children}
  </label>
);

export default Contact;
