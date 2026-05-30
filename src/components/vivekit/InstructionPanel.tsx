import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Settings, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface InstructionPanelProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function InstructionPanel({ value, onChange, disabled }: InstructionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  const presets = [
    { label: "🎁 Offer Coupon", text: "Offer a 10% coupon code LOYAL10 as a goodwill gesture." },
    { label: "⏰ Express Delay", text: "Apologize for the scheduling delay and offer immediate priority call." }
  ];

  return (
    <Card className="border-slate-800 bg-slate-900/30 backdrop-blur-xl shadow-xl select-none">
      
      {/* Collapsible Trigger Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex justify-between items-center border-b border-transparent cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/15">
            <Settings className="w-3.5 h-3.5" />
          </div>
          <div>
            <CardTitle className="text-slate-100 text-xs font-bold tracking-wide">
              AI Directive Adjustments
            </CardTitle>
            <CardDescription className="text-slate-400 text-[10px] mt-0.5">
              Add specific instruction overrides for this response.
            </CardDescription>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <CardContent className="pt-0 pb-5 space-y-4 border-t border-slate-800/40">
          <div className="grid grid-cols-1 gap-2 pt-4">
            <Label className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">Tactical Override Guidelines</Label>
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="e.g. 'Politely guide to standard pricing tier' or 'Offer a callback'"
              className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-lg text-xs h-9"
            />
          </div>

          {/* Presets helpers */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-semibold">Quick Add:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(preset.text)}
                  className="text-[9px] px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      )}

    </Card>
  );
}
