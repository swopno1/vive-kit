'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck,
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  UserCheck, 
  Scale, 
  Clock, 
  Activity, 
  HelpCircle,
  FileText,
  MessageSquare,
  Lock,
  RefreshCw,
  Search
} from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';

// =========================================================================
// ViveKit - Human Approval & Safety Governance Console - Phase 11
// =========================================================================

export default function ApprovalGovernanceConsole() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
  const [activeWorkflowData, setActiveWorkflowData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Operator text adjustments
  const [editedText, setEditedText] = useState('');
  const [reviewerName, setReviewerName] = useState('Senior Systems Operator');

  // Fetch queue list on mount
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/approvals');
        if (res.ok) {
          const data = await res.json();
          setWorkflows(data.queue || []);
        }
      } catch (err) {
        console.error('Failed to fetch approvals queue:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueue();
  }, []);

  // Fetch workflow detail on selection
  useEffect(() => {
    const fetchDetail = async () => {
      if (!selectedWorkflowId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/approvals/${selectedWorkflowId}`);
        if (res.ok) {
          const data = await res.json();
          setActiveWorkflowData(data);
          setEditedText(data.workflow?.currentText || '');
        }
      } catch (err) {
        console.error('Failed to fetch workflow details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [selectedWorkflowId]);

  // Execute transition state
  const handleTransitionState = async (nextState: string, action: string) => {
    if (!activeWorkflowData) return;
    try {
      const res = await fetch(`/api/approvals/${selectedWorkflowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextState,
          currentText: editedText,
          reviewer: reviewerName,
          action
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Update local list
        setWorkflows(prev => 
          prev.map(w => w.id === selectedWorkflowId ? data.updatedWorkflow : w)
        );
        
        // Update selected detail
        setActiveWorkflowData({
          ...activeWorkflowData,
          workflow: data.updatedWorkflow,
          auditLogs: [data.auditLogged, ...activeWorkflowData.auditLogs]
        });

        // Copy if approving
        if (nextState === 'approved') {
          await navigator.clipboard.writeText(editedText);
          alert('🏆 Strategy approved, copied to clipboard, and logged to reinforcement audit buffers!');
        }
      }
    } catch (err) {
      console.error('Failed to process workflow transition:', err);
    }
  };

  // Filter queues based on search query
  const filteredQueue = workflows.filter(w => 
    w.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.activeState.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-full">
      
      {/* 1. Left Sidebar - Safety Reviews Queue */}
      <aside className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950 flex flex-col shrink-0 h-auto md:h-full max-h-60 md:max-h-none overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Header */}
          <div className="p-6 space-y-4 shrink-0">
            <div className="flex items-center gap-3">
              <div>
                
                <h2 className="text-sm font-black text-slate-200">Safety & Governance Queue</h2>
              </div>
            </div>
            
            <div className="h-px bg-slate-900" />

            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search safety files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-900 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Active Queue List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
            <Label className="px-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Safety Audits Folder</Label>
            
            {filteredQueue.length > 0 ? (
              filteredQueue.map((w) => {
                const isSelected = selectedWorkflowId === w.id;
                const isHighRisk = w.riskAssessment?.score > 60;
                
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWorkflowId(w.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-slate-900 border-slate-800 shadow-lg' 
                        : 'bg-slate-950/40 border-transparent hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <h3 className={`text-xs font-bold transition-colors ${isSelected ? 'text-slate-100' : 'text-slate-400'}`}>
                        {w.clientName}
                      </h3>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        w.activeState === 'escalated' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' :
                        w.activeState === 'pending_review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        w.activeState === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {w.activeState.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-semibold truncate max-w-30">Assignee: {w.assignedReviewer || 'None'}</span>
                      <span className={`font-bold ${isHighRisk ? 'text-rose-400' : 'text-slate-400'}`}>
                        Risk: {w.riskAssessment?.score}%
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-[10px] text-slate-500 text-center py-6">All safety reviews processed.</p>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-slate-900 space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[9px] font-bold text-slate-500 tracking-wider">SAFETY LAYER SECURE</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-900 space-y-1.5">
            <span className="text-[9px] font-bold text-slate-500 block uppercase">Reviewer Credentials</span>
            <input 
              type="text" 
              value={reviewerName} 
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-200 focus:outline-none"
            />
          </div>
        </div>
      </aside>

      {/* 2. Main Executive review Desk */}
      <main className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />

        {/* Header */}
        <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-bold capitalize">Governance Console</span>
            <span className="text-slate-700 text-xs hidden sm:block">/</span>
            <span className="text-slate-200 text-xs font-semibold">Operational safety check</span>
          </div>
        </header>

        {/* Dashboard Workspace */}
        {isLoading && !activeWorkflowData ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Compiling Safety Parameters...</p>
          </div>
        ) : activeWorkflowData ? (
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar space-y-6 z-10">
            
            {/* ROW 1: EXEC HEADER & STATE CONTROLS */}
            <div className="flex justify-between items-center bg-slate-900/10 border border-slate-900 rounded-2xl p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-200">{activeWorkflowData.workflow.clientName}</h3>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    activeWorkflowData.workflow.activeState === 'escalated' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' :
                    activeWorkflowData.workflow.activeState === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {activeWorkflowData.workflow.activeState.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">Assigned Case Manager: <span className="text-indigo-400 font-semibold">{activeWorkflowData.workflow.assignedReviewer || 'Unassigned'}</span></p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleTransitionState('approved', 'approve')}
                  disabled={activeWorkflowData.workflow.activeState === 'approved'}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve & Copy</span>
                </Button>
                
                <Button
                  onClick={() => handleTransitionState('escalated', 'escalate')}
                  disabled={activeWorkflowData.workflow.activeState === 'escalated'}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/20 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Escalate to Lead</span>
                </Button>
                
                <Button
                  onClick={() => handleTransitionState('rejected', 'reject')}
                  disabled={activeWorkflowData.workflow.activeState === 'rejected'}
                  className="bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/20 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject draft</span>
                </Button>
              </div>
            </div>

            {/* ROW 2: ACTIVE SAFETY AUDIT COMPLIANCE REPORT */}
            <Card className="bg-slate-900/30 border border-slate-900 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-violet-400" />
                  <span>Safety Compliance Auditing report</span>
                </h4>
                
                <div className="flex gap-4 text-xs font-medium text-slate-500">
                  <span>Overpromising: <span className={activeWorkflowData.workflow.riskAssessment.overpromisingRating > 50 ? "text-rose-400 font-bold" : "text-slate-350"}>{activeWorkflowData.workflow.riskAssessment.overpromisingRating}%</span></span>
                  <span>Legal Liability: <span className={activeWorkflowData.workflow.riskAssessment.legalRiskRating > 50 ? "text-rose-400 font-bold" : "text-slate-350"}>{activeWorkflowData.workflow.riskAssessment.legalRiskRating}%</span></span>
                </div>
              </div>

              {/* Warnings Stream */}
              {activeWorkflowData.workflow.riskAssessment.warningIndicators.length > 0 ? (
                <div className="space-y-2">
                  {activeWorkflowData.workflow.riskAssessment.warningIndicators.map((warn: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs text-rose-400 flex gap-2 items-center leading-normal">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-400 flex gap-2 items-center leading-normal">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Pass: No pricing compliance warnings or overpromising violations detected.</span>
                </div>
              )}

              {/* Actionable AI Remediation checklist */}
              {activeWorkflowData.workflow.riskAssessment.suggestedRevisions.length > 0 && (
                <div className="p-4 rounded-xl bg-violet-950/10 border border-violet-900/40 text-xs leading-normal space-y-2">
                  <span className="font-bold text-violet-400 uppercase tracking-wider text-[9px] block">AI Suggested Rewrites</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    {activeWorkflowData.workflow.riskAssessment.suggestedRevisions.map((rev: string, idx: number) => (
                      <li key={idx}>{rev}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            {/* ROW 3: DOUBLE PANEL COMPILATION DESK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Panel A: Original AI Draft (Audit Trail) */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 flex flex-col justify-between h-75">
                <div className="space-y-3 flex-1 flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block shrink-0">Original AI Draft Track</span>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-400 leading-relaxed overflow-y-auto custom-scrollbar flex-grow whitespace-pre-wrap">
                    {activeWorkflowData.workflow.originalDraft}
                  </div>
                </div>
              </Card>

              {/* Panel B: Human-in-the-Loop Editor desk (Operational changes) */}
              <Card className="bg-slate-900/30 border border-slate-900 p-5 flex flex-col justify-between h-75">
                <div className="space-y-3 flex-1 flex flex-col">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block shrink-0">Active Operator Refinement Desk</span>
                  <div className="relative flex-grow min-h-0 border border-slate-900 rounded-xl bg-slate-950 p-4">
                    <Textarea
                      value={editedText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedText(e.target.value)}
                      className="w-full h-full bg-transparent border-0 resize-none text-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 text-xs leading-relaxed p-0 custom-scrollbar"
                    />
                  </div>
                </div>
              </Card>

            </div>

            {/* ROW 4: HISTORICAL REVISION TIMELINE */}
            <Card className="bg-slate-900/30 border border-slate-900 p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>State Transition Audit Stream</span>
              </h4>

              <div className="space-y-4 relative pl-4 max-h-40 overflow-y-auto custom-scrollbar border-l border-slate-900 ml-2">
                {activeWorkflowData.auditLogs.map((log: any, idx: number) => (
                  <div key={idx} className="relative space-y-1">
                    
                    {/* dot */}
                    <span className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full border bg-slate-950 border-emerald-500 flex items-center justify-center shrink-0" />
                    
                    <div className="flex justify-between items-start text-xs">
                      <h5 className="font-bold text-slate-200 leading-none">
                        Action: {log.action.toUpperCase()}
                      </h5>
                      <span className="text-[9px] text-slate-500 whitespace-nowrap font-medium">
                        {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Performed by: <span className="text-indigo-400 font-medium">{log.performedBy}</span>. Transitioned folder state from <span className="text-slate-350">{log.previousState}</span> to <span className="text-emerald-400">{log.nextState}</span>.
                    </p>
                    
                    {log.textDelta && (
                      <span className="text-[9px] font-mono text-slate-500 block">
                        Delta log: {log.textDelta}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

          </div>
        ) : null}
      </main>

    </div>
  );
}
