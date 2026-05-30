'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users,
  Shield, 
  Plus, 
  Send, 
  FolderLock, 
  MessageSquare, 
  Activity, 
  Lock, 
  Key, 
  AlertTriangle,
  Award,
  RefreshCw,
  Mail,
  UserPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';

// =========================================================================
// ViveKit - SaaS Tenant Collaboration & Multi-Workspace Console - Phase 13
// =========================================================================

export default function WorkspaceCollaborationConsole() {
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('members');
  const [isLoading, setIsLoading] = useState(true);

  // Invite form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('agent');
  const [isInviting, setIsInviting] = useState(false);

  // Comment thread states
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentRole, setCommentRole] = useState('agent');
  const [isPostingComment, setIsPostingComment] = useState(false);

  const fetchWorkspaceData = async () => {
    try {
      const res = await fetch('/api/workspace');
      if (res.ok) {
        const data = await res.json();
        // API returns workspaces[] array — use first entry
        const ws = Array.isArray(data.workspaces) ? data.workspaces[0] : data.workspace;
        setWorkspace(ws ?? null);
        setMembers(Array.isArray(data.members) ? data.members : []);
        setComments(Array.isArray(data.comments) ? data.comments : []);
        setAudits(Array.isArray(data.audits) ? data.audits : []);
      }
    } catch (err) {
      console.error('Failed to fetch workspace telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  // Send onboarding invitation
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          invitedBy: 'Operator'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMembers(prev => [...prev, data.invite]);
        setInviteEmail('');
        
        // Log action in audit logs locally
        const newAudit = {
          id: crypto.randomUUID(),
          actorName: 'Operator',
          actorRole: 'owner' as any,
          action: 'Member Invited',
          details: `Invitation sent to ${inviteEmail} with role: ${inviteRole}.`,
          ipAddress: '',
          timestamp: new Date().toISOString()
        };
        setAudits(prev => [newAudit, ...prev]);
        
        alert(`Invitation sent to ${inviteEmail}`);
      }
    } catch (err) {
      console.error('Failed to trigger onboarding invitation:', err);
    } finally {
      setIsInviting(false);
    }
  };

  // Adjust role selector locally
  const handleRoleChange = (memberId: string, nextRole: string) => {
    setMembers(prev => 
      prev.map(m => m.id === memberId ? { ...m, role: nextRole } : m)
    );
    
    // Log action in audit logs locally
    const member = members.find(m => m.id === memberId);
    const newAudit = {
      id: crypto.randomUUID(),
      actorName: 'Operator',
      actorRole: 'owner' as any,
      action: 'Role Adjusted',
      details: `Role for ${member?.fullName || member?.email} changed from ${member?.role} to ${nextRole}.`,
      ipAddress: '',
      timestamp: new Date().toISOString()
    };
    setAudits(prev => [newAudit, ...prev]);
  };

  // Post dynamic internal comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText) return;
    setIsPostingComment(true);
    try {
      const res = await fetch('/api/workspace/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: null,
          authorName: commentAuthor,
          authorRole: commentRole,
          text: newCommentText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setNewCommentText('');
      }
    } catch (err) {
      console.error('Failed to broadcast comment:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Top Header Section */}
      <header className="h-14 shrink-0 border-b border-slate-900 px-4 sm:px-8 flex items-center justify-between z-10 bg-slate-950/80 backdrop-blur-md relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider hidden sm:block">SaaS Infrastructure</span>
            <span className="text-slate-700 text-xs hidden sm:block">/</span>
            <span className="text-slate-200 text-xs font-semibold">Tenant workspace Console</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 tracking-wider">
          <FolderLock className="w-4 h-4 text-emerald-500" />
          <span>STRICT MULTI-TENANT BOUNDARY ENABLED</span>
        </div>
      </header>

      {/* Main Workspace Body */}
      {isLoading && !workspace ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs">Isolating Tenant Context...</p>
        </div>
      ) : workspace ? (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar space-y-6 z-10">
          
          {/* ROW 1: WORKSPACE PROFILE HERO BANNER */}
          <div className="flex justify-between items-center bg-slate-900/10 border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 shrink-0 bg-violet-600/10 border border-violet-500/20 rounded-bl-2xl text-[10px] font-bold text-violet-400 uppercase tracking-widest">
              {workspace.plan} Plan Active
            </div>
            
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-100 flex items-center gap-2">
                <span>{workspace.name}</span>
              </h2>
              <p className="text-[11px] text-slate-500">
                SaaS Tenant ID: <span className="text-indigo-400 font-mono select-all">{workspace.tenantId}</span> | Created: {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Seat capacity meter */}
            <div className="space-y-1.5 text-right pr-28">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Seat Capacity: <span className="text-slate-200 font-black">{members.length}</span> / {workspace.maxSeats} Seats
              </div>
              <div className="w-40 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-violet-600 rounded-full" style={{ width: `${(members.length / workspace.maxSeats) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* TAB SWAPPER FOR CHANNELS */}
          <div className="flex gap-1 p-1 bg-slate-950 border border-slate-900 rounded-xl overflow-x-auto">
            {[
              { id: 'members', name: 'Team Roster & Invites', icon: Users },
              { id: 'comments', name: 'Shared Annotations', icon: MessageSquare },
              { id: 'audits', name: 'SaaS Security Logs', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider relative transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id 
                      ? 'bg-slate-900 text-white shadow' 
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE DISPATCH CHANNELS */}
          
          {/* TAB A: TEAM ROSTER & INVITATION SYSTEM */}
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              
              {/* Member listing Table */}
              <Card className="col-span-1 md:col-span-2 bg-slate-900/20 border border-slate-900 p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>Workspace Active Membership</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Configure user-specific access credentials and dynamic permissions tags.</p>
                </div>

                <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
                  <table className="w-full text-xs text-slate-400 border-collapse">
                    <thead>
                      <tr className="bg-slate-900/40 text-slate-500 border-b border-slate-900 font-bold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-4 text-left">Member Name</th>
                        <th className="py-2.5 px-4 text-left">Email Address</th>
                        <th className="py-2.5 px-4 text-left">SaaS Role</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 font-sans">
                      {members.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-200">{member.fullName}</td>
                          <td className="py-3 px-4 text-slate-450 font-mono text-[11px]">{member.email}</td>
                          <td className="py-3 px-4">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-slate-200 focus:outline-none uppercase font-bold tracking-wider"
                            >
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="agent">Support Agent</option>
                              <option value="viewer">Viewer</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              member.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* simulated Invite wizard card */}
              <Card className="col-span-1 bg-slate-900/20 border border-slate-900 p-6 flex flex-col justify-between">
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-violet-400" />
                      <span>Transmit Invite Wizard</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">Send a dynamic onboarding link to invite a new agent to your workspace.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase">Candidate Email</Label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="candidate@vivereply.com"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase">Assigned Permission Role</Label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none uppercase font-bold tracking-wider"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="agent">Support Agent</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isInviting || members.length >= workspace.maxSeats}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-4"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInviting ? 'Sending Invite...' : 'Transmit Access Invite'}</span>
                  </Button>
                </form>
              </Card>

            </div>
          )}

          {/* TAB B: INTERNAL CO-REVIEW ANNOTATIONS (LIVE THREAD) */}
          {activeTab === 'comments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
              
              {/* Comment Thread listing */}
              <Card className="col-span-1 md:col-span-2 bg-slate-900/20 border border-slate-900 p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    <span>Disputed Case Team Room</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">Internal team annotations for active conversations.</p>
                </div>

                <div className="space-y-4 relative pl-4 max-h-75 overflow-y-auto custom-scrollbar border-l border-slate-900 ml-2">
                  {comments.map((comm) => (
                    <div key={comm.id} className="relative space-y-1">
                      {/* dot */}
                      <span className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full border bg-slate-950 border-violet-500 flex items-center justify-center shrink-0" />
                      
                      <div className="flex justify-between items-start text-xs">
                        <h5 className="font-bold text-slate-200">
                          {comm.authorName} <span className="text-[9px] uppercase text-violet-400 bg-violet-600/10 px-1 rounded ml-1 border border-violet-500/10">{comm.authorRole}</span>
                        </h5>
                        <span className="text-[9px] text-slate-500 font-medium">
                          {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-normal p-3 rounded-xl bg-slate-900/30 border border-slate-900 mt-1 whitespace-pre-wrap">
                        {comm.text}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Annotation sender form */}
              <Card className="col-span-1 bg-slate-900/20 border border-slate-900 p-6">
                <form onSubmit={handlePostComment} className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-violet-400" />
                      <span>Post Annotation</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-1">Broadcast an internal message to help operators refine active drafts.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase">Your Name</Label>
                      <input
                        type="text"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] text-slate-500 font-bold uppercase">Annotation Body</Label>
                      <Textarea
                        value={newCommentText}
                        required
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Mention an agent or tag a strategic recommendation..."
                        className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-colors h-24 resize-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPostingComment}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-4"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPostingComment ? 'Broadcasting...' : 'Broadcast comment'}</span>
                  </Button>
                </form>
              </Card>

            </div>
          )}

          {/* TAB C: SECURE TENANT AUDIT LEDGER */}
          {activeTab === 'audits' && (
            <Card className="bg-slate-900/20 border border-slate-900 p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>SaaS Workspace Administrative Audit Logs</span>
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Chronological record tracking secure onboarding invitations, user adjustments, and workspace boundary ticks.</p>
              </div>

              <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
                <table className="w-full text-[11px] text-slate-400 border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 text-slate-500 border-b border-slate-900 font-bold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5 px-4 text-left">Actor</th>
                      <th className="py-2.5 px-4 text-left">SaaS Role</th>
                      <th className="py-2.5 px-4 text-left">IP Address</th>
                      <th className="py-2.5 px-4 text-left">Administrative Action</th>
                      <th className="py-2.5 px-4 text-left">Event Details</th>
                      <th className="py-2.5 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60 font-mono">
                    {audits.map((audit) => (
                      <tr key={audit.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-350">{audit.actorName}</td>
                        <td className="py-2.5 px-4 text-indigo-400 capitalize">{audit.actorRole}</td>
                        <td className="py-2.5 px-4 text-slate-500">{audit.ipAddress}</td>
                        <td className="py-2.5 px-4 text-slate-200 font-sans">{audit.action}</td>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">{audit.details}</td>
                        <td className="py-2.5 px-4 text-right text-slate-500">{new Date(audit.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

        </div>
      ) : null}

    </div>
  );
}
