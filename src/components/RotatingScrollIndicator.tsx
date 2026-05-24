import { ArrowDown } from "lucide-react";

export const RotatingScrollIndicator = () => {
  const pathId = "scroll-indicator-path";

  return (
    <button
      type="button"
      onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
      className="relative flex h-36 w-36 items-center justify-center rounded-full border-2 border-secondary bg-primary text-secondary transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F6F0]"
      aria-label="Scroll down to services"
    >
      <svg className="absolute inset-0 h-full w-full animate-kinetic-spin" viewBox="0 0 144 144" aria-hidden="true">
        <defs>
          <path
            id={pathId}
            d="M 72,72 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0"
          />
        </defs>
        <text className="fill-secondary font-mono text-[9px] font-bold uppercase tracking-[-0.02em]">
          <textPath href={`#${pathId}`} startOffset="0%">
            Scroll Down - Scroll Down - Scroll Down - Scroll Down -
          </textPath>
        </text>
      </svg>
      <ArrowDown className="h-9 w-9" strokeWidth={2.5} />
    </button>
  );
};

export default RotatingScrollIndicator;
