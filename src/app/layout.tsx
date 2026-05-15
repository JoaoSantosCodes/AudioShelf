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

import { ThemeProvider } from "@/context/ThemeContext";
import { MediaProvider } from "@/context/MediaContext";
import GlobalMediaContainer from "@/components/GlobalMediaContainer";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Solicitar permissão de notificação
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Ouvinte Real-time para novos livros
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'books' },
        (payload) => {
          if (Notification.permission === "granted") {
            new Notification("MediaShelf: Novo Projeto!", {
              body: `O projeto "${payload.new.title}" foi processado e já está disponível na sua biblioteca.`,
              icon: "/favicon.ico"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <MediaProvider>
            {children}
            <GlobalMediaContainer />
          </MediaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
