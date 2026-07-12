"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendContactEmail, type ContactFormState } from "../actions";
import ArrowIcon from "./arrow-icon";

const initialState: ContactFormState = {
  status: "idle",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type StepConfig = {
  name: "name" | "email" | "project";
  label: string;
  placeholder: string;
  type: string;
  autoComplete?: string;
};

const steps: StepConfig[] = [
  { name: "name", label: "Name", placeholder: "Your name", type: "text", autoComplete: "name" },
  {
    name: "email",
    label: "Email",
    placeholder: "Your email",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "project",
    label: "Project",
    placeholder: "Your project — website, social presence, or both",
    type: "text",
  },
];

// Client-side mirrors of the server action's validation rules.
function stepError(step: number, value: string): string | null {
  const trimmed = value.trim();
  if (step === 0 && !trimmed) return "Please tell us your name.";
  if (step === 1 && !EMAIL_PATTERN.test(trimmed)) return "Please enter a valid email address.";
  if (step === 2 && trimmed.length < 10) {
    return "Tell us a little more about your project (at least 10 characters).";
  }
  return null;
}

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [seenStatus, setSeenStatus] = useState(state.status);

  // Render-time reaction to the action result (avoids effect-driven setState).
  if (state.status !== seenStatus) {
    setSeenStatus(state.status);
    if (state.status === "success") {
      setStep(steps.length);
      setError(null);
    }
  }

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const advance = () => {
    const value = inputRefs.current[step]?.value ?? "";
    const validation = stepError(step, value);
    if (validation) {
      setError(validation);
      inputRefs.current[step]?.focus();
      return;
    }
    setError(null);
    const next = Math.min(step + 1, steps.length - 1);
    setStep(next);
    requestAnimationFrame(() => inputRefs.current[next]?.focus());
  };

  const isLastStep = step === steps.length - 1;
  const isDone = step >= steps.length;

  return (
    <form
      action={formAction}
      aria-describedby={state.message || error ? "contact-form-status" : undefined}
      className="elc-form"
      onKeyDown={(event) => {
        if (event.key === "Enter" && !isLastStep && !isDone) {
          event.preventDefault();
          advance();
        }
      }}
      onSubmit={(event) => {
        const validation = stepError(2, inputRefs.current[2]?.value ?? "");
        if (validation) {
          event.preventDefault();
          setError(validation);
          inputRefs.current[2]?.focus();
        }
      }}
      ref={formRef}
    >
      <div className="elc-form-shell">
        <div className="elc-form-fields">
          {steps.map((field, index) => (
            <label
              className="elc-form-field"
              data-active={!isDone && index === step ? "true" : "false"}
              key={field.name}
            >
              <span className="elc-sr-only">{field.label}</span>
              <input
                autoComplete={field.autoComplete}
                name={field.name}
                placeholder={field.placeholder}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                tabIndex={!isDone && index === step ? 0 : -1}
                type={field.type}
              />
            </label>
          ))}
          {isDone ? (
            <p className="elc-form-done" role="status">
              {state.message}
            </p>
          ) : null}
        </div>

        <label aria-hidden="true" className="elc-form-hp">
          <span>Company</span>
          <input autoComplete="off" name="company" tabIndex={-1} type="text" />
        </label>

        {isDone ? (
          <button className="elc-pill elc-form-continue" disabled type="button">
            Sent
            <ArrowIcon className="elc-pill-icon" />
          </button>
        ) : (
          <button
            className="elc-pill elc-form-continue"
            disabled={pending}
            onClick={isLastStep ? undefined : (event) => {
              event.preventDefault();
              advance();
            }}
            type={isLastStep ? "submit" : "button"}
          >
            {pending ? "Sending..." : isLastStep ? "Send" : "Continue"}
            <ArrowIcon className="elc-pill-icon" />
          </button>
        )}

        <div aria-hidden="true" className="elc-form-progress">
          {[...steps, { name: "done" }].map((item, index) => (
            <span
              className="elc-form-dot"
              data-active={index === Math.min(step, steps.length) ? "true" : "false"}
              key={item.name}
            />
          ))}
        </div>
        <span className="elc-sr-only" role="status">
          {isDone ? "Message sent" : `Step ${step + 1} of ${steps.length}`}
        </span>
      </div>

      {(error || (state.message && !isDone)) ? (
        <p
          className={`elc-form-status is-${error ? "error" : state.status}`}
          id="contact-form-status"
          role={error || state.status === "error" ? "alert" : "status"}
        >
          {error ?? state.message}
        </p>
      ) : null}
    </form>
  );
}
