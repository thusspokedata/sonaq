import type { Metadata } from "next";
import { LegalSection } from "@/components/store/LegalSection";

export const metadata: Metadata = { title: "Términos y condiciones" };

const HEADING_FONT = { fontFamily: "var(--font-barlow-condensed), sans-serif" };

export default function TerminosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col gap-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4 text-[#b8521a]">
          Legal
        </p>
        <h1
          className="text-5xl font-black uppercase leading-tight text-[#1a0f00]"
          style={HEADING_FONT}
        >
          Términos y condiciones
        </h1>
        <p className="text-xs text-[#5a4535] mt-3">Última actualización: abril 2026</p>
      </div>

      <LegalSection title="1. Datos del vendedor">
        <p>
          <strong>Sonaq</strong> es un nombre de fantasía. Titular: persona física con domicilio
          legal en <strong>12 de Octubre 441, Malagueño, Córdoba, República Argentina</strong>.
          CUIT: <strong>20-26433102-2</strong>.
        </p>
        <p>
          Contacto:{" "}
          <a href="https://wa.me/5493512881616" className="underline text-[#b8521a]">
            +54 9 351 288-1616
          </a>{" "}
          (WhatsApp) o a través del formulario en{" "}
          <a href="/contacto" className="underline text-[#b8521a]">
            sonaq.com.ar/contacto
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto">
        <p>
          Sonaq comercializa muebles y accesorios para guitarras fabricados artesanalmente. Los
          presentes términos regulan la relación entre Sonaq y el comprador en toda compra
          realizada a través del sitio web.
        </p>
      </LegalSection>

      <LegalSection title="3. Proceso de compra">
        <p>
          El cliente selecciona los productos deseados, completa el formulario de datos de contacto
          y envío, y confirma el pedido. La orden se genera al enviar el formulario; Sonaq la
          confirma por email.
        </p>
        <p>
          Los precios publicados incluyen IVA y están expresados en pesos argentinos (ARS). Sonaq
          se reserva el derecho de modificar precios sin previo aviso; el precio válido es el
          vigente al momento de confirmar el pedido.
        </p>
      </LegalSection>

      <LegalSection title="4. Formas de pago">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>
            <strong>Transferencia bancaria:</strong> los datos se envían por email tras confirmar el
            pedido. El pedido se procesa una vez acreditado el pago.
          </li>
          <li>
            <strong>MercadoPago:</strong> próximamente disponible.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Envíos y entregas">
        <p>
          Enviamos a todo el territorio argentino. Los plazos y costos de envío se acuerdan con el
          cliente según destino y producto. Sonaq no se responsabiliza por demoras imputables al
          correo o empresa de transporte.
        </p>
      </LegalSection>

      <LegalSection title="6. Derecho de arrepentimiento (Ley 24.240, art. 34)">
        <p>
          El consumidor puede revocar la aceptación dentro de los <strong>10 días corridos</strong>{" "}
          contados desde la entrega del producto o la celebración del contrato, lo que ocurra
          después. Para ejercer este derecho, contactarse por WhatsApp al{" "}
          <a href="https://wa.me/5493512881616" className="underline text-[#b8521a]">
            +54 9 351 288-1616
          </a>{" "}
          indicando el número de orden.
        </p>
        <p>
          El reintegro se realiza por el mismo medio de pago utilizado. Los gastos de devolución
          del producto son a cargo del vendedor cuando la revocación se ejerce dentro del plazo
          legal.
        </p>
      </LegalSection>

      <LegalSection title="7. Garantías">
        <p>
          Los productos cuentan con la garantía legal de <strong>6 meses</strong> establecida por
          la Ley 24.240 para defectos de fabricación. No cubre daños por uso inadecuado o
          desgaste normal.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitación de responsabilidad">
        <p>
          Sonaq no se responsabiliza por daños indirectos, lucro cesante ni perjuicios derivados
          del uso o imposibilidad de uso de los productos adquiridos, más allá de lo establecido
          por la legislación argentina vigente.
        </p>
      </LegalSection>

      <LegalSection title="9. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República Argentina. Para cualquier
          controversia, las partes se someten a los tribunales ordinarios de la ciudad de Córdoba.
        </p>
      </LegalSection>
    </div>
  );
}
