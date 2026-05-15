'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

interface PresenceUser {
  user_id: string;
  email: string;
  online_at: string;
}

export default function PresenceIndicator() {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Pegar usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser(user);
        setupPresence(user);
      }
    });

    const setupPresence = (user: any) => {
      const channel = supabase.channel('online-users', {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const users: PresenceUser[] = [];
          
          for (const id in newState) {
            const userState = newState[id][0] as any;
            users.push({
              user_id: id,
              email: userState.email || 'Usuário',
              online_at: userState.online_at
            });
          }
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('Join:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('Leave:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              email: user.email,
              online_at: new Date().toISOString(),
            });
          }
        });

      return () => {
        channel.unsubscribe();
      };
    };
  }, []);

  return (
    <div className="flex items-center -space-x-2 px-2">
      <AnimatePresence>
        {onlineUsers.map((user) => (
          <motion.div
            key={user.user_id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative group"
            title={user.email}
          >
            <div className={`w-8 h-8 rounded-full border-2 ${user.user_id === currentUser?.id ? 'border-gold bg-gold/10' : 'border-emerald-500 bg-emerald-500/10'} flex items-center justify-center shadow-lg backdrop-blur-md`}>
              <span className={`text-[10px] font-black ${user.user_id === currentUser?.id ? 'text-gold' : 'text-emerald-400'}`}>
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background shadow-sm" />
            
            {/* TOOLTIP */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface-2 border border-border-custom rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <p className="text-[9px] font-bold text-text whitespace-nowrap">{user.email}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {onlineUsers.length > 0 && (
        <div className="pl-4">
          <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em] animate-pulse">
            {onlineUsers.length} Online
          </span>
        </div>
      )}
    </div>
  );
}
