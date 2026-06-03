'use client';

import React, { useState } from 'react';
import { LeadDataExtraction } from '../../lib/ai/intelligence/schemas';
import { LeadMapper } from '../../lib/ai/lead-mapper';
import { EditableLeadInfo } from '../../types';
import { Check, AlertCircle, Edit2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface LeadExtractionProps {
  leadData: LeadDataExtraction;
  onApply?: (crmFields: Record<string, any>) => void;
}

export function LeadExtraction({ leadData, onApply }: LeadExtractionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<EditableLeadInfo>(() => LeadMapper.mapToCRMProfile(leadData));
  const confidence = LeadMapper.getConfidenceBreakdown(leadData);

  const handleSave = () => {
    onApply?.(editValues);
    setIsEditing(false);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-emerald-400';
    if (conf >= 0.6) return 'text-amber-400';
    return 'text-red-400';
  };

  const getConfidenceBg = (conf: number) => {
    if (conf >= 0.8) return 'bg-emerald-500/10 border-emerald-500/20';
    if (conf >= 0.6) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <Card className="bg-slate-900/20 border border-slate-900">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Extracted Lead Data</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getConfidenceBg(leadData.overallConfidence)}`}>
              {confidence.overall.quality} · {confidence.overall.confidence}
            </span>
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-slate-800 transition-colors"
              title="Edit extracted data"
            >
              <Edit2 className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Edit/View Mode */}
        {isEditing ? (
          // Edit Mode
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">First Name</label>
                <input
                  type="text"
                  value={editValues.firstName || ''}
                  onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={editValues.lastName || ''}
                  onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={editValues.email || ''}
                  onChange={(e) => setEditValues({ ...editValues, email: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Phone</label>
                <input
                  type="tel"
                  value={editValues.phone || ''}
                  onChange={(e) => setEditValues({ ...editValues, phone: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="+1-555-123-4567"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1">Company</label>
                <input
                  type="text"
                  value={editValues.company || ''}
                  onChange={(e) => setEditValues({ ...editValues, company: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="Acme Corp"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1">Service Interest</label>
                <input
                  type="text"
                  value={editValues.serviceInterest || ''}
                  onChange={(e) => setEditValues({ ...editValues, serviceInterest: e.target.value || undefined })}
                  className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  placeholder="Web development, API integration"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-2 text-sm">
            {[
              { label: 'Name', value: [confidence.firstName.value, confidence.lastName.value].filter(Boolean).join(' '), conf: (leadData.firstName.confidence + leadData.lastName.confidence) / 2 },
              { label: 'Email', value: confidence.email.value, conf: leadData.email.confidence },
              { label: 'Phone', value: confidence.phone.value, conf: leadData.phone.confidence },
              { label: 'Company', value: confidence.company.value, conf: leadData.company.confidence },
              { label: 'Services', value: confidence.serviceInterest.values.join(', '), conf: leadData.serviceInterest.confidence },
            ].map(item => item.value !== 'Not found' && (
              <div key={item.label} className="flex items-center justify-between p-2 rounded bg-slate-950/40">
                <div>
                  <span className="text-slate-400 block text-xs">{item.label}</span>
                  <span className="text-slate-200 font-medium">{item.value}</span>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${getConfidenceColor(item.conf)}`}>
                    {(item.conf * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="flex items-start gap-2 p-2 rounded bg-slate-950/40 text-xs text-slate-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Confidence scores indicate extraction accuracy. Edit any fields before saving to CRM.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
