import { Link } from "react-router-dom";
import { siteConfig } from "@/constants/siteConfig";
import bahLogo from "@/assets/bah-logo-rounded.png";

const Footer = () => {
  return (
    <footer className="border-t-2 border-secondary bg-primary text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr] md:items-center">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:translate-x-4" aria-label="BAH Oil LLC home">
            <img src={bahLogo} alt="BAH Oil LLC" className="h-14 w-14 rounded-full border-2 border-secondary bg-white object-cover" />
            <span className="kinetic-heading text-3xl">BAH Oil LLC</span>
          </Link>

          <div className="flex flex-wrap gap-4 md:justify-end">
            {[
              ["About", "/about"],
              ["Field Review", "/#services"],
              ["Team", "/#team"],
              ["Investor Login", "/login"],
              [siteConfig.contact.email, `mailto:${siteConfig.contact.email}`],
            ].map(([label, href]) => (
              <a key={label} href={href} className="inline-flex min-h-[44px] items-center px-2 font-mono text-xs font-bold uppercase tracking-[-0.02em] underline decoration-2 underline-offset-4 transition-transform hover:translate-x-2">
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t-2 border-secondary pt-5 font-mono text-xs font-bold uppercase tracking-[-0.02em] md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} BAH Oil LLC. All rights reserved.</p>
          <div className="flex gap-4">
            {siteConfig.social.linkedin && <a href={siteConfig.social.linkedin} className="inline-flex min-h-[44px] items-center px-2 hover:underline">LinkedIn</a>}
            <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex min-h-[44px] items-center px-2 hover:underline">Email</a>
            <Link to="/login" className="inline-flex min-h-[44px] items-center px-2 hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
