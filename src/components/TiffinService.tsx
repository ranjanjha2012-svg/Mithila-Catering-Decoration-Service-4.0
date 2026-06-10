import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, CreditCard, Smartphone, Globe, ArrowRight, X, Loader2, RefreshCw, Search, Calendar, MapPin } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

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
    price: 2500,
    description: '4 Roti + Rice + Sabji + Dal + Salad + Sweet/Raita. Choose up to 3 meals. (Veg starting from ₹2500/mo)',
    logo: 'https://i.ibb.co/Z6fr2j20/images.jpg',
    color: 'bg-green-600',
  },
  {
    id: 'egg',
    name: 'Egg Tiffin',
    price: 2600,
    description: '4 Roti + Rice + Egg Curry/Bhurji/Role + Dal + Salad. Choose up to 3 meals. (Egg starting from ₹2600/mo)',
    logo: 'https://i.ibb.co/CK3GVkh5/egg.jpg',
    color: 'bg-yellow-600',
  },
  {
    id: 'nonveg',
    name: 'Non-Veg',
    price: 2700,
    description: '4 Roti + Rice + Special Chicken/Fish/Mutton + Dal + Salad. Choose up to 3 meals. (Non-Veg starting from ₹2700/mo)',
    logo: 'https://i.ibb.co/TDcBbnpk/pawan-tiffin-service-sultanpur-majra-delhi-ccor92cbjx.avif',
    color: 'bg-red-600',
  },
  {
    id: 'daily_trial',
    name: 'Daily Tiffin Trial',
    price: 1,
    description: 'Hot single meal trial of our premium pure homestyle cooking served hot. Just ₹1 limit one meal.',
    logo: 'https://i.ibb.co/Lzr2gnd9/tiffin-delivery.jpg',
    color: 'bg-purple-600',
  }
];

