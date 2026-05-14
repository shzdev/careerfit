export function HeroSection() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-6 pt-6 sm:px-6 lg:px-8">
      <nav className="flex items-center justify-between">
        <div className="font-display text-lg font-semibold text-white">CareerFit AI</div>
        <a
          href="#matcher"
          className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-100"
        >
          Start matching
        </a>
      </nav>

      <div className="max-w-3xl pt-6 sm:pt-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-cyan-200">IT career role matcher</p>
        <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">
          CareerFit AI
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          Turn your technical skills into clear career direction with structured role matching and AI-assisted guidance.
        </p>
      </div>
    </section>
  );
}

