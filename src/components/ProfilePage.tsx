import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  User as UserIcon, Mail, Phone, MapPin, Loader2, Save, 
  Package, Clock, CheckCircle2, ShoppingBag, ArrowRight,
  Sparkles, Key, RefreshCw, HelpCircle, ChevronRight, CheckCircle, AlertTriangle
} from 'lucide-react';
import { menuItems } from '../constants/menu';

interface FirestoreOrder {
  id: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
  }[];
  subtotal: number;
  totalAmount: number;
  address: string;
  location: string;
  paymentMethod: string;
  status: 'Placed' | 'Processing' | 'On the way' | 'Delivered' | 'Pending' | 'Approved' | 'Archived';
  createdAt: string;
  orderDate?: string;
  orderTime?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pastOrders, setPastOrders] = useState<FirestoreOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit Mode
  const [isEditing, setIsEditing] = useState(false);

  // Password reset feedback states
  const [passwordResetFeedback, setPasswordResetFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  // AI Food Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResults, setAiResults] = useState<any[]>([]);

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    location: ''
  });

  const ordersUnsubscribeRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Redirect Admin away from regular customer Profile to their isolated Admin Dashboard
        const savedRole = localStorage.getItem('userRole');
        if (savedRole === 'admin') {
          window.location.href = '/admin-dashboard';
          return;
        }

        setUser(currentUser);
        await fetchUserProfile(currentUser);
        fetchUserOrders(currentUser.uid);
      } else {
        // If not logged in, boot back to main website
        setUser(null);
        window.location.href = '/';
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (ordersUnsubscribeRef.current) {
        ordersUnsubscribeRef.current();
      }
    };
  }, []);

  const fetchUserProfile = async (currentUser: FirebaseUser) => {
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileData({
          name: data.name || currentUser.displayName || '',
          phone: data.phone || data.number || '',
          whatsapp: data.whatsapp || data.phone || data.number || '',
          address: data.address || '',
          location: data.location || ''
        });
      } else {
        // Default initialized profile doc if not present
        setProfileData({
          name: currentUser.displayName || '',
          phone: '',
          whatsapp: '',
          address: '',
          location: ''
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const fetchUserOrders = (userId: string) => {
    setLoadingOrders(true);
    if (ordersUnsubscribeRef.current) {
      ordersUnsubscribeRef.current();
    }

    try {
      const q = query(collection(db, 'orders'), where('userId', '==', userId));
      const unsub = onSnapshot(q, (snapshot) => {
        const list: FirestoreOrder[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            items: data.items || [],
            subtotal: data.subtotal || 0,
            totalAmount: data.totalAmount || 0,
            address: data.address || '',
            location: data.location || '',
            paymentMethod: data.paymentMethod || 'COD',
            status: data.status || 'Pending',
            createdAt: data.createdAt || ''
          });
        });
        // Sort newest first
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setPastOrders(list);
        setLoadingOrders(false);
      }, (err) => {
        console.error('Real-time query error for user orders:', err);
        setLoadingOrders(false);
      });

      ordersUnsubscribeRef.current = unsub;
    } catch (err) {
      console.error('Error fetching past orders:', err);
      setLoadingOrders(false);
    }
  };

  // Levenshtein helper for spelling mistake solver in food search
  const getLevenshteinDistance = (a: string, b: string): number => {
    const tmp: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      tmp[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      tmp[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  };

  const handleAiSearch = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setAiResults([]);
      return;
    }
    const queryLower = val.toLowerCase().trim();

    // Direct match search
    const matches = menuItems.filter(item => 
      item.name.toLowerCase().includes(queryLower) ||
      item.description.toLowerCase().includes(queryLower) ||
      item.category.toLowerCase().includes(queryLower)
    );

    // If few literal matches, run Levenshtein typo-fixing search
    if (matches.length < 3) {
      const fuzzyMatches = menuItems.map(item => {
        const itemWords = item.name.toLowerCase().split(/\s+/);
        const queryWords = queryLower.split(/\s+/);
        
        let score = 0;
        queryWords.forEach(qw => {
          let minWordDist = 999;
          itemWords.forEach(iw => {
            const dist = getLevenshteinDistance(qw, iw);
            if (dist < minWordDist) minWordDist = dist;
          });
          score += minWordDist;
        });
        
        return { item, score };
      })
      .filter(x => x.score < 4) // reasonable matches limit
      .sort((a, b) => a.score - b.score)
      .map(x => x.item);

      const seen = new Set(matches.map(m => m.id));
      fuzzyMatches.forEach(fm => {
        if (!seen.has(fm.id)) {
          matches.push(fm);
          seen.add(fm.id);
        }
      });
    }

    setAiResults(matches.slice(0, 4));
  };

  const handlePasswordResetRequest = async () => {
    if (!user || !user.email) return;
    setSendingReset(true);
    setPasswordResetFeedback(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPasswordResetFeedback({
        type: 'success',
        text: 'Password reset email sent! Please check your Inbox and Junk/Spam folder.'
      });
    } catch (err: any) {
      console.error(err);
      setPasswordResetFeedback({
        type: 'error',
        text: err.message || 'Failed to send reset email. Please try again later.'
      });
    } finally {
      setSendingReset(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        uid: user.uid,
        name: profileData.name,
        email: user.email,
        phone: profileData.phone,
        number: profileData.phone,
        whatsapp: profileData.whatsapp,
        address: profileData.address,
        location: profileData.location,
        role: 'customer',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating user profile:', err);
      alert('Failed to save profile. Please check your network connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-50">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        <p className="text-stone-850 font-extrabold mt-4 animate-pulse">Syncing Profile Details...</p>
      </div>
    );
  }

  if (!user) return null;

  // Function to map category string directly to its proper target ordering page
  const getCategoryUrl = (category: string) => {
    const c = category.toLowerCase().trim();
    if (c.includes('mithilanchal')) return '/order/mithilanchal.html';
    if (c.includes('special-thali') || c.includes('special thali')) return '/order/special-thali.html';
    if (c.includes('combo')) return '/order/combo.html';
    if (c.includes('veg')) return '/order/veg.html';
    if (c.includes('starter')) return '/order/starters.html';
    if (c.includes('mutton')) return '/order/mutton.html';
    if (c.includes('chicken')) return '/order/chicken.html';
    if (c.includes('egg')) return '/order/egg.html';
    if (c.includes('fish')) return '/order/fish.html';
    if (c.includes('thali')) return '/order/thali.html';
    if (c.includes('rice')) return '/order/rice.html';
    if (c.includes('roti')) return '/order/roti.html';
    if (c.includes('sweet')) return '/order/sweets.html';
    return '/order.html';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top Banner Greetings card with corporate logo in left side of namaste */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-64 h-64 bg-red-100/30 rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
          <div className="flex items-center gap-5">
            {/* Logo in left side of Namaste */}
            <div className="w-16 h-16 shrink-0 bg-white rounded-full p-1 border-2 border-red-200 shadow-md flex items-center justify-center overflow-hidden">
              <img 
                src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
                alt="Mithila Catering Brand Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-red-600 font-sans flex items-center gap-2">
                Namaste, {profileData.name || 'Mithila Guest'}!
              </h2>
              <p className="text-red-500 text-xs md:text-sm mt-1 font-bold">
                Manage your catering delivery address, change password, and browse past orders.
              </p>
            </div>
          </div>
          <div className="bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-xs font-mono text-red-600 font-bold self-start md:self-center">
            UID: <span className="text-red-700 font-black">{user.uid.substring(0, 10)}...</span>
          </div>
        </div>

      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Editing Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-rose-950 flex items-center gap-2">
                  <UserIcon size={18} className="text-orange-600" />
                  <span>Account Profile</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">Keep your delivery contact verified.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg border transition-all ${
                  isEditing 
                  ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                  : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
                }`}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Details'}
              </button>
            </div>

            <form onSubmit={async (e) => {
              await handleSaveProfile(e);
              setIsEditing(false);
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={!isEditing}
                  value={profileData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className={`w-full px-4 py-3 text-xs rounded-xl border transition-all font-bold ${
                    isEditing 
                    ? 'border-orange-300 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 text-stone-800' 
                    : 'border-stone-100 bg-stone-100/45 text-stone-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Email Address (Primary)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-stone-100 bg-stone-100/60 text-stone-400 font-bold outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input
                    type="tel"
                    name="phone"
                    required
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 9876543210"
                    className={`w-full pl-10 pr-4 py-3 text-xs rounded-xl border transition-all font-bold ${
                      isEditing 
                      ? 'border-orange-300 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 text-stone-800' 
                      : 'border-stone-100 bg-stone-100/45 text-stone-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-405" size={14} />
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    disabled={!isEditing}
                    value={profileData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="WhatsApp contact"
                    className={`w-full pl-10 pr-4 py-3 text-xs rounded-xl border transition-all font-bold ${
                      isEditing 
                      ? 'border-orange-300 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 text-stone-800' 
                      : 'border-stone-100 bg-stone-100/45 text-stone-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Locality region (City)</label>
                <select
                  name="location"
                  required
                  disabled={!isEditing}
                  value={profileData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 text-xs rounded-xl border transition-all font-bold ${
                    isEditing 
                    ? 'border-orange-300 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 text-stone-800 cursor-pointer' 
                    : 'border-stone-100 bg-stone-100/45 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <option value="">Select Region</option>
                  <option value="DELHI">DELHI</option>
                  <option value="NOIDA">NOIDA</option>
                  <option value="FARIDABAD">FARIDABAD</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Doorstep Address</label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  disabled={!isEditing}
                  value={profileData.address}
                  onChange={handleInputChange}
                  placeholder="Complete door/flat number, block details..."
                  className={`w-full px-4 py-3 text-xs rounded-xl border transition-all font-semibold resize-none leading-relaxed ${
                    isEditing 
                    ? 'border-orange-300 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 text-stone-800' 
                    : 'border-stone-100 bg-stone-100/45 text-stone-500 cursor-not-allowed'
                  }`}
                />
              </div>

              {isEditing && (
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/10 active:scale-[0.98]"
                >
                  {saving ? (
                    <>Saving Profile... <Loader2 className="animate-spin" size={14} /></>
                  ) : (
                    <>Update Profile Details <Save size={14} /></>
                  )}
                </button>
              )}

              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-50 text-green-700 border border-green-150 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> Profile details saved securely!
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Secure Security & Forgot Password card widget */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl space-y-4 font-sans"
          >
            <div className="flex items-center gap-2">
              <Key className="text-orange-400 shrink-0" size={18} />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Account Password & Security</h4>
                <p className="text-[10px] text-stone-400 font-semibold">Change or recover password instantly.</p>
              </div>
            </div>

            <button
              onClick={handlePasswordResetRequest}
              disabled={sendingReset}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white border border-white/15 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {sendingReset ? (
                <>Sending Verification Mail... <Loader2 size={12} className="animate-spin" /></>
              ) : (
                <>Change/Forgot Password <RefreshCw size={12} /></>
              )}
            </button>

            {passwordResetFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-xl border text-[10px] font-bold ${
                  passwordResetFeedback.type === 'success' 
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800' 
                  : 'bg-red-950/50 text-red-300 border-red-800'
                }`}
              >
                <p className="leading-relaxed">{passwordResetFeedback.text}</p>
                {passwordResetFeedback.type === 'success' && (
                  <div className="mt-3">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-black uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      ✉️ Open Gmail Automatically
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Past Orders History Column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-rose-955 flex items-center gap-2">
                  <Package size={18} className="text-orange-600" />
                  <span>Catering Orders History</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">Real-time status of your food deliveries.</p>
              </div>
              <span className="text-[10px] bg-stone-150 px-2 py-1 font-bold text-stone-600 rounded">
                Total Placed: {pastOrders.length}
              </span>
            </div>

            {loadingOrders ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-3" />
                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Syncing ledger records...</p>
              </div>
            ) : pastOrders.length === 0 ? (
              <div className="text-center py-16 border rounded-2xl border-stone-100 bg-stone-50/50">
                <ShoppingBag className="mx-auto text-stone-300 mb-2" size={36} />
                <p className="text-stone-500 text-sm font-bold">No orders placed under this account.</p>
                <p className="text-stone-400 text-xs mt-1">Order your first delicious package today!</p>
                <a 
                  href="/order.html" 
                  className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
                >
                  Explore Catering Menu <ArrowRight size={14} />
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map((order) => {
                  const currentMappedStatus = order.status === 'Pending' ? 'Placed' : order.status === 'Approved' ? 'Processing' : order.status;
                  return (
                    <div 
                      key={order.id}
                      className="border border-stone-200/60 rounded-2xl p-5 hover:bg-neutral-50/30 transition-all duration-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3.5 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono uppercase text-stone-500">Order #{order.id.slice(-6)}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase ${
                              currentMappedStatus === 'Placed' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              currentMappedStatus === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              currentMappedStatus === 'On the way' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              currentMappedStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {currentMappedStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            <span>Pay Type: {order.paymentMethod}</span>
                            <span>•</span>
                            <span className="font-mono">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-stone-400 block uppercase">Total Amount</span>
                          <span className="text-lg font-black text-orange-600">₹{order.totalAmount}</span>
                        </div>
                      </div>

                      {/* Ordered Items loop */}
                      <div className="bg-stone-50/60 rounded-xl p-3 border border-stone-100/50 space-y-1.5 mb-3">
                        {order.items.map((item, id) => (
                          <div key={id} className="flex justify-between items-center text-xs text-stone-600 font-semibold">
                            <span>{item.quantity}x {item.name} {item.size && item.size !== 'single' ? `(${item.size})` : ''}</span>
                            <span className="font-bold text-stone-800">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3.5">
                        <p className="text-[10px] text-stone-500 font-semibold">
                          <Clock size={11} className="inline mr-1 text-stone-400" />
                          Delivery Site: <strong className="text-stone-700 font-bold">{order.address}, {order.location}</strong>
                        </p>

                        {/* Dynamic Stepper Progress Visual Line */}
                        <div className="bg-stone-50/50 rounded-xl p-4 border border-stone-150 relative">
                          <div className="absolute top-[26px] left-[12.5%] right-[12.5%] h-1 bg-stone-200 rounded-full z-0">
                            <div 
                              className="h-full bg-orange-600 rounded-full transition-all duration-500"
                              style={{
                                width: 
                                  currentMappedStatus === 'Placed' ? '0%' :
                                  currentMappedStatus === 'Processing' ? '33.33%' :
                                  currentMappedStatus === 'On the way' ? '66.66%' :
                                  '100%'
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-4 gap-1 relative z-10">
                            {['Placed', 'Processing', 'On the way', 'Delivered'].map((stepName, stepIdx) => {
                              const steps = ['Placed', 'Processing', 'On the way', 'Delivered'];
                              const activeIndex = steps.indexOf(currentMappedStatus);
                              const isFinished = stepIdx < activeIndex;
                              const isCurrent = stepIdx === activeIndex;

                              return (
                                <div key={stepIdx} className="flex flex-col items-center">
                                  <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center font-black text-[9px] transition-all border ${
                                    isCurrent ? 'bg-orange-600 border-orange-600 text-white scale-110 shadow-sm shadow-orange-500/20' :
                                    isFinished ? 'bg-green-600 border-green-600 text-white' :
                                    'bg-white border-stone-250 text-stone-400'
                                  }`}>
                                    {isFinished ? '✓' : stepIdx + 1}
                                  </div>
                                  <span className={`text-[8px] font-black mt-1.5 uppercase tracking-wide text-center block ${
                                    isCurrent ? 'text-orange-600 font-black' :
                                    isFinished ? 'text-green-600' :
                                    'text-stone-400'
                                  }`}>
                                    {stepName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
