'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  Edit2, 
  ShieldCheck, 
  CornerDownLeft, 
  AlertTriangle,
  TrendingUp,
  Award,
  ShieldAlert,
  Flame,
  Scale
} from 'lucide-react';
import { StrategyEngine } from '../../lib/ai/strategy-engine';

interface ResponsePanelProps {
  generatedReply: string;
  isGenerating: boolean;
  onApprove: (finalReply: string) => void;
}

export function ResponsePanel({ generatedReply, isGenerating, onApprove }: ResponsePanelProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<'empty' | 'pending' | 'modified' | 'approved'>('empty');

  // Multi-Strategy Decision states
  const [businessPriority, setBusinessPriority] = useState<string>('profitability');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('strat-profit');
  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>({});

  // ⚡ Perf: useMemo replaces useEffect + setState cascade.
  // generateMultiReplies is a pure computation of (generatedReply, businessPriority),
  // so memoizing it avoids 4 cascading setState re-renders per recomputation.
  const strategyPayload = useMemo(() => {
    if (!generatedReply) return null;
    return StrategyEngine.generateMultiReplies(generatedReply, businessPriority);
  }, [generatedReply, businessPriority]);

  // Track the previous payload reference to sync derived state only on change
  const prevPayloadRef = useRef(strategyPayload);
  useEffect(() => {
    if (strategyPayload === prevPayloadRef.current) return;
    prevPayloadRef.current = strategyPayload;

    if (strategyPayload) {
      // Select the strategy recommended by AI
      const rec = strategyPayload.strategies.find((s: { recommended: boolean }) => s.recommended);
      setSelectedStrategyId(rec ? rec.id : 'strat-profit');

      // Initialise draft texts from strategy templates
      const drafts: Record<string, string> = {};
      strategyPayload.strategies.forEach((s: { id: string; draftText: string }) => {
        drafts[s.id] = s.draftText;
      });
      setCustomDrafts(drafts);
      setStatus('pending');
    } else {
      setStatus('empty');
    }
  }, [strategyPayload]);

  const activeStrategy = strategyPayload?.strategies.find((s: { id: string }) => s.id === selectedStrategyId);
  const activeContent = activeStrategy ? (customDrafts[activeStrategy.id] || activeStrategy.draftText) : '';

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeStrategy) return;
    const val = e.target.value;
    setCustomDrafts({
      ...customDrafts,
      [activeStrategy.id]: val
    });
    setStatus('modified');
  };

  const handleCopy = async () => {
    if (!activeContent) return;
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setStatus('approved');
      onApprove(activeContent);

      // Log decision human selection override event
      await fetch('/api/crm/clients/log-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedStrategy: activeStrategy?.category,
          userOverrode: status === 'modified',
          overrideText: activeContent
        })
      }).catch(err => console.error('Silent logging bypass:', err));

      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl h-full flex flex-col justify-between overflow-hidden">
      
      {/* Panel Header */}
      <CardHeader className="pb-4 border-b border-slate-800/60 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-slate-100 flex items-center gap-2 text-base font-semibold tracking-wide">
              <span>Decision Intelligence Desk</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-1">
              Select and evaluate diverse communication strategies aligned to business priority bounds.
            </CardDescription>
          </div>
          
          {/* Priority levers */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-950 border border-slate-900 rounded-lg shrink-0">
            {['profitability', 'retention', 'premium'].map((mode) => (
              <button
                key={mode}
                onClick={() => setBusinessPriority(mode)}
                className={`px-2 sm:px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all min-h-8 ${
                  businessPriority === mode
                    ? 'bg-slate-900 text-white shadow-inner border-slate-800'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      {/* Main Workspace Body */}
      <div className="flex-1 min-h-0 relative p-6 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
        
        {/* Empty status */}
        {status === 'empty' && !isGenerating && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800/80 rounded-2xl bg-slate-950/20">
            <div className="p-4 rounded-full bg-slate-900/80 text-slate-650 border border-slate-800/50 mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-slate-350 text-sm">Waiting for Prompt Input</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs leading-normal">
              Paste customer dialogue on the left panel and click generate to populate strategic reply variants.
            </p>
          </div>
        )}

        {isGenerating && status === 'empty' && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Generating Multi-Reply Strategies...</p>
          </div>
        )}

        {/* Active Multi-Strategy Workspace */}
        {status !== 'empty' && strategyPayload && (
          <div className="space-y-5 flex-grow">
            
            {/* Urgent boundary warning */}
            {strategyPayload.strategicWarning && (
              <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[10px] text-rose-400 flex gap-2 items-center">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{strategyPayload.strategicWarning}</span>
              </div>
            )}

            {/* Strategic selection Tabs — scrollable on mobile */}
            <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
              {strategyPayload.strategies.map((strat: any) => (
                <button
                  key={strat.id}
                  onClick={() => {
                    setSelectedStrategyId(strat.id);
                    setIsEditing(false);
                  }}
                  className={`flex-1 py-2 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider relative transition-all ${
                    selectedStrategyId === strat.id 
                      ? 'bg-slate-900 text-white shadow' 
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <span>{strat.name}</span>
                  {strat.recommended && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-violet-600 border border-slate-950 flex items-center justify-center" title="AI Recommended Strategy">
                      <Award className="w-2 h-2 text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 1. STRATEGIC INSIGHTS AND TRADEOFFS CARD */}
            {activeStrategy && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                
                {/* Tradeoffs Column */}
                <Card className="bg-slate-900/20 border border-slate-900 p-4 space-y-2 col-span-1">
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-violet-400" />
                    <span>Reasoned Tradeoff</span>
                  </h4>
                  <div className="space-y-1.5 text-[11px] leading-normal text-slate-400">
                    <p><span className="font-semibold text-slate-300">Objective</span>: {activeStrategy.tradeoffs.strategicObjective}</p>
                    <p><span className="font-semibold text-slate-300">Posture</span>: {activeStrategy.tradeoffs.negotiationPosture}</p>
                    <p><span className="font-semibold text-slate-300">Tradeoff</span>: {activeStrategy.tradeoffs.tradeoffsExplanation}</p>
                  </div>
                </Card>

                {/* Outcome predictions Column */}
                <Card className="bg-slate-900/20 border border-slate-900 p-4 space-y-2 col-span-1">
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Likely Outcome</span>
                  </h4>
                  <div className="space-y-2 text-[11px]">
                    <div className="space-y-0.5">
                      <div className="flex justify-between font-semibold text-slate-400 text-[10px]">
                        <span>Conversion Rate</span>
                        <span>{activeStrategy.prediction.conversionProbability}%</span>
                      </div>
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${activeStrategy.prediction.conversionProbability}%` }} />
                      </div>
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className="flex justify-between font-semibold text-slate-400 text-[10px]">
                        <span>Satisfaction Score</span>
                        <span>{activeStrategy.prediction.clientSatisfactionImpact}%</span>
                      </div>
                      <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${activeStrategy.prediction.clientSatisfactionImpact}%` }} />
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] pt-1">
                      <span className="font-semibold text-slate-500">Escalation Risk</span>
                      <span className={`font-bold capitalize ${
                        activeStrategy.prediction.escalationRisk === 'high' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>{activeStrategy.prediction.escalationRisk}</span>
                    </div>
                  </div>
                </Card>

              </div>
            )}

            {/* 2. CORE DRAFT EDITOR PANEL */}
            <div className="space-y-3 flex-grow flex flex-col min-h-0">
              <div className="flex justify-between items-center shrink-0">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Draft Review Workspace</span>
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`text-[10px] h-7 px-3 rounded-lg border ${
                    isEditing 
                      ? 'text-violet-400 border-violet-500/20 bg-violet-600/10 hover:bg-violet-600/15 font-bold' 
                      : 'text-slate-400 border-slate-900 hover:text-white hover:bg-slate-800/60 font-bold'
                  }`}
                >
                  {isEditing ? '✓ Lock Changes' : 'Quick Edit Strategy'}
                </Button>
              </div>

              {/* Text Field Editor */}
              <div className="flex-1 min-h-[140px] relative rounded-2xl border border-slate-800/60 bg-slate-950/70 p-4">
                {isEditing ? (
                  <Textarea
                    value={activeContent}
                    onChange={handleContentChange}
                    className="w-full h-full bg-transparent border-0 resize-none text-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs leading-relaxed p-0 custom-scrollbar"
                  />
                ) : (
                  <div className="w-full h-full overflow-y-auto text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans pr-2 custom-scrollbar">
                    {activeContent}
                  </div>
                )}
              </div>

              {/* Warning on Potential Risk */}
              {activeStrategy && activeStrategy.tradeoffs.potentialRisks && (
                <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[9px] text-amber-400 flex gap-2 items-center leading-normal">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span><span className="font-bold">Strategic Risk:</span> {activeStrategy.tradeoffs.potentialRisks}</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Panel Action Footer */}
      <div className="p-6 border-t border-slate-800/60 bg-slate-900/20 shrink-0">
        <Button
          size="lg"
          disabled={!activeContent || isGenerating}
          onClick={handleCopy}
          className={`w-full py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md'
              : 'bg-slate-100 text-slate-950 hover:bg-white hover:shadow-white/10 hover:shadow-lg'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Approved Strategy & Copied!</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4.5 h-4.5 text-slate-900" />
              <span>Approve Strategy & Copy (Ctrl+C)</span>
            </>
          )}
        </Button>
      </div>

    </Card>
  );
}
