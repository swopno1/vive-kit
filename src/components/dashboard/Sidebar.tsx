'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, Users, ShieldCheck, Settings,
  Activity, Zap, Lock, Building2, LogOut, X, KeyRound,
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { getUserAIConfig, UserAIConfig } from '../../lib/user-ai-config';
import { ApiKeyModal } from '../settings/ApiKeyModal';

const NAV = [
  {
    group: 'AI Workspace',
    items: [
      { href: '/', label: 'Intelligence Desk', icon: MessageSquare },
      { href: '/admin/approvals', label: 'Review Queue', icon: ShieldCheck },
    ],
  },
  {
    group: 'My Business',
    items: [
      { href: '/admin/business', label: 'Business Profile', icon: Settings },
      { href: '/admin/crm', label: 'My Clients', icon: Users },
      { href: '/admin/workspace', label: 'My Team', icon: Building2 },
    ],
  },
  {
    group: 'Analytics',
    items: [
      { href: '/admin/usage', label: 'Usage Log', icon: Activity },
      { href: '/admin/costs', label: 'AI Costs', icon: Zap },
      { href: '/admin/data', label: 'My Data', icon: Lock },
    ],
  },
];

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Claude',
};

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string; avatar?: string; name?: string } | null>(null);
  const [aiConfig, setAiConfig] = useState<UserAIConfig | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data?.user) setUser({
        email: data.user.email,
        avatar: data.user.user_metadata?.avatar_url,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
      });
    });
    // Load user's AI config from localStorage
    setAiConfig(getUserAIConfig());
  }, []);

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    window.location.href = '/auth/login';
  };

  const handleNavClick = () => onClose?.();

  // Badge label: shows user's chosen model or default
  const providerBadge = aiConfig
    ? `${PROVIDER_LABELS[aiConfig.provider] ?? aiConfig.provider} · ${aiConfig.model.split('-').slice(0, 3).join('-')}`
    : 'Gemini 3.5 Flash · Default key';

  return (
    <>
      <aside className="w-64 h-full border-r border-slate-800/60 bg-slate-950 flex flex-col text-slate-100 select-none shadow-2xl md:shadow-none">
        {/* Brand + mobile close */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ViveKit"
              width={36}
              height={36}
              className="rounded-xl shadow-lg shadow-violet-500/20 shrink-0"
            />
            <div>
              <div className="font-bold text-sm text-white tracking-tight leading-none">ViveKit</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">by ViveScript</div>
            </div>
          </div>
          {/* Close button — only visible on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-500 transition-[color,background-color,transform] duration-100 active:scale-95 hover:text-white hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800/60 mx-5 mb-2" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {NAV.map(({ group, items }) => (
            <div key={group}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1">
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map(({ href, label, icon: Icon }) => {
                  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={handleNavClick}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                        min-h-[44px] transition-[background-color,color,transform] duration-150 active:scale-95
                        ${isActive
                          ? 'bg-violet-600/15 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-r-full bg-linear-to-b from-violet-500 to-indigo-500 transition-opacity duration-150" />
                      )}
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="truncate">{label}</span>
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-slate-800/60 space-y-2 shrink-0">
          {/* AI provider status — clickable to open settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-[background-color,border-color,transform] duration-150 active:scale-95 hover:border-violet-500/30 hover:bg-violet-500/5 group"
            title="Configure AI provider"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate flex-1 text-left">
              {providerBadge}
            </span>
            <KeyRound className="w-3 h-3 text-slate-600 group-hover:text-violet-400 transition-colors shrink-0" />
          </button>

          {/* User */}
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl transition-[background-color,transform] duration-150 active:scale-95 hover:bg-slate-800/40 group">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-slate-700 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-xs font-bold ring-2 ring-slate-700 shrink-0">
                  {(user.name || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-300 truncate leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">{user.email}</div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 rounded-lg text-slate-600 transition-[color,background-color,transform] duration-150 active:scale-95 group-hover:text-slate-400 hover:!text-rose-400 hover:bg-slate-800 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* API Key Settings Modal */}
      <ApiKeyModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfigChange={(cfg) => setAiConfig(cfg)}
      />
    </>
  );
}
