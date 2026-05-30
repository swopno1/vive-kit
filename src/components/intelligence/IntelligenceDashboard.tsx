import React from 'react';
import { ConversationIntelligence, RetrievalResult, ClientIntelligenceProfile } from '@/types';
import {
  Brain,
  TrendingUp,
  ShieldAlert,
  Zap,
  MessageSquare,
  Target,
  AlertTriangle,
  Clock,
  Users,
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MemoryTimeline } from './MemoryTimeline';
import { ClientIntelligenceCard } from './ClientIntelligenceCard';

interface IntelligenceDashboardProps {
  intelligence: ConversationIntelligence;
  memories?: RetrievalResult[];
  profile?: ClientIntelligenceProfile;
}

export const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({
  intelligence,
  memories = [],
  profile
}) => {
  const {
    emotionalAnalysis,
    businessIntelligence,
    riskAnalysis,
    summary,
    projectIntelligence,
    negotiationSignals,
    entities
  } = intelligence;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* PHASE 6: Persistent Intelligence & Memory Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {profile ? (
            <ClientIntelligenceCard profile={profile} />
          ) : (
            <Card className="bg-slate-900 border-slate-800 h-full flex flex-col items-center justify-center p-6 text-center">
              <Users className="w-10 h-10 text-slate-700 mb-3" />
              <h3 className="text-sm font-semibold text-slate-400">No Profile Active</h3>
              <p className="text-[11px] text-slate-500 mt-1">Connect this conversation to a customer to build persistent intelligence.</p>
            </Card>
          )}
        </div>
        <div className="lg:col-span-2">
           <Card className="bg-slate-900/40 border-slate-800 h-full">
            <CardHeader className="pb-2 border-b border-slate-800/50 mb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-300">
                  <Database className="w-4 h-4 text-violet-400" />
                  Semantic Memory Retrieval (RAG)
                </CardTitle>
                <Badge variant="secondary" className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20">
                  {memories.length} Memories Found
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[250px] overflow-y-auto custom-scrollbar">
              <MemoryTimeline memories={memories} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Executive Summary & Key Actions */}
      <Card className="border-violet-500/20 bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-violet-400">
              <Brain className="w-5 h-5" />
              Executive Intelligence Summary
            </CardTitle>
            <Badge variant={riskAnalysis.riskScore > 50 ? "destructive" : "secondary"}>
              Risk Score: {riskAnalysis.riskScore}/100
            </Badge>
          </div>
          <CardDescription className="text-slate-400 mt-1">
            {summary.executiveSummary}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
                <Target className="w-4 h-4" />
                Action Items
              </h4>
              <ul className="text-sm space-y-1 text-slate-300">
                {summary.actionItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Pending Decisions
              </h4>
              <ul className="text-sm space-y-1 text-slate-300">
                {summary.pendingDecisions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emotional Intelligence */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              Emotional Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Frustration</span>
                <span>{emotionalAnalysis.frustrationLevel}%</span>
              </div>
              <Progress value={emotionalAnalysis.frustrationLevel} className="h-1.5" indicatorClassName="bg-red-500" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Excitement</span>
                <span>{emotionalAnalysis.excitementLevel}%</span>
              </div>
              <Progress value={emotionalAnalysis.excitementLevel} className="h-1.5" indicatorClassName="bg-emerald-500" />
            </div>
            <div className="pt-2">
              <p className="text-xs text-slate-400 italic">"Primary Emotion: {emotionalAnalysis.primaryEmotion}"</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Intelligence */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Business Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Lead Quality</span>
                <span>{businessIntelligence.leadQuality}%</span>
              </div>
              <Progress value={businessIntelligence.leadQuality} className="h-1.5" indicatorClassName="bg-emerald-400" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1 text-slate-400">
                <span>Buying Intent</span>
                <span>{negotiationSignals.buyingIntentScore}%</span>
              </div>
              <Progress value={negotiationSignals.buyingIntentScore} className="h-1.5" indicatorClassName="bg-violet-400" />
            </div>
            <Badge variant="outline" className="text-[10px] uppercase border-slate-700 text-slate-400">
              Pricing Sensitivity: {businessIntelligence.pricingSensitivity}
            </Badge>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-300">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskAnalysis.riskFactors.slice(0, 3).map((risk, i) => (
              <div key={i} className="text-xs p-2 rounded bg-slate-800/50 border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-200">{risk.type}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                    risk.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    risk.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-1">{risk.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Intelligence */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Project & Deliverables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Deliverables</h5>
                <div className="flex flex-wrap gap-2">
                  {projectIntelligence.requestedDeliverables.map((d, i) => (
                    <Badge key={i} variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/20">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-500 mb-1 tracking-wider">Timeline</h5>
                  <p className="text-sm text-slate-300">{projectIntelligence.timelineExpectations}</p>
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-500 mb-1 tracking-wider">Complexity</h5>
                  <p className="text-sm text-slate-300 capitalize">{projectIntelligence.projectComplexity}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entities & Context */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-md font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              Extracted Entities
            </CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">People</h5>
                  <div className="flex flex-wrap gap-1">
                    {entities.names.map((n, i) => <Badge key={i} variant="outline" className="text-[10px]">{n}</Badge>)}
                    {entities.names.length === 0 && <span className="text-xs text-slate-600">None detected</span>}
                  </div>
                </div>
                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Companies</h5>
                  <div className="flex flex-wrap gap-1">
                    {entities.companies.map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}
                    {entities.companies.length === 0 && <span className="text-xs text-slate-600">None detected</span>}
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Technologies</h5>
                <div className="flex flex-wrap gap-1">
                  {entities.technologies.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
