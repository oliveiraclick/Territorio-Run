import React from 'react';
import { ActivityEvent } from '../../types';
import { ShieldAlert, Sword, Crown } from 'lucide-react';

interface ActivityFeedProps {
  events: ActivityEvent[];
  onEventClick?: (event: ActivityEvent) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ events, onEventClick }) => {
  if (events.length === 0) return null;

  return (
    <div className="absolute top-28 left-4 z-10 w-64 flex flex-col space-y-2 pointer-events-none">
      {events.slice(0, 3).map((event) => (
        <div 
          key={event.id} 
          onClick={() => onEventClick && onEventClick(event)}
          className={`
            bg-black/80 backdrop-blur-md border-l-4 p-3 rounded-r-lg shadow-lg text-white 
            transform transition-all animate-in fade-in slide-in-from-left duration-500 
            pointer-events-auto cursor-pointer hover:bg-black/90 hover:scale-105
            ${event.type === 'lost' ? 'border-neon-red' : event.type === 'conquer' ? 'border-neon-green' : 'border-yellow-400'}
          `}
        >
          <div className="flex items-center space-x-2 mb-1">
            {event.type === 'lost' && <ShieldAlert size={16} className="text-neon-red" />}
            {event.type === 'conquer' && <Crown size={16} className="text-neon-green" />}
            {event.type === 'defend' && <Sword size={16} className="text-yellow-400" />}
            <span className={`text-xs font-bold uppercase tracking-wide ${event.type === 'lost' ? 'text-neon-red' : 'text-gray-400'}`}>
              {event.type === 'conquer' ? 'Vitória' : event.type === 'lost' ? 'SOB ATAQUE' : 'Atualização'}
            </span>
          </div>
          <p className="text-sm font-medium leading-tight">{event.message}</p>
          <span className="text-[10px] text-gray-500 mt-1 block">
            {event.type === 'lost' ? 'Toque para ver o local' : 'Agora mesmo'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;