import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Sparkles, AlertTriangle, Megaphone, Calendar } from 'lucide-react';

interface Announcement {
  id: string;
  announcementId: string;
  title: string;
  message: string;
  type: 'Announcement' | 'Greeting' | 'Festival Greeting' | 'Important Notice';
  priority: 'Normal' | 'High' | 'Urgent';
  startDate: string;
  endDate: string;
  active: boolean;
  enableMarquee: boolean;
  createdAt: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dismissedAnnouncements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch announcements in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const list: Announcement[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          announcementId: data.announcementId || doc.id,
          title: data.title || '',
          message: data.message || '',
          type: data.type || 'Announcement',
          priority: data.priority || 'Normal',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          active: data.active !== undefined ? data.active : true,
          enableMarquee: data.enableMarquee !== undefined ? data.enableMarquee : true,
          createdAt: data.createdAt || ''
        });
      });
      setAnnouncements(list);
    }, (error) => {
      console.error("Error syncing announcements for customers:", error);
    });

    return () => unsub();
  }, []);

  // Filter to compute active announcements
  const activeAnnouncements = announcements.filter((ann) => {
    if (!ann.active) return false;
    if (dismissedIds.includes(ann.id)) return false;

    // Date validity check
    const today = new Date().toISOString().split('T')[0];
    if (ann.startDate && today < ann.startDate) return false;
    if (ann.endDate && today > ann.endDate) return false;

    return true;
  });

  // Cycle index if multiple announcements exist
  useEffect(() => {
    if (activeAnnouncements.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [activeAnnouncements.length]);

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const currentAnn = activeAnnouncements[currentIndex];
  if (!currentAnn) return null;

  const isUrgent = currentAnn.priority === 'Urgent';
  const isHigh = currentAnn.priority === 'High';

  // Styles by Type
  let bgGradient = 'bg-gradient-to-r from-blue-600 to-indigo-650';
  let badgeColor = 'bg-blue-800 text-white border-blue-500';
  let icon = '📢';

  if (currentAnn.type === 'Greeting') {
    bgGradient = 'bg-gradient-to-r from-emerald-600 to-teal-650';
    badgeColor = 'bg-emerald-800 text-white border-emerald-500';
    icon = '👋';
  } else if (currentAnn.type === 'Festival Greeting') {
    bgGradient = 'bg-gradient-to-r from-purple-650 to-pink-650';
    badgeColor = 'bg-purple-800 text-white border-purple-500';
    icon = '🎉';
  } else if (currentAnn.type === 'Important Notice') {
    bgGradient = 'bg-gradient-to-r from-rose-600 to-red-700';
    badgeColor = 'bg-rose-800 text-white border-rose-500';
    icon = '🚨';
  }

  // Text representation for banner ticker
  const displayString = ` ${icon} ${currentAnn.title.toUpperCase()} : ${currentAnn.message} ✦ VISIT MITHILA CATERING & TIFFIN SERVICES ✦ CALL 8210350711 `;

  const handleDismissClick = () => {
    const updated = [...dismissedIds, currentAnn.id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className={`fixed top-[71px] left-0 right-0 z-30 transition-all duration-300 shadow-md select-none ${bgGradient} ${
        isUrgent ? 'animate-pulse' : ''
      }`}
      id={`banner-${currentAnn.id}`}
    >
      <div className="max-w-7xl mx-auto h-11 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Type pill left header label badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[9px] font-black tracking-widest uppercase border px-2 py-0.5 rounded-full shadow-sm select-none ${badgeColor}`}>
            {currentAnn.type}
          </span>
          {isUrgent && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          {isHigh && (
            <Sparkles size={12} className="text-yellow-300 animate-spin" />
          )}
        </div>

        {/* Dynamic scroll area */}
        <div className="flex-1 overflow-hidden mx-4 text-xs font-black tracking-wide text-white uppercase flex items-center">
          {currentAnn.enableMarquee ? (
            <marquee
              scrollamount="6"
              className="w-full flex items-center h-full cursor-pointer"
              onMouseOver={(e: any) => e.currentTarget.stop()}
              onMouseOut={(e: any) => e.currentTarget.start()}
            >
              {displayString}
            </marquee>
          ) : (
            <div className="w-full text-center px-4 flex items-center justify-center gap-1.5 truncate">
              <span>{icon}</span>
              <span className="font-extrabold">{currentAnn.title.toUpperCase()}:</span>
              <span className="opacity-95 font-semibold text-stone-100 truncate">{currentAnn.message}</span>
            </div>
          )}
        </div>

        {/* Close control button right side */}
        <button
          type="button"
          onClick={handleDismissClick}
          className="p-1 hover:bg-white/15 rounded-full text-white/80 hover:text-white transition flex-shrink-0 cursor-pointer"
          title="Dismiss Announcement"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
