import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, User, ChevronLeft, MapPin } from 'lucide-react';
import { Inquiry } from '../types';

const Messages: React.FC = () => {
  const { inquiries, user, properties, sendMessage } = useApp();
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter inquiries related to current user and sort by last update
  const userInquiries = inquiries
    .filter(i => user?.role === 'OWNER' ? i.ownerId === user.id : i.tenantId === user.id)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  const selectedInquiry = userInquiries.find(i => i.id === selectedInquiryId);
  const relatedProperty = selectedInquiry ? properties.find(p => p.id === selectedInquiry.propertyId) : null;

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedInquiryId, selectedInquiry?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId || !newMessage.trim()) return;
    sendMessage(selectedInquiryId, newMessage);
    setNewMessage('');
  };

  return (
    <div className="glass-card rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-140px)] flex border border-white/5">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-surface/50 ${selectedInquiryId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5 bg-surfaceHighlight/30">
          <h2 className="font-bold text-white font-heading">Secure Inbox</h2>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {userInquiries.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                No messages yet.
            </div>
          ) : (
            userInquiries.map(inquiry => {
              const prop = properties.find(p => p.id === inquiry.propertyId);
              const lastMsg = inquiry.messages[inquiry.messages.length - 1];
              const isSelected = inquiry.id === selectedInquiryId;
              
              // Logic to choose display title
              // For Owners: Show Tenant Name (and property in subtitle)
              // For Tenants: Show Property Title (and Owner in subtitle)
              const displayTitle = user?.role === 'OWNER' 
                ? (inquiry.tenantName || 'Potential Tenant') 
                : (prop?.title || 'Unknown Property');
              
              const subTitle = user?.role === 'OWNER'
                ? prop?.title || 'Unknown Property'
                : 'Owner';

              return (
                <div 
                  key={inquiry.id}
                  onClick={() => setSelectedInquiryId(inquiry.id)}
                  className={`p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${isSelected ? 'bg-brand-500/10 border-l-2 border-l-brand-500' : 'border-l-2 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-slate-200 truncate pr-2 w-3/4">{displayTitle}</h3>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
                      {new Date(lastMsg.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mb-1 truncate">{subTitle}</div>
                  <p className="text-sm text-slate-400 truncate font-light">{lastMsg.text}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-sm font-medium uppercase tracking-wide border ${
                      inquiry.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}>
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-background/50 ${!selectedInquiryId ? 'hidden md:flex' : 'flex'}`}>
        {selectedInquiry ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surfaceHighlight/20 backdrop-blur">
              <div className="flex items-center gap-3">
                 <button onClick={() => setSelectedInquiryId(null)} className="md:hidden text-slate-400 hover:text-white transition-colors">
                   <ChevronLeft className="h-6 w-6" />
                 </button>
                 <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        {user?.role === 'OWNER' ? (selectedInquiry.tenantName || 'Potential Tenant') : relatedProperty?.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-brand-400 font-mono">
                        <MapPin className="h-3 w-3" />
                        {relatedProperty?.address}
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="bg-brand-500/20 p-2 rounded-full border border-brand-500/30">
                    <User className="h-4 w-4 text-brand-400" />
                 </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {selectedInquiry.messages.map(msg => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-lg backdrop-blur-sm border ${
                      isMe 
                        ? 'bg-brand-600/80 text-white rounded-br-none border-brand-500/50' 
                        : 'bg-surfaceHighlight/80 text-slate-200 border-white/10 rounded-bl-none'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 opacity-60 font-mono text-right`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-surfaceHighlight/20 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white focus:ring-1 focus:ring-brand-500 outline-none placeholder-slate-600 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-neon transform active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="bg-white/5 p-6 rounded-full mb-4 border border-white/5 animate-pulse">
               <MessageSquare className="h-10 w-10 text-slate-600" />
            </div>
            <p className="font-mono text-sm">Select a conversation to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;