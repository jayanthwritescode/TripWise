
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Sparkles, ExternalLink, Trash2, GripVertical, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Thermometer, Timer, ChevronDown, Plane, Building, Star, Map, Bed, Wifi, UtensilsCrossed, Info, ChevronUp, Quote, Camera } from 'lucide-react';
import { Itinerary, DayPlan, Activity, FlightInfo, HotelInfo, HeroImage } from '../types';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onUpdateActivity?: (dayIndex: number, activityIndex: number, action: 'up' | 'down' | 'delete') => void;
  onReorderActivity?: (dayIndex: number, fromIndex: number, toIndex: number) => void;
}

const WeatherIcon: React.FC<{ condition: string }> = ({ condition }) => {
  const lower = condition.toLowerCase();
  if (lower.includes('sun') || lower.includes('clear')) return <Sun className="w-5 h-5 text-amber-500" />;
  if (lower.includes('rain') || lower.includes('shower')) return <CloudRain className="w-5 h-5 text-blue-500" />;
  if (lower.includes('storm') || lower.includes('thunder')) return <CloudLightning className="w-5 h-5 text-indigo-500" />;
  if (lower.includes('snow')) return <Snowflake className="w-5 h-5 text-cyan-400" />;
  return <Cloud className="w-5 h-5 text-gray-400" />;
};

const FlightSummary: React.FC<{ flight: FlightInfo }> = ({ flight }) => (
  <div className="bg-[#1E1B4B] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden h-full">
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] opacity-60">Logistics Segment</p>
      </div>
      
      <div className="flex justify-between items-start gap-4 mb-8">
        <div className="space-y-1">
          <h3 className="text-3xl font-editorial italic leading-tight">{flight.airline}</h3>
          {flight.times && <p className="text-sm font-bold text-indigo-200">{flight.times}</p>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-black">{flight.priceRange}</div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Estimate</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 mt-auto">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Duration</p>
          <p className="text-sm font-bold">{flight.duration}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Type</p>
          <p className="text-sm font-bold">{flight.stops}</p>
        </div>
      </div>
      
      {flight.layoverDetails && flight.layoverDetails !== 'None' && (
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2.5">
           <Map className="w-3.5 h-3.5 text-indigo-400" />
           <p className="text-[11px] font-bold text-indigo-100 uppercase tracking-widest truncate">{flight.layoverDetails}</p>
        </div>
      )}
    </div>
  </div>
);

const AmenityBadge: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/50 border border-indigo-100/40 hover:scale-105 hover:bg-indigo-50 transition-all cursor-default">
    <div className="text-indigo-500">
      {React.cloneElement(icon as React.ReactElement<any>, { className: "w-3.5 h-3.5" })}
    </div>
    <span className="text-[10px] font-black text-[#1E1B4B] uppercase tracking-wider">{label}</span>
  </div>
);

const HotelSummary: React.FC<{ hotel: HotelInfo }> = ({ hotel }) => {
  const [showContext, setShowContext] = useState(false);

  const getVal = (key: string) => {
    const line = hotel.details.split('\n').find(l => l.startsWith(`${key}:`));
    return line ? line.split(`${key}:`)[1].trim().replace(/\*/g, '') : '';
  };

  const context = getVal('CONTEXT');
  const reasoning = getVal('REASONING');

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-gray-100 shadow-xl shadow-indigo-900/5 relative overflow-hidden h-full group flex flex-col">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50/50 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-xl">
              <Building className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-indigo-600">Sanctuary</p>
          </div>
          <div className="flex items-center gap-1.5 bg-indigo-50 px-3 py-1 rounded-full">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-black text-[#1E1B4B]">{hotel.rating}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-start gap-4 mb-8">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h3 className="text-3xl font-editorial italic text-[#1E1B4B] leading-tight">{hotel.name}</h3>
              <p className="text-sm font-medium text-slate-500 italic max-w-xs">“{hotel.highlight}”</p>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <AmenityBadge icon={<Bed />} label="Comfort" />
              <AmenityBadge icon={<Wifi />} label="Wifi" />
              <AmenityBadge icon={<UtensilsCrossed />} label="Dining" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-[#1E1B4B]">{hotel.priceRange}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nightly</div>
          </div>
        </div>

        {/* Provider Context Section */}
        <div className="mt-4 relative z-20">
          <button 
            onClick={() => setShowContext(!showContext)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
              showContext ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100 hover:border-indigo-100'
            }`}
          >
            <div className="flex items-center gap-2.5 text-[11px] font-black text-[#1E1B4B] uppercase tracking-widest">
              <Info className={`w-3.5 h-3.5 ${showContext ? 'text-indigo-600' : 'text-slate-400'}`} />
              Provider Insights
            </div>
            {showContext ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showContext ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 bg-white border border-indigo-50 rounded-2xl shadow-sm space-y-4">
              {reasoning && (
                <div className="flex items-start gap-3 pb-4 border-b border-slate-50">
                  <Quote className="w-3.5 h-3.5 text-indigo-300 shrink-0 mt-1 rotate-180" />
                  <p className="text-[13px] text-indigo-900 font-bold leading-relaxed italic">
                    {reasoning}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                  {context || "Detailed booking and provider context is being verified by our curation engine."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 flex gap-2">
          {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-1 rounded-full ${i <= 4 ? 'bg-indigo-100' : 'bg-slate-100'}`}></div>)}
        </div>
      </div>
    </div>
  );
};

