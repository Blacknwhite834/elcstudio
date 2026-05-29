"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContactEmail, type ContactFormState } from "../actions";

const initialState: ContactFormState = {
  status: "idle",
  message: "",
};

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form
      ref={formRef}
      className="elc-contact-form"
      action={formAction}
      aria-describedby={state.message ? "contact-form-status" : undefined}
      data-cta-item
    >
      <label>
        <span>Name</span>
        <input name="name" type="text" autoComplete="name" placeholder="Your name" required />
      </label>
      <label>
        <span>Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          required
        />
      </label>
      <label className="elc-form-hp" aria-hidden="true">
        <span>Company</span>
        <input name="company" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <label>
        <span>Project</span>
        <textarea
          name="project"
          rows={4}
          placeholder="Website, social presence, or both"
          minLength={10}
          required
        />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Start the conversation"}
      </button>
      {state.message ? (
        <p
          id="contact-form-status"
          className={`elc-contact-status is-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
