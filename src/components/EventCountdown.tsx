import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Edit, Check, Settings, Sparkles, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownConfig {
  eventName: string;
  eventDate: string; // ISO string or YYYY-MM-DD
}

export default function EventCountdown() {
  const [config, setConfig] = useState<CountdownConfig>(() => {
    const saved = localStorage.getItem('mithila_countdown_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    // Default to wedding on some future date
    return {
      eventName: 'Our Grand Wedding Ceremony',
      eventDate: '2026-12-14T18:00:00',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(config.eventName);
  const [tempDate, setTempDate] = useState(config.eventDate.split('T')[0]);
  const [tempTime, setTempTime] = useState(config.eventDate.includes('T') ? config.eventDate.split('T')[1].substring(0, 5) : '18:00');

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  // Save config to local storage
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: CountdownConfig = {
      eventName: tempName.trim() || 'My Celebration',
      eventDate: `${tempDate}T${tempTime}:00`,
    };
    setConfig(newConfig);
    localStorage.setItem('mithila_countdown_config', JSON.stringify(newConfig));
    setIsEditing(false);
  };

  // Preset quick configurator
  const applyPreset = (presetType: 'wedding' | 'birthday' | 'anniversary' | 'party') => {
    const nextYear = new Date().getFullYear();
    let dateStr = `${nextYear}-12-14`;
    let nameStr = '';

    if (presetType === 'wedding') {
      nameStr = 'Our Grand Wedding';
      dateStr = `${nextYear}-11-25`;
    } else if (presetType === 'birthday') {
      nameStr = 'Grand Birthday Feast';
      dateStr = `${nextYear}-08-15`;
    } else if (presetType === 'anniversary') {
      nameStr = 'Silver Anniversary Celebration';
      dateStr = `${nextYear}-10-10`;
    } else if (presetType === 'party') {
      nameStr = 'Mithila catered Corporate Gala';
      dateStr = `${nextYear}-12-31`;
    }

    setTempName(nameStr);
    setTempDate(dateStr);
    setTempTime('19:00');
  };

  // Ticker logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(config.eventDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isCompleted: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isCompleted: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [config.eventDate]);

  return (
    <div id="event-countdown-container" className="w-full max-w-xl mx-auto bg-stone-900/90 backdrop-blur-md rounded-3xl border border-orange-500/20 p-6 md:p-8 shadow-2xl relative overflow-hidden text-white mt-10">
      {/* Decorative particle background layout */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-6 -mt-6 pointer-events-none blur-xl" />
      <div className="absolute left-0 bottom-0 w-24 h-24 bg-amber-500/10 rounded-full -ml-6 -mb-6 pointer-events-none blur-xl" />

      <div className="flex justify-between items-start gap-4 mb-4 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-orange-400 flex items-center gap-1">
            <Sparkles size={12} className="animate-spin" /> Countdown to Celebration
          </span>
          <h3 className="text-xl md:text-2xl font-black text-white mt-1 leading-tight tracking-tight">
            {config.eventName}
          </h3>
          <p className="text-xs text-stone-300 font-bold mt-1 flex items-center gap-1.5 font-mono">
            <Calendar size={13} className="text-orange-400" /> 
            {new Date(config.eventDate).toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <button
          onClick={() => {
            setTempName(config.eventName);
            setTempDate(config.eventDate.split('T')[0]);
            setTempTime(config.eventDate.includes('T') ? config.eventDate.split('T')[1].substring(0, 5) : '18:00');
            setIsEditing(!isEditing);
          }}
          className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
          title="Configure Event Date"
        >
          {isEditing ? <Check size={14} /> : <Settings size={14} />}
          <span className="hidden sm:inline">{isEditing ? 'Close' : 'Plan Date'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form
            key="config-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSave}
            className="border-t border-white/10 pt-4 mt-4 space-y-4 text-left relative z-10"
          >
            <div className="text-xs font-black text-orange-300 uppercase tracking-wider mb-2">
              Configure Your Event Details:
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase text-stone-300 block mb-1">Event Name / Occasion</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Wedding, Sunita's Birthday Bash"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-2 bg-stone-800 border border-white/20 rounded-xl text-sm focus:ring-1 focus:ring-orange-500 outline-none text-white placeholder-stone-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase text-stone-300 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="w-full px-4 py-2 bg-stone-800 border border-white/20 rounded-xl text-sm focus:ring-1 focus:ring-orange-500 outline-none text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase text-stone-300 block mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={tempTime}
                    onChange={(e) => setTempTime(e.target.value)}
                    className="w-full px-4 py-2 bg-stone-800 border border-white/20 rounded-xl text-sm focus:ring-1 focus:ring-orange-500 outline-none text-white font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-stone-400 font-extrabold uppercase">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('wedding')}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-md border border-white/10 text-[10px] font-black text-amber-300"
                >
                  💍 Wedding
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('birthday')}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-md border border-white/10 text-[10px] font-black text-indigo-300"
                >
                  🎂 Birthday
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('anniversary')}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-md border border-white/10 text-[10px] font-black text-pink-300"
                >
                  💖 Anniversary
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('party')}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 rounded-md border border-white/10 text-[10px] font-black text-emerald-300"
                >
                  🎉 Party / Gala
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider text-center"
              >
                Save Countdown Config
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs uppercase"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="counter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 pt-6 border-t border-white/10 relative z-10"
          >
            {timeLeft.isCompleted ? (
              <div className="text-center py-6">
                <PartyPopper size={44} className="mx-auto text-yellow-400 mb-2 animate-bounce" />
                <h4 className="text-2xl font-black text-white uppercase tracking-wider bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                  The Big Celebratory Day Has Arrived! 🎉
                </h4>
                <p className="text-xs text-stone-350 font-bold mt-1 leading-relaxed">
                  Wishing you first-class celebrations. Order from Mithila Premium Catering to serve luxury memories!
                </p>
                <a
                  href="/contact"
                  className="inline-block mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black hover:scale-105 active:scale-95 transition-all text-xs rounded-xl uppercase tracking-wider"
                >
                  Get VIP Catering Price Quote
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 md:gap-4 text-center">
                <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-1 md:py-4 transition-transform hover:scale-[1.03]">
                  <span className="block text-2xl md:text-4xl font-extrabold text-orange-400 font-mono tracking-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-wider text-stone-400 block mt-1">Days</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-1 md:py-4 transition-transform hover:scale-[1.03]">
                  <span className="block text-2xl md:text-4xl font-extrabold text-orange-400 font-mono tracking-tight">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-wider text-stone-400 block mt-1">Hours</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-1 md:py-4 transition-transform hover:scale-[1.03]">
                  <span className="block text-2xl md:text-4xl font-extrabold text-orange-400 font-mono tracking-tight">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-wider text-stone-400 block mt-1">Mins</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl py-3 px-1 md:py-4 transition-transform hover:scale-[1.03]">
                  <span className="block text-2xl md:text-4xl font-extrabold text-orange-400 font-mono tracking-tight">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] md:text-xs font-black uppercase tracking-wider text-stone-400 block mt-1">Secs</span>
                </div>
              </div>
            )}

            {!timeLeft.isCompleted && (
              <div className="mt-5 text-center">
                <p className="text-[11px] text-stone-400 font-bold leading-normal">
                  💡 Event planners recommend locking catering, decorator, and DJ arrangements <strong className="text-amber-400">at least 30 days prior</strong> to avoid price hikes.
                </p>
                <div className="flex justify-center gap-3 mt-3">
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl shadow-lg hover:shadow-orange-500/10 cursor-pointer"
                  >
                    💍 Book Menu Catering & Decor
                  </a>
                  <a
                    href="#ai-planner"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase rounded-xl border border-white/10"
                  >
                    🤖 Plan Menu with AI
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
