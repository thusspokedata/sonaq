const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/;

export function safeAdminCallback(value: string | null | undefined): string {
  if (
    !value ||
    (value !== "/admin" && !value.startsWith("/admin/")) ||
    value.includes("//") ||
    value.includes("\\") ||
    CONTROL_CHARACTERS.test(value)
  ) {
    return "/admin";
  }

  const hasDotSegment = value.split("/").some((segment) => segment === "." || segment === "..");
  return hasDotSegment ? "/admin" : value;
}
