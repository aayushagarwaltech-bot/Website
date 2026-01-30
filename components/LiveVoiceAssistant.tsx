import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Loader2, Sparkles } from 'lucide-react';
import { genAIClient } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';

const LiveVoiceAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Initialize Link');
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  // Helper: Encode PCM to Base64
  const encodeAudio = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Helper: Decode Base64 to PCM and create Buffer
  const decodeAudioData = async (
    base64Str: string,
    ctx: AudioContext
  ): Promise<AudioBuffer> => {
    const binaryString = atob(base64Str);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert 16-bit PCM to float
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      setStatus('Negotiating Connection...');
      setIsActive(true);

      // 1. Setup Audio Contexts
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      // 2. Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Connect to Gemini Live
      const sessionPromise = genAIClient.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'You are a helpful Indian real estate assistant named "RentFlow". Keep answers concise and helpful.',
        },
        callbacks: {
          onopen: () => {
            setStatus('Live Uplink Active');
            
            // Setup Audio Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert Float32 to Int16 PCM
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              const base64Data = encodeAudio(new Uint8Array(int16.buffer));
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                  }
                });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            sourceRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && audioContextRef.current) {
               const ctx = audioContextRef.current;
               const buffer = await decodeAudioData(base64Audio, ctx);
               
               const source = ctx.createBufferSource();
               source.buffer = buffer;
               source.connect(ctx.destination);
               
               const currentTime = ctx.currentTime;
               // Simple scheduling to prevent overlap/gaps
               if (nextStartTimeRef.current < currentTime) {
                 nextStartTimeRef.current = currentTime;
               }
               
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += buffer.duration;
             }
          },
          onclose: () => {
            setStatus('Link Terminated');
            stopSession();
          },
          onerror: (err) => {
            console.error(err);
            setStatus('Connection Error');
            stopSession();
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error("Failed to start live session", e);
      setStatus("Uplink Failed");
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (processorRef.current && sourceRef.current) {
      sourceRef.current.disconnect();
      processorRef.current.disconnect();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    setIsActive(false);
    setStatus('Initialize Link');
    nextStartTimeRef.current = 0;
  };

  const toggleSession = () => {
    if (isActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-ai-600 to-brand-600 text-white p-4 rounded-full shadow-neon hover:scale-105 transition-transform z-50 flex items-center gap-2 group border border-white/20 animate-pulse-slow"
      >
        <Sparkles className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold font-mono">
          Connect Live
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-surfaceHighlight/90 backdrop-blur-xl rounded-2xl shadow-2xl z-50 w-80 overflow-hidden border border-brand-500/30 animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-brand-900 to-ai-900 p-4 text-white flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
           <Volume2 className="h-5 w-5 text-brand-400" />
           <span className="font-bold font-heading tracking-wide">Voice Link</span>
        </div>
        <button onClick={() => { stopSession(); setIsOpen(false); }} className="hover:bg-white/10 p-1 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-6 flex flex-col items-center justify-center space-y-6">
         <div className={`relative h-24 w-24 flex items-center justify-center rounded-full transition-all duration-500`}>
            {isActive && (
              <>
                <span className="absolute inset-0 rounded-full bg-brand-500/30 animate-ping"></span>
                <span className="absolute inset-2 rounded-full bg-ai-500/20 animate-pulse"></span>
              </>
            )}
            <div className={`z-10 h-16 w-16 rounded-full flex items-center justify-center transition-all border ${
              isActive 
                ? 'bg-gradient-to-br from-brand-500 to-ai-500 text-white border-white/20 shadow-neon' 
                : 'bg-surface text-slate-500 border-white/10'
              }`}>
               {isActive ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
            </div>
         </div>
         
         <div className="text-center">
           <p className={`font-medium font-mono text-sm ${isActive ? 'text-brand-400 animate-pulse' : 'text-slate-500'}`}>
             {status}
           </p>
           <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Gemini 1.5 Flash Audio</p>
         </div>

         <button 
           onClick={toggleSession}
           className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 border ${
             isActive 
               ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30' 
               : 'bg-brand-600 text-white hover:bg-brand-500 border-brand-400/50 shadow-neon'
           }`}
         >
           {isActive ? 'Terminate Uplink' : 'Activate Voice'}
         </button>
      </div>
    </div>
  );
};

export default LiveVoiceAssistant;