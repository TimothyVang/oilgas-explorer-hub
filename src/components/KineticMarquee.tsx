const focusItems = ["Zapata County", "Conventional Vertical", "Known Horizons", "Operator of Record"];

export const KineticMarquee = () => (
  <section aria-label="BAH Oil LLC operating focus" className="border-y-2 border-secondary bg-[#F8F6F0] px-4 py-16 text-secondary md:px-8 md:py-20">
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
      <div>
        <p className="kinetic-label mb-3 text-sm text-primary">FOCUS</p>
        <h2 className="kinetic-heading text-[clamp(3rem,12vw,7rem)] leading-[0.86]">
          Conventional redevelopment in South Texas.
        </h2>
      </div>
      <div className="border-2 border-secondary bg-white p-5 shadow-[6px_6px_0_#C09B4C] md:p-6">
        <p className="font-body text-lg font-semibold leading-tight text-secondary/80 md:text-2xl">
          BAH Oil LLC focuses on shallow, conventional vertical oil and gas projects in the Zapata County region of South Texas. We target known, productive horizons where established geology and existing field data reduce subsurface risk and support disciplined, repeatable development.
        </p>
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {focusItems.map((item) => (
            <div key={item} className="border-2 border-secondary bg-secondary px-4 py-3 text-center font-mono text-xs font-bold uppercase tracking-[-0.02em] text-primary">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default KineticMarquee;
