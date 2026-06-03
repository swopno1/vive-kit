import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Sparkles, Copy, Check, Edit3, Eye, ShieldAlert, RotateCw, Database } from 'lucide-react';

interface ResponseViewerProps {
  content: string;
  isGenerating: boolean;
  onApprove: (finalReply: string) => void;
  onRegenerate: () => void;
  hasInput: boolean;
}

export function ResponseViewer({
  content,
  isGenerating,
  onApprove,
  onRegenerate,
  hasInput
}: ResponseViewerProps) {
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'empty' | 'pending' | 'modified' | 'approved'>('empty');

  // Sync state with streaming text
  useEffect(() => {
    if (content) {
      setText(content);
      setStatus('pending');
    } else {
      setText('');
      setStatus('empty');
    }
  }, [content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    setStatus('modified');
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setStatus('approved');
      onApprove(text);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'empty':
        return <span className="text-[9px] bg-slate-900 text-slate-300 border border-slate-700/80 px-2 py-0.5 rounded font-bold uppercase tracking-wider" aria-label="Status: Idle">Idle</span>;
      case 'pending':
        return <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse" aria-label="Status: Drafting">Drafting</span>;
      case 'modified':
        return <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider" aria-label="Status: Corrected">Corrected</span>;
      case 'approved':
        return <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1" aria-label="Status: Approved">Approved</span>;
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-xl shadow-xl h-full flex flex-col justify-between overflow-hidden">
      
      {/* 1. Header controls */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-950/20 flex justify-between items-center select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300 tracking-wide">AI Composed Output</span>
          {getStatusBadge()}
        </div>

        {/* AI Confidence & Memory retrieval placeholders */}
        {text && (
          <div className="flex items-center gap-2.5">
            <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>RAG: 2 Snips</span>
            </span>
            <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Confidence: 98%</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Response Screen Area */}
      <div className="flex-1 p-5 min-h-[300px] flex flex-col justify-between gap-4">
        
        <div className="flex-grow flex flex-col gap-3 h-full">
          
          {/* Edit toggler status bar */}
          {text && (
            <div className="flex justify-between items-center shrink-0 select-none">
              <span className="text-[10px] text-slate-500 font-semibold italic">
                {isEditing ? 'Directly editing prompt body...' : 'Previewing markdown stream'}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
                data-state={isEditing ? 'editing' : 'viewing'}
                className={`text-[10px] h-6 px-2.5 rounded border transition-[color,background-color,border-color] duration-150 ease-out cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isEditing
                    ? 'text-violet-400 border-violet-500/20 bg-violet-600/10'
                    : 'text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                {isEditing ? (
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Save view</span>
                ) : (
                  <span className="flex items-center gap-1"><Edit3 className="w-3 h-3" /> Quick Edit</span>
                )}
              </Button>
            </div>
          )}

          {/* Text viewport container */}
          <div className="flex-grow relative rounded-xl border border-slate-800 bg-slate-950/70 p-4 h-[350px]">
            {isEditing ? (
              <Textarea
                value={text}
                onChange={handleTextChange}
                className="w-full h-full bg-transparent border-0 resize-none text-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed p-0 scroll-area"
              />
            ) : (
              <div className="w-full h-full overflow-y-auto text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans pr-2 custom-scrollbar">
                {text ? (
                  text
                ) : isGenerating ? (
                  <span className="text-slate-500 italic flex items-center gap-2 select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                    ViveKit AI is writing the draft reply...
                  </span>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 select-none">
                    <span className="text-slate-500 text-xs">Awaiting prompt submission</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. Action bar footer */}
      {text && (
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/30 flex gap-2 shrink-0 select-none">
          <Button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating || !hasInput}
            variant="outline"
            className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900/60 cursor-pointer rounded-xl h-11 px-4 flex items-center gap-1.5 transition-[color,background-color] duration-150 ease-out"
          >
            <RotateCw className={`w-3.5 h-3.5 transition-transform duration-150 ease-out ${isGenerating ? 'animate-spin' : 'rotate-0'}`} />
            <span className="text-xs font-bold">Regenerate</span>
          </Button>

          <Button
            type="button"
            onClick={handleCopy}
            disabled={isGenerating}
            data-state={copied ? 'success' : 'idle'}
            aria-live="polite"
            aria-label={copied ? 'Copied to clipboard' : 'Approve and copy reply'}
            className={`flex-1 rounded-xl h-11 font-bold flex items-center justify-center gap-2 cursor-pointer transition-[background-color,color,box-shadow] duration-200 ease-out transform ${
              copied
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white shadow-emerald-500/25 shadow-md border-0 scale-100'
                : 'bg-slate-100 text-slate-950 hover:bg-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="text-xs">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-xs">Approve & Copy Reply</span>
              </>
            )}
          </Button>
        </div>
      )}

    </Card>
  );
}
