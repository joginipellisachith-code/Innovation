import React, { useState } from 'react';
import { PRODUCTION_CODE_TEMPLATES } from '../../data/productionCodeTemplates';
import { Copy, Check, Database, Server, Cpu, FileCode2, Layers } from 'lucide-react';

export const CodeHub: React.FC = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PRODUCTION_CODE_TEMPLATES[0].id);
  const [copied, setCopied] = useState<boolean>(false);

  const activeTemplate = PRODUCTION_CODE_TEMPLATES.find((t) => t.id === selectedTemplateId) || PRODUCTION_CODE_TEMPLATES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Architecture Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Backend Architecture &amp; Production Code Artifacts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready-to-deploy PostgreSQL DDL schema, Prisma models, Express + Socket.IO routes, and Redis cache patterns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              PostgreSQL 14+ · Prisma · Redis 7+ · Express · Socket.IO
            </span>
          </div>
        </div>

        {/* 4-Tier System Design Architecture Diagram */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 block mb-3 uppercase tracking-wider font-mono">
            High-Concurrency Headcount Pipeline Architecture
          </span>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Tier 1 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold mb-1">
                <Cpu className="w-4 h-4 text-amber-600" />
                <span>1. Student PWA Edge</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Atomic RSVP toggles or 60s rotating QR tokens sent with HMAC signature.
              </p>
            </div>

            {/* Tier 2 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-sky-700 font-bold mb-1">
                <Server className="w-4 h-4 text-sky-600" />
                <span>2. Express &amp; Socket.IO</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Enforces 09:00 AM cutoff time-lock; broadcasts room updates with &lt;10ms latency.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                <Database className="w-4 h-4 text-rose-600" />
                <span>3. Redis In-Memory Cache</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Atomic <code className="text-amber-800 font-bold">INCRBY</code> / <code className="text-amber-800 font-bold">DECRBY</code> counters prevent database locks during morning rush.
              </p>
            </div>

            {/* Tier 4 */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>4. PostgreSQL Ledger</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                ACID transactions update monthly student mess rebate balances and inventory BOM.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Browser & Viewer */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {/* Template Selector Tabs */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/80 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            {PRODUCTION_CODE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  tmpl.id === selectedTemplateId
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{tmpl.filename}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors shrink-0 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Info Bar */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <h4 className="font-bold text-slate-900">{activeTemplate.title}</h4>
            <p className="text-slate-500 text-[11px] mt-0.5">{activeTemplate.description}</p>
          </div>
          <span className="font-mono text-slate-600 uppercase text-[10px] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 shrink-0 font-bold">
            {activeTemplate.language} · Production Ready
          </span>
        </div>

        {/* Code Body in clean developer console */}
        <div className="p-5 overflow-x-auto bg-[#0b0f19] text-xs font-mono text-slate-200 leading-relaxed max-h-[600px] select-text">
          <pre className="whitespace-pre">
            <code>{activeTemplate.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
