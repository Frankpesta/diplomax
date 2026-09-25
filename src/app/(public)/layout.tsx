import Script from "next/script";
import { WhatsAppWidget } from "@/components/public/whatsapp-widget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WhatsAppWidget />
      {/* Chatway live chat — the widget renders its own launcher in the bottom-right corner. */}
      <Script id="chatway" src="https://cdn.chatway.app/widget.js?id=KPqHo0dQpAJ5" strategy="afterInteractive" />
    </>
  );
}
