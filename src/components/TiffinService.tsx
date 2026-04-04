import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, CreditCard, Smartphone, Globe, ArrowRight, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface TiffinPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  logo: string;
  color: string;
}

const plans: TiffinPlan[] = [
  {
    id: 'veg',
    name: 'Pure Veg',
    price: 2700,
    description: '4 Roti + Rice + Sabji + Dal + Salad + Sweet/Raita (Weekdays)',
    logo: 'https://cdn-icons-png.flaticon.com/512/706/706164.png',
    color: 'bg-green-600',
  },
  {
    id: 'egg',
    name: 'Egg Tiffin',
    price: 2900,
    description: 'Menu as per you (Egg based dishes included)',
    logo: 'https://cdn-icons-png.flaticon.com/512/2913/2913990.png',
    color: 'bg-yellow-600',
  },
  {
    id: 'nonveg',
    name: 'Non-Veg',
    price: 3100,
    description: 'Menu as per you (Chicken/Mutton based dishes included)',
    logo: 'https://cdn-icons-png.flaticon.com/512/1046/1046769.png',
    color: 'bg-red-600',
  },
];

const locations = ['Delhi', 'Faridabad', 'Noida'];
const timings = ['Breakfast', 'Lunch', 'Dinner'];

export default function TiffinService() {
  const [selectedPlan, setSelectedPlan] = useState<TiffinPlan | null>(null);
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState('');
  const [selectedTimings, setSelectedTimings] = useState<string[]>([]);
  const [showBooking, setShowBooking] = useState(false);

  const getDiscountRate = () => {
    const count = selectedTimings.length;
    if (count === 1) return 0.02;
    if (count === 2) return 0.06;
    if (count === 3) return 0.10;
    return 0;
  };

  const subtotal = (selectedPlan?.price || 0) * selectedTimings.length;
  const discountRate = getDiscountRate();
  const discountAmount = Math.round(subtotal * discountRate);
  const totalAmount = subtotal - discountAmount;

  const handleTimingToggle = (timing: string) => {
    if (selectedTimings.includes(timing)) {
      setSelectedTimings(selectedTimings.filter(t => t !== timing));
    } else {
      if (selectedTimings.length < 3) {
        setSelectedTimings([...selectedTimings, timing]);
      }
    }
  };

  const upiId = "9650254164@kotak";
  const upiLink = `upi://pay?pa=${upiId}&pn=Mithila%20Catering&am=${totalAmount}&cu=INR`;

  return (
    <div className="min-h-screen bg-[#064e3b] pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 relative">
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-0 top-0 hidden md:flex items-center gap-2 text-green-100/60 hover:text-white font-bold transition-colors group"
          >
            <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </motion.a>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-4"
          >
            Mithila Tiffin Service
          </motion.h1>
          <p className="text-green-100/80 max-w-2xl mx-auto">
            Authentic home-style meals delivered to your doorstep. Healthy, hygienic, and delicious.
          </p>

          <motion.a
            href="/"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 md:hidden inline-flex items-center gap-2 text-white font-bold"
          >
            <ArrowRight size={18} className="rotate-180" />
            Back to Home
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 flex flex-col"
            >
              <div className={`${plan.color} p-8 flex justify-center`}>
                <img src={plan.logo} alt={plan.name} className="h-24 w-24 object-contain brightness-0 invert" />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6 flex-1">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-green-700">₹{plan.price}</span>
                  <span className="text-gray-400 text-sm ml-2">/ month</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowBooking(true);
                    setStep(1);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-black rounded-2xl shadow-lg hover:shadow-yellow-200 transition-all uppercase tracking-widest"
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {showBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative"
              >
                <button 
                  onClick={() => setShowBooking(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>

                {step === 1 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Select Your Location</h2>
                      <p className="text-gray-500">Where should we deliver your meals?</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {locations.map(loc => (
                        <button
                          key={loc}
                          onClick={() => setLocation(loc)}
                          className={`py-4 rounded-2xl font-bold transition-all border-2 ${
                            location === loc 
                              ? 'bg-green-600 text-white border-green-600 shadow-lg' 
                              : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-green-200'
                          }`}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Select Timing</h2>
                      <p className="text-gray-500">Choose up to 3 meals per day</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {timings.map(t => (
                        <button
                          key={t}
                          onClick={() => handleTimingToggle(t)}
                          className={`py-4 rounded-2xl font-bold transition-all border-2 ${
                            selectedTimings.includes(t)
                              ? 'bg-green-600 text-white border-green-600 shadow-lg' 
                              : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-green-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <button
                      disabled={!location || selectedTimings.length === 0}
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      Continue to Payment <ArrowRight size={20} />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Order Summary</h2>
                      <div className="bg-gray-50 rounded-2xl p-6 mt-6 space-y-3 text-left">
                        <div className="flex justify-between text-gray-600">
                          <span>Plan:</span>
                          <span className="font-bold text-gray-900">{selectedPlan?.name}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Location:</span>
                          <span className="font-bold text-gray-900">{location}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Plan Price:</span>
                          <span className="font-bold text-gray-900">₹{selectedPlan?.price} / month</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal:</span>
                          <span className="font-bold text-gray-900">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-bold">
                          <span>Discount ({Math.round(discountRate * 100)}%):</span>
                          <span>- ₹{discountAmount}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-xl font-black text-gray-900 mt-2">
                            <span>Total Payable:</span>
                            <span>₹{totalAmount}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      <div className="p-4 bg-white rounded-2xl shadow-xl border border-gray-100">
                        <QRCodeSVG value={upiLink} size={200} />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-gray-900">Scan for Payment</p>
                        <p className="text-sm text-gray-500">Link to: {upiId}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest">Pay with UPI Apps</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <a 
                          href={upiLink}
                          className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-8 w-16 object-contain" />
                          <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">Google Pay</span>
                        </a>
                        <a 
                          href={upiLink}
                          className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-sky-500 hover:bg-sky-50 transition-all group"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo.svg" alt="Paytm" className="h-8 w-16 object-contain" />
                          <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">Paytm</span>
                        </a>
                        <a 
                          href={upiLink}
                          className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-purple-500 hover:bg-purple-50 transition-all group"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-8 w-16 object-contain" />
                          <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">PhonePe</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Other Payment Options</p>
                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-600">
                          <CreditCard size={16} className="text-orange-500" /> Credit/Debit Card
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs font-bold text-gray-600">
                          <Globe size={16} className="text-green-500" /> Net Banking
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-start gap-3">
                      <Info size={20} className="text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-800">
                        Please <strong>share a screenshot</strong> of your payment at WhatsApp <strong>+91 9650254164</strong> to confirm your booking.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 uppercase mb-2">AI Order Summary</p>
                      <p className="text-sm text-blue-900 italic">
                        "User from {location} has selected the {selectedPlan?.name} plan for {selectedTimings.join(' and ')}. Total amount payable is ₹{totalAmount} after discount."
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
