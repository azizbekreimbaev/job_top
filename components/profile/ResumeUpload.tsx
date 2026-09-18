"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import { uploadResume } from "@/actions/profile";
import { hasPdfFileName, MAX_RESUME_SIZE } from "@/lib/resume";
import type {
  ProfileExtractionMode,
  ResumeGenerationResponse,
  ResumeUploadActionState,
} from "@/types/profile";

const MINIMUM_UPLOAD_STATE_MS = 1200;

type ResumeUploadProps = {
  disabled: boolean;
  error?: string;
  hasResume: boolean;
  onBusyChange: (isBusy: boolean) => void;
  onExtract: (
    mode: ProfileExtractionMode,
  ) => Promise<{ changedFields: string[]; warnings: string[] }>;
  onResumeUploaded: () => void;
  canUndoExtraction: boolean;
  onUndoExtraction: () => void;
  profileHasUnsavedChanges: boolean;
  generationMissingFields: string[];
};

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function getClientValidationError(file: File): string | null {
  if (!hasPdfFileName(file.name)) {
    return "Only PDF files can be uploaded.";
  }
  if (file.size > MAX_RESUME_SIZE) {
    return "Choose a PDF that is 5 MB or smaller.";
  }
  return null;
}

export function ResumeUpload({
  disabled,
  error,
  hasResume,
  onBusyChange,
  onExtract,
  onResumeUploaded,
  canUndoExtraction,
  onUndoExtraction,
  profileHasUnsavedChanges,
  generationMissingFields,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadState, setUploadState] =
    useState<ResumeUploadActionState | null>(null);
  const [hasUploadedResume, setHasUploadedResume] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isConfirmingReplace, setIsConfirmingReplace] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirmingGeneration, setIsConfirmingGeneration] = useState(false);
  const [hasGeneratedResume, setHasGeneratedResume] = useState(false);
  const [generationState, setGenerationState] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);
  const [extractionState, setExtractionState] = useState<{
    status: "success" | "error";
    message: string;
    warnings: string[];
  } | null>(null);

  const resumeIsAvailable = hasResume || hasUploadedResume || hasGeneratedResume;
  const operationInProgress = isUploading || isExtracting || isGenerating;
  const visibleError =
    uploadState?.status === "error" ? uploadState.message : error;

  async function uploadFile(file: File): Promise<void> {
    const validationError = getClientValidationError(file);
    if (validationError) {
      setSelectedFileName("");
      setUploadState({ status: "error", message: validationError });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    const startedAt = Date.now();
    setSelectedFileName(file.name);
    setUploadState(null);
    setIsUploading(true);
    onBusyChange(true);

    try {
      const formData = new FormData();
      formData.set("resume", file);
      const result = await uploadResume(formData);
      const remainingTime = Math.max(
        0,
        MINIMUM_UPLOAD_STATE_MS - (Date.now() - startedAt),
      );
      if (remainingTime > 0) {
        await wait(remainingTime);
      }
      setUploadState(result);
      if (result.status === "success") {
        setHasUploadedResume(true);
        setHasGeneratedResume(false);
        setGenerationState(null);
        setIsConfirmingGeneration(false);
        setExtractionState(null);
        setIsConfirmingReplace(false);
        onResumeUploaded();
      }
      if (result.status === "error") {
        setSelectedFileName("");
      }
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setIsUploading(false);
      onBusyChange(false);
    }
  }

  async function runExtraction(mode: ProfileExtractionMode): Promise<void> {
    setIsConfirmingReplace(false);
    setExtractionState(null);
    setIsExtracting(true);
    onBusyChange(true);
    try {
      const result = await onExtract(mode);
      const count = result.changedFields.length;
      setExtractionState({
        status: "success",
        message:
          count > 0
            ? `${count} profile ${count === 1 ? "section" : "sections"} populated. Review the highlighted fields, then save your profile.`
            : "No empty profile fields could be populated from this resume.",
        warnings: result.warnings,
      });
    } catch (error) {
      setExtractionState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "AI extraction failed. Your profile was not changed.",
        warnings: [],
      });
    } finally {
      setIsExtracting(false);
      onBusyChange(false);
    }
  }

  async function runGeneration(): Promise<void> {
    if (profileHasUnsavedChanges || generationMissingFields.length > 0) {
      setIsConfirmingGeneration(false);
      setGenerationState({
        status: "error",
        message: profileHasUnsavedChanges
          ? "Save your profile changes before generating a resume."
          : "Complete and save the required resume fields before generating.",
      });
      return;
    }

    setIsConfirmingGeneration(false);
    setGenerationState(null);
    setIsGenerating(true);
    onBusyChange(true);

    let failureMessage =
      "Resume generation failed. Your current resume was not changed.";
    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as ResumeGenerationResponse;
      if (!response.ok || !result.success) {
        failureMessage = result.success
          ? failureMessage
          : result.error;
        throw new Error("Resume generation request failed.");
      }

      setHasGeneratedResume(true);
      setHasUploadedResume(false);
      setSelectedFileName("resume.pdf");
      setGenerationState({ status: "success", message: result.message });
      setExtractionState(null);
      onResumeUploaded();
    } catch {
      setGenerationState({
        status: "error",
        message: failureMessage,
      });
    } finally {
      setIsGenerating(false);
      onBusyChange(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (file) {
      void uploadFile(file);
    }
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    if (disabled || operationInProgress) {
      return;
    }
    dragDepth.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (disabled || operationInProgress) {
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file) {
      void uploadFile(file);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Upload an existing resume to auto-fill the profile, or generate a new
        tailored one from your details below.
      </p>

      <div
        onDragEnter={handleDragEnter}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-6 flex min-h-64 flex-col items-center justify-center rounded-xl border-dashed px-6 py-10 text-center transition-all duration-200 ${
          isDragging
            ? "scale-[1.01] border-2 border-accent bg-accent-muted shadow-md ring-4 ring-accent/15"
            : "border border-border-muted bg-surface-secondary"
        } ${disabled || operationInProgress ? "cursor-not-allowed opacity-75" : ""}`}
      >
        <div
          className={`grid size-14 place-items-center rounded-full border shadow-sm transition-all ${
            isDragging
              ? "border-accent bg-accent shadow-md"
              : "border-border bg-surface"
          }`}
        >
          {isUploading ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-7 animate-spin fill-none stroke-accent"
              strokeWidth="2"
            >
              <path d="M20 12a8 8 0 1 1-5.6-7.63" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`size-7 fill-none ${
                isDragging ? "stroke-accent-foreground" : "stroke-accent"
              }`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 11a3.5 3.5 0 0 1-.5 7" />
              <path d="m9 13 3-3 3 3" />
              <path d="M12 10v8" />
            </svg>
          )}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || operationInProgress}
          className="mt-5 text-base font-semibold text-text-primary underline-offset-4 hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:no-underline"
        >
          {isDragging
            ? "Drop your PDF to upload"
            : isUploading
              ? "Uploading resume…"
              : "Click to upload or drag and drop"}
        </button>
        <p className="mt-1 text-sm text-text-secondary">
          PDF files only. Maximum file size 5 MB.
        </p>

        <input
          ref={inputRef}
          type="file"
          name="resumePicker"
          accept="application/pdf,.pdf"
          disabled={disabled || operationInProgress}
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="mt-5 min-h-12 w-full max-w-md" aria-live="polite">
          {isUploading ? (
            <div className="rounded-lg border border-accent/30 bg-surface px-4 py-3 text-left shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-text-primary">
                  {selectedFileName}
                </span>
                <span className="shrink-0 text-accent">Uploading…</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent-muted">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-accent" />
              </div>
            </div>
          ) : resumeIsAvailable ? (
            <a
              href="/api/resume/view"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-success/30 bg-success-lightest px-4 py-3 text-left shadow-sm transition-colors hover:border-success focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface text-success shadow-sm">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 fill-none stroke-current"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                >
                  <path d="M7 3h7l4 4v14H7z" />
                  <path d="M14 3v5h5" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-success-foreground">
                  {hasGeneratedResume
                    ? "Resume generated successfully"
                    : "Resume uploaded successfully"}
                </span>
                <span className="block truncate text-xs text-text-secondary group-hover:text-text-primary">
                  {selectedFileName || "resume.pdf"} · Click to review
                </span>
              </span>
              <span aria-hidden="true" className="text-success">
                ↗
              </span>
            </a>
          ) : null}
        </div>

        {visibleError ? (
          <p className="mt-3 text-sm text-error" role="alert">
            {visibleError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || operationInProgress}
          className="mt-5 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resumeIsAvailable ? "Replace Resume" : "Select Resume"}
        </button>
      </div>

      {resumeIsAvailable ? (
        <div className="mt-6 rounded-xl border border-border bg-surface-secondary p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Fill profile with AI
              </h3>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                Extract supported details for your review. Nothing is saved until
                you select Save Profile.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void runExtraction("fill-empty")}
                disabled={disabled || operationInProgress}
                className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60"
              >
                {isExtracting ? "Extracting profile…" : "Extract & Fill Empty Fields"}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingReplace(true)}
                disabled={disabled || operationInProgress}
                className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-tertiary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Replace Existing Fields
              </button>
            </div>
          </div>

          {isConfirmingReplace ? (
            <div
              className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4"
              role="alertdialog"
              aria-label="Confirm profile field replacement"
            >
              <p className="text-sm text-text-primary">
                Replace supported profile fields with values found in this
                resume? Missing resume details will not erase your data.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void runExtraction("replace")}
                  className="rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-foreground hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Confirm replacement
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingReplace(false)}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {extractionState ? (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                extractionState.status === "success"
                  ? "border-success/30 bg-success-lightest text-success-foreground"
                  : "border-error/30 bg-error/10 text-error"
              }`}
              role={extractionState.status === "error" ? "alert" : "status"}
              aria-live="polite"
            >
              <p>{extractionState.message}</p>
              {extractionState.warnings.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-text-secondary">
                  {extractionState.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {canUndoExtraction ? (
            <button
              type="button"
              onClick={() => {
                onUndoExtraction();
                setExtractionState({
                  status: "success",
                  message: "Extraction changes were undone.",
                  warnings: [],
                });
              }}
              disabled={disabled || operationInProgress}
              className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              Undo Extraction
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">
              Need a fresh document based on your saved profile?
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              AI polishes your summary and experience while preserving your facts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (resumeIsAvailable) {
                setIsConfirmingGeneration(true);
              } else {
                void runGeneration();
              }
            }}
            disabled={
              disabled ||
              operationInProgress ||
              profileHasUnsavedChanges ||
              generationMissingFields.length > 0
            }
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`size-4 fill-none stroke-current ${isGenerating ? "animate-pulse" : ""}`}
              strokeWidth="1.8"
              strokeLinejoin="round"
            >
              <path d="M7 3h7l4 4v14H7z" />
              <path d="M14 3v5h5" />
              <path d="M10 12h5M10 16h5" />
            </svg>
            {isGenerating ? "Generating resume…" : "Generate Resume from Profile"}
          </button>
        </div>

        {profileHasUnsavedChanges ? (
          <p className="mt-3 text-sm text-warning" role="status">
            Save your profile changes before generating a resume.
          </p>
        ) : generationMissingFields.length > 0 ? (
          <div
            className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text-primary"
            role="status"
          >
            Add and save these resume fields first: {generationMissingFields.join(", ")}.
          </div>
        ) : null}

        {isConfirmingGeneration ? (
          <div
            className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4"
            role="alertdialog"
            aria-label="Confirm resume replacement"
          >
            <p className="text-sm text-text-primary">
              Generate a new resume and replace the current PDF? The previous file
              cannot be recovered.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void runGeneration()}
                disabled={
                  disabled ||
                  operationInProgress ||
                  profileHasUnsavedChanges ||
                  generationMissingFields.length > 0
                }
                className="rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-foreground hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                Confirm generation
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingGeneration(false)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {generationState ? (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              generationState.status === "success"
                ? "border-success/30 bg-success-lightest text-success-foreground"
                : "border-error/30 bg-error/10 text-error"
            }`}
            role={generationState.status === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {generationState.message}
            {generationState.status === "success" ? (
              <a
                href="/api/resume/view"
                target="_blank"
                rel="noreferrer"
                className="ml-2 font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Review PDF
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
