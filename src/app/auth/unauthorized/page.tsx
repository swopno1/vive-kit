'use client';

import React from 'react';
import Image from 'next/image';
import { createClient } from '../../../lib/supabase/client';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 px-4">
      
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        
        <div className="text-center space-y-3">
          <div className="inline-flex flex-col items-center gap-3 mb-2">
            <Image src="/logo.png" alt="ViveKit" width={64} height={64} className="rounded-2xl shadow-lg shadow-violet-600/20" />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-orange-600 shadow-lg shadow-rose-600/20">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Access Denied</h1>
          <p className="text-sm text-slate-400">You do not have permission to view this page.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm space-y-6">
          
          <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              If you believe you should have access, please contact support.
            </p>
            <p className="text-xs text-slate-500">
              Contact: <a href="https://www.vivescriptsolutions.com/en/contact" className="text-violet-400 hover:text-violet-300 transition-colors">vivescriptsolutions.com/en/contact</a>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 font-medium text-sm hover:bg-slate-800 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-700">
          Developed by <a href="https://www.vivescriptsolutions.com" className="text-slate-500 hover:text-violet-400 transition-colors">ViveScript Solutions</a>
        </p>
      </div>
    </div>
  );
}
