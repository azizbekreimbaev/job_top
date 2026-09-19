type Props = {
  reason: string;
};

export function MatchReasoning({ reason }: Props) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-success-lightest text-success">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" /><path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14ZM5 13l.7 2.3L8 16l-2.3.7L5 19l-.7-2.3L2 16l2.3-.7L5 13Z" /></svg>
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">AI Match Reasoning</h2>
      </div>
      <p className="mt-5 text-[15px] font-medium leading-7 text-text-primary">{reason}</p>
    </section>
  );
}
