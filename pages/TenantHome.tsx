import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  MapPin, Bed, Bath, Search, Filter, Sparkles, Building2, Store, Home as HomeIcon, Map, Globe2, ArrowRight, Loader2, TrendingUp, Scale, AlertCircle, CheckCircle2, Navigation, Layers, X, Maximize2
} from 'lucide-react';
import { searchLocationWithMaps, searchRentalTrends, reviewLeaseTerms } from '../services/geminiService';
import { MapSearchResult, PropertyCategory } from '../types';

const TenantHome: React.FC = () => {
  const { properties, isLoading, compareList, addToCompare, removeFromCompare, clearCompare } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<number>(200000);
  const [categoryFilter, setCategoryFilter] = useState<PropertyCategory | 'ALL'>('ALL');
  
  // --- GLOBAL TOOLKIT STATES ---
  const [activeTool, setActiveTool] = useState<'MAPS' | 'TRENDS' | 'LEGAL'>('MAPS');
  
  // 1. Map Scout State
  const [scoutQuery, setScoutQuery] = useState('');
  const [scoutResult, setScoutResult] = useState<MapSearchResult | null>(null);
  const [isScouting, setIsScouting] = useState(false);

  // 2. Market Trend State
  const [trendQuery, setTrendQuery] = useState('');
  const [trendResult, setTrendResult] = useState<{text: string, sources: any[]} | null>(null);
  const [isTrending, setIsTrending] = useState(false);

  // 3. Legal Review State
  const [legalQuery, setLegalQuery] = useState('');
  const [legalResult, setLegalResult] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Compare Modal State
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const filteredProperties = properties
    .filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = p.price <= priceFilter;
      const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
      return matchesSearch && matchesPrice && matchesCategory;
    });

  // --- TOOL HANDLERS ---
  const handleScout = async () => {
    if(!scoutQuery) return;
    setIsScouting(true);
    const res = await searchLocationWithMaps(scoutQuery);
    setScoutResult(res);
    setIsScouting(false);
  };

  const handleTrends = async () => {
    if(!trendQuery) return;
    setIsTrending(true);
    const res = await searchRentalTrends(trendQuery);
    setTrendResult(res);
    setIsTrending(false);
  };

  const handleLegal = async () => {
    if(!legalQuery) return;
    setIsReviewing(true);
    const res = await reviewLeaseTerms(legalQuery);
    setLegalResult(res);
    setIsReviewing(false);
  };

  const handleCompareCheck = (e: React.MouseEvent, property: any) => {
      e.preventDefault();
      e.stopPropagation();
      const isSelected = compareList.find(p => p.id === property.id);
      if (isSelected) {
          removeFromCompare(property.id);
      } else {
          addToCompare(property);
      }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Map className="h-6 w-6 text-brand-500 animate-pulse" />
            </div>
          </div>
          <p className="text-brand-400 font-bold animate-pulse">Initializing Global Map Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 pb-12 relative">
      
      {/* 1. VIBRANT HERO SECTION */}
      <section className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 max-w-4xl">
           <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-left-4 fade-in duration-700">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                Global Beta Live
              </span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight font-heading animate-in slide-in-from-left-6 fade-in duration-700 delay-100">
             Discover your <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-500">Perfect Sanctuary.</span>
           </h1>
           <p className="text-xl text-gray-300 mb-10 max-w-xl font-light leading-relaxed animate-in slide-in-from-left-8 fade-in duration-700 delay-200">
             Seamlessly explore rentals worldwide with AI-powered insights and Google Maps precision.
           </p>

           {/* Hero Search */}
           <div className="bg-white/5 backdrop-blur-xl p-2 rounded-2xl shadow-glow border border-white/10 flex flex-col md:flex-row gap-2 max-w-2xl animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
             <div className="flex-1 flex items-center px-4 h-14 bg-surface/80 rounded-xl border border-white/5 focus-within:border-brand-500 transition-colors">
                <Search className="text-brand-400 h-5 w-5 mr-3" />
                <input 
                   type="text" 
                   className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 font-medium"
                   placeholder="City, Zip, or Address..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white h-14 px-8 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 group">
                Search <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
        </div>
      </section>

      {/* 2. LIVE MAP RADAR */}
      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[400px] relative">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d5487.569404671868!2d77.30262040665563!3d28.59421290621251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1srental%20homes!5e0!3m2!1sen!2sin!4v1769766942638!5m2!1sen!2sin" 
          width="100%" 
          height="100%" 
          style={{border:0, filter: 'invert(90%) hue-rotate(180deg)'}} // Dark mode style filter
          allowFullScreen 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur p-4 rounded-xl border border-white/10">
           <h3 className="font-bold text-white flex items-center gap-2 font-heading"><MapPin className="h-4 w-4 text-brand-500" /> Live Rental Radar</h3>
           <p className="text-xs text-gray-400">Real-time availability in your area</p>
        </div>
      </div>

      {/* 3. CATEGORY PILLS */}
      <div className="flex flex-col items-center gap-6">
         <div className="flex overflow-x-auto pb-4 gap-4 w-full justify-start md:justify-center px-4 scrollbar-hide">
            {[{ id: 'ALL', label: 'All Stays', icon: Globe2 }, { id: 'APARTMENT', label: 'Apartments', icon: Building2 }, { id: 'HOUSE', label: 'Houses', icon: HomeIcon }, { id: 'VILLA', label: 'Luxury Villas', icon: Sparkles }, { id: 'COMMERCIAL', label: 'Workspaces', icon: Store }].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all border group min-w-[140px] justify-center ${
                  categoryFilter === cat.id 
                    ? 'bg-brand-600 text-white border-brand-500 shadow-glow' 
                    : 'bg-surfaceHighlight/50 text-gray-400 border-white/5 hover:bg-surfaceHighlight hover:border-brand-500/50 hover:text-white'
                }`}
              >
                <cat.icon className={`h-5 w-5 ${categoryFilter === cat.id ? 'text-white' : 'text-gray-500 group-hover:text-brand-400'}`} />
                {cat.label}
              </button>
            ))}
         </div>
      </div>

      {/* 4. LISTINGS GRID */}
      <div className="space-y-8">
         <div className="flex justify-between items-end px-2">
            <h2 className="text-3xl font-bold text-white font-heading">Featured Listings</h2>
            <span className="text-gray-500 text-sm font-medium">{filteredProperties.length} results found</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(property => {
              const isCompared = !!compareList.find(p => p.id === property.id);
              return (
              <Link to={`/property/${property.id}`} key={property.id} className="group bg-surface rounded-3xl overflow-hidden border border-white/5 hover:border-brand-500/50 hover:shadow-glow transition-all duration-300 flex flex-col h-full relative">
                <div className="relative h-64 overflow-hidden">
                  <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80"></div>
                  
                  {/* Floating Tags */}
                  <div className="absolute top-4 left-4 flex gap-2">
                     <span className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">
                       {property.category}
                     </span>
                  </div>

                  {/* Compare Checkbox */}
                  <div className="absolute top-4 right-4 z-20">
                      <button 
                        onClick={(e) => handleCompareCheck(e, property)}
                        className={`p-2 rounded-full border backdrop-blur-md transition-all ${
                            isCompared 
                            ? 'bg-brand-500 border-brand-500 text-white shadow-glow' 
                            : 'bg-black/40 border-white/30 text-gray-300 hover:bg-black/60'
                        }`}
                        title="Compare"
                      >
                         {isCompared ? <CheckCircle2 className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                      </button>
                  </div>
                  
                  {/* Price Tag */}
                  <div className="absolute bottom-4 left-4">
                     <p className="text-2xl font-black text-white font-heading drop-shadow-lg">
                       ₹{(property.price).toLocaleString('en-IN')} <span className="text-sm font-medium text-gray-300 font-sans">/ mo</span>
                     </p>
                  </div>
                  
                  {/* Map Button */}
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-4 right-4 p-3 bg-white text-brand-900 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                    title="View on Map"
                  >
                     <Map className="h-5 w-5" />
                  </a>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                   <h3 className="text-xl font-bold text-gray-100 mb-2 line-clamp-1 group-hover:text-brand-400 transition-colors">{property.title}</h3>
                   <div className="flex items-start gap-2 text-gray-400 text-sm mb-6 flex-1">
                      <MapPin className="h-4 w-4 mt-0.5 text-brand-500 flex-shrink-0" />
                      <span className="line-clamp-2">{property.address}</span>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5">
                      <div className="text-center">
                         <div className="text-lg font-bold text-white flex justify-center items-center gap-1"><Bed className="h-4 w-4 text-gray-500" /> {property.bedrooms}</div>
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Beds</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                         <div className="text-lg font-bold text-white flex justify-center items-center gap-1"><Bath className="h-4 w-4 text-gray-500" /> {property.bathrooms}</div>
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Baths</div>
                      </div>
                      <div className="text-center border-l border-white/5">
                         <div className="text-lg font-bold text-white flex justify-center items-center gap-1"><Building2 className="h-4 w-4 text-gray-500" /> {property.sqft}</div>
                         <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">SqFt</div>
                      </div>
                   </div>
                </div>
              </Link>
            )})}
         </div>
      </div>

      {/* 5. GLOBAL AI TOOLKIT SECTION (Footer Functions) */}
      <section id="toolkit" className="scroll-mt-24">
         <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-500/50"></div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-500 font-heading uppercase tracking-widest text-center">
               RentalFinds AI Toolkit
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-500/50"></div>
         </div>

         <div className="bg-surfaceHighlight/30 backdrop-blur-sm rounded-3xl border border-white/5 p-2 md:p-4">
            {/* Tool Navigation */}
            <div className="flex flex-col md:flex-row gap-2 mb-8 bg-surface/50 p-2 rounded-2xl md:inline-flex w-full md:w-auto">
               {[
                 { id: 'MAPS', label: 'Location Scout', icon: Navigation, color: 'text-blue-400' },
                 { id: 'TRENDS', label: 'Market Trends', icon: TrendingUp, color: 'text-green-400' },
                 { id: 'LEGAL', label: 'Lease Guardian', icon: Scale, color: 'text-red-400' }
               ].map(tool => (
                 <button 
                   key={tool.id}
                   onClick={() => setActiveTool(tool.id as any)}
                   className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-all ${
                     activeTool === tool.id 
                       ? 'bg-surface shadow-lg text-white ring-1 ring-white/10' 
                       : 'text-gray-500 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   <tool.icon className={`h-5 w-5 ${activeTool === tool.id ? tool.color : ''}`} />
                   {tool.label}
                 </button>
               ))}
            </div>

            {/* Tool Content Panels */}
            <div className="bg-surface rounded-2xl p-6 md:p-10 border border-white/5 min-h-[400px] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  {activeTool === 'MAPS' && <Navigation className="h-64 w-64 text-blue-500" />}
                  {activeTool === 'TRENDS' && <TrendingUp className="h-64 w-64 text-green-500" />}
                  {activeTool === 'LEGAL' && <Scale className="h-64 w-64 text-red-500" />}
               </div>

               {/* MAP SCOUT UI */}
               {activeTool === 'MAPS' && (
                 <div className="relative z-10 max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-bold text-white mb-2">Location Intelligence Scout</h3>
                    <p className="text-gray-400 mb-6">Analyze any neighborhood worldwide using Google Maps data. Get vibe checks, transit scores, and nearby amenities instantly.</p>
                    
                    <div className="flex gap-4 mb-8">
                       <input 
                         type="text" 
                         className="flex-1 bg-background border border-border rounded-xl px-5 py-4 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                         placeholder="Enter a neighborhood (e.g., 'Indiranagar, Bangalore' or 'Shibuya, Tokyo')"
                         value={scoutQuery}
                         onChange={e => setScoutQuery(e.target.value)}
                       />
                       <button 
                         onClick={handleScout} 
                         disabled={isScouting}
                         className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-xl font-bold transition-colors disabled:opacity-50"
                       >
                         {isScouting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Scout Area'}
                       </button>
                    </div>

                    {scoutResult && (
                       <div className="bg-background/50 rounded-xl border border-white/10 p-6">
                          <p className="text-gray-300 whitespace-pre-line leading-relaxed mb-6">{scoutResult.text}</p>
                          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Direct Map Links</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                             {scoutResult.mapLinks.map((link, i) => (
                               <a 
                                 key={i} 
                                 href={link.uri} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="flex items-center gap-3 p-3 bg-surfaceHighlight rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-500/30 transition-all group"
                               >
                                  <Map className="h-5 w-5 text-blue-500" />
                                  <span className="flex-1 text-sm font-medium text-gray-300 group-hover:text-blue-400 truncate">{link.title}</span>
                                  <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-blue-400" />
                               </a>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
               )}

               {/* TRENDS UI */}
               {activeTool === 'TRENDS' && (
                 <div className="relative z-10 max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-bold text-white mb-2">Real-Time Market Watch</h3>
                    <p className="text-gray-400 mb-6">Access live rental trends, price fluctuations, and demand heatmaps powered by Google Search Grounding.</p>
                    
                    <div className="flex gap-4 mb-8">
                       <input 
                         type="text" 
                         className="flex-1 bg-background border border-border rounded-xl px-5 py-4 text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                         placeholder="E.g., 'Rental price trends in Mumbai 2024'"
                         value={trendQuery}
                         onChange={e => setTrendQuery(e.target.value)}
                       />
                       <button 
                         onClick={handleTrends}
                         disabled={isTrending}
                         className="bg-green-600 hover:bg-green-500 text-white px-8 rounded-xl font-bold transition-colors disabled:opacity-50"
                       >
                         {isTrending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze Trends'}
                       </button>
                    </div>

                    {trendResult && (
                       <div className="bg-background/50 rounded-xl border border-white/10 p-6">
                          <p className="text-gray-300 whitespace-pre-line leading-relaxed mb-6">{trendResult.text}</p>
                          <div className="flex flex-wrap gap-2">
                             {trendResult.sources.map((source, i) => (
                               <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="text-xs bg-surfaceHighlight border border-white/10 px-3 py-1 rounded-full text-green-400 hover:text-white hover:border-green-500 transition-colors">
                                 {source.title}
                               </a>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
               )}

               {/* LEGAL UI */}
               {activeTool === 'LEGAL' && (
                 <div className="relative z-10 max-w-3xl animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-2xl font-bold text-white mb-2">AI Lease Guardian</h3>
                    <p className="text-gray-400 mb-6">Paste any rental agreement clause to detect hidden risks, unfair terms, or unusual conditions instantly.</p>
                    
                    <div className="mb-6">
                       <textarea 
                         className="w-full h-32 bg-background border border-border rounded-xl px-5 py-4 text-white outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                         placeholder="Paste contract clause here..."
                         value={legalQuery}
                         onChange={e => setLegalQuery(e.target.value)}
                       ></textarea>
                    </div>
                    <button 
                       onClick={handleLegal}
                       disabled={isReviewing}
                       className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 w-full md:w-auto"
                    >
                       {isReviewing ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Review for Risks'}
                    </button>

                    {legalResult && (
                       <div className="mt-8 bg-background/50 rounded-xl border border-red-500/20 p-6 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                          <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                             <AlertCircle className="h-5 w-5" /> Risk Assessment
                          </h4>
                          <p className="text-gray-300 leading-relaxed">{legalResult}</p>
                       </div>
                    )}
                 </div>
               )}
            </div>
         </div>
      </section>
      
      {/* Comparison Bottom Bar */}
      {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface/90 backdrop-blur-md border border-brand-500/50 rounded-2xl p-4 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10">
              <div className="flex gap-2">
                  {compareList.map(p => (
                      <div key={p.id} className="relative h-12 w-12 rounded-lg overflow-hidden border border-white/20">
                          <img src={p.images[0]} className="w-full h-full object-cover" />
                          <button 
                             onClick={() => removeFromCompare(p.id)}
                             className="absolute top-0 right-0 bg-red-500 text-white p-0.5"
                          >
                             <X className="h-2 w-2" />
                          </button>
                      </div>
                  ))}
                  {Array.from({length: 3 - compareList.length}).map((_, i) => (
                      <div key={i} className="h-12 w-12 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-xs text-gray-500">
                          Empty
                      </div>
                  ))}
              </div>
              <div className="flex gap-2">
                  <button onClick={clearCompare} className="text-sm text-gray-400 hover:text-white px-3">Clear</button>
                  <button 
                    onClick={() => setIsCompareOpen(true)}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-xl font-bold shadow-neon flex items-center gap-2"
                  >
                      <Maximize2 className="h-4 w-4" /> Compare
                  </button>
              </div>
          </div>
      )}

      {/* Comparison Modal */}
      {isCompareOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface w-full max-w-6xl max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surfaceHighlight/50">
                      <h2 className="text-2xl font-bold text-white font-heading">Property Comparison</h2>
                      <button onClick={() => setIsCompareOpen(false)} className="text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
                  </div>
                  <div className="p-8 overflow-x-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-w-[800px]">
                          {compareList.map(p => (
                              <div key={p.id} className="space-y-6">
                                  <div className="relative h-48 rounded-2xl overflow-hidden border border-white/10">
                                      <img src={p.images[0]} className="w-full h-full object-cover" />
                                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-4">
                                          <h3 className="font-bold text-white truncate">{p.title}</h3>
                                          <p className="text-brand-400 font-mono text-lg font-bold">₹{p.price.toLocaleString('en-IN')}</p>
                                      </div>
                                  </div>
                                  <div className="space-y-4 text-sm">
                                      <div className="flex justify-between border-b border-white/5 pb-2">
                                          <span className="text-gray-500">Location</span>
                                          <span className="text-white font-medium text-right w-1/2">{p.address}</span>
                                      </div>
                                      <div className="flex justify-between border-b border-white/5 pb-2">
                                          <span className="text-gray-500">Size</span>
                                          <span className="text-white font-medium">{p.sqft} sqft</span>
                                      </div>
                                      <div className="flex justify-between border-b border-white/5 pb-2">
                                          <span className="text-gray-500">Configuration</span>
                                          <span className="text-white font-medium">{p.bedrooms} Beds, {p.bathrooms} Baths</span>
                                      </div>
                                      <div className="flex justify-between border-b border-white/5 pb-2">
                                          <span className="text-gray-500">Category</span>
                                          <span className="text-white font-medium">{p.category}</span>
                                      </div>
                                      <div>
                                          <span className="text-gray-500 block mb-2">Amenities</span>
                                          <div className="flex flex-wrap gap-2">
                                              {p.amenities.map(a => (
                                                  <span key={a} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300">{a}</span>
                                              ))}
                                          </div>
                                      </div>
                                  </div>
                                  <Link to={`/property/${p.id}`} className="block w-full text-center bg-brand-600/20 text-brand-400 border border-brand-500/30 py-3 rounded-xl font-bold hover:bg-brand-500/30">
                                      View Details
                                  </Link>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

// Simple Icon component needed for links inside map result
const ExternalLink = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

export default TenantHome;