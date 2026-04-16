export const metadata = { title: "Sonaq Studio" };

// El Studio maneja su propio DOM — evitamos conflictos con el root layout
// usando un fragment en lugar de html/body
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
