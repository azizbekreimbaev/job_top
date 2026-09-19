"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { saveProfile } from "@/actions/profile";
import { ProfileAttention } from "@/components/profile/ProfileAttention";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import {
  cloneProfileValues,
  mergeProfileExtraction,
} from "@/lib/profile-extraction";
import {
  createEmptyEducation,
  createEmptyWorkExperience,
} from "@/lib/profile";
import {
  getResumeGenerationEligibility,
  profileMatchesSavedState,
} from "@/lib/resume";
import type {
  ProfileExtractionMode,
  ProfileExtractionResponse,
  ProfileCompletion,
  ProfileFormValues,
} from "@/types/profile";

type ProfileEditorProps = {
  initialCompletion: ProfileCompletion;
  initialValues: ProfileFormValues;
};

function createEditableProfileValues(
  profile: ProfileFormValues,
): ProfileFormValues {
  const values = cloneProfileValues(profile);
  return {
    ...values,
    workExperience:
      values.workExperience.length > 0
        ? values.workExperience
        : [createEmptyWorkExperience()],
    education:
      values.education.length > 0
        ? values.education
        : [createEmptyEducation()],
  };
}

export function ProfileEditor({
  initialCompletion,
  initialValues,
}: ProfileEditorProps) {
  const [isResumeBusy, setIsResumeBusy] = useState(false);
  const [hasUserEditedForm, setHasUserEditedForm] = useState(false);
  const [values, setValues] = useState<ProfileFormValues>(() =>
    createEditableProfileValues(initialValues),
  );
  const [savedValues, setSavedValues] = useState<ProfileFormValues>(() =>
    createEditableProfileValues(initialValues),
  );
  const [undoSnapshot, setUndoSnapshot] =
    useState<ProfileFormValues | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(
    new Set(),
  );
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, formAction, isPending] = useActionState(saveProfile, {
    ...initialCompletion,
    status: "idle",
    message: "",
  });
  const valuesRef = useRef(values);
  const lastHandledActionState = useRef(state);
  const formIsPending = isPending || isResumeBusy;
  const profileHasUnsavedChanges =
    hasUserEditedForm || !profileMatchesSavedState(values, savedValues);
  const generationEligibility = getResumeGenerationEligibility(savedValues);

  function clearExtractionState(): void {
    setUndoSnapshot(null);
    setHighlightedFields(new Set());
    if (highlightTimer.current) {
      clearTimeout(highlightTimer.current);
      highlightTimer.current = null;
    }
  }

  useEffect(
    () => () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    },
    [],
  );

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    if (
      lastHandledActionState.current !== state &&
      state.status === "success"
    ) {
      const persistedValues = createEditableProfileValues(
        state.savedValues ?? valuesRef.current,
      );
      setValues(persistedValues);
      setSavedValues(cloneProfileValues(persistedValues));
      setHasUserEditedForm(false);
    }
    lastHandledActionState.current = state;
  }, [state]);

  function handleFormChange(event: FormEvent<HTMLFormElement>): void {
    const target = event.target;
    if (target instanceof HTMLInputElement && target.name === "resumePicker") {
      return;
    }
    setHasUserEditedForm(true);
  }

  async function extractProfile(
    mode: ProfileExtractionMode,
  ): Promise<{ changedFields: string[]; warnings: string[] }> {
    const response = await fetch("/api/resume/extract", {
      method: "POST",
      headers: { Accept: "application/json" },
    });
    const result = (await response.json()) as ProfileExtractionResponse;
    if (!response.ok || !result.success) {
      throw new Error(
        result.success ? "Profile extraction failed." : result.error,
      );
    }

    const snapshot = cloneProfileValues(values);
    const merged = mergeProfileExtraction(values, result.data, mode);
    setValues(merged.values);
    setUndoSnapshot(
      merged.changedFields.length > 0 ? snapshot : null,
    );
    setHighlightedFields(new Set(merged.changedFields));
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(
      () => setHighlightedFields(new Set()),
      5000,
    );
    return { changedFields: merged.changedFields, warnings: result.warnings };
  }

  function undoExtraction(): void {
    if (!undoSnapshot) return;
    setValues(cloneProfileValues(undoSnapshot));
    clearExtractionState();
  }

  return (
    <>
      <ProfileAttention
        completionPercentage={state.completionPercentage}
        isComplete={state.isComplete}
        missingFields={state.missingFields}
      />
      <form
        action={formAction}
        onChange={handleFormChange}
        onSubmit={clearExtractionState}
        className="space-y-8"
      >
        <ResumeUpload
          disabled={isPending}
          error={state.fieldErrors?.resume}
          hasResume={
            Boolean(initialValues.resumePdfKey) || state.resumeUploaded === true
          }
          onBusyChange={setIsResumeBusy}
          onExtract={extractProfile}
          onResumeUploaded={clearExtractionState}
          canUndoExtraction={Boolean(undoSnapshot)}
          onUndoExtraction={undoExtraction}
          profileHasUnsavedChanges={profileHasUnsavedChanges}
          generationMissingFields={generationEligibility.missingFields}
        />
        <ProfileForm
          actionState={state}
          values={values}
          onValuesChange={setValues}
          highlightedFields={highlightedFields}
          isPending={formIsPending}
        />
      </form>
    </>
  );
}
