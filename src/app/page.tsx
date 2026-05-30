'use client';

import React, { useState, useEffect } from 'react';
import { ConversationInput } from '../components/dashboard/ConversationInput';
import { ResponsePanel } from '../components/dashboard/ResponsePanel';
import { IntelligenceDashboard } from '../components/intelligence/IntelligenceDashboard';
import { Sidebar } from '../components/dashboard/Sidebar';
import { TonePreference, BusinessContext, RetrievalResult, ClientIntelligenceProfile, CustomerProfile } from '../types';
import { ConversationIntelligence } from '../lib/ai/intelligence/schemas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Brain, MessageSquare, Menu } from 'lucide-react';
import { BusinessIntelligenceEngine } from '../lib/ai/business-engine';
import { createClient } from '../lib/supabase/client';
import { getAIRequestHeaders } from '../lib/user-ai-config';

export default function DashboardHome() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Business context is synchronous — initialize directly, no effect needed
  const _defaultContext = BusinessIntelligenceEngine.getFallbackContext();

  // Input Workspace states
  const [rawConversation, setRawConversation] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [selectedTone, setSelectedTone] = useState<TonePreference>(
    (_defaultContext.tonePreference as TonePreference) || 'professional'
  );
  const [customerContext, setCustomerContext] = useState<CustomerProfile>({
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    relationshipNotes: '',
  });
  // Resolved customer profile ID from DB (replaces placeholder UUID)
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string>('00000000-0000-0000-0000-000000000000');

  // Business context state — seeded from synchronous default
  const [activeBusinessContext] = useState<BusinessContext>(_defaultContext);

  // Response Generation states
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Intelligence states
  const [intelligence, setIntelligence] = useState<ConversationIntelligence | null>(null);
  const [memories, setMemories] = useState<RetrievalResult[]>([]);
  const [profile, setProfile] = useState<ClientIntelligenceProfile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // CRM onboarding: resolve the authenticated user's customer profile ID
  useEffect(() => {
    // CRM onboarding: resolve the authenticated user's customer profile ID
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // Populate customerContext with OAuth identity
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const nameParts = fullName.trim().split(' ');
      setCustomerContext(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
      }));
      // Fetch or create the customer_profiles record to get the real UUID
      fetch('/api/crm/me')
        .then(r => r.json())
        .then(data => {
          if (data.success && data.profile?.id) {
            setResolvedCustomerId(data.profile.id);
          }
        })
        .catch(() => {
          // Keep placeholder UUID — RAG will bypass DB queries gracefully
        });
    });
  }, []);

  const handleTriggerAnalysis = async () => {
    if (!rawConversation.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAIRequestHeaders() },
        body: JSON.stringify({
          rawConversation,
          businessContext: activeBusinessContext,
          additionalInstructions,
          customerContext: { ...customerContext, id: resolvedCustomerId }
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const result = await response.json();
      setIntelligence(result.data);
      setMemories(result.memories || []);
      setProfile(result.profile || null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to analyze conversation.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTriggerStream = async () => {
    if (!rawConversation.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedReply('');
    setErrorMessage('');

    // Auto-trigger analysis in background
    handleTriggerAnalysis();

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAIRequestHeaders() },
        body: JSON.stringify({
          rawConversation,
          additionalInstructions,
          selectedTone,
          businessContext: activeBusinessContext,
          customerContext: { ...customerContext, id: resolvedCustomerId }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server responded with an error');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response reader unavailable');

      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          setGeneratedReply((prev) => prev + chunk);
        }
      }
    } catch (err: any) {
      console.error('[VIVEKIT_STREAM_ERROR]', err);
      setErrorMessage(err.message || 'Failed to compose AI response.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (finalReply: string) => {
    console.info('[APPROVAL_CONFIRMED]', { replyLength: finalReply.length, timestamp: new Date().toISOString() });

    // Persist conversation + approved reply to DB
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawConversation,
          generatedReply: finalReply,
          customerId: resolvedCustomerId !== '00000000-0000-0000-0000-000000000000' ? resolvedCustomerId : undefined,
          channel: 'email',
          promptUsed: `tone:${selectedTone}`,
        }),
      });
    } catch {
      // Non-blocking — UI flow continues regardless
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans dark select-none">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:z-auto md:transition-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 shrink-0 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-10 relative">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-400 hidden sm:block">Intelligence Desk</span>
              <span className="text-slate-700 hidden sm:block">/</span>
              <span className="text-slate-600 text-[11px] sm:text-xs">Compose Reply</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="hidden sm:block">Gemini 3.5 Flash Active</span>
          </div>
        </header>

        {/* Main content — stacks on mobile, side-by-side on lg */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col lg:flex-row gap-0 lg:gap-6 p-4 sm:p-6 lg:p-8">

          {/* Input column — full width on mobile, 1/3 on desktop */}
          <div className="w-full lg:w-90 xl:w-100 shrink-0 h-64 lg:h-full overflow-hidden">
            <ConversationInput
              rawConversation={rawConversation}
              setRawConversation={setRawConversation}
              additionalInstructions={additionalInstructions}
              setAdditionalInstructions={setAdditionalInstructions}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              customerContext={customerContext}
              setCustomerContext={setCustomerContext}
              onGenerate={handleTriggerStream}
              isGenerating={isGenerating}
            />
          </div>

          {/* Output column — full width on mobile, grow on desktop */}
          <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
            <Tabs defaultValue="reply" className="h-full flex flex-col">
              <TabsList className="bg-slate-900/50 border border-slate-800 mb-4 self-start">
                <TabsTrigger value="reply" className="flex items-center gap-2 data-[state=active]:bg-violet-600">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Response Draft
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="flex items-center gap-2 data-[state=active]:bg-violet-600">
                  <Brain className="w-3.5 h-3.5" />
                  Conversation Intelligence
                  {intelligence && <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500" />}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <TabsContent value="reply" className="h-full mt-0">
                  {errorMessage ? (
                    <div className="p-10 text-center border border-rose-500/20 bg-rose-500/5 rounded-3xl">
                      <p className="text-rose-400">{errorMessage}</p>
                    </div>
                  ) : isGenerating && !generatedReply ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : generatedReply ? (
                    <ResponsePanel
                      generatedReply={generatedReply}
                      isGenerating={isGenerating}
                      onApprove={handleApprove}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center">
                      <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                      <h3 className="font-semibold text-slate-400">Ready for Response</h3>
                      <p className="text-xs max-w-xs mt-2">Paste a conversation on the left to generate a strategic, context-aware business reply.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="intelligence" className="h-full mt-0">
                  {!intelligence && !isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl p-10 text-center">
                      <Brain className="w-12 h-12 mb-4 opacity-20" />
                      <h3 className="font-semibold text-slate-400">Intelligence Pending</h3>
                      <p className="text-xs max-w-xs mt-2">Generate a reply to trigger deep conversation analysis and risk assessment.</p>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500">
                      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
                      <p className="text-xs font-semibold animate-pulse text-violet-400">Extracting Business Intelligence...</p>
                    </div>
                  )}
                  {intelligence && (
                    <IntelligenceDashboard
                      intelligence={intelligence}
                      memories={memories}
                      profile={profile || undefined}
                    />
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-slate-900 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 z-10 bg-slate-950/80 backdrop-blur-md relative select-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/10 to-transparent" />
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="hidden sm:block">Developed by</span>
            <a href="https://www.vivescriptsolutions.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white font-bold transition-colors">
              ViveScript Solutions
            </a>
            <span className="text-slate-700 hidden sm:block">·</span>
            <a href="https://www.vivescriptsolutions.com/en/contact" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors hidden sm:block">
              Support
            </a>
          </div>
          <span className="hidden md:block">© {new Date().getFullYear()} ViveScript Solutions</span>
        </footer>
      </div>
    </div>
  );
}
