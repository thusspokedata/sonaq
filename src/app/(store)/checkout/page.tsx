import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1
        className="text-4xl font-black uppercase mb-10"
        style={{ fontFamily: "var(--font-barlow-condensed), sans-serif", color: "#1a0f00" }}
      >
        Finalizar pedido
      </h1>
      <CheckoutForm />
    </div>
  );
}
