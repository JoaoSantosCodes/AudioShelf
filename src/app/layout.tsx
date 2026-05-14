import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "AudioShelf | Seu Player de Audiobooks",
  description: "Ouca seus audiobooks com qualidade premium usando storage do Telegram.",
  manifest: "/manifest.json",
  themeColor: "#0e0c0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AudioShelf",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
