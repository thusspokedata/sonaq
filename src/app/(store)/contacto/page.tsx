import { EmailReveal } from "@/components/store/EmailReveal";

const CARD = "flex flex-col gap-2 p-6 border border-[#d4c4ae] bg-white";
const LABEL = "text-xs uppercase tracking-widest font-semibold text-[#5a4535]";
const BODY = "text-xs text-[#5a4535]";
const HEADING_FONT = { fontFamily: "var(--font-barlow-condensed), sans-serif" };

export default function ContactoPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4 text-[#b8521a]">
        Contacto
      </p>
      <h1
        className="text-5xl font-black uppercase leading-tight mb-12 text-[#1a0f00]"
        style={HEADING_FONT}
      >
        Hablemos
      </h1>

      <div className="flex flex-col gap-8">
        {/* Teléfono / WhatsApp */}
        <div className={CARD}>
          <p className={LABEL}>WhatsApp / Teléfono</p>
          <a
            href="https://wa.me/5493512881616"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl font-black uppercase hover:underline text-[#b8521a]"
            style={HEADING_FONT}
          >
            +54 9 351 288 1616
          </a>
          <p className={BODY}>Respondemos por WhatsApp en horario comercial.</p>
        </div>

        {/* Email (renderizado solo en cliente para evitar scraping) */}
        <div className={CARD}>
          <p className={LABEL}>Email</p>
          <EmailReveal />
          <p className={BODY}>Para consultas, presupuestos y pedidos a medida.</p>
        </div>

        {/* Ubicación */}
        <div className={CARD}>
          <p className={LABEL}>Dónde estamos</p>
          <p className="text-2xl font-black uppercase text-[#1a0f00]" style={HEADING_FONT}>
            Córdoba, Argentina
          </p>
          <p className={BODY}>12 de Octubre 486, Malagueño, Córdoba.</p>
          <p className={BODY}>Enviamos a todo el país.</p>
        </div>
      </div>
    </div>
  );
}
