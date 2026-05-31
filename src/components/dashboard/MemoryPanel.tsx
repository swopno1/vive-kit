import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Database,
  Search,
  PlusCircle,
  Check,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export function MemoryPanel() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [searchIsMock, setSearchIsMock] = useState(false);

  // Ingestion state
  const [ingestContent, setIngestContent] = useState("");
  const [ingestCategory, setIngestCategory] = useState("billing");
  const [ingestSource, setIngestSource] = useState("faq_kb");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingested, setIngested] = useState(false);

  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError("");
    try {
      const res = await fetch(
        `/api/memory?query=${encodeURIComponent(searchQuery)}&limit=3&threshold=0.3`,
      );
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      setSearchResults(data.memories || []);
      setSearchIsMock(!!data.isMock);
      setSearchCompleted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error executing semantic search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestContent.trim()) return;
    setIsIngesting(true);
    setError("");
    try {
      const res = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: ingestContent,
          metadata: {
            category: ingestCategory,
            source: ingestSource,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to generate embedding");
      const data = await res.json();
      if (data.success) {
        setIngested(true);
        setIngestContent("");
        setTimeout(() => setIngested(false), 2500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error ingesting vector memory");
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Header Info */}
      <div className="shrink-0">
        <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <span>pgvector Semantic Memory Explorer (RAG)</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Manage, search, and insert embeddings of support tickets, FAQ
          documents, and operational rules directly into your vector store
          database.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          Error: {error}
        </div>
      )}

      {/* Grid panels */}
      <div className="grid grid-cols-2 gap-6">
        {/* Panel 1: Vector Similarity Search Tester */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-800/60 shrink-0">
            <CardTitle className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
              <Search className="w-4 h-4 text-violet-400" />
              <span>Vector Similarity Search (Test Retrieval)</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-[11px] mt-0.5">
              Type standard customer queries to simulate semantic lookup and see
              matching confidence/similarity scores.
            </CardDescription>
          </CardHeader>

          <div className="flex-grow min-h-0 p-6 flex flex-col gap-5 justify-between">
            {/* Search Bar Form */}
            <form onSubmit={handleSearch} className="flex gap-2 shrink-0">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type e.g., 'What are pricing tiers?' or 'refund rules'"
                className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs h-9 flex-1"
              />
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-4 h-9 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                {isSearching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>Search</span>
              </Button>
            </form>

            {/* Search Output */}
            <div className="flex-1 min-h-0 relative rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 overflow-y-auto custom-scrollbar">
              {/* Active search mocks status warning */}
              {searchIsMock && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-400 flex items-start gap-2 mb-3.5 shrink-0 leading-normal">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Database is operating in <strong>Mock Mode</strong>.
                    Returning static vector representations to simulate pgvector
                    responses.
                  </span>
                </div>
              )}

              {!searchCompleted && !isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="text-slate-500 text-xs">
                    Run a search query above to test similarity matches.
                  </p>
                </div>
              )}

              {isSearching && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-500 mb-2" />
                  <span className="text-[11px] font-medium">
                    Embedding query & scoring vectors...
                  </span>
                </div>
              )}

              {searchCompleted &&
                !isSearching &&
                searchResults.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-slate-500 text-xs font-semibold">
                      No memories matched the search threshold.
                    </p>
                  </div>
                )}

              {searchCompleted && !isSearching && searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((memory, idx) => (
                    <div
                      key={memory.id || idx}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2.5 relative group hover:border-slate-700/80 transition-all duration-300"
                    >
                      {/* Similarity Badge */}
                      <div className="absolute right-3 top-3 flex items-center gap-1.5">
                        <span className="text-[9px] font-semibold text-slate-500">
                          Cosine Match
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/25">
                          {Math.floor(memory.similarity * 100)}%
                        </span>
                      </div>

                      {/* Content text */}
                      <p className="text-slate-200 text-xs font-medium leading-relaxed pr-24 whitespace-pre-wrap">
                        {memory.content}
                      </p>

                      {/* Metadata tag footer */}
                      <div className="flex gap-2 pt-1 border-t border-slate-800/40 text-[10px]">
                        <span className="text-slate-500 font-semibold uppercase">
                          Category:
                        </span>
                        <span className="text-slate-400 font-medium">
                          {memory.metadata?.category || "general"}
                        </span>
                        <span className="text-slate-500 font-semibold uppercase ml-2.5">
                          Source:
                        </span>
                        <span className="text-slate-400 font-medium">
                          {memory.metadata?.source || "faq"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Panel 2: Vector Memory Ingestion Form */}
        <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-xl flex flex-col h-[600px] overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-800/60 shrink-0">
            <CardTitle className="text-slate-100 text-sm font-semibold tracking-wide flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Ingest New Vector Memory (Store Knowledge)</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-[11px] mt-0.5">
              Embed custom Q&A items, customer agreements, or technical
              procedures into long-term agent context.
            </CardDescription>
          </CardHeader>

          <form
            onSubmit={handleIngest}
            className="flex-grow min-h-0 p-6 flex flex-col justify-between gap-5"
          >
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {/* Memory content chunk */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-xs font-semibold">
                  Knowledge Content Chunk *
                </Label>
                <Textarea
                  value={ingestContent}
                  onChange={(e) => setIngestContent(e.target.value)}
                  placeholder="e.g. 'Standard onboarding support includes a 45-minute live screen share with our setups manager, active only for Pro teams billed annually. Standard plans receive email guides.'"
                  rows={8}
                  required
                  className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl resize-none text-xs leading-relaxed"
                />
              </div>

              {/* Tagging */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs font-semibold">
                    Memory Category Tag
                  </Label>
                  <Input
                    value={ingestCategory}
                    onChange={(e) => setIngestCategory(e.target.value)}
                    placeholder="e.g. billing, feature, technical"
                    className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs font-semibold">
                    Source Document Name
                  </Label>
                  <Input
                    value={ingestSource}
                    onChange={(e) => setIngestSource(e.target.value)}
                    placeholder="e.g. onboarding_pdf, kb_refund"
                    className="bg-slate-950/80 border-slate-800 text-slate-200 placeholder-slate-500 focus-visible:ring-violet-500 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Ingest Action Button */}
            <Button
              type="submit"
              disabled={isIngesting || !ingestContent.trim()}
              className={`w-full py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                ingested
                  ? "bg-emerald-600 text-white shadow-emerald-500/20 shadow-md"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-500/20 hover:shadow-lg border border-emerald-400/20"
              }`}
            >
              {isIngesting ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
                  <span>Generating Gemini Embeddings & Ingesting...</span>
                </>
              ) : ingested ? (
                <>
                  <Check className="w-4.5 h-4.5 text-white animate-bounce" />
                  <span>Memory Embedded & Ingested!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                  <span>Generate Vector Embedding & Save</span>
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
