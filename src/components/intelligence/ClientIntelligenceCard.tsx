import React from 'react';
import { ClientIntelligenceProfile } from '@/types';
import {
  ShieldCheck,
  User,
  MessageSquare,
  DollarSign,
  Zap,
  Activity,
  Award
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ClientIntelligenceCardProps {
  profile: ClientIntelligenceProfile;
}

export const ClientIntelligenceCard: React.FC<ClientIntelligenceCardProps> = ({ profile }) => {
  const getPricingColor = (sensitivity: string) => {
    switch (sensitivity) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'high': return 'text-orange-400';
      case 'extreme': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="bg-slate-800/30 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <User className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Client Intelligence</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Persistent Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase">Verified Identity</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Award className="w-3 h-3 text-violet-400" /> Trust Score
              </span>
              <span className="text-violet-400 font-bold">{profile.trustScore.toFixed(0)}%</span>
            </div>
            <Progress value={profile.trustScore} className="h-1.5 bg-slate-800" indicatorClassName="bg-violet-500" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[11px] font-medium">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-cyan-400" /> Relationship
              </span>
              <span className="text-cyan-400 font-bold">{profile.relationshipStrength.toFixed(0)}%</span>
            </div>
            <Progress value={profile.relationshipStrength} className="h-1.5 bg-slate-800" indicatorClassName="bg-cyan-500" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Zap className="w-3 h-3 text-amber-400 mt-1" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Style</p>
              <p className="text-xs text-slate-200 capitalize">{profile.communicationStyle || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <DollarSign className="w-3 h-3 text-emerald-400 mt-1" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Sensitivity</p>
              <p className={`text-xs font-medium capitalize ${getPricingColor(profile.pricingSensitivity)}`}>
                {profile.pricingSensitivity}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project History Summary</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed italic">
            "{profile.projectHistorySummary || 'No project history recorded yet.'}"
          </p>
        </div>
      </div>

      <div className="bg-slate-800/20 px-4 py-2 flex justify-between items-center border-t border-slate-800">
        <span className="text-[9px] text-slate-500">Updated: {new Date(profile.lastUpdatedAt).toLocaleDateString()}</span>
        <button className="text-[9px] font-bold text-violet-400 uppercase tracking-widest hover:text-violet-300 transition-colors">
          View Detailed Insights
        </button>
      </div>
    </div>
  );
};
