import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/shared/convex-client-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diplomaxdelivery.com"),
  title: {
    template: "%s | Diplomaxdelivery",
    default: "Diplomaxdelivery — Global Courier & Logistics",
  },
  description:
    "Fast, reliable, and transparent shipment tracking. Track your package in real-time with Diplomaxdelivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang="en"
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
              <TooltipProvider delay={300}>
                {children}
              </TooltipProvider>
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

