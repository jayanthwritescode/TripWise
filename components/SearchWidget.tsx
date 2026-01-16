
import React, { useState, useEffect, useRef } from 'react';
import { Plane, Building, ExternalLink, Search, MapPin, Plus, Star, ChevronDown, ChevronUp, Clock, Milestone, Wallet, Sparkles, Quote, Info, RefreshCw, Coffee, Map, Loader2, Coins, Gem, ArrowUpRight, AlertCircle } from 'lucide-react';
import { searchTravelData, getDestinationSuggestions } from '../services/gemini';
import { SearchResult, FlightInfo, HotelInfo } from '../types';

interface SearchWidgetProps {
  destination: string;
  startDate: string;
  onSelectFlight?: (flight: FlightInfo) => void;
  selectedFlight?: FlightInfo;
  onSelectHotel?: (hotel: HotelInfo) => void;
  selectedHotel?: HotelInfo;
}

const extractValue = (text: string, key: string): string => {
  const patterns = [
    new RegExp(`${key}:\\s*(.*)`, 'i'),
    new RegExp(`\\*\\*${key}:\\*\\*\\s*(.*)`, 'i'),
    new RegExp(`^${key}\\s*-\\s*(.*)`, 'im')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim().replace(/\*/g, '').split('[OPTION_END]')[0].trim();
  }
  return '';
};

