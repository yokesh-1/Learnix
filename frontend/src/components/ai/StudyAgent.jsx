import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, Send, Search, FileText, Layers } from 'lucide-react';
import agentService from '../../services/agentService';
import MarkdownRenderer from '../common/MarkdownRenderer';
import toast from 'react-hot-toast';

// Maps backend tool names to a friendly label + icon for the "thinking" trace.
const TOOL_META = {
  search_document: { label: 'Searched the document', Icon: Search },
  summarize_document: { label: 'Summarized the document', Icon: FileText },
  generate_flashcards: { label: 'Generated flashcards', Icon: Layers },
};

const SUGGESTIONS = [
  'Summarize this document and make 5 flashcards.',
  'What are the key concepts I should focus on?',
  'Create flashcards for the hardest topics.',
];

const StudyAgent = () => {
  const { id: documentId } = useParams();

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { answer, steps, flashcards }

  const ask = async (text) => {
    const q = (text ?? question).trim();
    if (!q) {
      toast.error('Please enter a question for the agent.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await agentService.ask(documentId, q);
      setResult(data);
    } catch (error) {
      toast.error(error?.error || error?.message || 'Agent request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask();
  };

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/25 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Study Assistant Agent</h3>
            <p className="text-xs text-slate-500">Ask anything. It decides which tools to use.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-3">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Summarize this and make 5 flashcards on the key topics"
              rows={2}
              className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-fuchsia-500 focus:bg-white resize-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="shrink-0 h-[52px] px-5 bg-linear-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" strokeWidth={2} />
              )}
              Ask
            </button>
          </div>

          {/* Suggestions */}
          {!result && !loading && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setQuestion(s); ask(s); }}
                  className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors hover:cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Thinking state */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-fuchsia-500 rounded-full animate-spin" />
            The agent is working through your request...
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Steps / tools used */}
            {Array.isArray(result.steps) && result.steps.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Agent steps
                </p>
                <ul className="space-y-1.5">
                  {result.steps.map((step, i) => {
                    const meta = TOOL_META[step.tool] || { label: step.tool, Icon: Bot };
                    const { Icon } = meta;
                    return (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="shrink-0 w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5 text-fuchsia-600" strokeWidth={2} />
                        </span>
                        {meta.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Answer */}
            <div className="p-5 rounded-xl border border-slate-200/70 bg-white">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Answer
              </p>
              <div className="prose prose-sm max-w-none prose-slate">
                <MarkdownRenderer content={result.answer || ''} />
              </div>
            </div>

            {/* Flashcards (if the agent generated any) */}
            {Array.isArray(result.flashcards) && result.flashcards.length > 0 && (
              <div className="p-5 rounded-xl border border-slate-200/70 bg-white">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Flashcards ({result.flashcards.length})
                </p>
                <div className="space-y-3">
                  {result.flashcards.map((card, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-50/60 border border-slate-200/70"
                    >
                      <p className="text-sm font-semibold text-slate-900">Q: {card.question}</p>
                      <p className="text-sm text-slate-600 mt-1">A: {card.answer}</p>
                      {card.difficulty && (
                        <span className="inline-block mt-2 text-[11px] font-medium text-fuchsia-700 bg-fuchsia-100 px-2 py-0.5 rounded-full capitalize">
                          {card.difficulty}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyAgent;
