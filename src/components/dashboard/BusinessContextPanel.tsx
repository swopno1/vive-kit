import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { BusinessContext, TonePreference } from '../../types';
import { Save, Check, FileText, Globe, Tag, DollarSign, HelpCircle, Loader2 } from 'lucide-react';

interface BusinessContextPanelProps {
  onSaveSuccess?: () => void;
}

export function BusinessContextPanel({ onSaveSuccess }: BusinessContextPanelProps) {
  const [context, setContext] = useState<BusinessContext>({
    businessName: '',
    industry: '',
    websiteUrl: '',
    tonePreference: 'professional',
    pricingInstructions: '',
    generalContext: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial context settings
  useEffect(() => {
    async function loadContext() {
      try {
        const res = await fetch('/api/context');
        if (!res.ok) throw new Error('Failed to retrieve active settings');
        const data = await res.json();
        if (data.context) {
          setContext(data.context);
        }
      } catch (err: any) {
        console.error('Error fetching context:', err);
        setError(err.message || 'Error loading active contexts');
      } finally {
        setIsLoading(false);
      }
    }
    loadContext();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const res = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      });

      if (!res.ok) throw new Error('Failed to store context settings');
      const data = await res.json();
      if (data.success && data.context) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        if (onSaveSuccess) onSaveSuccess();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving contexts');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mr-2" />
        <span className="text-sm font-semibold">Loading business specifications...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      
      {/* Header Info */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-400" />
            <span>Business Context & Instructions Settings</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Define pricing constraints, brand voice guidelines, and core FAQs that guide the AI support agent's outputs.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isSaving || !context.businessName}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            saved
              ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md'
              : 'bg-violet-600 text-white hover:bg-violet-500 hover:shadow-violet-500/20 hover:shadow-md border border-violet-400/20'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Saving Changes...</span>
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-white" />
              <span>Save Specifications</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          Error: {error}
        </div>
      )}

      {/* Grid Specifications */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Side: General Profile (1 Column) */}
        <div className="col-span-1 space-y-6">
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Company Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold">Brand / Business Name *</Label>
                <Input
                  value={context.businessName}
                  onChange={(e) => setContext({ ...context, businessName: e.target.value })}
                  placeholder="e.g. CloudSaas Inc."
                  required
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold">Industry / Domain</Label>
                <Input
                  value={context.industry || ''}
                  onChange={(e) => setContext({ ...context, industry: e.target.value })}
                  placeholder="e.g. B2B SaaS"
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold">Website URL</Label>
                <Input
                  value={context.websiteUrl || ''}
                  onChange={(e) => setContext({ ...context, websiteUrl: e.target.value })}
                  placeholder="e.g. https://cloudsaas.io"
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                <Label className="text-slate-300 text-xs font-semibold">Default Global Tone</Label>
                <Select
                  value={context.tonePreference}
                  onValueChange={(val) => setContext({ ...context, tonePreference: val as TonePreference })}
                >
                  <SelectTrigger className="bg-slate-950/80 border-slate-800 text-slate-200 focus:ring-violet-500 rounded-xl text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="professional">👔 Professional</SelectItem>
                    <SelectItem value="casual">👋 Warm & Casual</SelectItem>
                    <SelectItem value="empathetic">❤️ Empathetic</SelectItem>
                    <SelectItem value="urgent">⚡ Rapid/Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Detailed Rules & FAQs (2 Columns) */}
        <div className="col-span-2 space-y-6">
          
          {/* Pricing & Discounts Rules */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Pricing & Discount Instructions</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-[11px] mt-0.5">
                Outline explicit rules for subscription billing, coupons, refunds, and operator authority limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={context.pricingInstructions}
                onChange={(e) => setContext({ ...context, pricingInstructions: e.target.value })}
                placeholder={`e.g.
1. Standard Package is $29/mo, includes 1000 credits.
2. Premium Tier is $79/mo, includes unlimited credits.
3. Refund window is strictly 30 days. Outside of 30 days, we only grant company credit (up to $50 max).
4. Operator may offer up to a 10% loyalty discount code: 'LOYAL10' for distressed customers.`}
                rows={7}
                className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl resize-none text-xs leading-relaxed"
              />
            </CardContent>
          </Card>

          {/* Brand FAQ / General Context */}
          <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>Brand General Context & Brand FAQs</span>
              </CardTitle>
              <CardDescription className="text-slate-400 text-[11px] mt-0.5">
                Supply general info about your tools, services, operating hours, and standard technical questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={context.generalContext}
                onChange={(e) => setContext({ ...context, generalContext: e.target.value })}
                placeholder={`e.g.
* We are a smart drag-and-drop landing page builder.
* Core features include A/B testing, forms integration, and custom domain mapping.
* Support contact hours: 9 AM - 6 PM EST, Monday through Friday.
* Standard setup takes less than 3 minutes, no coding needed.`}
                rows={8}
                className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl resize-none text-xs leading-relaxed"
              />
            </CardContent>
          </Card>

        </div>

      </div>

    </form>
  );
}
