/** WhatsApp number in international format without "+" or spaces, as wa.me requires. */
export const WHATSAPP_NUMBER = "905378599702";
export const WHATSAPP_DISPLAY = "+90 537 859 97 02";

export function whatsappUrl(message?: string) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
