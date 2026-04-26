import type { Metadata } from "next";
import { LegalSection } from "@/components/store/LegalSection";

export const metadata: Metadata = { title: "Política de privacidad" };

const HEADING_FONT = { fontFamily: "var(--font-barlow-condensed), sans-serif" };

export default function PrivacidadPage() {
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
          Política de privacidad
        </h1>
        <p className="text-xs text-[#5a4535] mt-3">Última actualización: abril 2026</p>
      </div>

      <LegalSection title="1. Responsable del tratamiento">
        <p>
          <strong>Sonaq</strong> (nombre de fantasía), con domicilio legal en{" "}
          <strong>12 de Octubre 441, Malagueño, Córdoba, República Argentina</strong>. CUIT:{" "}
          <strong>20-26433102-2</strong>.
        </p>
        <p>
          Contacto para consultas sobre privacidad:{" "}
          <a href="https://wa.me/5493512881616" className="underline text-[#b8521a]">
            +54 9 351 288-1616
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recopilamos">
        <p>Al realizar una compra solicitamos los siguientes datos:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Nombre completo</li>
          <li>Dirección de correo electrónico</li>
          <li>Número de teléfono (opcional)</li>
          <li>Dirección postal de envío (calle, ciudad, provincia)</li>
        </ul>
        <p>
          No recopilamos datos de tarjetas de crédito ni información financiera sensible. Los pagos
          electrónicos son procesados por terceros (MercadoPago) bajo sus propias políticas de
          seguridad.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidad del tratamiento">
        <p>Los datos recopilados se utilizan exclusivamente para:</p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Procesar y gestionar el pedido</li>
          <li>Coordinar el envío y la entrega</li>
          <li>Comunicarnos ante cualquier inconveniente con el pedido</li>
        </ul>
        <p>
          No utilizamos los datos para campañas de marketing ni los cedemos a terceros, salvo a
          los servicios de transporte necesarios para completar la entrega.
        </p>
      </LegalSection>

      <LegalSection title="4. Base legal">
        <p>
          El tratamiento se basa en la ejecución del contrato de compraventa y en el cumplimiento
          de las obligaciones legales derivadas de la Ley 24.240 de Defensa del Consumidor. Los
          datos se conservan durante el plazo legal aplicable a operaciones comerciales.
        </p>
      </LegalSection>

      <LegalSection title="5. Seguridad">
        <p>
          Adoptamos medidas técnicas y organizativas razonables para proteger los datos contra
          acceso no autorizado, alteración o destrucción. El sitio opera bajo protocolo HTTPS.
        </p>
      </LegalSection>

      <LegalSection title="6. Tus derechos (Ley 25.326)">
        <p>
          Como titular de los datos, tenés derecho a acceder, rectificar, actualizar y suprimir tu
          información personal. Para ejercerlos, contactate por WhatsApp al{" "}
          <a href="https://wa.me/5493512881616" className="underline text-[#b8521a]">
            +54 9 351 288-1616
          </a>{" "}
          indicando tu nombre y número de orden.
        </p>
        <p>
          La Dirección Nacional de Protección de Datos Personales (DNPDP) es el organismo de
          control competente ante el cual podés presentar una denuncia si considerás que tus
          derechos no han sido respetados.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          El sitio puede utilizar cookies técnicas necesarias para el funcionamiento del carrito.
          No utilizamos cookies de seguimiento ni publicidad de terceros.
        </p>
      </LegalSection>

      <LegalSection title="8. Cambios en esta política">
        <p>
          Podemos actualizar esta política en cualquier momento. La fecha de última actualización
          figura al inicio de este documento. El uso continuado del sitio tras los cambios implica
          la aceptación de la nueva versión.
        </p>
      </LegalSection>
    </div>
  );
}