const PremiumResultCard: React.FC<{ 
  section: string; 
  onSelect?: (details: string) => void;
  type: 'flights' | 'hotels';
}> = ({ section, onSelect, type }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const name = extractValue(section, 'NAME') || "Discovery Option";
  const price = extractValue(section, 'PRICE') || "Check Live Rate";
  const rating = extractValue(section, 'RATING') || "4.5/5";
  const duration = extractValue(section, 'DURATION') || "See Details";
  const stops = extractValue(section, 'STOPS') || "Direct";
  const times = extractValue(section, 'TIMES');
  const layovers = extractValue(section, 'LAYOVERS');
  const context = extractValue(section, 'CONTEXT');
  const tag = extractValue(section, 'TAG') || (type === 'flights' ? 'Top Choice' : 'Curated Stay');
  const reasoning = extractValue(section, 'REASONING');

  return (
    <div className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E1B4B] text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-2.5 h-2.5" /> {tag}
          </div>
          <h4 className="text-2xl font-editorial italic text-[#1E1B4B] leading-tight group-hover:text-indigo-600 transition-colors">
            {name}
          </h4>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-[#1E1B4B] leading-none mb-1">{price}</div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Estimate</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {type === 'flights' ? (
          <>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span className="text-[13px] font-bold">{duration}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Milestone className="w-4 h-4 text-indigo-400" />
              <span className="text-[13px] font-bold">{stops}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-[13px] font-bold">{rating}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-[13px] font-bold">Verified Locale</span>
            </div>
          </>
        )}
      </div>

      {reasoning && (
        <div className="mb-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/30">
          <div className="flex items-start gap-3">
            <Quote className="w-4 h-4 text-indigo-400 shrink-0 mt-1 rotate-180" />
            <p className="text-[14.5px] text-[#1E1B4B] font-medium leading-relaxed italic opacity-90">
              {reasoning}
            </p>
          </div>
        </div>
      )}

      <div className="mt-auto space-y-4">
        <div className={`overflow-hidden transition-all duration-500 ${showDetails ? 'max-h-[600px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <div className="pt-5 border-t border-gray-100/60 space-y-6">
             {type === 'flights' ? (
               <div className="space-y-6">
                 {times && (
                   <div className="space-y-2">
                     <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3" /> Flight Window
                     </div>
                     <p className="text-[15px] font-bold text-[#1E1B4B]">{times}</p>
                   </div>
                 )}
                 {layovers && (
                   <div className="space-y-2">
                     <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Map className="w-3 h-3" /> Routing
                     </div>
                     <p className="text-sm text-slate-600 leading-relaxed font-medium">
                       {layovers}
                     </p>
                   </div>
                 )}
               </div>
             ) : (
               <div className="space-y-4">
                 <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3" /> Description
                 </div>
                 <p className="text-sm text-slate-600 leading-loose font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                   {context || "Detailed context is being verified for this specific stay."}
                 </p>
               </div>
             )}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => onSelect?.(section)}
            className="flex-1 py-4.5 rounded-2xl bg-[#1E1B4B] text-white font-bold text-[14px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <Plus className="w-4.5 h-4.5" /> Select Option
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`px-5 py-4.5 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              showDetails ? 'bg-slate-50 border-slate-200 text-[#1E1B4B]' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-100'
            }`}
          >
            {showDetails ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchWidget: React.FC<SearchWidgetProps> = ({ destination, startDate, onSelectFlight, selectedFlight, onSelectHotel, selectedHotel }) => {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');
  const [tripType, setTripType] = useState<'round' | 'one-way'>('round');
  const [budgetTier, setBudgetTier] = useState<'Value' | 'Standard' | 'Premium' | 'Luxury'>('Standard');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originCity, setOriginCity] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      const messages = ["Scouring global networks...", "Validating live availability...", "Refining results..."];
      let idx = 0;
      setLoadingMsg(messages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % messages.length;
        setLoadingMsg(messages[idx]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (originCity.trim().length >= 2 && activeTab === 'flights') {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearchingOrigin(true);
        try {
          const results = await getDestinationSuggestions(originCity);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (e) {
          // Silent fail for autocomplete
        } finally {
          setIsSearchingOrigin(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [originCity, activeTab]);

  const handleSearch = async () => {
    if (activeTab === 'flights' && !originCity) return;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const query = activeTab === 'flights'
        ? `${tripType} flight options from ${originCity} to ${destination} departing around ${startDate}`
        : `Top rated ${budgetTier} hotels and stays in ${destination} for the period of ${startDate}`;
      const data = await searchTravelData(query, activeTab === 'flights');
      setResults(data);
    } catch (e: any) {
      if (e.message === 'API_RATE_LIMIT') {
        setError("Our AI engine is currently at capacity. Please use the verified search platforms below for real-time results.");
      } else {
        setError("Something went wrong with the AI search. Please try again or use the manual links.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAttachOption = (section: string) => {
    if (activeTab === 'flights') {
      onSelectFlight?.({
        airline: extractValue(section, 'NAME'),
        duration: extractValue(section, 'DURATION'),
        stops: extractValue(section, 'STOPS'),
        priceRange: extractValue(section, 'PRICE'),
        times: extractValue(section, 'TIMES'),
        layoverDetails: extractValue(section, 'LAYOVERS'),
        details: section
      });
    } else {
      onSelectHotel?.({
        name: extractValue(section, 'NAME'),
        rating: extractValue(section, 'RATING'),
        priceRange: extractValue(section, 'PRICE'),
        highlight: extractValue(section, 'TAG'),
        details: section
      });
    }
  };

  const getGoogleFlightsUrl = () => `https://www.google.com/travel/flights?q=Flights from ${encodeURIComponent(originCity || "anywhere")} to ${encodeURIComponent(destination)} on ${startDate}`;
  const getGoogleHotelsUrl = () => `https://www.google.com/travel/hotels?q=Hotels in ${encodeURIComponent(destination)} on ${startDate}`;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-indigo-900/5 border border-gray-100 flex gap-2 w-fit mx-auto">
        <button onClick={() => { setActiveTab('flights'); setResults(null); setError(null); }} className={`px-8 py-3.5 rounded-[1.5rem] flex items-center gap-3 font-bold transition-all text-[14px] ${activeTab === 'flights' ? 'bg-[#1E1B4B] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Plane className="w-4.5 h-4.5" /> Flights
        </button>
        <button onClick={() => { setActiveTab('hotels'); setResults(null); setError(null); }} className={`px-8 py-3.5 rounded-[1.5rem] flex items-center gap-3 font-bold transition-all text-[14px] ${activeTab === 'hotels' ? 'bg-[#1E1B4B] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
          <Building className="w-4.5 h-4.5" /> Hotels
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-indigo-900/5 border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-10 md:p-14 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {activeTab === 'flights' ? (
              <>
                <div className="md:col-span-3 space-y-3.5">
                  <label className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-widest ml-1">Type</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-xl h-[72px]">
                    {['round', 'one-way'].map(t => (
                      <button key={t} onClick={() => setTripType(t as any)} className={`flex-1 rounded-lg text-xs font-bold ${tripType === t ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-slate-500'}`}>{t === 'round' ? 'Round' : 'One-way'}</button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-4 relative space-y-3.5">
                  <label className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-widest ml-1 block">Origin</label>
                  <div className="relative h-[72px]">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input type="text" placeholder="Origin City" value={originCity} onChange={(e) => setOriginCity(e.target.value)} onFocus={() => setShowSuggestions(suggestions.length > 0)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="w-full h-full pl-14 pr-6 bg-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none text-[15px] font-bold text-[#1E1B4B]" />
                    {isSearchingOrigin && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-indigo-400" />}
                  </div>
                  {showSuggestions && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
                      {suggestions.map((s) => (
                        <button key={s} onClick={() => { setOriginCity(s); setShowSuggestions(false); }} className="w-full text-left px-5 py-3.5 text-sm font-bold hover:bg-indigo-50 text-[#1E1B4B]">{s}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="md:col-span-3 space-y-3.5">
                  <label className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-widest ml-1 block">To</label>
                  <div className="w-full h-[72px] px-7 bg-indigo-50/50 rounded-2xl text-[15px] font-bold text-[#1E1B4B] flex items-center gap-3 border border-indigo-100/30 truncate">
                    <MapPin className="w-4.5 h-4.5 text-indigo-600 shrink-0" /> {destination}
                  </div>
                </div>
              </>
            ) : (
              <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3.5">
                  <label className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-widest ml-1 block">Locale</label>
                  <div className="h-[72px] px-8 bg-indigo-50/50 rounded-2xl text-[15px] font-bold text-[#1E1B4B] flex items-center gap-4 border border-indigo-100/40 truncate"><MapPin className="w-5 h-5 text-indigo-600 shrink-0" /> {destination}</div>
                </div>
                <div className="space-y-3.5">
                  <label className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-widest ml-1 block">Stay Tier</label>
                  <div className="flex bg-slate-50 p-1.5 rounded-xl h-[72px] gap-1">
                    {['Value', 'Standard', 'Premium', 'Luxury'].map(t => (
                      <button key={t} onClick={() => setBudgetTier(t as any)} className={`flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${budgetTier === t ? 'bg-white text-[#1E1B4B] shadow-sm' : 'text-slate-400'}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="md:col-span-2 space-y-3.5">
              <label className="hidden md:block opacity-0">Find</label>
              <button onClick={handleSearch} disabled={loading || (activeTab === 'flights' && !originCity)} className="w-full h-[72px] bg-[#1E1B4B] text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-20 active:scale-95 shadow-xl shadow-indigo-900/10">
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> <span>Find</span></>}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <div className="relative mb-8"><div className="w-20 h-20 border-4 border-indigo-50 rounded-full border-t-indigo-600 animate-spin"></div><div className="absolute inset-0 flex items-center justify-center text-indigo-500"><Sparkles className="w-8 h-8" /></div></div>
              <p className="text-2xl font-editorial italic text-[#1E1B4B]">{loadingMsg}</p>
            </div>
          ) : error ? (
            <div className="py-24 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center mb-8 border border-amber-100">
                 <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h4 className="text-3xl font-editorial italic text-[#1E1B4B] mb-4">Discovery Unavailable</h4>
              <p className="text-slate-500 max-w-lg mx-auto font-medium leading-relaxed mb-12">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href={getGoogleFlightsUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-10 py-5 bg-[#1E1B4B] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-indigo-900/10"><Plane className="w-5 h-5" /> Open Google Flights <ArrowUpRight className="w-4 h-4" /></a>
                <a href={getGoogleHotelsUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 px-10 py-5 bg-white border border-gray-200 text-[#1E1B4B] rounded-2xl font-bold hover:bg-slate-50 transition-all">Google Hotels <ArrowUpRight className="w-4 h-4" /></a>
              </div>
            </div>
          ) : results ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.text.split('---').filter(s => s.trim().length > 30).map((section, idx) => (
                  <PremiumResultCard key={idx} section={section} type={activeTab} onSelect={handleAttachOption} />
                ))}
              </div>
              <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-2xl font-editorial italic text-[#1E1B4B]">Manual Verification</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Open search in verified travel platforms</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <a href={getGoogleFlightsUrl()} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"><Plane className="w-4 h-4" /> Flights <ArrowUpRight className="w-3.5 h-3.5" /></a>
                  <a href={getGoogleHotelsUrl()} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"><Building className="w-4 h-4" /> Hotels <ArrowUpRight className="w-3.5 h-3.5" /></a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-8">{activeTab === 'flights' ? <Plane className="w-8 h-8 text-slate-300" /> : <Building className="w-8 h-8 text-slate-300" />}</div>
              <h4 className="text-2xl font-editorial italic text-[#1E1B4B]">Ready to Search</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchWidget;
