import React from 'react';
import { Sparkles, MessageSquarePlus, Terminal, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectSample: (conversation: string, tone: string, instructions: string) => void;
}

export function EmptyState({ onSelectSample }: EmptyStateProps) {
  const samples = [
    {
      title: "Discount Request",
      desc: "Client asks for a pricing reduction",
      text: "Client: Hi there, I love ViveKit but our budget is tight this quarter. We'd love to stay on the Professional plan. Is there any discount or coupon you can offer us to renew?",
      tone: "empathetic",
      instructions: "Offer standard 10% coupon code LOYAL10 as a goodwill gesture."
    },
    {
      title: "Delay Explanation",
      desc: "Technical onboarding is delayed",
      text: "Client: Hey team, we were scheduled for our developer setup call yesterday at 2 PM, but no one joined. What's the status? We are waiting to launch our landing page.",
      tone: "professional",
      instructions: "Apologize profusely. Explain the server overload and offer to reschedule within the hour."
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-slate-800/80 rounded-2xl bg-slate-900/10 backdrop-blur-sm select-none py-14">
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 mb-5 relative group">
        <div className="absolute inset-0 bg-violet-500/10 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <MessageSquarePlus className="w-6 h-6 text-slate-400 relative z-10" />
      </div>
      
      <h3 className="font-semibold text-slate-200 text-sm tracking-wide">Workspace Idle</h3>
      <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
        Paste client dialogue on the left panel, or load one of our support scenarios to begin streaming replies.
      </p>

      {/* Preset templates */}
      <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-lg">
        {samples.map((sample, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSample(sample.text, sample.tone, sample.instructions)}
            className="group flex flex-col items-start p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-left hover:border-slate-700/80 hover:bg-slate-900/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute right-3 top-3 p-1 rounded-md bg-slate-900 text-slate-500 group-hover:text-violet-400 group-hover:bg-slate-900/80 transition-colors">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span className="text-[11px] font-bold text-slate-300 tracking-wide">{sample.title}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-normal pr-5">
              {sample.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
