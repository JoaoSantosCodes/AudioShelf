'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Library, LayoutDashboard, Calendar, BarChart3, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', icon: Library, path: '/' },
    { name: 'Finanças', icon: Wallet, path: '/financas' },
    { name: 'Mercado', icon: ShoppingCart, path: '/shopping' },
    { name: 'Agenda', icon: Calendar, path: '/agenda' },
    { name: 'Kanban', icon: LayoutDashboard, path: '/kanban' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[110] bg-background/80 backdrop-blur-xl border-t border-border-custom px-6 pb-6 pt-3 flex justify-between items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.name} href={item.path} className="relative flex flex-col items-center gap-1">
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'text-gold' : 'text-text-muted hover:text-text'}`}>
              <item.icon size={22} fill={isActive ? "currentColor" : "none"} fillOpacity={0.2} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-gold' : 'text-text-dim'}`}>
              {item.name}
            </span>
            {isActive && (
              <motion.div 
                layoutId="mobile-nav-active"
                className="absolute -top-3 w-8 h-1 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
