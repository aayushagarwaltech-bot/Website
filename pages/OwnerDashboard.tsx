import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Plus, Home, Users, DollarSign, Sparkles, X, Upload, Image as ImageIcon, Trash2, Wand2, Loader2, ScanEye, TrendingUp, ChevronRight, Activity, Building2, MoreVertical, Eye, Edit } from 'lucide-react';
import { generatePropertyDescription, editPropertyImage, analyzePropertyImage, analyzeOwnerStats } from '../services/geminiService';
import { Property, PropertyCategory } from '../types';
import { useNavigate } from 'react-router-dom';

interface PropertyFormState extends Partial<Property> {
  featuresInput?: string;
}

const OwnerDashboard: React.FC = () => {
  const { stats, properties, addProperty, deleteProperty, user } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // New Property Form State
  const [newProp, setNewProp] = useState<PropertyFormState>({
    title: '',
    address: '',
    price: 0,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 500,
    featuresInput: '',
    description: '',
    images: [],
    category: 'APARTMENT'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Image Editing & Analysis State
  const [editingImageIdx, setEditingImageIdx] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);
  
  const [analyzingImageIdx, setAnalyzingImageIdx] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stats Analysis State
  const [statsInsight, setStatsInsight] = useState('');
  const [isAnalyzingStats, setIsAnalyzingStats] = useState(false);

  const handleGenerateDescription = async () => {
    if (!newProp.title || !newProp.featuresInput) return;
    setIsGenerating(true);
    const features = newProp.featuresInput.split(',').map((s: string) => s.trim());
    const desc = await generatePropertyDescription(newProp.title || '', features, 'Apartment in India');
    setNewProp(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const promises = files.map(file => {
          return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
          });
      });

      Promise.all(promises).then(base64Images => {
          setNewProp(prev => ({
              ...prev,
              images: [...(prev.images || []), ...base64Images]
          }));
      });
    }
  };

  const removeImage = (index: number) => {
    setNewProp(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleMagicEdit = async () => {
      if (editingImageIdx === null || !newProp.images || !editPrompt) return;
      
      setIsEditingImage(true);
      const originalImage = newProp.images[editingImageIdx];
      const editedImage = await editPropertyImage(originalImage, editPrompt);
      
      if (editedImage) {
          const updatedImages = [...newProp.images];
          updatedImages[editingImageIdx] = editedImage;
          setNewProp(prev => ({ ...prev, images: updatedImages }));
          setEditingImageIdx(null); // Close edit mode
          setEditPrompt('');
      } else {
          alert('Failed to edit image. Please try again.');
      }
      setIsEditingImage(false);
  };

  const handleAnalyzeImage = async (index: number) => {
    if (!newProp.images) return;
    setAnalyzingImageIdx(index);
    setAnalysisResult('');
    setIsAnalyzing(true);
    
    const result = await analyzePropertyImage(newProp.images[index]);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const handleAnalyzeStats = async () => {
    setIsAnalyzingStats(true);
    const result = await analyzeOwnerStats(stats);
    setStatsInsight(result);
    setIsAnalyzingStats(false);
  };

  const handleSaveProperty = () => {
    if(!newProp.title || !newProp.price) return;
    const propertyImages = (newProp.images && newProp.images.length > 0) 
      ? newProp.images 
      : ['https://picsum.photos/800/600?random=' + Date.now()];

    const property: Property = {
      id: Date.now().toString(),
      ownerId: user?.id || 'owner1',
      title: newProp.title!,
      description: newProp.description || '',
      address: newProp.address || '',
      price: Number(newProp.price),
      bedrooms: Number(newProp.bedrooms),
      bathrooms: Number(newProp.bathrooms),
      sqft: Number(newProp.sqft),
      images: propertyImages,
      amenities: newProp.featuresInput ? newProp.featuresInput.split(',').map(s => s.trim()).filter(s => s.length > 0) : [],
      status: 'AVAILABLE',
      rating: 0, 
      category: newProp.category || 'APARTMENT',
      postedDate: new Date().toISOString(),
      isFeatured: false
    };
    
    addProperty(property);
    setIsModalOpen(false);
    setNewProp({ title: '', address: '', price: 0, bedrooms: 1, bathrooms: 1, sqft: 500, featuresInput: '', description: '', images: [], category: 'APARTMENT' });
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">Command Center</h1>
          <p className="text-slate-400">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); handleAnalyzeStats(); }}
            disabled={isAnalyzingStats}
            className="flex items-center gap-2 bg-surfaceHighlight text-brand-400 border border-brand-500/20 hover:bg-brand-500/10 px-4 py-2 rounded-lg transition-colors shadow-neon font-medium"
          >
            {isAnalyzingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />}
            {isAnalyzingStats ? 'Processing...' : 'AI Audit'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors shadow-neon font-medium"
          >
            <Plus className="h-5 w-5" />
            New Listing
          </button>
        </div>
      </div>

      {/* Stats Analysis Panel */}
      {statsInsight && (
        <div className="bg-gradient-to-r from-ai-900/40 to-surfaceHighlight p-6 rounded-xl border border-ai-500/30 shadow-neon-purple animate-in fade-in slide-in-from-top-4 relative backdrop-blur-md">
           <button onClick={() => setStatsInsight('')} className="absolute top-4 right-4 text-ai-400 hover:text-white">
             <X className="h-5 w-5" />
           </button>
           <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 font-heading">
             <Sparkles className="h-5 w-5 text-ai-400" />
             Strategic Insight Report
           </h3>
           <div className="prose prose-invert prose-sm max-w-none text-slate-300">
             <div className="whitespace-pre-line leading-relaxed">{statsInsight}</div>
           </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-green-400', sub: '+12% growth' },
          { label: 'Occupancy Rate', value: `${stats.occupancyRate}%`, icon: Home, color: 'text-brand-400', sub: 'Top tier' },
          { label: 'Active Inquiries', value: stats.activeInquiries, icon: Users, color: 'text-ai-400', sub: '2 pending' },
          { label: 'Portfolio Size', value: stats.totalProperties, icon: Building2, color: 'text-orange-400', sub: 'Assets active' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-surface p-6 rounded-2xl shadow-lg border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400 font-mono uppercase">{kpi.label}</p>
                <h3 className="text-3xl font-bold text-white mt-2 font-mono group-hover:scale-105 transition-transform origin-left">{kpi.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
            </div>
            <p className={`text-xs mt-4 font-medium flex items-center gap-1 ${kpi.color}`}>
              <TrendingUp className="h-3 w-3" /> {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl shadow-lg border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 font-heading">Revenue Trajectory</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff'}} 
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-surface p-6 rounded-2xl shadow-lg border border-white/5">
          <h3 className="text-lg font-bold text-white mb-6 font-heading">Asset Status</h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto custom-scrollbar">
            {properties.filter(p => p.ownerId === (user?.id || 'owner1')).map(prop => (
               <div key={prop.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors relative group">
                 <img src={prop.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-800" />
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate group-hover:text-brand-400">{prop.title}</p>
                    <p className="text-xs text-slate-500 font-mono">{prop.status}</p>
                 </div>
                 
                 {/* Three Dots Menu Trigger */}
                 <button 
                    onClick={(e) => toggleMenu(e, prop.id)}
                    className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
                 >
                    <MoreVertical className="h-4 w-4" />
                 </button>

                 {/* Dropdown Menu */}
                 {activeMenuId === prop.id && (
                    <div className="absolute right-0 top-12 w-40 bg-surfaceHighlight border border-white/10 rounded-xl shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/property/${prop.id}`); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                        >
                           <Eye className="h-4 w-4" /> View
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); /* Add Edit Logic */ setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 flex items-center gap-2"
                        >
                           <Edit className="h-4 w-4" /> Edit
                        </button>
                        <div className="my-1 border-t border-white/10"></div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteProperty(prop.id); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                           <Trash2 className="h-4 w-4" /> Delete
                        </button>
                    </div>
                 )}
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-surface z-10">
              <h2 className="text-xl font-bold text-white font-heading">Create Listing</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div className="bg-surfaceHighlight/50 p-4 rounded-xl border border-white/10 border-dashed">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-brand-400" />
                    Visual Assets
                  </label>
                  <span className="text-xs text-slate-500">Max 5 images</span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                   {newProp.images?.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 shadow-sm bg-surface">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        <div className="absolute bottom-1 right-1 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleAnalyzeImage(idx)}
                              className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500"
                              title="Analyze"
                            >
                              <ScanEye className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => setEditingImageIdx(idx)}
                              className="p-1.5 bg-ai-600 text-white rounded-lg hover:bg-ai-500"
                              title="Edit"
                            >
                              <Wand2 className="h-3 w-3" />
                            </button>
                        </div>
                      </div>
                   ))}
                   {(newProp.images?.length || 0) < 5 && (
                     <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-600 cursor-pointer hover:border-brand-500 hover:bg-white/5 transition-all group">
                       <Upload className="h-6 w-6 text-slate-500 group-hover:text-brand-400 mb-1" />
                       <span className="text-xs text-slate-500 group-hover:text-brand-400">Upload</span>
                       <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                     </label>
                   )}
                </div>

                {/* Analysis Overlay */}
                {analyzingImageIdx !== null && (
                    <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                           <ScanEye className="h-3 w-3" /> Vision Analysis
                         </span>
                         <button onClick={() => setAnalyzingImageIdx(null)} className="text-slate-400 hover:text-white">
                           <X className="h-3 w-3" />
                         </button>
                       </div>
                       
                       {isAnalyzing ? (
                         <div className="flex items-center gap-2 text-sm text-green-400 py-2">
                           <Loader2 className="h-4 w-4 animate-spin" /> Processing pixels...
                         </div>
                       ) : (
                         <div className="text-sm text-slate-300 leading-relaxed">
                            {analysisResult}
                            <button 
                              onClick={() => setNewProp(prev => ({...prev, description: (prev.description || '') + '\n\n' + analysisResult}))}
                              className="block mt-2 text-xs font-semibold text-green-400 hover:underline"
                            >
                              + Append to Description
                            </button>
                         </div>
                       )}
                    </div>
                )}

                {/* Magic Edit Overlay */}
                {editingImageIdx !== null && (
                   <div className="mt-4 p-4 bg-ai-900/20 rounded-lg border border-ai-500/30">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-ai-400 flex items-center gap-1">
                           <Wand2 className="h-3 w-3" /> Generative Edit
                         </span>
                         <button onClick={() => setEditingImageIdx(null)} className="text-slate-400 hover:text-white">
                           <X className="h-3 w-3" />
                         </button>
                      </div>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           placeholder="Prompt: Add modern furniture..." 
                           className="flex-1 text-sm bg-black/40 border border-white/10 rounded-md focus:ring-1 focus:ring-ai-500 px-3 py-2 text-white outline-none"
                           value={editPrompt}
                           onChange={(e) => setEditPrompt(e.target.value)}
                         />
                         <button 
                           onClick={handleMagicEdit}
                           disabled={isEditingImage || !editPrompt}
                           className="bg-ai-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-ai-500 disabled:opacity-50 flex items-center gap-1"
                         >
                           {isEditingImage ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                         </button>
                      </div>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                  <input 
                    type="text" 
                    className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                    value={newProp.title || ''}
                    onChange={e => setNewProp({...newProp, title: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Address</label>
                  <input 
                    type="text" 
                    className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                    value={newProp.address || ''}
                    onChange={e => setNewProp({...newProp, address: e.target.value})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price</label>
                  <input 
                    type="number" 
                    className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                    value={newProp.price}
                    onChange={e => setNewProp({...newProp, price: Number(e.target.value)})}
                  />
                </div>
                
                <div className="col-span-1">
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category</label>
                   <select 
                      className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white outline-none"
                      value={newProp.category}
                      onChange={e => setNewProp({...newProp, category: e.target.value as PropertyCategory})}
                   >
                     {['APARTMENT', 'HOUSE', 'VILLA', 'COMMERCIAL', 'LAND'].map(c => (
                       <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                </div>
                
                 <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">SqFt</label>
                  <input 
                    type="number" 
                    className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                    value={newProp.sqft}
                    onChange={e => setNewProp({...newProp, sqft: Number(e.target.value)})}
                  />
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Beds</label>
                   <select className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white outline-none" value={newProp.bedrooms} onChange={e => setNewProp({...newProp, bedrooms: Number(e.target.value)})}>
                     {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                   </select>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Baths</label>
                    <select className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white outline-none" value={newProp.bathrooms} onChange={e => setNewProp({...newProp, bathrooms: Number(e.target.value)})}>
                     {[1,1.5,2,2.5,3].map(n => <option key={n} value={n}>{n}</option>)}
                   </select>
                </div>
                
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Features</label>
                   <input 
                    type="text" 
                    className="w-full rounded-lg bg-black/30 border border-white/10 p-2 text-white focus:ring-1 focus:ring-brand-500 outline-none"
                    value={newProp.featuresInput || ''}
                    onChange={e => setNewProp({...newProp, featuresInput: e.target.value})}
                    placeholder="Pool, Gym, Smart Home..."
                  />
                </div>
                
                {/* AI Section */}
                <div className="col-span-2 bg-gradient-to-r from-brand-900/20 to-surfaceHighlight p-4 rounded-xl border border-brand-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-brand-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Copywriter
                    </label>
                    <button 
                      onClick={handleGenerateDescription}
                      disabled={isGenerating || !newProp.title}
                      className="text-xs bg-brand-600 text-white px-3 py-1 rounded-full hover:bg-brand-500 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? 'Generating...' : 'Auto-Generate'}
                    </button>
                  </div>
                  <textarea 
                    className="w-full rounded-lg bg-black/30 border border-white/10 p-3 text-sm text-white focus:ring-1 focus:ring-brand-500 outline-none placeholder-slate-600"
                    rows={4}
                    value={newProp.description || ''}
                    onChange={e => setNewProp({...newProp, description: e.target.value})}
                    placeholder="AI will generate a listing description here..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-surface">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-300 font-medium hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProperty}
                className="px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-500 transition-colors shadow-neon"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;