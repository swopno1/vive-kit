import React from 'react';
import { RetrievalResult } from '@/types';
import { Brain, Clock, Shield, Tag, TrendingUp } from 'lucide-react';

interface MemoryTimelineProps {
  memories: RetrievalResult[];
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({ memories }) => {
  if (memories.length === 0) {
    return (
      <div className="text-slate-400 text-sm italic p-4 text-center">
        No semantic memories found for this context.
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pricing_discussion': return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'business_risk': return <Shield className="w-4 h-4 text-rose-400" />;
      case 'project_requirement': return <Clock className="w-4 h-4 text-cyan-400" />;
      default: return <Brain className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
        <Clock className="w-3 h-3" />
        Semantic Memory Retrieval
      </h3>
      <div className="relative border-l border-slate-800 ml-2 pl-6 space-y-6">
        {memories.map((memory, index) => (
          <div key={memory.id || index} className="relative">
            <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(memory.category)}
                  <span className="text-[10px] font-medium text-slate-400 uppercase">
                    {memory.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500"
                      style={{ width: `${memory.similarity * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {(memory.similarity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {memory.content}
              </p>
              {memory.metadata.relevanceTags && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {memory.metadata.relevanceTags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-800/50 text-slate-500 text-[9px] border border-slate-800">
                      <Tag className="w-2 h-2" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
