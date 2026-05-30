'use client';

import { useState, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '../dashboard/Sidebar';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const close = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden dark select-none">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static column on desktop */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:z-auto md:transition-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar onClose={close} />
      </div>

      {/* Content area */}
      <div className="grow overflow-hidden flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 h-14 px-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-white tracking-tight">ViveKit</span>
        </div>

        {children}
      </div>
    </div>
  );
}
