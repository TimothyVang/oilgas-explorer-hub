import { Link } from "react-router-dom";
import { siteConfig } from "@/constants/siteConfig";

const Footer = () => {
  return (
    <footer className="relative bg-black py-20 overflow-hidden">
      {/* Massive Watermark */}
      <div className="absolute bottom-0 left-0 w-full text-center pointer-events-none select-none opacity-[0.1]">
        <h1 className="text-[25vw] font-black leading-none text-white tracking-tighter translate-y-[20%]">BAH</h1>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="lg:col-span-2">
            <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-6">
              Powering <br /> Tomorrow.
            </h2>
            <a href="#contact" className="inline-block px-8 py-3 rounded-full border border-white/40 bg-white/5 text-white font-bold hover:bg-white hover:text-black transition-all">
              Start a Project
            </a>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-300 hover:text-white text-lg transition-colors">About</Link></li>
              <li><Link to="/#services" className="text-gray-300 hover:text-white text-lg transition-colors">Services</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-white text-lg transition-colors">Investor Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Contact</h4>
            <p className="text-gray-300 text-lg mb-4">
              1200 Energy Corridor<br />
              Houston, TX 77079
            </p>
            <a href={`mailto:${siteConfig.contact.email}`} className="text-gray-300 text-lg hover:text-primary transition-colors">
              {siteConfig.contact.email}
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} BAH Energy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
