"use client";

import { useState, type KeyboardEvent } from "react";

import {
  createEmptyEducation,
  createEmptyWorkExperience,
  MAX_EDUCATION_ENTRIES,
  MAX_WORK_EXPERIENCE_ROLES,
  normalizeStringList,
} from "@/lib/profile";
import type {
  Education,
  ProfileActionState,
  ProfileFormValues,
  WorkExperience,
} from "@/types/profile";

const inputClassName =
  "h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-secondary";
const labelClassName =
  "mb-2 block text-xs font-medium uppercase tracking-wide text-text-secondary";
const sectionClassName = "border-t border-border pt-10";
const textareaClassName =
  "w-full resize-y rounded-md border border-border bg-surface px-3 py-3 text-sm leading-5 text-text-primary shadow-sm outline-none placeholder:text-text-muted focus:border-accent focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary";

type ProfileFormProps = {
  actionState: ProfileActionState;
  values: ProfileFormValues;
  onValuesChange: (values: ProfileFormValues) => void;
  highlightedFields: ReadonlySet<string>;
  isPending: boolean;
};

function TagEditor({
  id,
  label,
  optional = false,
  placeholder,
  values,
  onChange,
  disabled,
  highlighted = false,
}: {
  id: string;
  label: string;
  optional?: boolean;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled: boolean;
  highlighted?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function addDraft() {
    const nextValues = normalizeStringList([...values, draft]);
    if (nextValues.length !== values.length) {
      onChange(nextValues);
    }
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addDraft();
    }
  }

  return (
    <div
      className={`rounded-lg transition-shadow sm:col-span-2 ${
        highlighted ? "ring-2 ring-accent/20" : ""
      }`}
    >
      <label htmlFor={id} className={labelClassName}>
        {label}{optional ? " (Optional)" : ""}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={addDraft}
          disabled={disabled || !draft.trim()}
          className="rounded-md bg-surface-tertiary px-4 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </div>
      {values.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2" aria-label={`${label} list`}>
          {values.map((value) => (
            <span
              key={value.toLowerCase()}
              className="inline-flex items-center gap-2 rounded-md bg-surface-tertiary px-3 py-1.5 text-xs font-medium text-text-dark"
            >
              {value}
              <button
                type="button"
                onClick={() =>
                  onChange(values.filter((item) => item !== value))
                }
                disabled={disabled}
                aria-label={`Remove ${value}`}
                className="text-text-secondary hover:text-text-primary disabled:cursor-not-allowed"
              >
                <span aria-hidden="true">×</span>
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProfileForm({
  actionState,
  values,
  onValuesChange,
  highlightedFields,
  isPending,
}: ProfileFormProps) {
  const workExperience = values.workExperience;
  const education = values.education;

  function updateValues(update: Partial<ProfileFormValues>) {
    onValuesChange({ ...values, ...update });
  }

  function setWorkExperience(workExperience: WorkExperience[]) {
    updateValues({ workExperience });
  }

  function setEducation(education: Education[]) {
    updateValues({ education });
  }

  function highlightedClass(field: string): string {
    return highlightedFields.has(field)
      ? "border-accent ring-2 ring-accent/20"
      : "";
  }

  function updateRole(index: number, update: Partial<WorkExperience>) {
    setWorkExperience(
      workExperience.map((role, roleIndex) =>
        roleIndex === index ? { ...role, ...update } : role,
      ),
    );
  }

  function updateEducation(index: number, update: Partial<Education>) {
    setEducation(
      education.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...update } : entry,
      ),
    );
  }

  const submittedRoles = workExperience.filter((role) =>
    [
      role.company,
      role.title,
      role.startDate,
      role.endDate,
      role.responsibilities,
    ].some(Boolean),
  );
  const submittedEducation = education.filter((entry) =>
    Object.values(entry).some(Boolean),
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <input
        type="hidden"
        name="skillsJson"
        value={JSON.stringify(values.skills)}
      />
      <input
        type="hidden"
        name="industriesJson"
        value={JSON.stringify(values.industries)}
      />
      <input
        type="hidden"
        name="workExperienceJson"
        value={JSON.stringify(submittedRoles)}
      />
      <input
        type="hidden"
        name="educationJson"
        value={JSON.stringify(submittedEducation)}
      />

      <div className="border-b border-border pb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          This context is used to accurately represent you in agent
          interactions.
        </p>
      </div>

      <div className="space-y-10 pt-8">
        <fieldset disabled={isPending}>
          <legend className="mb-7 text-base font-semibold text-text-primary">
            Personal Info
          </legend>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label>
              <span className={labelClassName}>Full Name</span>
              <input
                name="fullName"
                value={values.fullName}
                onChange={(event) => updateValues({ fullName: event.target.value })}
                autoComplete="name"
                className={`${inputClassName} ${highlightedClass("fullName")}`}
              />
            </label>
            <label>
              <span className={labelClassName}>Email</span>
              <input
                type="email"
                value={values.email}
                disabled
                className={inputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Phone Number</span>
              <input
                type="tel"
                name="phone"
                value={values.phone}
                onChange={(event) => updateValues({ phone: event.target.value })}
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                className={`${inputClassName} ${highlightedClass("phone")}`}
              />
            </label>
            <label>
              <span className={labelClassName}>Location</span>
              <input
                name="location"
                value={values.location}
                onChange={(event) => updateValues({ location: event.target.value })}
                autoComplete="address-level2"
                placeholder="City, Country"
                className={`${inputClassName} ${highlightedClass("location")}`}
              />
            </label>
            <label>
              <span className={labelClassName}>LinkedIn URL</span>
              <input
                type="url"
                name="linkedinUrl"
                value={values.linkedinUrl}
                onChange={(event) =>
                  updateValues({ linkedinUrl: event.target.value })
                }
                placeholder="https://linkedin.com/in/you"
                className={`${inputClassName} ${highlightedClass("linkedinUrl")}`}
                aria-describedby="linkedinUrl-error"
              />
              {actionState.fieldErrors?.linkedinUrl ? (
                <span id="linkedinUrl-error" className="mt-1 block text-xs text-error">
                  {actionState.fieldErrors.linkedinUrl}
                </span>
              ) : null}
            </label>
            <label>
              <span className={labelClassName}>Portfolio / GitHub</span>
              <input
                type="url"
                name="portfolioUrl"
                value={values.portfolioUrl}
                onChange={(event) =>
                  updateValues({ portfolioUrl: event.target.value })
                }
                placeholder="https://github.com/you"
                className={`${inputClassName} ${highlightedClass("portfolioUrl")}`}
                aria-describedby="portfolioUrl-error"
              />
              {actionState.fieldErrors?.portfolioUrl ? (
                <span id="portfolioUrl-error" className="mt-1 block text-xs text-error">
                  {actionState.fieldErrors.portfolioUrl}
                </span>
              ) : null}
            </label>
            <label>
              <span className={labelClassName}>Work Authorization</span>
              <select
                name="workAuthorization"
                defaultValue={values.workAuthorization}
                className={inputClassName}
              >
                <option value="">Select status</option>
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="visa_required">Visa Required</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset disabled={isPending} className={sectionClassName}>
          <legend className="mb-7 text-base font-semibold text-text-primary">
            Professional Info
          </legend>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClassName}>Current/Recent Job Title</span>
              <input
                name="currentTitle"
                value={values.currentTitle}
                onChange={(event) =>
                  updateValues({ currentTitle: event.target.value })
                }
                className={`${inputClassName} ${highlightedClass("currentTitle")}`}
              />
            </label>
            <label>
              <span className={labelClassName}>Experience Level</span>
              <select
                name="experienceLevel"
                value={values.experienceLevel}
                onChange={(event) =>
                  updateValues({
                    experienceLevel: event.target
                      .value as ProfileFormValues["experienceLevel"],
                  })
                }
                className={`${inputClassName} ${highlightedClass("experienceLevel")}`}
              >
                <option value="">Select level</option>
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
                value={values.yearsExperience}
                onChange={(event) =>
                  updateValues({ yearsExperience: event.target.value })
                }
                min="0"
                step="1"
                className={`${inputClassName} ${highlightedClass("yearsExperience")}`}
              />
            </label>
            <TagEditor
              id="skill"
              label="Skills"
              placeholder="Add a skill"
              values={values.skills}
              onChange={(skills) => updateValues({ skills })}
              disabled={isPending}
              highlighted={highlightedFields.has("skills")}
            />
            <TagEditor
              id="industry"
              label="Industries Worked In"
              optional
              placeholder="E.g. FinTech, Healthcare"
              values={values.industries}
              onChange={(industries) => updateValues({ industries })}
              disabled={isPending}
              highlighted={highlightedFields.has("industries")}
            />
          </div>
        </fieldset>

        <fieldset disabled={isPending} className={sectionClassName}>
          <div className="mb-7 flex items-center justify-between gap-4">
            <legend className="text-base font-semibold text-text-primary">
              Work Experience
            </legend>
            <button
              type="button"
              onClick={() =>
                setWorkExperience([
                  ...workExperience,
                  createEmptyWorkExperience(),
                ])
              }
              disabled={workExperience.length >= MAX_WORK_EXPERIENCE_ROLES}
              className="text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-text-muted"
            >
              +&nbsp; Add role
            </button>
          </div>
          <div className="space-y-5">
            {workExperience.map((role, index) => (
              <div
                key={index}
                className={`rounded-xl border border-border bg-surface-secondary p-5 transition-shadow sm:p-6 ${highlightedClass("workExperience")}`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary">
                    Role {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkExperience(
                        workExperience.length === 1
                          ? [createEmptyWorkExperience()]
                          : workExperience.filter(
                              (_, roleIndex) => roleIndex !== index,
                            ),
                      )
                    }
                    className="text-xs font-medium text-text-secondary hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  <label>
                    <span className={labelClassName}>Company Name</span>
                    <input
                      value={role.company}
                      onChange={(event) =>
                        updateRole(index, { company: event.target.value })
                      }
                      className={inputClassName}
                    />
                  </label>
                  <label>
                    <span className={labelClassName}>Job Title</span>
                    <input
                      value={role.title}
                      onChange={(event) =>
                        updateRole(index, { title: event.target.value })
                      }
                      className={inputClassName}
                    />
                  </label>
                  <label>
                    <span className={labelClassName}>Start Date</span>
                    <input
                      value={role.startDate}
                      onChange={(event) =>
                        updateRole(index, { startDate: event.target.value })
                      }
                      placeholder="January 2022"
                      className={inputClassName}
                    />
                  </label>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label
                        htmlFor={`endDate-${index}`}
                        className="text-xs font-medium uppercase tracking-wide text-text-secondary"
                      >
                        End Date
                      </label>
                      <label className="flex items-center gap-2 text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={role.currentlyWorking}
                          onChange={(event) =>
                            updateRole(index, {
                              currentlyWorking: event.target.checked,
                              ...(event.target.checked ? { endDate: "" } : {}),
                            })
                          }
                          className="size-4 accent-accent"
                        />
                        Currently working here
                      </label>
                    </div>
                    <input
                      id={`endDate-${index}`}
                      value={role.endDate}
                      onChange={(event) =>
                        updateRole(index, { endDate: event.target.value })
                      }
                      placeholder="December 2024"
                      disabled={role.currentlyWorking}
                      className={inputClassName}
                    />
                  </div>
                  <label className="sm:col-span-2">
                    <span className={labelClassName}>Key Responsibilities</span>
                    <textarea
                      value={role.responsibilities}
                      onChange={(event) =>
                        updateRole(index, {
                          responsibilities: event.target.value,
                        })
                      }
                      rows={4}
                      className={textareaClassName}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          {actionState.fieldErrors?.workExperience ? (
            <p className="mt-2 text-xs text-error">
              {actionState.fieldErrors.workExperience}
            </p>
          ) : null}
        </fieldset>

        <fieldset disabled={isPending} className={sectionClassName}>
          <div className="mb-7 flex items-center justify-between gap-4">
            <legend className="text-base font-semibold text-text-primary">
              Education
            </legend>
            <button
              type="button"
              onClick={() =>
                setEducation([...education, createEmptyEducation()])
              }
              disabled={education.length >= MAX_EDUCATION_ENTRIES}
              className="text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-text-muted"
            >
              +&nbsp; Add education
            </button>
          </div>
          <div className="space-y-5">
            {education.map((entry, index) => (
              <div
                key={index}
                className={`rounded-xl border border-border bg-surface-secondary p-5 transition-shadow sm:p-6 ${highlightedClass("education")}`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm font-medium text-text-primary">
                    Education {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setEducation(
                        education.length === 1
                          ? [createEmptyEducation()]
                          : education.filter(
                              (_, entryIndex) => entryIndex !== index,
                            ),
                      )
                    }
                    className="text-xs font-medium text-text-secondary hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  <label>
                    <span className={labelClassName}>Degree</span>
                    <select
                      value={entry.degree}
                      onChange={(event) =>
                        updateEducation(index, { degree: event.target.value })
                      }
                      className={inputClassName}
                    >
                      <option value="">Select degree</option>
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
                      value={entry.fieldOfStudy}
                      onChange={(event) =>
                        updateEducation(index, {
                          fieldOfStudy: event.target.value,
                        })
                      }
                      className={inputClassName}
                    />
                  </label>
                  <label>
                    <span className={labelClassName}>Institution Name</span>
                    <input
                      value={entry.institution}
                      onChange={(event) =>
                        updateEducation(index, {
                          institution: event.target.value,
                        })
                      }
                      placeholder="E.g. State University"
                      className={inputClassName}
                    />
                  </label>
                  <label>
                    <span className={labelClassName}>Graduation Year</span>
                    <input
                      inputMode="numeric"
                      value={entry.graduationYear}
                      onChange={(event) =>
                        updateEducation(index, {
                          graduationYear: event.target.value,
                        })
                      }
                      placeholder="YYYY"
                      aria-describedby={
                        actionState.fieldErrors?.education
                          ? "education-error"
                          : undefined
                      }
                      className={inputClassName}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          {actionState.fieldErrors?.education ? (
            <p id="education-error" className="mt-2 text-xs text-error">
              {actionState.fieldErrors.education}
            </p>
          ) : null}
        </fieldset>

        <fieldset disabled={isPending} className={sectionClassName}>
          <legend className="mb-7 text-base font-semibold text-text-primary">
            Job Preferences
          </legend>
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={labelClassName}>Job Titles Seeking</span>
              <input
                name="jobTitlesSeeking"
                defaultValue={values.jobTitlesSeeking.join(", ")}
                placeholder="Frontend Engineer, React Developer"
                className={inputClassName}
              />
            </label>
            <label>
              <span className={labelClassName}>Remote Preference</span>
              <select
                name="remotePreference"
                defaultValue={values.remotePreference}
                className={inputClassName}
              >
                <option value="">Select preference</option>
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
                defaultValue={values.salaryExpectation}
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
                defaultValue={values.preferredLocations.join(", ")}
                placeholder="E.g. New York, London"
                className={inputClassName}
              />
            </label>
          </div>
        </fieldset>

        <div className="border-t border-border pt-8">
          {actionState.status !== "idle" ? (
            <div
              role={actionState.status === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`mb-4 rounded-md border px-4 py-3 text-sm ${
                actionState.status === "error"
                  ? "border-error/30 bg-error/10 text-error"
                  : actionState.isComplete
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-warning/30 bg-warning/10 text-text-primary"
              }`}
            >
              {actionState.message}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
          >
            {isPending ? "Saving Profile…" : "Save Profile"}
          </button>
        </div>
      </div>
    </section>
  );
}
