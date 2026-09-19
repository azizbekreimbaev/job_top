type Props = {
  matchedSkills: string[];
  missingSkills: string[];
};

export function SkillsComparison({ matchedSkills, missingSkills }: Props) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">Required Skills vs Your Profile</h2>
      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-sm text-text-muted">You have</p>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.length ? matchedSkills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1.5 text-sm font-medium text-success-dark"><span aria-hidden="true">✓</span>{skill}</span>
            )) : <span className="text-sm text-text-muted">No direct skill matches identified.</span>}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-text-muted">Gap skills</p>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length ? missingSkills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1.5 text-sm font-medium text-accent"><span aria-hidden="true">×</span>{skill}</span>
            )) : <span className="text-sm text-text-muted">No skill gaps identified.</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
