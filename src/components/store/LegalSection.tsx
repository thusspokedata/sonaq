export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2
        className="text-xl font-black uppercase text-[#1a0f00]"
        style={{ fontFamily: "var(--font-barlow-condensed), sans-serif" }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-2 text-sm text-[#5a4535] leading-relaxed">{children}</div>
    </section>
  );
}
