
import React, { useState, useEffect, useRef } from 'react';
import { TripDetails, Itinerary, SavedTrip, FlightInfo, HotelInfo, Activity, HeroImage } from './types';
import { generateItinerary, generateDestinationIllustration } from './services/gemini';
import TripForm from './components/TripForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import SearchWidget from './components/SearchWidget';
import LandingPage from './components/LandingPage';
import { Plane, Save, History, Trash2, ChevronRight, Sparkles, MoveLeft, AlertTriangle, RefreshCw, X, WifiOff, ShieldAlert, KeyRound } from 'lucide-react';

const STORAGE_KEY = 'tripwise_saved_trips';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [view, setView] = useState<'itinerary' | 'booking'>('itinerary');
  const [appState, setAppState] = useState<'landing' | 'planner'>('landing');
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [errorState, setErrorState] = useState<{ code: string; message: string } | null>(null);
  
  const plannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setSavedTrips(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleTripSubmit = async (details: TripDetails) => {
    setLoading(true);
    setErrorState(null);
    setItinerary(null);
    setTripDetails(details);
    setIsSaved(false);
    setView('itinerary');
    
    try {
      const itineraryResult = await generateItinerary(details);
      const heroImage = await generateDestinationIllustration(
        details.destination, 
        itineraryResult.heroSearchTerm
      );
      itineraryResult.heroImage = heroImage;
      setItinerary(itineraryResult);
    } catch (error: any) {
      const code = error.message;
      let message = "We encountered an unexpected issue. Please try again.";
      
      if (code === 'ERR_RATE_LIMIT') message = "Our AI engine is currently busy. Please wait 60 seconds and try again.";
      if (code === 'ERR_NETWORK') message = "Unable to reach our servers. Please check your internet connection.";
      if (code === 'ERR_AUTH') message = "There is an issue with the API authentication. Please check your configuration.";
      if (code === 'ERR_SAFETY') message = "The request was flagged by safety filters. Try a different destination.";
      
      setErrorState({ code, message });
    } finally {
      setLoading(false);
    }
  };

  const getErrorIcon = (code: string) => {
    switch (code) {
      case 'ERR_NETWORK': return <WifiOff className="w-8 h-8 text-amber-500" />;
      case 'ERR_SAFETY': return <ShieldAlert className="w-8 h-8 text-amber-500" />;
      case 'ERR_AUTH': return <KeyRound className="w-8 h-8 text-amber-500" />;
      default: return <AlertTriangle className="w-8 h-8 text-amber-500" />;
    }
  };

  const startNewPlanner = () => {
    setAppState('planner');
    setItinerary(null);
    setTripDetails(null);
    setErrorState(null);
    setTimeout(() => plannerRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleReset = () => {
    setItinerary(null);
    setTripDetails(null);
    setView('itinerary');
    setErrorState(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setAppState('landing'), 300);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#FBFCFE]">
      {appState === 'landing' ? (
        <LandingPage onStart={startNewPlanner} savedTrips={savedTrips} onLoadTrip={(t) => { setTripDetails(t.details); setItinerary(t.itinerary); setAppState('planner'); }} onDeleteTrip={(id) => setSavedTrips(savedTrips.filter(s => s.id !== id))} />
      ) : (
        <div ref={plannerRef} className="flex-1 flex flex-col animate-in fade-in duration-700">
          <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
                <div className="bg-[#1E1B4B] p-2 rounded-xl"><Plane className="w-6 h-6 text-white" /></div>
                <span className="text-xl font-bold text-[#1E1B4B]">TripWise</span>
              </div>
              <button onClick={handleReset} className="p-2.5 text-gray-400 hover:text-indigo-600 transition-all flex items-center gap-2 font-medium text-sm">
                <MoveLeft className="w-4 h-4" /> Return
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
            {errorState && (
              <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-amber-900/5">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                    {getErrorIcon(errorState.code)}
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h4 className="text-2xl font-editorial italic text-[#1E1B4B]">Service Interruption</h4>
                    <p className="text-slate-600 font-medium">{errorState.message}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => tripDetails && handleTripSubmit(tripDetails)} className="px-8 py-4 bg-[#1E1B4B] text-white rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Retry</button>
                    <button onClick={() => setErrorState(null)} className="p-4 bg-white border border-amber-100 text-amber-500 rounded-2xl hover:bg-amber-100 transition-all"><X className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            )}

            {!itinerary ? (
              <div className="py-12"><TripForm onSubmit={handleTripSubmit} loading={loading} /></div>
            ) : (
              <div className="space-y-10">
                <div className="flex justify-center">
                  <div className="bg-white p-1.5 rounded-[1.5rem] shadow-xl border border-gray-100 flex gap-1">
                    <button onClick={() => setView('itinerary')} className={`px-10 py-3 rounded-2xl font-bold transition-all text-sm ${view === 'itinerary' ? 'bg-[#1E1B4B] text-white shadow-lg' : 'text-gray-400'}`}>Itinerary Journal</button>
                    <button onClick={() => setView('booking')} className={`px-10 py-3 rounded-2xl font-bold transition-all text-sm ${view === 'booking' ? 'bg-[#1E1B4B] text-white shadow-lg' : 'text-gray-400'}`}>Logistics Discovery</button>
                  </div>
                </div>
                {view === 'itinerary' ? (
                  <ItineraryDisplay itinerary={itinerary} />
                ) : (
                  <SearchWidget destination={tripDetails?.destination || ''} startDate={tripDetails?.startDate || ''} />
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
