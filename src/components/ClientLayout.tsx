'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from "@/context/ThemeContext";
import { MediaProvider } from "@/context/MediaContext";
import { NavigationProvider } from "@/context/NavigationContext";
import MediaExpandedView from "@/components/MediaExpandedView";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import NeuralSyncIndicator from "@/components/NeuralSyncIndicator";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import QuickActions from "@/components/QuickActions";

import NeuralShield from "@/components/NeuralShield";

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
      <AuthProvider>
        <ToastProvider>
          <NeuralShield>
            <MediaProvider>
              <NavigationProvider>
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto no-scrollbar relative">
                      {children}
                    </main>
                  </div>
                </div>
                <NeuralSyncIndicator />
                <MediaExpandedView />
                <MobileNav />
                <QuickActions />
              </NavigationProvider>
            </MediaProvider>
          </NeuralShield>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
