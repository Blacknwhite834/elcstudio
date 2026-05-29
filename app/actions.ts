"use server";

import mailer from "nodemailer";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const CONTACT_TO = process.env.CONTACT_TO || "contact@elcstudio.net";

function getField(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

  if (!host || !user || !pass || Number.isNaN(port)) {
    return null;
  }

  return {
    from: process.env.SMTP_FROM || user,
    host,
    pass,
    port,
    secure,
    user,
  };
}

export async function sendContactEmail(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = getField(formData, "name", 120);
  const email = getField(formData, "email", 180);
  const project = getField(formData, "project", 3000);
  const company = getField(formData, "company", 120);

  if (company) {
    return {
      status: "success",
      message: "Thanks, your message was sent.",
    };
  }

  if (!name || !isValidEmail(email) || project.length < 10) {
    return {
      status: "error",
      message: "Please add your name, a valid email, and a few details about the project.",
    };
  }

  const smtp = getSmtpConfig();

  if (!smtp) {
    return {
      status: "error",
      message: "Email sending is not configured yet.",
    };
  }

  const transporter = mailer.createTransport({
    auth: {
      pass: smtp.pass,
      user: smtp.user,
    },
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
  });

  const submittedAt = new Date().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });

  const text = [
    "New elc.studio contact request",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Submitted: ${submittedAt}`,
    "",
    "Project:",
    project,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #050505;">
      <h1 style="font-size: 22px;">New elc.studio contact request</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
      <p><strong>Project:</strong></p>
      <p>${escapeHtml(project).replaceAll("\n", "<br />")}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: smtp.from,
      html,
      replyTo: email,
      subject: `New elc.studio request from ${name}`,
      text,
      to: CONTACT_TO,
    });

    return {
      status: "success",
      message: "Thanks, your message was sent.",
    };
  } catch (error) {
    console.error("Contact form email failed:", error);

    return {
      status: "error",
      message: "The message could not be sent. Please email contact@elcstudio.net directly.",
    };
  }
}
