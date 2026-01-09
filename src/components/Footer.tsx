import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { siteConfig } from "@/constants/siteConfig";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative h-[80vh] bg-midnight text-white overflow-hidden clip-path-footer" style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}>
      <div className="fixed bottom-0 h-[80vh] w-full flex flex-col justify-between p-10 z-0">

        {/* Massive Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none opacity-[0.05]">
          <h1 className="text-[25vw] font-black leading-none text-white tracking-tighter">BAH</h1>
        </div>

        <div className="container mx-auto relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 pt-20">
          <div className="md:col-span-2 space-y-8">
            <Link to="/" className="text-4xl font-black uppercase tracking-tighter">BAH Energy</Link>
            <p className="text-xl text-gray-400 max-w-sm font-light">
              Pioneering the future of energy infrastructure through AI-driven exploration and sustainable practices.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-accent uppercase tracking-widest font-bold">Explore</h4>
            <ul className="space-y-4 text-lg text-gray-300">
              {['About', 'Services', 'Projects', 'Investors'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="hover:text-white hover:pl-2 transition-all block">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-accent uppercase tracking-widest font-bold">Connect</h4>
            <ul className="space-y-4 text-lg text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Twitter // X</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto relative z-10 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between text-white/40 text-sm">
          <p>© {currentYear} BAH Energy. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
      {/* Spacer to allow scroll to reveal the fixed footer */}
      {/* Note: The parent container in App/Index needs a z-index higher than this footer for the effect to work naturally, 
          or we use the 'sticky header / fixed footer' pattern where body has margin-bottom equal to footer height.
          For this component, we'll rely on the classic 'sticky bottom' feel or just a massive static block for now to be safe with standard layouts. 
          Actually, let's make it a standard high-impact block for stability, but with the parallax internal elements. */}
    </footer>
  );
};

// Re-writing the component effectively to be a standard block but with high-impact visuals 
// because the 'fixed reveal' often breaks in complex React routers without specific layout wrappers.
const LiquidFooter = () => {
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
              {['About', 'Services'].map(item => (
                <li key={item}><Link to={item === 'About' ? '/about' : `/#${item.toLowerCase()}`} className="text-gray-300 hover:text-white text-lg">{item}</Link></li>
              ))}
              <li><Link to="#" className="text-gray-300 hover:text-white text-lg">News</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-white text-lg">Investor Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Offices</h4>
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
          <p>&copy; {new Date().getFullYear()} BAH Energy</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LiquidFooter;
