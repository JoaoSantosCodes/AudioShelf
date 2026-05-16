'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from "@/context/ThemeContext";
import { MediaProvider } from "@/context/MediaContext";
import GlobalMediaContainer from "@/components/GlobalMediaContainer";
import MobileNav from "@/components/MobileNav";
import { supabase } from "@/lib/supabase";
import NeuralSyncIndicator from "@/components/NeuralSyncIndicator";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Solicitar permissão de notificação
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
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
    <ThemeProvider>
      <MediaProvider>
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
        <GlobalMediaContainer />
        <NeuralSyncIndicator />
        <MobileNav />
      </MediaProvider>
    </ThemeProvider>
  );
}
