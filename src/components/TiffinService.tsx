import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, CreditCard, Smartphone, Globe, ArrowRight, X, Loader2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

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
    price: 1,
    description: '4 Roti + Rice + Sabji + Dal + Salad + Sweet/Raita (Weekdays)',
    logo: 'https://i.ibb.co/Z6fr2j20/images.jpg',
    color: 'bg-green-600',
  },
  {
    id: 'egg',
    name: 'Egg Tiffin',
    price: 2900,
    description: 'Menu as per you (Egg based dishes included)',
    logo: 'https://i.ibb.co/CK3GVkh5/egg.jpg',
    color: 'bg-yellow-600',
  },
  {
    id: 'nonveg',
    name: 'Non-Veg',
    price: 3100,
    description: 'Menu as per you (Chicken/Mutton based dishes included)',
    logo: 'https://i.ibb.co/TDcBbnpk/pawan-tiffin-service-sultanpur-majra-delhi-ccor92cbjx.avif',
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

  // Delivery details form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      setFullName(auth.currentUser.displayName || '');
    }
  }, [auth.currentUser, showBooking]);

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

  const handlePayUPayment = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: auth.currentUser.uid,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: auth.currentUser.email || '',
        userName: fullName,
        userPhone: phone,
        address: deliveryAddress,
        location: location,
        items: [
          {
            id: selectedPlan?.id || 'veg',
            name: `${selectedPlan?.name} Tiffin Subscription`,
            price: selectedPlan?.price || 0,
            quantity: selectedTimings.length,
            size: selectedTimings.join('+'),
            total: totalAmount
          }
        ],
        subtotal: subtotal,
        packingCharge: 0,
        deliveryCharge: 0,
        totalAmount: totalAmount,
        status: 'Pending Payment',
        paymentMethod: 'ONLINE',
        orderDate: new Date().toISOString().split('T')[0],
        orderTime: new Date().toTimeString().split(' ')[0],
        createdAt: new Date().toISOString(),
        isTiffinOrder: true,
        statusHistory: [
          { status: 'Pending Payment', timestamp: new Date().toISOString() }
        ]
      };

      const docRef = await addDoc(collection(db, 'orders'), orderPayload);
      const newOrderId = docRef.id;

      const configRes = await fetch('/api/payu/config');
      const configData = await configRes.json();
      const payuKey = configData.payuKey;

      const hashRes = await fetch('/api/payu/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnid: newOrderId,
          amount: totalAmount.toFixed(2),
          productinfo: `${selectedPlan?.name} Tiffin Subscription`,
          firstname: fullName,
          email: auth.currentUser?.email || "info@mithilacatering.com"
        })
      });

      const hashData = await hashRes.json();
      if (hashData.error) {
        throw new Error(hashData.error);
      }
      const secureHash = hashData.hash;

      const actionUrl = 'https://secure.payu.in/_payment';
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = actionUrl;

      const surl = `${window.location.origin}/api/payu/success`;
      const furl = `${window.location.origin}/api/payu/failure`;

      const payload: Record<string, string> = {
        key: payuKey,
        txnid: newOrderId,
        amount: totalAmount.toFixed(2),
        productinfo: `${selectedPlan?.name} Tiffin Subscription`,
        firstname: fullName,
        email: auth.currentUser?.email || "info@mithilacatering.com",
        phone: phone,
        surl: surl,
        furl: furl,
        hash: secureHash,
        service_provider: "payu_paisa"
      };

      Object.entries(payload).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error("Failed to initiate Tiffin payment:", err);
      alert(err.message || "Something went wrong during payment initialization. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#064e3b] pt-32 pb-20">
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
              <div className="h-56 overflow-hidden relative">
                <img src={plan.logo} alt={plan.name} className="w-full h-full object-cover transition-transform duration-500" />
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
                    if (!auth.currentUser) {
                      window.dispatchEvent(new CustomEvent('open-mithila-auth'));
                      return;
                    }
                    setSelectedPlan(plan);
                    setShowBooking(true);
                    setStep(1);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-black rounded-2xl shadow-lg hover:shadow-yellow-200 transition-all uppercase tracking-widest cursor-pointer"
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
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Select Your Location</h2>
                      <p className="text-gray-500 text-xs">Where should we deliver your meals?</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {locations.map(loc => (
                        <button
                          key={loc}
                          onClick={() => setLocation(loc)}
                          className={`py-3 rounded-2xl font-bold transition-all border-2 text-sm ${
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
                      <p className="text-gray-500 text-xs">Choose up to 3 meals per day</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {timings.map(t => (
                        <button
                          key={t}
                          onClick={() => handleTimingToggle(t)}
                          className={`py-3 rounded-2xl font-bold transition-all border-2 text-sm ${
                            selectedTimings.includes(t)
                              ? 'bg-green-600 text-white border-green-600 shadow-lg' 
                              : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-green-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Delivery Form fields inside Step 1 */}
                    <div className="space-y-4 border-t border-gray-100 pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-black text-gray-900">Delivery Information</h3>
                        <p className="text-xs text-gray-500">Provide contact and address matching your location</p>
                      </div>
                      <div className="space-y-3 text-left">
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="Enter 10-digit mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-700 block mb-1">Precise Delivery Address</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Apartment/House No, Floor, Block, Area, Landmark, etc."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-green-500 outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!location || selectedTimings.length === 0 || !fullName || !phone || !deliveryAddress}
                      onClick={() => setStep(2)}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Continue to Order Summary <ArrowRight size={20} />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-2xl font-black text-gray-900 mb-1">Subscription Order Summary</h2>
                      <p className="text-xs text-gray-500">Confirm details before online payment</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 space-y-3.5 text-left text-sm border border-gray-100">
                      <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/60">
                        <span>Subscription Plan:</span>
                        <strong className="text-gray-900">{selectedPlan?.name} Plan</strong>
                      </div>
                      <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/60">
                        <span>Deliver Location:</span>
                        <strong className="text-gray-900">{location}</strong>
                      </div>
                      <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/60">
                        <span>Timings selected:</span>
                        <strong className="text-gray-900">{selectedTimings.join(', ')}</strong>
                      </div>
                      <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/60 font-sans">
                        <span>Recipient:</span>
                        <strong className="text-gray-900">{fullName} ({phone})</strong>
                      </div>
                      <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/60 font-sans">
                        <span>Address:</span>
                        <strong className="text-gray-900 text-right max-w-[280px] truncate block" title={deliveryAddress}>{deliveryAddress}</strong>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <strong className="text-gray-950">₹{subtotal}</strong>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600 font-bold">
                          <span>Multi-meal Discount ({Math.round(discountRate * 100)}%):</span>
                          <span>- ₹{discountAmount}</span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-xl font-black text-gray-900 mt-1">
                          <span>Total Amount:</span>
                          <span className="text-green-700">₹{totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                      <Info size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-900 leading-normal">
                        <strong>Instant Automated Activation:</strong>
                        <p className="mt-0.5 font-semibold">Your monthly tiffin plan starts immediately on payment validation. Check My Orders for tracker progress updates in real-time.</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handlePayUPayment}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={20} className="animate-spin" />
                            Redirecting to PayU Secure Checkout...
                          </>
                        ) : (
                          <>
                            <CreditCard size={20} />
                            Pay Online (PayU)
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setStep(1)}
                        disabled={isSubmitting}
                        className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-800 font-black uppercase tracking-wider transition-colors"
                      >
                        ← Change Selections / Details
                      </button>
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
