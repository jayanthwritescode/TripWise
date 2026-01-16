
import React from 'react';
import { Plane, ArrowRight, Sparkles, Map, Heart, Compass, History, Trash2, ChevronRight, MapPin, Calendar, Building, Clock } from 'lucide-react';
import { SavedTrip } from '../types';

interface LandingPageProps {
  onStart: () => void;
  savedTrips: SavedTrip[];
  onLoadTrip: (trip: SavedTrip) => void;
  onDeleteTrip: (id: string) => void;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart, savedTrips, onLoadTrip, onDeleteTrip }) => {
  return (
    <div className="relative min-h-screen bg-[#FBFCFE] flex flex-col items-center overflow-x-hidden">
      {/* Globe Visualization Background */}
      <div className="globe-container">
        <div className="globe-orb-wrapper">
          <div className="globe-orb"></div>
          <div className="globe-grid"></div>
        </div>
      </div>

      <nav className="w-full px-6 md:px-12 py-10 flex justify-center items-center z-20 sticky top-0 bg-[#FBFCFE]/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-[#1E1B4B] p-2 rounded-xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-white animate-flight" />
          </div>
          <span className="text-2xl font-bold text-[#1E1B4B] tracking-tight">TripWise</span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto py-24 md:py-40 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50/80 backdrop-blur-sm text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles className="w-4 h-4" /> Personal Travel Architecture
        </div>
        
        <h1 className="text-5xl md:text-8xl font-editorial text-[#1E1B4B] leading-[1.1] mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Travel, thoughtfully <br />
          <span className="italic">planned by AI.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-500 font-medium mb-14 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          Experience bespoke itineraries that move at your rhythm. From hidden gems to seamless logistics, we craft the journey you’ve been dreaming of.
        </p>
        
        <button 
          onClick={onStart}
          className="cta-premium px-10 py-5 md:px-14 md:py-7 rounded-full text-white text-lg md:text-xl font-bold flex items-center gap-4 mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-500 active:scale-95 z-20"
        >
          Begin Curation <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Archive Section */}
      {savedTrips.length > 0 && (
        <section id="archives" className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-gray-100 z-10 relative bg-[#FBFCFE]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E1B4B] flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Personal Archive</h2>
              </div>
              <h3 className="text-5xl font-editorial italic text-[#1E1B4B]">Recent Journeys</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {savedTrips.map((trip) => (
              <div 
                key={trip.id}
                className="group relative bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all cursor-pointer flex flex-col justify-between h-full min-h-[480px]"
                onClick={() => onLoadTrip(trip)}
              >
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-[#1E1B4B] group-hover:text-white transition-all">
                        <MapPin className="w-5 h-5" />
                      </div>
                      {trip.itinerary.selectedFlight && (
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-500" title="Flight included">
                          <Plane className="w-5 h-5" />
                        </div>
                      )}
                      {trip.itinerary.selectedHotel && (
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-500" title="Hotel included">
                          <Building className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteTrip(trip.id); }}
                      className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
                      <Clock className="w-3.5 h-3.5" /> {formatDate(trip.savedAt)}
                    </div>
                    <h4 className="font-editorial text-4xl text-[#1E1B4B] group-hover:text-indigo-600 transition-colors leading-[1.1]">
                      {trip.details.destination}
                    </h4>
                    <p className="text-gray-400 text-sm font-medium line-clamp-2 italic leading-relaxed">
                      "{trip.itinerary.summary}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Journey Path Preview</p>
                    <div className="space-y-2">
                      {trip.itinerary.days.slice(0, 2).map((day, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-indigo-200">0{day.day}</span>
                          <span className="text-xs font-bold text-[#1E1B4B] truncate">{day.theme}</span>
                        </div>
                      ))}
                      {trip.itinerary.days.length > 2 && (
                        <div className="text-[10px] font-bold text-gray-300 ml-6">+ {trip.itinerary.days.length - 2} more days...</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-50 pt-8 mt-10">
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full"><Calendar className="w-3.5 h-3.5" /> {trip.details.days} Days</span>
                    <span className="w-1 h-1 rounded-full bg-indigo-100"></span>
                    <span className="truncate max-w-[100px]">{trip.details.objective}</span>
                  </div>
                  <div className="p-3 bg-[#1E1B4B]/0 group-hover:bg-[#1E1B4B] rounded-2xl transition-all">
                    <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-white transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Philosophy Section */}
      <section id="philosophy" className="w-full bg-white py-32 md:py-48 z-10 border-t border-gray-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Our Vision</h2>
            <h3 className="text-5xl md:text-6xl font-editorial italic text-[#1E1B4B]">Built for the modern wanderer.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            {/* Feature 01 */}
            <div className="space-y-8 p-10 rounded-[3rem] bg-indigo-50/10 hover:bg-indigo-50/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Map className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#1E1B4B]">Curated Discovery</h3>
                <p className="text-gray-400 leading-relaxed font-medium">AI that finds the magic in every corner, balancing tourist essentials with verified local secrets.</p>
              </div>
            </div>

            {/* Feature 02 */}
            <div className="space-y-8 p-10 rounded-[3rem] bg-rose-50/10 hover:bg-rose-50/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#1E1B4B]">Rhythm Balanced</h3>
                <p className="text-gray-400 leading-relaxed font-medium">Planned with time to breathe. We don't just pack schedules; we design experiences that allow for serendipity.</p>
              </div>
            </div>

            {/* Feature 03 */}
            <div className="space-y-8 p-10 rounded-[3rem] bg-amber-50/10 hover:bg-amber-50/30 transition-all group">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Compass className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#1E1B4B]">Intelligent Flow</h3>
                <p className="text-gray-400 leading-relaxed font-medium">Real-time search grounding for flights and stays that fit your budget and personal style perfectly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Hook */}
      <footer className="w-full bg-[#1E1B4B] py-32 text-center z-10 text-white relative">
        <div className="max-w-xl mx-auto px-6 space-y-12">
          <div className="bg-white/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-md">
            <Plane className="w-8 h-8 text-white animate-flight" />
          </div>
          <div className="space-y-4">
            <p className="text-4xl md:text-5xl font-editorial italic">Your next story begins here.</p>
            <p className="text-gray-400 text-lg">Download the voyage, live the moment.</p>
          </div>
          <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">© 2026 TripWise.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
