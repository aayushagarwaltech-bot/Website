import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Home,
  UserCircle,
  Map,
  Globe2,
  Sparkles,
  Bell,
  Check,
  Calendar,
  LucideIcon
} from 'lucide-react';
import LiveVoiceAssistant from './LiveVoiceAssistant';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, logout, bookings, properties, markNotificationsAsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter bookings for notifications
  const myNotifications = bookings.filter(b => {
    if (role === 'OWNER') {
      const prop = properties.find(p => p.id === b.propertyId);
      return prop?.ownerId === user?.id;
    }
    return b.tenantId === user?.id;
  }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = myNotifications.filter(b => !b.isRead).length;

  const handleNotificationClick = () => {
      setIsNotificationOpen(!isNotificationOpen);
  };

  const handleMarkRead = async () => {
      await markNotificationsAsRead();
  };

  const navItems: NavItem[] = role === 'OWNER' ? [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Messages', path: '/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ] : [
    { label: 'Explore', path: '/browse', icon: Globe2 },
    { label: 'Saved', path: '/saved', icon: Home }, 
    { label: 'Inbox', path: '/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-300" onClick={() => setIsNotificationOpen(false)}>
      {/* Navigation Bar */}
      <nav className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 rounded-xl shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <Map className="h-6 w-6 text-white absolute" />
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-heading tracking-tight">RentalFinds</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1 p-1 bg-surfaceHighlight/50 rounded-full border border-white/5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 relative ${
                    isActive(item.path)
                      ? 'bg-brand-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* User Profile & Notifications */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Notification Bell */}
              <div className="relative" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={handleNotificationClick}
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 relative transition-all"
                  >
                      <Bell className="h-6 w-6" />
                      {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                              {unreadCount}
                          </span>
                      )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                      <div className="absolute right-0 top-12 w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                          <div className="p-4 border-b border-border flex justify-between items-center bg-surfaceHighlight">
                              <h3 className="font-bold text-white">Notifications</h3>
                              {unreadCount > 0 && (
                                  <button onClick={handleMarkRead} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium">
                                      <Check className="h-3 w-3" /> Mark all read
                                  </button>
                              )}
                          </div>
                          <div className="max-h-80 overflow-y-auto custom-scrollbar">
                              {myNotifications.length === 0 ? (
                                  <div className="p-8 text-center text-gray-500 text-sm">
                                      No notifications.
                                  </div>
                              ) : (
                                  myNotifications.map(notif => {
                                      const prop = properties.find(p => p.id === notif.propertyId);
                                      return (
                                          <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!notif.isRead ? 'bg-brand-500/5' : ''}`}>
                                              <div className="flex justify-between items-start mb-1">
                                                  <span className="font-bold text-white text-sm truncate w-2/3">{prop?.title}</span>
                                                  <span className="text-[10px] text-gray-500">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                              </div>
                                              <p className="text-xs text-gray-400 mb-2">
                                                  Status update: <span className={`font-bold ${notif.status === 'CONFIRMED' ? 'text-green-400' : notif.status === 'DECLINED' ? 'text-red-400' : 'text-yellow-400'}`}>{notif.status}</span>
                                              </p>
                                          </div>
                                      );
                                  })
                              )}
                          </div>
                          <div className="p-2 border-t border-border bg-surfaceHighlight text-center">
                              <Link to="/notifications" className="text-xs text-brand-400 hover:underline" onClick={() => setIsNotificationOpen(false)}>
                                  View all activity
                              </Link>
                          </div>
                      </div>
                  )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-white leading-none">{user?.name}</p>
                  <p className="text-[11px] text-brand-400 mt-1 capitalize font-medium tracking-wide">{role?.toLowerCase()}</p>
                </div>
                <div className="relative group cursor-pointer">
                    <div className="p-0.5 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full">
                        <img 
                        className="h-10 w-10 rounded-full bg-surface border-2 border-background object-cover" 
                        src={user?.avatar} 
                        alt="" 
                        />
                    </div>
                    <div className="absolute right-0 top-12 w-48 bg-surface border border-border rounded-xl shadow-xl p-1 hidden group-hover:block transform origin-top-right transition-all z-50">
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 font-medium"
                        >
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border animate-in slide-in-from-top-2">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold ${
                    isActive(item.path)
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                 <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <LiveVoiceAssistant />

      <footer className="bg-surface border-t border-border mt-auto relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                 <div className="flex items-center gap-2 mb-6">
                    <div className="relative flex items-center justify-center w-8 h-8 bg-brand-600 rounded-lg">
                        <Globe2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-2xl font-black text-white font-heading">RentalFinds</span>
                 </div>
                 <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                   The world's first AI-powered global rental discovery platform. 
                   Seamlessly connecting you to your next sanctuary using advanced location intelligence and generative AI.
                 </p>
              </div>
              <div>
                 <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Global Tools</h4>
                 <ul className="space-y-3 text-sm text-gray-500 font-medium">
                    <li><a href="#toolkit" className="hover:text-brand-400 transition-colors flex items-center gap-2"><Map className="h-3 w-3" /> Location Scout</a></li>
                    <li><a href="#toolkit" className="hover:text-brand-400 transition-colors flex items-center gap-2"><Sparkles className="h-3 w-3" /> Market Trends</a></li>
                    <li><a href="#toolkit" className="hover:text-brand-400 transition-colors flex items-center gap-2"><Globe2 className="h-3 w-3" /> Area Guide</a></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Platform</h4>
                 <ul className="space-y-3 text-sm text-gray-500 font-medium">
                    <li><a href="#" className="hover:text-brand-400 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-brand-400 transition-colors">Careers</a></li>
                    <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
                 </ul>
              </div>
           </div>
           <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-medium">
             <p>© 2024 RentalFinds Global Inc.</p>
             <p className="mt-2 md:mt-0 flex items-center gap-2">
               Powered by <span className="text-brand-500">Gemini</span> & <span className="text-blue-500">Google Maps</span>
             </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;