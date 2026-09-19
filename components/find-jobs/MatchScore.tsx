type Props = {
  score: number;
};

export function MatchScore({ score }: Props) {
  const strokeClass =
    score >= 90
      ? "stroke-success"
      : score >= 80
        ? "stroke-info-medium"
        : "stroke-warning";

  return (
    <div className="flex items-center gap-2">
      <svg aria-hidden="true" viewBox="0 0 100 6" className="h-1.5 w-24 overflow-visible">
        <line x1="3" y1="3" x2="97" y2="3" pathLength="100" className="stroke-border" strokeWidth="6" strokeLinecap="round" />
        <line x1="3" y1="3" x2="97" y2="3" pathLength="100" className={strokeClass} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${score} 100`} />
      </svg>
      <span className="text-sm font-semibold text-text-dark">{score}%</span>
    </div>
  );
}
