import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/shared/convex-client-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/provider";
import { getDictionary, getLocale } from "@/i18n/server";
import { OG_LOCALE } from "@/i18n/config";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  // latin-ext carries Turkish characters (ğ, ş, ı, İ).
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = getDictionary(locale);
  return {
    metadataBase: new URL("https://diplomaxdelivery.com"),
    title: {
      template: meta.titleTemplate,
      default: meta.titleDefault,
    },
    description: meta.description,
    openGraph: { locale: OG_LOCALE[locale] },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang={locale}
        className={`h-full antialiased ${manrope.variable} ${manrope.className}`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <I18nProvider locale={locale} dictionary={getDictionary(locale)}>
                <TooltipProvider delay={300}>
                  {children}
                </TooltipProvider>
              </I18nProvider>
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
