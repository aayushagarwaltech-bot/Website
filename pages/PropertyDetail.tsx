import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { askPropertyAssistant, draftNegotiationMessage, reviewLeaseTerms } from '../services/geminiService';
import { 
  MapPin, Bed, Bath, Square, ShieldCheck, 
  Sparkles, Send, ArrowLeft, Share2, Heart, Check, Zap, ExternalLink, Scale, IndianRupee, Map, Users, Minus, Plus, ChevronDown
} from 'lucide-react';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, user, addInquiry, bookProperty, logInteraction } = useApp();
  
  const property = properties.find(p => p.id === id);
  
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });

  // Guest State
  const [guests, setGuests] = useState({ adults: 1, children: 0, pets: 0 });
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);

  // New Agent States
  const [negotiationOpen, setNegotiationOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState<number>(0);
  const [negotiationReason, setNegotiationReason] = useState('');
  
  const [legalOpen, setLegalOpen] = useState(false);
  const [leaseClause, setLeaseClause] = useState('');
  const [legalReview, setLegalReview] = useState('');

  if (!property) return <div className="p-20 text-center text-slate-500">Property not found</div>;

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAiThinking(true);
    setAiResponse('');
    const answer = await askPropertyAssistant(property, aiQuestion);
    setAiResponse(answer);
    setIsAiThinking(false);
    logInteraction('AI_QUERY', `Asked: ${aiQuestion} for property ${property.id}`);
  };

  const handleDraftNegotiation = async () => {
    if (!targetPrice || !negotiationReason) return;
    setIsAiThinking(true);
    const draft = await draftNegotiationMessage(property.title, property.price, targetPrice, negotiationReason);
    setMessageText(draft);
    setNegotiationOpen(false);
    setIsAiThinking(false);
    logInteraction('AI_QUERY', `Drafted negotiation for ${property.id}`);
  };

  const handleReviewLease = async () => {
    if (!leaseClause) return;
    setIsAiThinking(true);
    const review = await reviewLeaseTerms(leaseClause);
    setLegalReview(review);
    setIsAiThinking(false);
    logInteraction('AI_QUERY', `Reviewed lease clause for ${property.id}`);
  };

  const handleInquiry = () => {
    if(!messageText.trim()) return;
    addInquiry({
      id: Date.now().toString(),
      propertyId: property.id,
      ownerId: property.ownerId,
      tenantId: user?.id || 'guest',
      tenantName: user?.name || 'Guest User',
      status: 'PENDING',
      lastUpdated: new Date().toISOString(),
      messages: [{
        id: Date.now().toString(),
        senderId: user?.id || 'guest',
        text: messageText,
        timestamp: new Date().toISOString()
      }]
    });
    setMessageText('');
    alert('Message sent to owner!');
    navigate('/messages');
  };

  const handleBook = () => {
    if(!bookingDates.start || !bookingDates.end) return alert("Select dates");
    bookProperty(property.id, bookingDates.start, bookingDates.end, guests);
  };

  const updateGuest = (type: 'adults' | 'children' | 'pets', operation: 'inc' | 'dec') => {
      setGuests(prev => {
          const val = prev[type];
          if (operation === 'dec' && val === 0) return prev;
          if (operation === 'dec' && type === 'adults' && val === 1) return prev; // Min 1 adult
          return { ...prev, [type]: operation === 'inc' ? val + 1 : val - 1 };
      });
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Search
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-slate-300 text-sm font-medium hover:bg-surfaceHighlight transition-colors">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-slate-300 text-sm font-medium hover:bg-surfaceHighlight transition-colors">
            <Heart className="h-4 w-4" /> Save
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[500px] mb-10 rounded-2xl overflow-hidden border border-border">
         <div className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer">
            <img src={property.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Main" />
         </div>
         <div className="col-span-2 md:col-span-1 row-span-1 relative group cursor-pointer">
            <img src={property.images[1] || property.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Secondary" />
         </div>
         <div className="col-span-2 md:col-span-1 row-span-1 relative group cursor-pointer">
             <img src={property.images[2] || property.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Third" />
         </div>
         <div className="col-span-2 md:col-span-2 row-span-1 relative group cursor-pointer">
             <img src={property.images[0]} className="w-full h-full object-cover opacity-60" alt="More" />
             <div className="absolute inset-0 bg-surface/60 backdrop-blur-sm flex items-center justify-center">
                 <span className="text-white font-bold text-lg border border-border px-6 py-2 rounded-full hover:bg-white/10 transition-colors">View All Photos</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Title Header */}
          <div className="border-b border-border pb-8">
             <div className="flex gap-3 mb-4">
                <span className="bg-brand-500/10 text-brand-400 border border-brand-500/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                   <ShieldCheck className="h-3 w-3" /> Verified
                </span>
                <span className="bg-surfaceHighlight text-slate-300 border border-border px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">{property.category}</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-heading">{property.title}</h1>
             <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-400 text-lg">
                <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-brand-500" />
                    {property.address}
                </div>
                <a 
                    href={googleMapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => logInteraction('CLICK_MAP', `View map for ${property.id}`)}
                    className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full bg-brand-500/10 w-fit"
                >
                    <Map className="h-4 w-4" /> View on Google Maps
                </a>
             </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-6 overflow-x-auto pb-2">
              <div className="flex flex-col items-center justify-center p-4 bg-surfaceHighlight rounded-2xl min-w-[100px] border border-border">
                <Bed className="h-6 w-6 text-brand-400 mb-2" />
                <span className="font-bold text-white font-mono">{property.bedrooms} Beds</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-surfaceHighlight rounded-2xl min-w-[100px] border border-border">
                <Bath className="h-6 w-6 text-brand-400 mb-2" />
                <span className="font-bold text-white font-mono">{property.bathrooms} Baths</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-surfaceHighlight rounded-2xl min-w-[100px] border border-border">
                <Square className="h-6 w-6 text-brand-400 mb-2" />
                <span className="font-bold text-white font-mono">{property.sqft} sqft</span>
              </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-white font-heading">About this sanctuary</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg font-light">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
             <h2 className="text-xl font-bold mb-6 text-white font-heading">Features</h2>
             <div className="grid grid-cols-2 gap-4">
               {property.amenities.map((am, i) => (
                 <div key={i} className="flex items-center text-slate-300 p-3 rounded-xl border border-border bg-surfaceHighlight hover:border-brand-500/30 transition-colors">
                   <div className="mr-3 p-1 bg-brand-500/10 rounded-full">
                      <Check className="h-4 w-4 text-brand-400" />
                   </div>
                   {am}
                 </div>
               ))}
             </div>
          </div>

          {/* AI Agents Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white font-heading">RentFlow Agents</h2>
            
            {/* 1. General Assistant */}
            <div className="bg-surfaceHighlight rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-brand-500/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-brand-400" />
                 </div>
                 <h3 className="font-bold text-white">Property Assistant</h3>
              </div>
              {aiResponse && (
                  <div className="mb-4 bg-background p-3 rounded-lg border border-border text-slate-300 text-sm">{aiResponse}</div>
              )}
              <form onSubmit={handleAskAI} className="flex gap-2">
                 <input 
                   type="text" 
                   value={aiQuestion}
                   onChange={e => setAiQuestion(e.target.value)}
                   className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-white outline-none focus:border-brand-500"
                   placeholder="Ask about pet policy, noise, etc..."
                 />
                 <button disabled={isAiThinking} className="bg-brand-600 text-white p-2 rounded-lg"><Send className="h-4 w-4" /></button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* 2. Negotiator Bot */}
               <div className="bg-surfaceHighlight rounded-2xl p-6 border border-border relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-2">
                       <IndianRupee className="h-5 w-5 text-green-400" />
                       <h3 className="font-bold text-white">Price Negotiator</h3>
                   </div>
                   <p className="text-xs text-slate-500 mb-4">Get AI to draft a professional offer.</p>
                   {!negotiationOpen ? (
                       <button onClick={() => setNegotiationOpen(true)} className="w-full bg-background border border-border text-slate-300 py-2 rounded-lg hover:border-green-500 transition-colors">Open Negotiator</button>
                   ) : (
                       <div className="space-y-2">
                           <input type="number" placeholder="Target Price" className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm" onChange={e => setTargetPrice(Number(e.target.value))} />
                           <input type="text" placeholder="Reason (e.g., Long term lease)" className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm" onChange={e => setNegotiationReason(e.target.value)} />
                           <button onClick={handleDraftNegotiation} disabled={isAiThinking} className="w-full bg-green-600 text-white py-2 rounded text-sm font-bold">Draft Offer</button>
                       </div>
                   )}
               </div>

               {/* 3. Legal Guardian */}
               <div className="bg-surfaceHighlight rounded-2xl p-6 border border-border relative overflow-hidden">
                   <div className="flex items-center gap-3 mb-2">
                       <Scale className="h-5 w-5 text-blue-400" />
                       <h3 className="font-bold text-white">Legal Guardian</h3>
                   </div>
                   <p className="text-xs text-slate-500 mb-4">Review contract clauses for risks.</p>
                   {!legalOpen ? (
                       <button onClick={() => setLegalOpen(true)} className="w-full bg-background border border-border text-slate-300 py-2 rounded-lg hover:border-blue-500 transition-colors">Check Clause</button>
                   ) : (
                       <div className="space-y-2">
                           <textarea placeholder="Paste clause here..." className="w-full bg-background border border-border rounded px-3 py-2 text-white text-sm h-20" onChange={e => setLeaseClause(e.target.value)} />
                           <button onClick={handleReviewLease} disabled={isAiThinking} className="w-full bg-blue-600 text-white py-2 rounded text-sm font-bold">Review Risks</button>
                           {legalReview && <div className="text-xs text-slate-300 bg-background p-2 rounded">{legalReview}</div>}
                       </div>
                   )}
               </div>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-6">
          <div className="bg-surfaceHighlight p-6 rounded-2xl sticky top-28 shadow-card border border-border">
            <div className="flex justify-between items-end mb-6 border-b border-border pb-6">
               <div>
                  <span className="text-3xl font-bold text-white font-mono">₹{(property.price).toLocaleString('en-IN')}</span>
                  <span className="text-slate-400 text-lg">/mo</span>
               </div>
               <div className="flex items-center gap-1 text-sm font-bold text-brand-300 bg-brand-500/10 px-2 py-1 rounded">
                  <span className="text-brand-400">★</span> {property.rating}
               </div>
            </div>
            
            <div className="space-y-4 mb-6">
              
              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background p-3 rounded-lg border border-border focus-within:ring-1 focus-within:ring-brand-500">
                   <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Move-in</label>
                   <input 
                      type="date" 
                      className="w-full bg-transparent text-sm font-medium outline-none text-white color-scheme-dark cursor-pointer" 
                      value={bookingDates.start}
                      onChange={(e) => setBookingDates({...bookingDates, start: e.target.value})}
                      style={{ colorScheme: 'dark' }}
                   />
                </div>
                <div className="bg-background p-3 rounded-lg border border-border focus-within:ring-1 focus-within:ring-brand-500">
                   <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Move-out</label>
                   <input 
                      type="date" 
                      className="w-full bg-transparent text-sm font-medium outline-none text-white color-scheme-dark cursor-pointer" 
                      value={bookingDates.end}
                      onChange={(e) => setBookingDates({...bookingDates, end: e.target.value})}
                      style={{ colorScheme: 'dark' }}
                   />
                </div>
              </div>

              {/* Guest Selector Dropdown */}
              <div className="relative">
                 <button 
                   className="w-full bg-background p-3 rounded-lg border border-border flex justify-between items-center text-sm font-medium text-white hover:border-brand-500/50 transition-colors"
                   onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                 >
                    <span className="flex items-center gap-2 text-slate-300">
                        <Users className="h-4 w-4" /> 
                        {guests.adults + guests.children} Guests, {guests.pets} Pets
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isGuestDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {isGuestDropdownOpen && (
                     <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl z-20 p-4 space-y-4 animate-in fade-in zoom-in-95">
                         {['adults', 'children', 'pets'].map((type) => (
                             <div key={type} className="flex justify-between items-center">
                                 <div>
                                     <div className="text-sm font-bold text-white capitalize">{type}</div>
                                     <div className="text-xs text-gray-500">{type === 'adults' ? 'Age 13+' : type === 'children' ? 'Ages 2-12' : 'Service pets allowed'}</div>
                                 </div>
                                 <div className="flex items-center gap-3">
                                     <button 
                                        onClick={() => updateGuest(type as any, 'dec')}
                                        className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30"
                                        disabled={guests[type as keyof typeof guests] <= (type === 'adults' ? 1 : 0)}
                                     >
                                         <Minus className="h-4 w-4" />
                                     </button>
                                     <span className="w-4 text-center text-sm font-mono">{guests[type as keyof typeof guests]}</span>
                                     <button 
                                        onClick={() => updateGuest(type as any, 'inc')}
                                        className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white"
                                     >
                                         <Plus className="h-4 w-4" />
                                     </button>
                                 </div>
                             </div>
                         ))}
                         <button 
                           onClick={() => setIsGuestDropdownOpen(false)}
                           className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg"
                         >
                             Done
                         </button>
                     </div>
                 )}
              </div>

              <button onClick={handleBook} className="w-full bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg transform hover:scale-[1.02]">
                Request to Book
              </button>
              <div className="text-center text-xs text-slate-500 mt-2">
                 Zero-fee cancellation within 48 hours
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex items-center gap-3 mb-4">
                 <div className="relative">
                   <div className="absolute inset-0 bg-brand-500 blur opacity-50 rounded-full"></div>
                   <img src={`https://ui-avatars.com/api/?name=Owner&background=0f172a&color=fff`} className="relative h-10 w-10 rounded-full border border-border" alt="" />
                 </div>
                 <div>
                    <div className="text-sm font-bold text-white">Owner Connect</div>
                    <div className="text-xs text-brand-400 font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3" /> Online now
                    </div>
                 </div>
              </div>
              <div className="relative">
                <textarea
                  className="w-full p-3 rounded-xl bg-background border border-border text-sm mb-2 focus:ring-1 focus:ring-brand-500 outline-none resize-none text-white placeholder-slate-600"
                  rows={3}
                  placeholder="Hi, I'm interested..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                ></textarea>
                <button 
                  onClick={handleInquiry}
                  disabled={!messageText}
                  className="absolute bottom-4 right-2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-0 transition-all"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;