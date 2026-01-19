import type { Metadata } from "next";
import FloatingNav from "@/components/ui/floating-nav";
import { PageLoader } from "@/components/ui/page-loader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ascent | Performance Elite",
  description: "Engineering physical perfection through data-driven performance tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background-dark text-white font-body antialiased selection:bg-primary/30 overflow-x-hidden">
        <PageLoader />
        {children}
        <FloatingNav />
      </body>
    </html>
  );
}
