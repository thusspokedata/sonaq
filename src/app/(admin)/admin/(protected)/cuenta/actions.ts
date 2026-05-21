"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type CuentaState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const emailSchema = z.object({
  newEmail: z.string().email("Email inválido").max(255),
  currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
});

export async function changeEmail(_: CuentaState, formData: FormData): Promise<CuentaState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: "error", message: "No autenticado" };

  const parsed = emailSchema.safeParse({
    newEmail: formData.get("newEmail"),
    currentPassword: formData.get("currentPassword"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const { newEmail, currentPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) return { status: "error", message: "Usuario no encontrado" };

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { status: "error", message: "Contraseña actual incorrecta" };

  if (newEmail === user.email) {
    return { status: "error", message: "El nuevo email es igual al actual" };
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) return { status: "error", message: "Ese email ya está en uso" };

  await prisma.user.update({ where: { id: userId }, data: { email: newEmail } });

  return { status: "success", message: "Email actualizado. Cerrá sesión y volvé a ingresar." };
}

export async function changePassword(_: CuentaState, formData: FormData): Promise<CuentaState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { status: "error", message: "No autenticado" };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    return { status: "error", message: "Las contraseñas nuevas no coinciden" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) return { status: "error", message: "Usuario no encontrado" };

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return { status: "error", message: "Contraseña actual incorrecta" };

  if (await bcrypt.compare(newPassword, user.password)) {
    return { status: "error", message: "La nueva contraseña debe ser distinta a la actual" };
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { status: "success", message: "Contraseña actualizada correctamente." };
}