const HeroSection: React.FC<{ hero?: HeroImage, title: string }> = ({ hero, title }) => {
  const [error, setError] = useState(false);

  // Fallback high-quality editorial image if generation fails completely
  const fallbackUrl = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80";

  if (!hero) return null;

  return (
    <div className="w-full max-w-5xl px-6 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <div className="relative rounded-[3.5rem] overflow-hidden shadow-2xl shadow-indigo-900/10 border border-white aspect-video md:aspect-video group bg-slate-50">
        <img 
          key={hero.url} 
          src={error ? fallbackUrl : hero.url} 
          alt={title} 
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-all duration-[2s] ease-out group-hover:scale-105 opacity-100 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
        
        {/* Attribution - Bottom Right */}
        <div className="absolute bottom-6 right-8 z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/70 group/credit">
            <Camera className="w-3.5 h-3.5 group-hover/credit:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{error ? 'Curated Collection' : hero.photographerName}</span>
            <span className="text-[10px] opacity-40">/ AI Generated Photography</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DayCard: React.FC<{
  dayPlan: DayPlan;
  dayIdx: number;
  draggedItem: { dayIdx: number; actIdx: number } | null;
  dragOverIndex: number | null;
  recentlyMoved: { dayIdx: number; actIdx: number } | null;
  onDragStart: (e: React.DragEvent, dayIdx: number, actIdx: number) => void;
  onDragOver: (e: React.DragEvent, actIdx: number) => void;
  onDrop: (e: React.DragEvent, dayIdx: number, targetIdx: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onUpdateActivity?: (dayIndex: number, activityIndex: number, action: 'up' | 'down' | 'delete') => void;
}> = ({ dayPlan, dayIdx, draggedItem, dragOverIndex, recentlyMoved, onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave, onUpdateActivity }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] border border-gray-100/50 overflow-hidden transition-all hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.05)]">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-8 py-10 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
      >
        <div className="flex items-center gap-8">
          <div className="relative">
            <span className="font-editorial text-7xl text-slate-100 absolute -top-10 -left-6 select-none leading-none opacity-50">0{dayPlan.day}</span>
            <div className="relative z-10 font-editorial text-4xl text-[#1E1B4B] tracking-tight">
              Day {dayPlan.day}
            </div>
          </div>
          <div className="h-10 w-[1px] bg-slate-100 hidden md:block"></div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{dayPlan.theme}</h3>
            {dayPlan.weather && (
              <div className="flex items-center gap-3 text-[13px] text-slate-500 font-semibold">
                <WeatherIcon condition={dayPlan.weather.condition} />
                <span>{dayPlan.weather.condition}</span>
                <span className="text-slate-200">•</span>
                <span className="flex items-center gap-1.5"><Thermometer className="w-3.5 h-3.5 text-indigo-400" /> {dayPlan.weather.tempHigh}° / {dayPlan.weather.tempLow}°C</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="px-8 pb-12 md:px-12">
          <div className="relative border-l-2 border-slate-50 ml-4 space-y-4 pl-12">
            {dayPlan.activities.map((activity, actIdx) => {
              const isDragging = draggedItem?.dayIdx === dayIdx && draggedItem?.actIdx === actIdx;
              const isRecentlyMoved = recentlyMoved?.dayIdx === dayIdx && recentlyMoved?.actIdx === actIdx;
              const isDragTarget = dragOverIndex === actIdx && draggedItem?.dayIdx === dayIdx && !isDragging;

              return (
                <div 
                  key={`${dayIdx}-${actIdx}`}
                  className="relative group/item"
                  onDragOver={(e) => onDragOver(e, actIdx)}
                  onDrop={(e) => onDrop(e, dayIdx, actIdx)}
                  onDragLeave={onDragLeave}
                >
                  <div className={`absolute -top-2 left-0 right-0 h-1 bg-indigo-600 rounded-full z-30 transition-all duration-300 pointer-events-none transform origin-left ${isDragTarget ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`}></div>

                  <div 
                    draggable
                    onDragStart={(e) => onDragStart(e, dayIdx, actIdx)}
                    onDragEnd={onDragEnd}
                    className={`relative p-6 -ml-6 rounded-3xl transition-all duration-500 cursor-grab active:cursor-grabbing border-2 border-transparent ${
                      isDragging ? 'opacity-10 scale-95 grayscale' : 'hover:bg-slate-50'
                    } ${
                      isRecentlyMoved ? 'ring-4 ring-indigo-500/10 bg-indigo-50/50 border-indigo-200' : ''
                    }`}
                  >
                    <div className="absolute -left-[54px] top-10 w-3 h-3 rounded-full bg-slate-200 ring-4 ring-white z-20 transition-all group-hover/item:bg-indigo-600 group-hover/item:ring-indigo-50"></div>
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                      <div className="shrink-0 min-w-[110px] pt-1">
                        <div className="text-[#1E1B4B] font-black text-xl tracking-tight mb-2 transition-all group-hover/item:scale-105 origin-left">
                          {activity.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                          <Timer className="w-3 h-3" /> {activity.duration}
                        </div>
                      </div>
                      <div className="flex-1 space-y-3.5 pr-8">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="text-xl font-bold text-slate-900 leading-snug group-hover/item:text-indigo-600 transition-colors">
                            {activity.title}
                          </h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <div className="p-1.5 text-slate-300 cursor-move">
                               <GripVertical className="w-4 h-4" />
                            </div>
                            {onUpdateActivity && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdateActivity(dayIdx, actIdx, 'delete'); }}
                                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 leading-loose font-medium text-[15.5px]">
                          {activity.description}
                        </p>
                        {activity.location && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2.5 text-[12px] font-bold text-slate-500 py-2 px-4 rounded-xl bg-slate-100/50 hover:bg-indigo-600 hover:text-white transition-all group/loc border border-transparent hover:border-indigo-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MapPin className="w-4 h-4 text-indigo-500 group-hover/loc:text-white transition-colors" />
                            <span>{activity.location}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, onUpdateActivity, onReorderActivity }) => {
  const [draggedItem, setDraggedItem] = useState<{ dayIdx: number; actIdx: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [recentlyMoved, setRecentlyMoved] = useState<{ dayIdx: number; actIdx: number } | null>(null);

  useEffect(() => {
    if (recentlyMoved) {
      const timer = setTimeout(() => setRecentlyMoved(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [recentlyMoved]);

  const handleDragStart = (e: React.DragEvent, dayIdx: number, actIdx: number) => {
    setDraggedItem({ dayIdx, actIdx });
    e.dataTransfer.effectAllowed = 'move';
    const dragImg = new Image();
    dragImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    e.dataTransfer.setDragImage(dragImg, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, actIdx: number) => {
    e.preventDefault();
    setDragOverIndex(actIdx);
  };

  const handleDrop = (e: React.DragEvent, dayIdx: number, targetIdx: number) => {
    e.preventDefault();
    if (draggedItem && draggedItem.dayIdx === dayIdx && onReorderActivity) {
      if (draggedItem.actIdx !== targetIdx) {
        onReorderActivity(dayIdx, draggedItem.actIdx, targetIdx);
        setRecentlyMoved({ dayIdx, actIdx: targetIdx });
      }
    }
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="flex flex-col items-center pt-10">
        
        <HeroSection hero={itinerary.heroImage} title={itinerary.title} />

        <div className="text-center space-y-8 px-6">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-indigo-50/50 text-indigo-700 rounded-full text-[11px] font-extrabold uppercase tracking-[0.3em] border border-indigo-100/50">
            <Sparkles className="w-3.5 h-3.5" /> Curated Journal
          </div>
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-editorial text-[#1E1B4B] leading-[1.1] tracking-tight">
              {itinerary.title}
            </h1>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-600 leading-relaxed font-medium italic opacity-90">
              “{itinerary.summary}”
            </p>
          </div>
          <div className="flex justify-center items-center gap-8 text-[12px] font-extrabold uppercase tracking-widest text-slate-400">
             <div className="flex items-center gap-2.5">
                <Clock className="w-4.5 h-4.5" /> {itinerary.days.length} Days
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
             <div className="flex items-center gap-2.5">
                <Sparkles className="w-4.5 h-4.5" /> Personalized
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
        {itinerary.selectedFlight && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <FlightSummary flight={itinerary.selectedFlight} />
          </div>
        )}
        {itinerary.selectedHotel && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <HotelSummary hotel={itinerary.selectedHotel} />
          </div>
        )}
      </div>

      <div className="space-y-10 px-6">
        {itinerary.days.map((dayPlan, dayIdx) => (
          <DayCard 
            key={dayIdx}
            dayPlan={dayPlan}
            dayIdx={dayIdx}
            draggedItem={draggedItem}
            dragOverIndex={dragOverIndex}
            recentlyMoved={recentlyMoved}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={resetDragState}
            onDragLeave={() => setDragOverIndex(null)}
            onUpdateActivity={onUpdateActivity}
          />
        ))}
      </div>
      <div className="py-24 text-center space-y-8">
        <div className="h-[1px] w-24 bg-slate-100 mx-auto"></div>
        <p className="text-slate-400 font-editorial text-3xl italic">Ready for the adventure of a lifetime?</p>
      </div>
    </div>
  );
};

export default ItineraryDisplay;
