import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, Clock, Target, Sparkles } from 'lucide-react';
import aiService from '../../services/aiService';
import toast from 'react-hot-toast';

const StudyPlanGenerator = () => {
  const { id: documentId } = useParams();

  const [days, setDays] = useState(7);
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlan(null);

    try {
      const data = await aiService.generateStudyPlan({
        documentId,
        days: Number(days),
        dailyMinutes: Number(dailyMinutes),
        goal: goal.trim(),
      });

      setPlan(data?.plan || null);

      if (!data?.plan?.days?.length) {
        toast.error('The AI returned an empty plan. Try again.');
      } else {
        toast.success('Study plan ready!');
      }
    } catch (error) {
      toast.error(error?.error || error?.message || 'Failed to generate study plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Study Plan Generator</h3>
            <p className="text-xs text-slate-500">A personalized day-by-day schedule from this document</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Form */}
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Days */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <CalendarDays className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                Number of days
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
                disabled={loading}
              />
            </div>

            {/* Daily minutes */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Clock className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                Minutes per day
              </label>
              <input
                type="number"
                min={10}
                max={600}
                step={5}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(e.target.value)}
                className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <Target className="w-4 h-4 text-indigo-500" strokeWidth={2} />
              Learning goal <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Prepare for an interview on React"
              className="w-full h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:bg-white"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-11 px-6 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Building your plan...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Generate Study Plan
              </>
            )}
          </button>
        </form>

        {/* Result */}
        {plan && plan.days?.length > 0 && (
          <div className="pt-2">
            <div className="mb-4 p-4 rounded-xl bg-linear-to-br from-indigo-50 to-violet-50 border border-indigo-100">
              <h4 className="font-semibold text-slate-900">{plan.title || 'Your Study Plan'}</h4>
              {plan.overview && (
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{plan.overview}</p>
              )}
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {plan.days.map((d) => (
                <div
                  key={d.day}
                  className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/40 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                        {d.day}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{d.title}</p>
                        {d.focus && <p className="text-xs text-slate-500">{d.focus}</p>}
                      </div>
                    </div>
                    {d.estimatedMinutes ? (
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        {d.estimatedMinutes} min
                      </span>
                    ) : null}
                  </div>
                  {Array.isArray(d.tasks) && d.tasks.length > 0 && (
                    <ul className="mt-2 ml-1 space-y-1.5">
                      {d.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="leading-relaxed">{task}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanGenerator;
