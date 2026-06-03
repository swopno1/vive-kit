'use client';

import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// =========================================================================
// ViveKit - Goodbye Page (After Account Deletion)
// =========================================================================

export default function GoodbyePage() {
  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = '/auth/login';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
            <CheckCircle2 className="w-16 h-16 text-emerald-400 relative" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-100">Account Deleted</h1>
          <p className="text-slate-400">Your data has been permanently removed from our systems.</p>
        </div>

        {/* Details */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-lg p-5 space-y-3 text-sm">
          <p className="text-slate-300">
            ✓ All conversations deleted<br />
            ✓ All embeddings removed<br />
            ✓ All client profiles erased<br />
            ✓ Account closed
          </p>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <p className="text-slate-400">
            We appreciate the time you spent using ViveKit. If you have feedback, please reach out.
          </p>

          {/* Links */}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-sm font-medium"
            >
              Return to Login
            </Link>
            <a
              href="https://www.vivescriptsolutions.com/en/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-slate-900/40 hover:bg-slate-900/60 text-slate-400 hover:text-slate-300 transition-colors text-sm font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Auto-redirect Message */}
        <p className="text-xs text-slate-500 pt-2">
          Redirecting in 5 seconds...
        </p>

      </div>
    </div>
  );
}