export const getTiffinPrice = (planId: string, selectedTimings: string[]): number => {
  if (planId === 'daily_trial') {
    return 1;
  }
  const count = selectedTimings.length;
  if (count === 0) return 0;

  const isVeg = planId === 'veg';
  const hasBreakfast = selectedTimings.includes('Breakfast');
  const hasLunch = selectedTimings.includes('Lunch');
  const hasDinner = selectedTimings.includes('Dinner');

  if (isVeg) {
    if (count === 1) {
      if (hasBreakfast) return 2500;
      return 2700; // Lunch or Dinner Only
    }
    if (count === 2) {
      if (hasLunch && hasDinner) return 5100;
      return 4400; // Breakfast + Lunch / Breakfast + Dinner
    }
    if (count === 3) {
      return 6500;
    }
    return 2500 * count;
  } else if (planId === 'nonveg') {
    if (count === 1) {
      if (hasBreakfast) return 2700;
      return 3100; // Lunch or Dinner Only
    }
    if (count === 2) {
      if (hasLunch && hasDinner) return 5600;
      return 5000;
    }
    if (count === 3) {
      return 7500;
    }
    return 2700 * count;
  } else {
    // Egg Tiffin
    if (count === 1) {
      if (hasBreakfast) return 2600;
      return 2900;
    }
    if (count === 2) {
      if (hasLunch && hasDinner) return 5300;
      return 4700;
    }
    if (count === 3) {
      return 6900;
    }
    return 2600 * count;
  }
};

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
  const [emailInput, setEmailInput] = useState('');
  const [preferenceInput, setPreferenceInput] = useState('Veg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tiffin Tracking system states
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackerRefId, setTrackerRefId] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackerError, setTrackerError] = useState('');
  const [trackerResult, setTrackerResult] = useState<any | null>(null);

  // Captcha Generator logic
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    if (!captchaCode) {
      generateCaptcha();
    }
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      setFullName(auth.currentUser.displayName || '');
      setEmailInput(auth.currentUser.email || '');
    }
  }, [auth.currentUser, showBooking]);

  const subtotal = getTiffinPrice(selectedPlan?.id || '', selectedTimings);
  const discountRate = 0;
  const discountAmount = 0;
  const totalAmount = subtotal;

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
        customerEmail: emailInput || auth.currentUser.email || '',
        userName: fullName,
        userPhone: phone,
        address: deliveryAddress,
        location: location,
        preference: preferenceInput,
        items: [
          {
            id: selectedPlan?.id || 'veg',
            name: `${selectedPlan?.name} Tiffin Subscription`,
            price: totalAmount,
            quantity: 1,
            size: selectedTimings.join('+'),
            total: totalAmount,
            preference: preferenceInput
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
        orderType: 'tiffin',
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
          email: emailInput || auth.currentUser?.email || "info@mithilacatering.com"
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
        email: emailInput || auth.currentUser?.email || "info@mithilacatering.com",
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

  const handleTrackerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackerError('');
    setTrackerResult(null);

    const inputCode = captchaInput.toUpperCase().trim();
    if (inputCode !== captchaCode) {
      setTrackerError("CAPTCHA verification failed. Please type exactly the character code matching visual indicator.");
      generateCaptcha();
      return;
    }

    const trimmedRefId = trackerRefId.trim();
    if (!trimmedRefId) {
      setTrackerError("Please enter a valid Reference ID.");
      return;
    }

    setIsTracking(true);
    try {
      // Try direct ID lookup first
      const directRef = doc(db, 'tiffinCustomers', trimmedRefId);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        setTrackerResult({ id: directSnap.id, ...directSnap.data() });
        setIsTracking(false);
        return;
      }

      // Try referenceId field query second
      const q = query(
        collection(db, 'tiffinCustomers'),
        where('referenceId', '==', trimmedRefId)
      );
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0];
        setTrackerResult({ id: firstDoc.id, ...firstDoc.data() });
      } else {
        setTrackerError(`No active Tiffin Service found for reference ID "${trimmedRefId}". Keep in mind IDs are formatted as MTS-TF-XXXXXX.`);
        generateCaptcha();
      }
    } catch (err: any) {
      console.error("Error tracking subscriber:", err);
      setTrackerError("Failed to fetch tracking details: " + err.message);
      generateCaptcha();
    } finally {
      setIsTracking(false);
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

        {/* Already having Tiffin Service Track It Button */}
        <div className="flex flex-col items-center justify-center mb-10">
          <button
            onClick={() => {
              setShowTrackerModal(true);
              generateCaptcha();
              setTrackerResult(null);
              setTrackerRefId('');
              setCaptchaInput('');
              setTrackerError('');
            }}
            className="px-6 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-stone-950 font-black uppercase text-xs tracking-wider rounded-2xl transition-all cursor-pointer shadow-md select-none flex items-center gap-2"
          >
            Already having Tiffin Service? Track It
          </button>
        </div>

        {/* 1. PLANS VIEW */}
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
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{plan.name} Plan</h3>
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

          {false && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-6 sm:p-8 space-y-6 text-stone-900 border border-stone-200 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/5 rounded-full -mr-12 -mt-12 pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-100 pb-5 text-left">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#C2185B] tracking-widest block mb-1 font-sans">Mithila Customer Panel (Read Only)</span>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans">{trackerResult.name}</h3>
                    <p className="text-xs text-stone-400 font-bold font-mono mt-0.5">ID: {trackerResult.referenceId}</p>
                  </div>
                  <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-full border ${
                    trackerResult.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : trackerResult.status === 'Paused'
                      ? 'bg-amber-50 text-amber-800 border-amber-150'
                      : 'bg-rose-50 text-[#C2185B] border-rose-150'
                  }`}>
                    {trackerResult.status} Status
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-sans text-xs">
                  <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl text-[11px] sm:text-xs space-y-2 text-stone-600 leading-relaxed font-semibold">
                    <p className="font-sans">☎ <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Primary Mobile:</strong> {trackerResult.phone}</p>
                    {trackerResult.email && <p className="truncate font-sans">✉ <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Email Address:</strong> {trackerResult.email}</p>}
                    <p className="font-sans">📍 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Delivery Address:</strong> {trackerResult.address}</p>
                    <p className="font-sans">🥬 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Plan Preference:</strong> {trackerResult.preference === 'Veg' ? 'Vegetarian Meals (Pure Veg)' : 'Non-Vegetarian Meals (Fish & Curry styled)'}</p>
                  </div>

                  <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl text-[11px] sm:text-xs space-y-2 text-stone-600 leading-relaxed font-semibold font-sans">
                    <p className="font-sans">📅 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Registered Date:</strong> {trackerResult.createdAt ? new Date(trackerResult.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p className="font-sans">💰 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Monthly subscription:</strong> ₹{trackerResult.monthlyPrice}</p>
                    <p className="text-stone-900 font-sans font-sans">⚖ <strong className="uppercase text-[9px] tracking-wider font-extrabold text-stone-900 font-sans">Remaining Balance:</strong> <strong className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150">{trackerResult.balanceAmount}</strong></p>
                    {trackerResult.activatedAt && (
                      <p className="font-sans">✨ <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Activation Time:</strong> {new Date(trackerResult.activatedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Stepper tracking progress timeline */}
                <div className="border-t border-stone-100 pt-6 space-y-5 text-left font-sans">
                  <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider font-sans">Operational Tracking Stepper (Live status)</h4>
                  
                  <div className="relative pl-6 space-y-6 border-l-2 border-stone-200">
                    {/* STEP 1 */}
                    <div className="relative font-sans">
                      <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                        <Check size={10} className="font-black" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Client Registration Logged</h5>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">Reference credentials and profile registered in database.</p>
                      </div>
                    </div>

                    {/* STEP 2 */}
                    <div className="relative">
                      {trackerResult.status !== 'Registered' ? (
                        <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                          <Check size={10} className="font-black" />
                        </div>
                      ) : (
                        <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                      )}
                      <div>
                        <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Service Activation Status</h5>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">
                          {trackerResult.status !== 'Registered' 
                            ? 'Subscription verified and service scheduled/operational.' 
                            : 'Awaiting administrator activation process.'}
                        </p>
                      </div>
                    </div>

                    {/* STEP 3 */}
                    <div className="relative">
                      {['Preparing', 'Out For Delivery', 'Delivered'].includes(trackerResult.todayDeliveryStatus) && trackerResult.status === 'Active' ? (
                        <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                          <Check size={10} className="font-black" />
                        </div>
                      ) : trackerResult.todayDeliveryStatus === 'Not Started' && trackerResult.status === 'Active' ? (
                        <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                      ) : (
                        <div className="absolute -left-[31px] top-0.5 bg-gray-200 text-white rounded-full h-5 w-5 border-4 border-white shadow-sm ml-0.5" />
                      )}
                      <div>
                        <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Daily Meal Kitchen Prep</h5>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans font-sans">Chef packaging of hot pure home-cooked recipes styled to your details.</p>
                      </div>
                    </div>

                    {/* STEP 4 */}
                    <div className="relative font-sans">
                      {['Out For Delivery', 'Delivered'].includes(trackerResult.todayDeliveryStatus) && trackerResult.status === 'Active' ? (
                        <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                          <Check size={10} className="font-black" />
                        </div>
                      ) : trackerResult.todayDeliveryStatus === 'Preparing' && trackerResult.status === 'Active' ? (
                        <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                      ) : (
                        <div className="absolute -left-[31px] top-0.5 bg-gray-200 text-white rounded-full h-5 w-5 border-4 border-white shadow-sm ml-0.5" />
                      )}
                      <div>
                        <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Out For Daily Delivery Flow</h5>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">Tiffin carrier dispatched to destination doorstep.</p>
                      </div>
                    </div>

                    {/* STEP 5 */}
                    <div className="relative font-sans">
                      {trackerResult.todayDeliveryStatus === 'Delivered' && trackerResult.status === 'Active' ? (
                        <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                          <Check size={10} className="font-black" />
                        </div>
                      ) : trackerResult.todayDeliveryStatus === 'Out For Delivery' && trackerResult.status === 'Active' ? (
                        <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                      ) : (
                        <div className="absolute -left-[31px] top-0.5 bg-gray-200 text-white rounded-full h-5 w-5 border-4 border-white shadow-sm ml-0.5" />
                      )}
                      <div>
                        <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Doorstep Service Complete</h5>
                        <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">Nutritious hot food handed over successfully.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 font-sans">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!trackerResult.referenceId) return;
                      setIsTracking(true);
                      try {
                        const directRef = doc(db, 'tiffinCustomers', trackerResult.referenceId);
                        const snap = await getDoc(directRef);
                        if (snap.exists()) {
                          setTrackerResult({ id: snap.id, ...snap.data() });
                        } else {
                          // Try query fallback
                          const q = query(
                            collection(db, 'tiffinCustomers'),
                            where('referenceId', '==', trackerResult.referenceId)
                          );
                          const querySnap = await getDocs(q);
                          if (!querySnap.empty) {
                            setTrackerResult({ id: querySnap.docs[0].id, ...querySnap.docs[0].data() });
                          }
                        }
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setIsTracking(false);
                      }
                    }}
                    disabled={isTracking}
                    className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 select-none h-11 cursor-pointer font-sans"
                  >
                    <RefreshCw size={12} className={isTracking ? "animate-spin" : ""} /> Refresh Live Status
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrackerResult(null);
                      setTrackerRefId('');
                      setCaptchaInput('');
                      generateCaptcha();
                    }}
                    className="w-1/2 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition select-none h-11 cursor-pointer font-sans"
                  >
                    Track another number
                  </button>
                </div>
              </motion.div>
            </>
          )}

        <AnimatePresence>
          {showTrackerModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative border border-stone-200 shadow-2xl text-stone-900"
              >
                <button 
                  onClick={() => {
                    setShowTrackerModal(false);
                    setTrackerResult(null);
                    setTrackerRefId('');
                    setCaptchaInput('');
                    setTrackerError('');
                  }}
                  className="absolute top-6 right-6 p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors text-stone-500 hover:text-stone-700 cursor-pointer"
                >
                  <X size={20} />
                </button>

                {!trackerResult ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-black text-[#C2185B] uppercase mb-1 font-sans">Mithila Live Tiffin Tracker</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase font-sans">Enter Reference ID below to see status</p>
                    </div>

                    <form onSubmit={handleTrackerSubmit} className="space-y-4">
                      <div className="space-y-1 flex flex-col text-left">
                        <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider font-sans">Reference Key *</label>
                        <input
                          type="text"
                          required
                          value={trackerRefId}
                          onChange={(e) => setTrackerRefId(e.target.value)}
                          placeholder="e.g. MTS-TF-839274"
                          className="w-full px-4 py-3 bg-white border border-stone-200 hover:border-stone-300 rounded-xl outline-none text-xs font-bold text-black placeholder-stone-400"
                        />
                      </div>

                      <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-end">
                        <div className="space-y-1 flex flex-col text-left flex-1">
                          <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider font-sans">Human Security CAPTCHA *</label>
                          <input
                            type="text"
                            required
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            placeholder="Verify visually..."
                            className="w-full px-4 py-3 bg-white border border-stone-200 hover:border-stone-300 rounded-xl outline-none text-xs font-bold text-black placeholder-stone-450 font-mono uppercase"
                          />
                        </div>

                        <div className="flex flex-col text-left font-sans">
                          <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider sm:mb-1">CAPTCHA Indicator</label>
                          <div className="flex items-center gap-1.5">
                            <div className="select-none font-mono text-lg font-black tracking-widest text-[#C2185B] bg-amber-50 py-2 px-5 rounded-xl border border-amber-200 italic shadow-inner relative overflow-hidden flex items-center justify-center min-w-[125px] h-11">
                              {captchaCode}
                            </div>
                            <button
                              type="button"
                              onClick={generateCaptcha}
                              className="p-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition text-stone-600 hover:text-[#C2185B] cursor-pointer"
                              title="Refresh visual Captcha code"
                            >
                              <RefreshCw size={15} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {trackerError && (
                        <div className="p-3.5 bg-red-55 border border-red-200 rounded-xl text-[10px] sm:text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-2 leading-relaxed">
                          <span>{trackerError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isTracking}
                        className="w-full mt-2 py-4 bg-[#C2185B] hover:bg-[#a0134b] text-white font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md select-none flex items-center justify-center gap-2 font-sans"
                      >
                        {isTracking ? (
                          <>Searching Customer File... <Loader2 size={14} className="animate-spin" /></>
                        ) : (
                          <>Verify & Track Tiffin <Search size={14} /></>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-100 pb-5 text-left">
                      <div>
                        <span className="text-[10px] font-black uppercase text-[#C2185B] tracking-widest block mb-1 font-sans">Mithila Customer Panel (Read Only)</span>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans">{trackerResult.name}</h3>
                        <p className="text-xs text-stone-400 font-bold font-mono mt-0.5">ID: {trackerResult.referenceId}</p>
                      </div>
                      <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-full border ${
                        trackerResult.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : trackerResult.status === 'Paused'
                          ? 'bg-amber-50 text-amber-800 border-amber-150'
                          : 'bg-rose-50 text-[#C2185B] border-rose-150'
                      }`}>
                        {trackerResult.status} Status
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left font-sans text-xs">
                      <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl text-[11px] sm:text-xs space-y-2 text-stone-600 leading-relaxed font-semibold">
                        <p className="font-sans">☎ <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Primary Mobile:</strong> {trackerResult.phone}</p>
                        {trackerResult.email && <p className="truncate font-sans font-semibold">✉ <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Email Address:</strong> {trackerResult.email}</p>}
                        <p className="font-sans">📍 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Delivery Address:</strong> {trackerResult.address}</p>
                        <p className="font-sans font-semibold">🥬 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Plan Preference:</strong> {trackerResult.preference === 'Veg' ? 'Vegetarian Meals (Pure Veg)' : 'Non-Vegetarian Meals (Fish & Curry styled)'}</p>
                      </div>

                      <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl text-[11px] sm:text-xs space-y-2 text-stone-600 leading-relaxed font-semibold font-sans">
                        <p className="font-sans">📅 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Registered Date:</strong> {trackerResult.createdAt ? new Date(trackerResult.createdAt).toLocaleDateString() : 'N/A'}</p>
                        <p className="font-sans font-semibold">💎 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Plan Name:</strong> {trackerResult.planName || (trackerResult.preference === 'Veg' ? 'Pure Veg Tiffin Plan' : 'Non-Veg Tiffin Plan')}</p>
                        <p className="font-sans">💰 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Amount Paid:</strong> ₹{trackerResult.monthlyPrice}</p>
                        <p className="text-stone-900 font-sans font-semibold">⚖ <strong className="uppercase text-[9px] tracking-wider font-extrabold text-stone-900 font-sans">Remaining Balance:</strong> <strong className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150 font-bold">{trackerResult.balanceAmount}</strong></p>
                        {trackerResult.activatedAt ? (
                          <p className="font-sans font-semibold">✨ <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Activation Date:</strong> {new Date(trackerResult.activatedAt).toLocaleDateString()}</p>
                        ) : (
                          trackerResult.createdAt && <p className="font-sans font-semibold">✨ <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans font-sans">Activation Date:</strong> {new Date(trackerResult.createdAt).toLocaleDateString()}</p>
                        )}
                        <p className="font-sans font-semibold">🕒 <strong className="text-stone-900 uppercase text-[9px] tracking-wider font-extrabold font-sans">Last Updated Date:</strong> {trackerResult.activatedAt ? new Date(trackerResult.activatedAt).toLocaleDateString() : trackerResult.createdAt ? new Date(trackerResult.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    {/* Stepper tracking progress timeline */}
                    <div className="border-t border-stone-100 pt-6 space-y-5 text-left font-sans">
                      <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider font-sans">Operational Tracking Stepper (Live status)</h4>
                      
                      <div className="relative pl-6 space-y-6 border-l-2 border-stone-200">
                        {/* STEP 1 */}
                        <div className="relative font-sans">
                          <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                            <Check size={10} className="font-black" />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Client Registration Logged</h5>
                            <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">Reference credentials and profile registered in database.</p>
                          </div>
                        </div>

                        {/* STEP 2 */}
                        <div className="relative">
                          {trackerResult.status !== 'Registered' ? (
                            <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                              <Check size={10} className="font-black" />
                            </div>
                          ) : (
                            <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                          )}
                          <div>
                            <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Service Activation Status</h5>
                            <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">
                              {trackerResult.status !== 'Registered' 
                                ? 'Subscription verified and service scheduled/operational.' 
                                : 'Awaiting administrator activation process.'}
                            </p>
                          </div>
                        </div>

                        {/* STEP 3 */}
                        <div className="relative">
                          {['Preparing', 'Out For Delivery', 'Delivered'].includes(trackerResult.todayDeliveryStatus) && trackerResult.status === 'Active' ? (
                            <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                              <Check size={10} className="font-black" />
                            </div>
                          ) : trackerResult.todayDeliveryStatus === 'Not Started' && trackerResult.status === 'Active' ? (
                            <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                          ) : (
                            <div className="absolute -left-[31px] top-0.5 bg-gray-200 text-white rounded-full h-5 w-5 border-4 border-white shadow-sm ml-0.5" />
                          )}
                          <div>
                            <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Daily Meal Kitchen Prep</h5>
                            <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">Chef packaging of hot pure home-cooked recipes styled to your details.</p>
                          </div>
                        </div>

                        {/* STEP 4 */}
                        <div className="relative font-sans">
                          {['Out For Delivery', 'Delivered'].includes(trackerResult.todayDeliveryStatus) && trackerResult.status === 'Active' ? (
                            <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                              <Check size={10} className="font-black" />
                            </div>
                          ) : trackerResult.todayDeliveryStatus === 'Preparing' && trackerResult.status === 'Active' ? (
                            <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                          ) : (
                            <div className="absolute -left-[31px] top-0.5 bg-gray-200 text-white rounded-full h-5 w-5 border-4 border-white shadow-sm ml-0.5" />
                          )}
                          <div>
                            <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Out For Daily Delivery Flow</h5>
                            <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">Tiffin carrier dispatched to destination doorstep.</p>
                          </div>
                        </div>

                        {/* STEP 5 */}
                        <div className="relative font-sans">
                          {trackerResult.todayDeliveryStatus === 'Delivered' && trackerResult.status === 'Active' ? (
                            <div className="absolute -left-[31px] top-0.5 bg-emerald-500 text-white rounded-full p-1 border-4 border-white shadow-md">
                              <Check size={10} className="font-black" />
                            </div>
                          ) : trackerResult.todayDeliveryStatus === 'Out For Delivery' && trackerResult.status === 'Active' ? (
                            <div className="absolute -left-[31px] top-0.5 bg-amber-500 text-white rounded-full h-5 w-5 border-4 border-white shadow-md animate-pulse ml-0.5" />
                          ) : (
                            <div className="absolute -left-[31px] top-0.5 bg-gray-200 text-white rounded-full h-5 w-5 border-4 border-white shadow-sm ml-0.5" />
                          )}
                          <div>
                            <h5 className="text-xs font-black text-gray-950 uppercase tracking-wide font-sans">Doorstep Service Complete</h5>
                            <p className="text-[10px] text-stone-400 font-bold mt-0.5 font-sans">Nutritious hot food handed over successfully.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 font-sans">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!trackerResult.referenceId) return;
                          setIsTracking(true);
                          try {
                            const directRef = doc(db, 'tiffinCustomers', trackerResult.referenceId);
                            const snap = await getDoc(directRef);
                            if (snap.exists()) {
                              setTrackerResult({ id: snap.id, ...snap.data() });
                            } else {
                              const q = query(
                                collection(db, 'tiffinCustomers'),
                                where('referenceId', '==', trackerResult.referenceId)
                              );
                              const querySnap = await getDocs(q);
                              if (!querySnap.empty) {
                                setTrackerResult({ id: querySnap.docs[0].id, ...querySnap.docs[0].data() });
                              }
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsTracking(false);
                          }
                        }}
                        disabled={isTracking}
                        className="w-1/2 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 select-none h-11 cursor-pointer font-sans"
                      >
                        <RefreshCw size={12} className={isTracking ? "animate-spin" : ""} /> Refresh Live Status
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTrackerResult(null);
                          setTrackerRefId('');
                          setCaptchaInput('');
                          generateCaptcha();
                        }}
                        className="w-1/2 py-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition select-none h-11 cursor-pointer font-sans"
                      >
                        Track another number
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    <div className="space-y-4 border-t border-stone-250 pt-6">
                      <div className="text-center">
                        <h3 className="text-lg font-black text-black">Delivery Information</h3>
                        <p className="text-xs text-stone-605">Provide contact and address matching your location</p>
                      </div>
                      <div className="space-y-4 text-left">
                        <div>
                          <label className="text-xs font-bold text-[#000000] block mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none text-[#000000] placeholder-[#555555] font-semibold bg-white"
                          />
                          {!fullName && (
                            <span className="text-[11px] text-[#000000] font-extrabold mt-1 block">
                              ⚠️ Full name is required to activate and book.
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#000000] block mb-1">Phone Number (10-Digit Mobile)</label>
                          <input
                            type="tel"
                            required
                            placeholder="Enter 10-digit mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none text-[#000000] placeholder-[#555555] font-semibold bg-white"
                          />
                          {(!phone || phone.length !== 10) && (
                            <span className="text-[11px] text-[#000000] font-extrabold mt-1 block">
                              ⚠️ Please enter your exact 10-digit Indian active mobile number.
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#000000] block mb-1">Email Address (For receipts & copy id)</label>
                          <input
                            type="email"
                            required
                            placeholder="Enter your email address"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none text-[#000000] placeholder-[#555555] font-semibold bg-white"
                          />
                          {!emailInput && (
                            <span className="text-[11px] text-[#000000] font-extrabold mt-1 block">
                              ⚠️ Valid email address is requested.
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#000000] block mb-1">Precise Delivery Address</label>
                          <textarea
                            required
                            rows={2}
                            placeholder="Apartment/House No, Floor, Block, Area, Landmark, etc."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none resize-none text-[#000000] placeholder-[#555555] font-semibold bg-white"
                          />
                          {!deliveryAddress && (
                            <span className="text-[11px] text-[#000000] font-extrabold mt-1 block">
                              ⚠️ Full street address details are requested.
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#000000] block mb-1">Food Preference</label>
                          <select
                            value={preferenceInput}
                            onChange={(e) => setPreferenceInput(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none text-[#000000] font-extrabold bg-white cursor-pointer"
                          >
                            <option value="Veg" className="text-[#000000] font-bold">Vegetarian Plan (Pure Veg)</option>
                            <option value="Non-Veg" className="text-[#000000] font-bold">Non-Vegetarian Plan (Fish & Curry)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#000000] block mb-1">Plan Selection</label>
                          <select
                            value={selectedPlan?.id || ''}
                            onChange={(e) => {
                              const selected = plans.find(p => p.id === e.target.value);
                              if (selected) setSelectedPlan(selected);
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-green-500 outline-none text-[#000000] font-extrabold bg-white cursor-pointer"
                          >
                            {plans.map(p => (
                              <option key={p.id} value={p.id} className="text-[#000000] font-bold">
                                {p.name} (pricing starts at ₹{p.price})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={!location || selectedTimings.length === 0 || !fullName || !phone || phone.length !== 10 || !deliveryAddress || !emailInput}
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
