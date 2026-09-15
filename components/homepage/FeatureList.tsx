type FeatureItem = {
  title: string;
  body: string;
};

type FeatureListProps = {
  items: FeatureItem[];
  accentItem: number;
};

export function FeatureList({ items, accentItem }: FeatureListProps) {
  return (
    <div className="border-t border-border">
      {items.map((item, index) => (
        <article
          key={item.title}
          className={`border-b border-border px-6 py-8 sm:px-10 ${index === accentItem ? "border-l-2 border-l-accent" : "border-l-2 border-l-transparent"}`}
        >
          <h3 className="text-lg font-semibold text-text-slate">{item.title}</h3>
          <p className="mt-3 text-base leading-7 font-normal text-text-secondary">
            {item.body}
          </p>
        </article>
      ))}
    </div>
  );
}
