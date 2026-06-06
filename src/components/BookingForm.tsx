import React, { useState } from 'react';
import { Check, Sparkles, Send, User, MapPin, Home, Package, Users, Utensils, Phone, Mail, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import AIPlanner from './AIPlanner';

export default function BookingForm() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [guestOption, setGuestOption] = useState('');
  const [customGuests, setCustomGuests] = useState('');
  
  // Controlled form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  
  // Submission Status
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    setErrorMessage('');

    const calculatedGuests = guestOption === 'Other' ? customGuests : guestOption;
    const submissionData = {
      name,
      phone,
      email,
      venue,
      address,
      selectedServices: selectedServices.join(', '),
      guests: calculatedGuests,
      foodPreference,
      submittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch('https://formspree.io/f/mojzjonw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        setStatus('SUCCESS');
        // Clear all states
        setName('');
        setPhone('');
        setEmail('');
        setVenue('');
        setAddress('');
        setSelectedServices([]);
        setGuestOption('');
        setCustomGuests('');
        setFoodPreference('');
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit booking request. Please try again.');
      }
    } catch (err: any) {
      console.error('Contact Formspree Error: ', err);
      setStatus('ERROR');
      setErrorMessage(err.message || 'Something went wrong while connecting with Formspree. Please try again.');
    }
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
          {/* Header section on Contact page */}
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 text-orange-200 text-xs font-black uppercase tracking-widest rounded-full border border-white/10 mb-4 animate-pulse">
              <ShieldCheck size={14} className="text-orange-400" /> Professional Event Services
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Get In Touch With Us
            </h1>
            <p className="text-orange-100/60 max-w-2xl mx-auto font-medium text-xs md:text-sm mt-3">
              Fill up our enquiry form, view our direct contact channels, or consult our automated AI planner model to design a comprehensive event blueprint.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            
            {/* Left Side: Booking / Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col justify-between"
            >
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tighter flex items-center gap-3">
                    <Sparkles className="text-orange-400" /> Book Your Event
                  </h2>
                  <p className="text-orange-200/80 font-semibold italic text-xs md:text-sm">
                    {getWish()}
                  </p>
                </div>

                {/* Success Banner */}
                {status === 'SUCCESS' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-5 bg-green-500/25 border-2 border-green-400/40 rounded-2xl flex items-start gap-3.5 text-white"
                  >
                    <CheckCircle2 size={24} className="text-green-300 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider text-green-100">Enquiry Submitted Successfully!</p>
                      <p className="text-xs text-green-200/90 mt-1 font-semibold">Your details have been securely dispatched to our catering directors (via Formspree). We will review the custom items and connect with you shortly.</p>
                    </div>
                  </motion.div>
                )}

                {/* Error Banner */}
                {status === 'ERROR' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-5 bg-red-650/25 border-2 border-red-500/40 rounded-2xl flex items-start gap-3.5 text-white"
                  >
                    <AlertCircle size={24} className="text-red-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider text-red-100">Submission Error</p>
                      <p className="text-xs text-red-200/95 mt-1 font-semibold">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} /> Full Name
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder="Event Venue Name"
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
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
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
                        name="guests_range" 
                        required
                        value={guestOption}
                        onChange={(e) => setGuestOption(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white font-bold appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-stone-900 text-white">Select Quantity</option>
                        <option value="50-100" className="bg-stone-900 text-white">50 - 100</option>
                        <option value="100-250" className="bg-stone-900 text-white">100 - 250</option>
                        <option value="250-500" className="bg-stone-900 text-white">250 - 500</option>
                        <option value="500-1000" className="bg-stone-900 text-white">500 - 1000</option>
                        <option value="1000+" className="bg-stone-900 text-white">1000+</option>
                        <option value="Other" className="bg-stone-900 text-white">Other (Custom)</option>
                      </select>
                      {guestOption === 'Other' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3"
                        >
                          <input 
                            type="number" 
                            name="guests_custom" 
                            required 
                            value={customGuests}
                            onChange={(e) => setCustomGuests(e.target.value)}
                            placeholder="Enter specific number"
                            className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/5 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/40 font-bold"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                        <Utensils size={14} /> Food Preference
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Veg Only', 'Non-Veg & Veg'].map((pref) => (
                          <label 
                            key={pref}
                            className={`flex flex-1 items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${
                              foodPreference === pref 
                                ? 'bg-orange-600 border-orange-400 text-white' 
                                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <input 
                              type="radio" 
                              name="food_pref" 
                              value={pref} 
                              required 
                              checked={foodPreference === pref}
                              onChange={() => setFoodPreference(pref)}
                              className="accent-white cursor-pointer" 
                            />
                            <span className="text-xs font-bold">{pref}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={status === 'SUBMITTING'}
                    className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/40 flex items-center justify-center gap-3 uppercase tracking-widest group disabled:opacity-50"
                  >
                    {status === 'SUBMITTING' ? 'Sending Request...' : 'Confirm Booking'} 
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Right Side: Professional Contact Information Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-2 border-orange-100 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-100">
                    Get In Touch
                  </span>
                  <h3 className="text-2xl md:text-3xl font-black text-stone-900 uppercase tracking-tighter mt-3 mb-1">
                    Catering Headquarters
                  </h3>
                  <p className="text-stone-500 font-medium italic text-xs md:text-sm">
                    We are ready to make your celebration a grand culinary and decorative success.
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-6 space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Office Address</h4>
                      <p className="text-stone-850 font-black text-sm sm:text-base mt-0.5">Delhi, India</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <a 
                    href="tel:+919650254164" 
                    className="flex items-start gap-4 p-2.5 -m-2.5 rounded-[1.5rem] hover:bg-orange-50/50 transition-colors group"
                  >
                    <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Phone Number</h4>
                      <p className="text-orange-600 font-black text-sm sm:text-base mt-0.5 group-hover:underline">
                        +91 9650254164
                      </p>
                    </div>
                  </a>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 shrink-0">
                      <Mail size={20} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest leading-none">Email Accounts</h4>
                      <a 
                        href="mailto:ranjanjha@mithilacatering.com" 
                        className="block text-red-800 font-black text-xs sm:text-sm hover:underline"
                      >
                        ranjanjha@mithilacatering.com
                      </a>
                      <a 
                        href="mailto:mithilacateringservices@gmail.com" 
                        className="block text-stone-700 hover:text-orange-600 font-bold text-xs sm:text-sm hover:underline"
                      >
                        mithilacateringservices@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* WhatsApp Info */}
                  <a 
                    href="https://wa.me/919650254164" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-2.5 -m-2.5 rounded-[1.5rem] hover:bg-orange-50/50 transition-colors group"
                  >
                    <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl border border-green-100 group-hover:bg-green-600 group-hover:text-white transition-colors shrink-0">
                      <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 448 512">
                        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 19.3 70.1 29.5 108.1 29.5h.1c122.3 0 222-99.6 222-222 0-59.3-23.1-115.1-65-157.1zM223.9 446.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.7-68.2-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm101.1-138.8c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.5-8.6-44.8-27.6-16.6-14.8-27.8-33.1-31.1-38.6-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.5 8.3-9.8 2.8-3.2 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.8-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest text-[#25D366]">WhatsApp Connection</h4>
                      <p className="text-stone-850 font-black text-sm sm:text-base mt-0.5 group-hover:underline">
                        +91 9650254164
                      </p>
                    </div>
                  </a>

                  {/* Business Hours */}
                  <div className="flex items-start gap-4">
                    <div className="p-3.5 bg-orange-50 text-orange-600 rounded-2xl border border-orange-100 shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-400 uppercase tracking-widest">Business Hours</h4>
                      <p className="text-stone-850 font-black text-sm mt-0.5">07:00 AM to 10:30 PM (All Days)</p>
                      <p className="text-[10px] font-black text-orange-600 uppercase">Open 7 days a week</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat on WhatsApp Button */}
              <div className="mt-8 border-t border-stone-100 pt-6">
                <a 
                  href="https://wa.me/919650254164" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white font-black py-4 px-6 rounded-2xl hover:bg-[#128C7E] transition-all shadow-lg flex items-center justify-center gap-2.5 uppercase tracking-wider text-xs group cursor-pointer"
                >
                  <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 19.3 70.1 29.5 108.1 29.5h.1c122.3 0 222-99.6 222-222 0-59.3-23.1-115.1-65-157.1zM223.9 446.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.7-68.2-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54.1 130.5 0 101.7-82.8 184.5-184.6 184.5zm101.1-138.8c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.6-2.8-23.5-8.6-44.8-27.6-16.6-14.8-27.8-33.1-31.1-38.6-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.5 8.3-9.8 2.8-3.2 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.8-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </motion.div>

          </div>

          {/* Bottom Row: Full Width AI Planner Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-stone-900 to-orange-950 p-8 md:p-12 rounded-[2.5rem] border border-orange-900/30 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="max-w-3xl mb-8 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-900/40 text-orange-400 text-xs font-black uppercase tracking-widest rounded-full border border-orange-500/20 mb-3">
                <Sparkles size={13} /> Deep Intelligent Planning
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-3">
                AI Event Planner &amp; Assistant
              </h3>
              <p className="text-orange-200/60 text-xs md:text-sm font-semibold leading-relaxed">
                Not sure about how much food to order, decoration patterns, or budget breakdown? Chat with our smart AI Event Assistant below to generate a comprehensive, instant proposal tailored for your big day.
              </p>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl h-[550px] relative z-10">
              <AIPlanner isCompact={false} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
