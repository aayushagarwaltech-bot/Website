import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, XCircle, Calendar, MapPin, Building, AlertCircle } from 'lucide-react';

const Notifications: React.FC = () => {
  const { bookings, properties, updateBookingStatus, role, user } = useApp();

  // Filter bookings based on role
  const relevantBookings = bookings.filter(b => {
    if (role === 'OWNER') {
      const prop = properties.find(p => p.id === b.propertyId);
      return prop?.ownerId === user?.id;
    }
    return b.tenantId === user?.id;
  });

  const sortedBookings = [...relevantBookings].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'DECLINED': return 'text-red-400 bg-red-900/20 border-red-500/30';
      default: return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white font-heading">Notifications</h1>
      <p className="text-gray-400">Manage your rental requests and updates.</p>

      {sortedBookings.length === 0 ? (
        <div className="bg-surface/50 rounded-2xl p-12 text-center border border-white/5">
          <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No notifications yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedBookings.map(booking => {
            const property = properties.find(p => p.id === booking.propertyId);
            return (
              <div key={booking.id} className="bg-surface p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-800">
                  <img src={property?.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{property?.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {property?.address}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {booking.startDate} to {booking.endDate}</span>
                  </div>
                </div>

                {/* Actions for Owner */}
                {role === 'OWNER' && booking.status === 'PENDING' && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'DECLINED')}
                      className="flex-1 md:flex-none px-4 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" /> Decline
                    </button>
                    <button 
                      onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                      className="flex-1 md:flex-none px-6 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CheckCircle className="h-4 w-4" /> Accept
                    </button>
                  </div>
                )}

                {/* Status for Tenant or processed booking */}
                {booking.status !== 'PENDING' && (
                   <div className="text-sm font-medium text-gray-500 italic">
                     {booking.status === 'CONFIRMED' ? 'You have accepted this request.' : 'Request finalized.'}
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
