import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Building, Map, Mail, Lock, UserPlus, LogIn, AlertCircle, ScanFace, Check, Facebook, Github, Globe } from 'lucide-react';

const Login: React.FC = () => {
  const { login, signup } = useApp();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TENANT' as 'TENANT' | 'OWNER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passStrength, setPassStrength] = useState(0);

  useEffect(() => {
    if (formData.password) {
        let strength = 0;
        if (formData.password.length > 5) strength++;
        if (formData.password.length > 8) strength++;
        if (/[A-Z]/.test(formData.password)) strength++;
        if (/[0-9]/.test(formData.password)) strength++;
        setPassStrength(strength);
    } else {
        setPassStrength(0);
    }
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(formData);
      } else {
        await login(formData.email, formData.password);
      }
      navigate(formData.role === 'OWNER' ? '/dashboard' : '/browse');
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
      setIsScanning(true);
      // Simulate biometric processing time
      setTimeout(async () => {
          try {
              // Simulating successful face ID for the demo tenant account
              await login('tenant@rentflow.com', 'password');
              navigate('/browse');
          } catch (e) {
              setError("Face ID not recognized. Please use password.");
              setIsScanning(false);
          }
      }, 2500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-background"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>

      {/* Biometric Overlay */}
      {isScanning && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="relative">
                  <div className="h-32 w-32 rounded-full border-4 border-brand-500 animate-ping absolute inset-0"></div>
                  <div className="h-32 w-32 rounded-full border-4 border-t-transparent border-brand-400 animate-spin flex items-center justify-center relative bg-black">
                      <ScanFace className="h-16 w-16 text-brand-400" />
                  </div>
              </div>
              <p className="mt-8 text-brand-400 font-mono text-lg animate-pulse">Verifying Identity...</p>
          </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-8">
           <div className="relative group cursor-default">
               <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-accent-500 blur-xl opacity-50 group-hover:opacity-100 transition-all duration-500"></div>
               <div className="relative bg-surface p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                   <Map className="h-10 w-10 text-white" />
               </div>
           </div>
        </div>
        <h2 className="text-center text-4xl font-black text-white tracking-tight font-heading mb-2">
          RentalFinds
        </h2>
        <p className="text-center text-sm text-gray-400 font-medium tracking-wide uppercase">
          {isSignUp ? "Join the Future of Living" : "Secure Access Portal"}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface/60 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-3xl sm:px-10 border border-white/10">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-black/40 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm transition-all"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-black/40 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm transition-all"
                  placeholder="name@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Passcode</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-brand-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-black/40 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              
              {/* Password Strength Meter */}
              {isSignUp && formData.password && (
                  <div className="mt-2 flex gap-1 h-1">
                      <div className={`flex-1 rounded-full transition-colors duration-300 ${passStrength >= 1 ? 'bg-red-500' : 'bg-gray-700'}`}></div>
                      <div className={`flex-1 rounded-full transition-colors duration-300 ${passStrength >= 2 ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                      <div className={`flex-1 rounded-full transition-colors duration-300 ${passStrength >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                      <div className={`flex-1 rounded-full transition-colors duration-300 ${passStrength >= 4 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                  </div>
              )}
            </div>

            <div className="pt-2">
               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Access Level</label>
               <div className="grid grid-cols-2 gap-3">
                 <button
                   type="button"
                   onClick={() => setFormData({...formData, role: 'TENANT'})}
                   className={`flex items-center justify-center py-3 text-sm font-bold rounded-xl border transition-all relative overflow-hidden group ${
                     formData.role === 'TENANT' 
                       ? 'bg-brand-600/20 border-brand-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                       : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                   }`}
                 >
                   <User className={`h-4 w-4 mr-2 ${formData.role === 'TENANT' ? 'text-brand-400' : ''}`} /> Tenant
                   {formData.role === 'TENANT' && <div className="absolute inset-0 bg-brand-500/10 animate-pulse"></div>}
                 </button>
                 <button
                   type="button"
                   onClick={() => setFormData({...formData, role: 'OWNER'})}
                   className={`flex items-center justify-center py-3 text-sm font-bold rounded-xl border transition-all relative overflow-hidden ${
                     formData.role === 'OWNER' 
                       ? 'bg-brand-600/20 border-brand-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                       : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20'
                   }`}
                 >
                   <Building className={`h-4 w-4 mr-2 ${formData.role === 'OWNER' ? 'text-brand-400' : ''}`} /> Owner
                   {formData.role === 'OWNER' && <div className="absolute inset-0 bg-brand-500/10 animate-pulse"></div>}
                 </button>
               </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 animate-in shake">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-sm font-bold text-red-400">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-glow text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50 transform hover:scale-[1.02] hover:shadow-glow-accent"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                </div>
              ) : isSignUp ? (
                <>Initialize Account <UserPlus className="ml-2 h-5 w-5" /></>
              ) : (
                <>Secure Sign In <LogIn className="ml-2 h-5 w-5" /></>
              )}
            </button>
          </form>

          {/* Social / Bio Auth */}
          {!isSignUp && (
              <div className="mt-6">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="px-4 bg-[#111827] text-gray-500">Or connect with</span></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                      <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 flex justify-center transition-all"><Globe className="h-5 w-5 text-gray-400" /></button>
                      <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 flex justify-center transition-all"><Github className="h-5 w-5 text-gray-400" /></button>
                      <button onClick={handleBiometricLogin} className="bg-white/5 hover:bg-brand-500/20 border border-white/10 hover:border-brand-500/50 rounded-xl py-2 flex justify-center transition-all group" title="Face ID">
                          <ScanFace className="h-5 w-5 text-gray-400 group-hover:text-brand-400" />
                      </button>
                  </div>
              </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm font-bold text-gray-400 hover:text-brand-400 transition-colors"
            >
              {isSignUp ? "Already verified? Sign In" : "New User? Create Access Identity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;