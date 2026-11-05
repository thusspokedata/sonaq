const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;

export function safeAdminCallback(value: string | null | undefined): string {
  if (!value) return "/admin";

  try {
    const u = new URL(value, "http://localhost");
    const hasDotSegment = value.split("/").some((segment) => segment === "." || segment === "..");

    if (
      u.origin !== "http://localhost" ||
      (u.pathname !== "/admin" && !u.pathname.startsWith("/admin/")) ||
      u.pathname.includes("//") ||
      value.includes("\\") ||
      CONTROL_CHARACTERS.test(value) ||
      hasDotSegment
    ) {
      return "/admin";
    }

    return u.pathname + u.search + u.hash;
  } catch {
    return "/admin";
  }
}
