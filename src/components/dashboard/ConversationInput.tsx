import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { TonePreference, CustomerProfile } from '../../types';
import { Sparkles, Trash2, Users, ChevronDown, ChevronUp } from 'lucide-react';

interface ConversationInputProps {
  rawConversation: string;
  setRawConversation: (val: string) => void;
  additionalInstructions: string;
  setAdditionalInstructions: (val: string) => void;
  selectedTone: TonePreference;
  setSelectedTone: (tone: TonePreference) => void;
  customerContext: CustomerProfile;
  setCustomerContext: (profile: CustomerProfile) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ConversationInput({
  rawConversation,
  setRawConversation,
  additionalInstructions,
  setAdditionalInstructions,
  selectedTone,
  setSelectedTone,
  customerContext,
  setCustomerContext,
  onGenerate,
  isGenerating,
}: ConversationInputProps) {
  const [showCRM, setShowCRM] = useState(false);

  const handleClear = () => {
    setRawConversation('');
    setAdditionalInstructions('');
    setCustomerContext({
      email: '',
      firstName: '',
      lastName: '',
      companyName: '',
      relationshipNotes: '',
    });
  };

  const isFormValid = rawConversation.trim().length >= 5;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Main Conversation Paste Input Card */}
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-slate-100 flex items-center gap-2 text-base font-semibold tracking-wide">
                <span>1. Conversation History</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Paste the customer email, chat transcript, or ticket history below.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={isGenerating || (!rawConversation && !additionalInstructions && !customerContext.email)}
              className="text-slate-400 text-xs transition-[color,background-color,transform] duration-150 active:scale-95 hover:text-rose-400 hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Reset Inputs
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={rawConversation}
            onChange={(e) => setRawConversation(e.target.value)}
            placeholder="[Example]
Customer: Hi, I noticed I was charged $29 instead of $19. Is there an active discount I missed?
Agent: Let me check..."
            rows={6}
            className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 focus-visible:border-violet-500 rounded-xl resize-none text-sm leading-relaxed min-h-28 sm:min-h-48"
          />
        </CardContent>
      </Card>

      {/* 2. Tone and Tactical Instructions Card */}
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-slate-100 text-base font-semibold tracking-wide flex items-center gap-2">
            <span>2. Response Directives</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs mt-1">
            Specify how the AI should draft this reply.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Tone Selector */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="tone-override" className="text-slate-300 text-xs font-semibold">Response Tone Override</Label>
            <Select
              value={selectedTone}
              onValueChange={(val) => setSelectedTone(val as TonePreference)}
            >
              <SelectTrigger id="tone-override" className="bg-slate-950/80 border-slate-800 text-slate-200 focus:ring-violet-500 rounded-xl">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="professional">👔 Professional & Formal</SelectItem>
                <SelectItem value="casual">👋 Warm & Casual</SelectItem>
                <SelectItem value="empathetic">❤️ Compassionate & Empathetic</SelectItem>
                <SelectItem value="urgent">⚡ Direct & Rapid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tactical Instruction Panel */}
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="additional-directives" className="text-slate-300 text-xs font-semibold">Additional Directives (One-Off Rules)</Label>
            <Input
              id="additional-directives"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="e.g. 'Offer a 10% coupon code cloudsaas10' or 'Acknowledge the delay'"
              className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3. Collapsible Customer Profile CRM Details Card */}
      <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl">
        <button
          onClick={() => setShowCRM(!showCRM)}
          aria-expanded={showCRM}
          aria-label="Customer Relationship Context (CRM)"
          className="w-full text-left flex justify-between items-center p-6 border-b border-transparent transition-[background-color,border-color,transform] duration-150 active:scale-95 hover:bg-slate-800/20"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-slate-100 text-sm font-semibold tracking-wide">
                3. Customer Relationship Context (CRM)
              </CardTitle>
              <CardDescription className="text-slate-400 text-[10px] mt-0.5">
                Inject custom client value, company name, or mood context.
              </CardDescription>
            </div>
          </div>
          {showCRM ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {showCRM && (
          <CardContent className="pt-4 pb-6 space-y-4 border-t border-slate-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer-email" className="text-slate-300 text-[11px] font-semibold">Customer Email *</Label>
                <Input
                  id="customer-email"
                  value={customerContext.email}
                  onChange={(e) => setCustomerContext({ ...customerContext, email: e.target.value })}
                  placeholder="name@company.com"
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-name" className="text-slate-300 text-[11px] font-semibold">Company Name</Label>
                <Input
                  id="company-name"
                  value={customerContext.companyName || ''}
                  onChange={(e) => setCustomerContext({ ...customerContext, companyName: e.target.value })}
                  placeholder="Client company name"
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer-first-name" className="text-slate-300 text-[11px] font-semibold">First Name</Label>
                <Input
                  id="customer-first-name"
                  value={customerContext.firstName || ''}
                  onChange={(e) => setCustomerContext({ ...customerContext, firstName: e.target.value })}
                  placeholder="Sarah"
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer-last-name" className="text-slate-300 text-[11px] font-semibold">Last Name</Label>
                <Input
                  id="customer-last-name"
                  value={customerContext.lastName || ''}
                  onChange={(e) => setCustomerContext({ ...customerContext, lastName: e.target.value })}
                  placeholder="Connor"
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="relationship-notes" className="text-slate-300 text-[11px] font-semibold">Relationship Notes / Status</Label>
              <Textarea
                id="relationship-notes"
                value={customerContext.relationshipNotes || ''}
                onChange={(e) => setCustomerContext({ ...customerContext, relationshipNotes: e.target.value })}
                placeholder="VIP client since 2024. Active subscription is the Enterprise plan. Historically very polite, but currently frustrated due to double billing."
                rows={3}
                className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl resize-none text-xs leading-normal"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Form Submission Button */}
      <Button
        size="lg"
        disabled={!isFormValid || isGenerating}
        onClick={onGenerate}
        className="w-full bg-linear-to-r from-violet-600 via-indigo-600 to-blue-600 text-white font-bold hover:shadow-indigo-500/20 hover:shadow-xl transition-all duration-300 py-4 sm:py-6 rounded-2xl border border-violet-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        <Sparkles className="w-5 h-5 text-white" />
        {isGenerating ? 'Drafting Customer Reply...' : 'Generate Customer Reply'}
      </Button>
    </div>
  );
}
