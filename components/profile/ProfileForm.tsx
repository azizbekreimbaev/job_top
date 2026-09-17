const inputClassName =
  "h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-secondary";

const filledInputClassName = `${inputClassName} bg-surface-secondary`;

const labelClassName =
  "mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary";

const sectionClassName = "border-t border-border pt-10";

export function ProfileForm() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <div className="border-b border-border pb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          This context is used to accurately represent you in agent
          interactions.
        </p>
      </div>

      <form className="space-y-10 pt-8">
        <fieldset>
          <legend className="mb-7 text-base font-semibold text-text-primary">
            Personal Info
          </legend>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label>
              <span className={labelClassName}>Full Name</span>
              <input
                name="fullName"
                defaultValue="Faizan Ali"
                className={filledInputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Email</span>
              <input
                type="email"
                name="email"
                defaultValue="faizan@jsmastery.pro"
                disabled
                className={inputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Phone Number</span>
              <input
                type="tel"
                name="phone"
                placeholder="+1 (555) 000-0000"
                className={inputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Location</span>
              <input
                name="location"
                placeholder="City, Country"
                className={inputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>LinkedIn URL</span>
              <input
                type="url"
                name="linkedin"
                defaultValue="https://linkedin.com/in/faizan"
                className={filledInputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Portfolio / GitHub</span>
              <input
                type="url"
                name="portfolio"
                defaultValue="https://github.com/jsmastery"
                className={filledInputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Work Authorization</span>
              <select
                name="workAuthorization"
                defaultValue="citizen"
                className={inputClassName}
              >
                <option value="citizen">Citizen</option>
                <option value="permanent-resident">Permanent Resident</option>
                <option value="visa-required">Visa Required</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className={sectionClassName}>
          <legend className="mb-7 text-base font-semibold text-text-primary">
            Professional Info
          </legend>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClassName}>Current/Recent Job Title</span>
              <input
                name="currentTitle"
                defaultValue="Frontend Engineer"
                className={filledInputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Experience Level</span>
              <select
                name="experienceLevel"
                defaultValue="junior"
                className={inputClassName}
              >
                <option value="junior">Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </label>
            <label>
              <span className={labelClassName}>Years of Experience</span>
              <input
                type="number"
                name="yearsExperience"
                defaultValue="4"
                min="0"
                className={filledInputClassName}
              />
            </label>
            <div className="sm:col-span-2">
              <label htmlFor="skill" className={labelClassName}>
                Skills
              </label>
              <div className="flex gap-2">
                <input
                  id="skill"
                  name="skill"
                  placeholder="Add a skill"
                  className={inputClassName}
                />
                <button
                  type="button"
                  className="rounded-md bg-surface-tertiary px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {["React", "TypeScript", "Next.js", "Tailwind CSS"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-surface-tertiary px-3 py-1.5 text-xs font-medium text-text-dark"
                    >
                      {skill} <span aria-hidden="true">×</span>
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="industry" className={labelClassName}>
                Industries Worked In (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  id="industry"
                  name="industry"
                  placeholder="E.g. FinTech, Healthcare"
                  className={inputClassName}
                />
                <button
                  type="button"
                  className="rounded-md bg-surface-tertiary px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className={sectionClassName}>
          <div className="mb-7 flex items-center justify-between gap-4">
            <legend className="text-base font-semibold text-text-primary">
              Work Experience
            </legend>
            <button
              type="button"
              className="text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              +&nbsp; Add role
            </button>
          </div>
          <div className="rounded-xl border border-border bg-surface-secondary p-5 sm:p-6">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
              <label>
                <span className={labelClassName}>Company Name</span>
                <input
                  name="company"
                  defaultValue="Vercel"
                  className={inputClassName}
                />
              </label>
              <label>
                <span className={labelClassName}>Job Title</span>
                <input
                  name="jobTitle"
                  defaultValue="Frontend Engineer"
                  className={inputClassName}
                />
              </label>
              <label>
                <span className={labelClassName}>Start Date</span>
                <input
                  name="startDate"
                  defaultValue="January 2022"
                  className={inputClassName}
                />
              </label>
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="endDate" className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    End Date
                  </label>
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    <input
                      type="checkbox"
                      name="currentlyWorking"
                      defaultChecked
                      className="size-4 accent-accent"
                    />
                    Currently working here
                  </label>
                </div>
                <input
                  id="endDate"
                  name="endDate"
                  placeholder="---------- ----"
                  disabled
                  className={inputClassName}
                />
              </div>
              <label className="sm:col-span-2">
                <span className={labelClassName}>Key Responsibilities</span>
                <textarea
                  name="responsibilities"
                  defaultValue="Built Next.js features and optimized web vitals. Led a team of 3 developers."
                  rows={4}
                  className="w-full resize-y rounded-md border border-border bg-surface px-3 py-3 text-sm leading-5 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset className={sectionClassName}>
          <legend className="mb-7 text-base font-semibold text-text-primary">
            Education
          </legend>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label>
              <span className={labelClassName}>Highest Degree</span>
              <select
                name="degree"
                defaultValue="high-school"
                className={inputClassName}
              >
                <option value="high-school">High School</option>
                <option value="associate">Associate Degree</option>
                <option value="bachelor">Bachelor&apos;s Degree</option>
                <option value="master">Master&apos;s Degree</option>
                <option value="doctorate">Doctorate</option>
              </select>
            </label>
            <label>
              <span className={labelClassName}>Field of Study</span>
              <input
                name="fieldOfStudy"
                defaultValue="Computer Science"
                className={inputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Institution Name</span>
              <input
                name="institution"
                placeholder="E.g. State University"
                className={inputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Graduation Year</span>
              <input
                inputMode="numeric"
                name="graduationYear"
                placeholder="YYYY"
                className={inputClassName}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className={sectionClassName}>
          <legend className="mb-7 text-base font-semibold text-text-primary">
            Job Preferences
          </legend>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClassName}>Job Titles Seeking</span>
              <input
                name="jobTitlesSeeking"
                defaultValue="Frontend Engineer, React Developer"
                className={filledInputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Remote Preference</span>
              <select
                name="remotePreference"
                defaultValue="any"
                className={inputClassName}
              >
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </label>
            <label>
              <span className={labelClassName}>
                Salary Expectation (Optional)
              </span>
              <input
                name="salaryExpectation"
                placeholder="E.g. $120k+"
                className={inputClassName}
              />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClassName}>
                Preferred Locations (Optional)
              </span>
              <input
                name="preferredLocations"
                placeholder="E.g. New York, London"
                className={inputClassName}
              />
            </label>
          </div>
        </fieldset>

        <div className="border-t border-border pt-8">
          <button
            type="button"
            className="w-full rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Save Profile
          </button>
        </div>
      </form>
    </section>
  );
}
