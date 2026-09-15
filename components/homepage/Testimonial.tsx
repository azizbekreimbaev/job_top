import Image from "next/image";

export function Testimonial() {
  return (
    <section className="px-4 sm:px-8">
      <div className="marketing-grid mx-auto h-20 max-w-[1280px] border-x border-border" aria-hidden="true" />
      <div className="mx-auto max-w-[1280px] border border-border px-6 py-16 text-center sm:px-12 sm:py-20">
        <p className="text-sm font-semibold tracking-[0.16em] text-accent uppercase">
          Success Stories
        </p>
        <blockquote className="mx-auto mt-7 max-w-4xl text-2xl leading-snug font-normal text-text-slate sm:text-3xl lg:text-4xl">
          “I used to spend my evenings copy-pasting resumes. Now I open my
          dashboard to see interviews waiting. It feels like cheating. Had 3
          offers on the table simultaneously.”
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3 text-left">
          <Image
            src="/images/user-icon.png"
            alt="Tom Wilson"
            width={48}
            height={48}
            className="rounded-md"
          />
          <div>
            <p className="text-sm font-semibold text-text-black">Tom Wilson</p>
            <p className="mt-1 text-sm font-normal text-text-secondary">Junior Developer</p>
          </div>
        </div>
      </div>
      <div className="marketing-grid mx-auto h-20 max-w-[1280px] border-x border-border" aria-hidden="true" />
    </section>
  );
}
