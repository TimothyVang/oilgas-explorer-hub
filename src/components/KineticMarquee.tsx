const trustItems = ["Petroleum engineering", "Geology perspective", "Operating context", "Private capital", "Disciplined review"];

export const KineticMarquee = () => (
  <section aria-label="BAH Oil LLC strengths" className="bg-[#F8F6F0] px-4 py-8 md:px-8">
    <div className="mx-auto grid max-w-7xl gap-2 border-2 border-secondary bg-secondary p-2 text-white md:grid-cols-5">
      {trustItems.map((item) => (
        <div key={item} className="border border-primary/50 bg-[#08263F] px-4 py-3 text-center font-mono text-xs font-bold uppercase tracking-[-0.02em] text-primary">
          {item}
        </div>
      ))}
    </div>
  </section>
);

export default KineticMarquee;
