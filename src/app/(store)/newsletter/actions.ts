"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { Resend } from "resend";
import { checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
});

export type NewsletterState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "duplicate" }
  | { status: "error" };

export async function subscribeToNewsletter(
  _prev: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error" };

  // Rate limit: 3 intentos por IP en 10 minutos
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(`newsletter:${ip}`, 3, 10 * 60 * 1000)) {
    return { status: "error" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY no configurado");
    return { status: "error" };
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.error("RESEND_AUDIENCE_ID no configurado");
    return { status: "error" };
  }

  const resend = new Resend(apiKey);

  try {
    await resend.contacts.create({
      email: parsed.data.email,
      audienceId,
      unsubscribed: false,
    });
    return { status: "success" };
  } catch (err: unknown) {
    // Resend devuelve 409 cuando el contacto ya existe
    if (
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      (err as { statusCode: number }).statusCode === 409
    ) {
      return { status: "duplicate" };
    }
    const message = err instanceof Error ? err.message : "unknown";
    const code = (err as { code?: string }).code;
    console.error("Error al suscribir newsletter:", { message, code });
    return { status: "error" };
  }
}
