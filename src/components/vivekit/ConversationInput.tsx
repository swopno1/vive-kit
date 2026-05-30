import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { MessageSquare, Trash2, ArrowUpRight } from 'lucide-react';

interface ConversationInputProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ConversationInput({
  value,
  onChange,
  onClear,
  onSubmit,
  disabled
}: ConversationInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize handler
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to compute fresh scroll height
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  // Keyboard shortcut listener: (Cmd/Ctrl + Enter) to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (value.trim().length >= 5 && !disabled) {
        onSubmit();
      }
    }
  };

  const isFormValid = value.trim().length >= 5;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center select-none shrink-0">
        <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
          <span>Client Dialogue Stream</span>
        </Label>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 font-medium">
            {value.length} chars
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            disabled={disabled || !value}
            className="text-[10px] text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 h-6 px-2 rounded cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Reset Stream
          </Button>
        </div>
      </div>

      <div className="relative group">
        {/* Sleek card wrap with inner styling */}
        <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-xl shadow-xl overflow-hidden focus-within:border-slate-700/80 transition-all duration-300">
          <CardContent className="p-0">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Paste customer emails, Zendesk threads, or direct chat history here... (e.g. 'Customer: I noticed I was billed standard instead of coupon rates...')"
              rows={8}
              className="w-full bg-transparent border-0 text-slate-200 placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm leading-relaxed p-4 resize-none min-h-[160px] max-h-[480px] scroll-area"
            />
          </CardContent>
        </Card>

        {/* Floating bottom tips */}
        {!disabled && isFormValid && (
          <span className="absolute bottom-2.5 right-3.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-950/20 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-800 pointer-events-none select-none flex items-center gap-1.5 animate-pulse">
            <span>Ready to generate</span>
            <ArrowUpRight className="w-2.5 h-2.5" />
          </span>
        )}
      </div>
    </div>
  );
}
