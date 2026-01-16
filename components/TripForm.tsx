
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Target, Send, Sparkles, ChevronRight, ChevronLeft, Minus, Plus, Info, Search, Loader2 } from 'lucide-react';
import { TripDetails } from '../types';
import { getDestinationSuggestions } from '../services/gemini';

interface TripFormProps {
  onSubmit: (details: TripDetails) => void;
  loading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, loading }) => {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<TripDetails>({
    destination: '',
    days: 3,
    objective: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchTimeoutRef = useRef<any>(null);
  const lastSelectedRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const objectives = [
    'Sightseeing', 'Food Exploration', 'Shopping', 'Adventure Sports', 'Relaxation', 'Cultural Immersion', 'Nightlife'
  ];

  useEffect(() => {
    const query = details.destination.trim();
    if (query === lastSelectedRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (query.length >= 2 && step === 1) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await getDestinationSuggestions(query);
          if (step === 1 && details.destination.trim() === query) {
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setActiveSuggestionIndex(-1);
          }
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [details.destination, step]);

  const selectSuggestion = (suggestion: string) => {
    lastSelectedRef.current = suggestion;
    setDetails(prev => ({ ...prev, destination: suggestion }));
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    // Auto-advance after selection for smooth UX
    setTimeout(() => setStep(2), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (step === 1 && showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (activeSuggestionIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[activeSuggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (step < 3) setStep(step + 1);
      else if (details.objective) onSubmit(details);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-indigo-900/5 overflow-hidden border border-gray-100 transition-all duration-700">
        <div className="h-1.5 w-full bg-gray-50"><div className="h-full bg-[#1E1B4B] transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} /></div>
        <div className="p-12 md:p-16">
          <form className="space-y-12 min-h-[400px] flex flex-col" onSubmit={(e) => e.preventDefault()}>
            
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 flex-1 space-y-10 relative">
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><div className="bg-indigo-50 p-2.5 rounded-2xl"><MapPin className="w-6 h-6 text-indigo-600" /></div><span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Step 01</span></div>
                  <h2 className="text-4xl md:text-5xl font-editorial italic text-[#1E1B4B]">Where to?</h2>
                  <p className="text-gray-400 text-lg font-medium">Enter your dream destination.</p>
                </div>
                <div className="relative">
                  <div className="relative flex items-center">
                    <input
                      autoFocus
                      ref={inputRef}
                      type="text"
                      className="w-full py-6 bg-transparent border-b-2 border-gray-100 focus:border-indigo-600 outline-none text-3xl md:text-4xl font-bold text-[#1E1B4B] placeholder:text-gray-200"
                      placeholder="e.g. Kyoto, Japan"
                      value={details.destination}
                      autoComplete="off"
                      onChange={(e) => {
                        lastSelectedRef.current = null;
                        setDetails({ ...details, destination: e.target.value });
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => details.destination.length >= 2 && setShowSuggestions(true)}
                    />
                    {isSearching && <div className="absolute right-0 top-1/2 -translate-y-1/2 text-indigo-400"><Loader2 className="w-6 h-6 animate-spin" /></div>}
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                      {suggestions.map((s, idx) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => selectSuggestion(s)}
                          onMouseEnter={() => setActiveSuggestionIndex(idx)}
                          className={`w-full text-left px-8 py-5 text-xl font-bold flex items-center gap-4 ${activeSuggestionIndex === idx ? 'bg-indigo-50 text-indigo-700' : 'text-[#1E1B4B]'}`}
                        >
                          <Search className={`w-5 h-5 ${activeSuggestionIndex === idx ? 'text-indigo-600' : 'text-gray-300'}`} /> {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 flex-1 space-y-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><div className="bg-indigo-50 p-2.5 rounded-2xl"><Calendar className="w-6 h-6 text-indigo-600" /></div><span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Step 02</span></div>
                  <h2 className="text-4xl md:text-5xl font-editorial italic text-[#1E1B4B]">Timing is everything.</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <label className="text-xs font-black uppercase tracking-widest block">Duration: {details.days} Days</label>
                    <div className="flex items-center gap-6">
                      <button type="button" onClick={() => setDetails(d => ({ ...d, days: Math.max(1, d.days - 1) }))} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all"><Minus className="w-5 h-5 text-gray-400" /></button>
                      <input type="range" min="1" max="14" className="flex-1 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1E1B4B]" value={details.days} onChange={(e) => setDetails({ ...details, days: parseInt(e.target.value) })} />
                      <button type="button" onClick={() => setDetails(d => ({ ...d, days: Math.min(14, d.days + 1) }))} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all"><Plus className="w-5 h-5 text-gray-400" /></button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest block">Start Date</label>
                    <input type="date" required className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none outline-none text-xl font-bold text-[#1E1B4B]" value={details.startDate} onChange={(e) => setDetails({ ...details, startDate: e.target.value })} onKeyDown={handleKeyDown} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 flex-1 space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><div className="bg-indigo-50 p-2.5 rounded-2xl"><Target className="w-6 h-6 text-indigo-600" /></div><span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Step 03</span></div>
                  <h2 className="text-4xl md:text-5xl font-editorial italic text-[#1E1B4B]">Set the intent.</h2>
                </div>
                <div className="flex flex-wrap gap-4">
                  {objectives.map((obj) => (
                    <button key={obj} type="button" onClick={() => setDetails({ ...details, objective: obj })} className={`px-8 py-4 rounded-full text-sm font-bold transition-all border-2 ${details.objective === obj ? 'bg-[#1E1B4B] text-white border-[#1E1B4B] scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-100'}`}>{obj}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-between">
              {step > 1 ? <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 text-gray-400 font-bold hover:text-[#1E1B4B] transition-all flex items-center gap-2"><ChevronLeft className="w-5 h-5" /> Back</button> : <div />}
              {step < 3 ? (
                <button type="button" disabled={!details.destination.trim()} onClick={() => setStep(step + 1)} className="px-10 py-5 bg-[#1E1B4B] text-white rounded-full font-bold flex items-center gap-3 shadow-xl transition-all disabled:opacity-20 active:scale-95">Next <ChevronRight className="w-5 h-5" /></button>
              ) : (
                <button type="button" disabled={loading || !details.objective} onClick={() => onSubmit(details)} className="px-12 py-5 bg-[#1E1B4B] text-white rounded-full font-bold flex items-center gap-4 shadow-xl hover:scale-105 transition-all disabled:opacity-30 active:scale-95">
                  {loading ? <Loader2 className="animate-spin h-6 w-6" /> : <>Plan Journey <Sparkles className="w-5 h-5" /></>}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TripForm;
