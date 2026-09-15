import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="px-4 pt-12 sm:px-8 sm:pt-16">
      <div className="marketing-glow mx-auto max-w-[1280px] border border-border px-5 py-16 text-center sm:px-10 sm:py-20 lg:py-24">
        <h1 className="mx-auto max-w-4xl text-3xl leading-[1.08] font-semibold tracking-[-0.04em] text-text-slate sm:text-5xl lg:text-6xl">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 font-normal text-text-secondary sm:text-lg">
          Stop applying blind. JobPilot finds the jobs, researches the companies,
          and gives you everything you need to stand out.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-overlay px-5 py-3 text-base font-medium text-accent-foreground transition-colors hover:bg-text-slate focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Get Started <span aria-hidden="true" className="text-text-muted">▶</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex min-w-52 items-center justify-center rounded-md border border-border-muted bg-surface/70 px-5 py-3 text-base font-medium text-text-slate transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Find Your First Match
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] bg-background px-5 py-12 sm:px-16 sm:py-16">
        <Image
          src="/images/dashboard-demo.png"
          alt="JobPilot dashboard showing job search analytics and recent activity"
          width={4788}
          height={2416}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 1120px"
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
