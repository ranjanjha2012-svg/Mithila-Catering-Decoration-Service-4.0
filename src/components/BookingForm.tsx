import React, { useState } from 'react';
import { Check, Sparkles, Send, User, MapPin, Home, Package, Users, Utensils, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import AIPlanner from './AIPlanner';

export default function BookingForm() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  
  const services = [
    'Tent', 'Catering (Food Only)', 'Water', 'DJ Music', 'Buffet', 'Waiter', 'Decoration', 'Photography'
  ];

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  const getWish = () => {
    if (selectedServices.length === 0) return "We're excited to help you plan your event!";
    
    const firstService = selectedServices[0];
    const wishes: Record<string, string> = {
      'Tent': "We'll provide the perfect shelter for your grand celebration!",
      'Catering (Food Only)': "Get ready for a feast that your guests will remember forever!",
      'Water': "Pure and refreshing hydration for all your guests.",
      'DJ Music': "Let's get the party started with the best beats in town!",
      'Buffet': "A grand spread of deliciousness awaits your guests.",
      'Waiter': "Professional service to ensure your guests are well taken care of.",
      'Decoration': "We'll transform your venue into a dreamland!",
      'Photography': "Capturing every precious moment of your special day."
    };

    return wishes[firstService] || `Looking forward to making your ${firstService} absolutely perfect!`;
  };

  return (
    <section id="booking" className="py-20 relative overflow-hidden min-h-screen">
      {/* Fancy Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-blood opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Side: Form */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20"
            >
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase tracking-tighter flex items-center gap-3">
                  <Sparkles className="text-orange-400" /> Book Your Event
                </h2>
                <p className="text-orange-200/80 font-medium italic">
                  {getWish()}
                </p>
              </div>

              <form 
                action="https://formspree.io/f/xjgajopa" 
                method="POST"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} /> Full Name
                    </label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="Your Name"
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/40 font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} /> Venue Name
                    </label>
                    <input 
                      type="text" 
                      name="venue" 
                      required 
                      placeholder="Event Venue"
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/40 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <Phone size={14} /> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      placeholder="Your Contact Number"
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/40 font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <Mail size={14} /> Email Address
                    </label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      placeholder="Your Email Address"
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/40 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                    <Home size={14} /> Full Address
                  </label>
                  <input 
                    type="text" 
                    name="address" 
                    required 
                    placeholder="Complete Address"
                    className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/40 font-bold"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={14} /> Select Services (Items)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {services.map((service) => (
                      <label 
                        key={service}
                        className={`
                          flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-[10px] md:text-xs font-bold
                          ${selectedServices.includes(service) 
                            ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-600/20' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}
                        `}
                      >
                        <input 
                          type="checkbox" 
                          name="items[]" 
                          value={service}
                          className="hidden"
                          onChange={() => toggleService(service)}
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedServices.includes(service) ? 'bg-white border-white' : 'border-white/20'}`}>
                          {selectedServices.includes(service) && <Check size={12} className="text-orange-600" />}
                        </div>
                        {service}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <Users size={14} /> Guest Quantity
                    </label>
                    <select 
                      name="guests" 
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white font-bold appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-stone-900 text-white">Select Quantity</option>
                      <option value="50-100" className="bg-stone-900 text-white">50 - 100</option>
                      <option value="100-250" className="bg-stone-900 text-white">100 - 250</option>
                      <option value="250-500" className="bg-stone-900 text-white">250 - 500</option>
                      <option value="500-1000" className="bg-stone-900 text-white">500 - 1000</option>
                      <option value="1000+" className="bg-stone-900 text-white">1000+</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                      <Utensils size={14} /> Food Preference
                    </label>
                    <div className="flex gap-4">
                      {['Veg Only', 'Non-Veg & Veg'].map((pref) => (
                        <label 
                          key={pref}
                          className="flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all"
                        >
                          <input type="radio" name="food_pref" value={pref} required className="accent-orange-500" />
                          <span className="text-xs font-bold text-white">{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/40 flex items-center justify-center gap-3 uppercase tracking-widest group"
                >
                  Confirm Booking <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </motion.div>

            {/* Right Side: AI Planner Integration */}
            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10">
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter flex items-center gap-2">
                  <Sparkles className="text-orange-400" /> AI Event Assistant
                </h3>
                <p className="text-orange-100/60 text-sm mb-6 font-medium">
                  Need help deciding the menu or decor? Ask our AI assistant for instant suggestions tailored to your guest count and budget.
                </p>
                <div className="h-[400px] overflow-hidden rounded-2xl border border-white/10">
                   <AIPlanner isCompact={true} />
                </div>
              </div>

              <div className="bg-orange-600 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Need Immediate Help?</h4>
                <p className="text-orange-100 text-sm mb-6 font-bold">Call us directly for urgent bookings and customized packages.</p>
                <a 
                  href="tel:+919650254164" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-black rounded-xl hover:bg-orange-50 transition-all uppercase text-xs tracking-widest"
                >
                  Call Now
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
