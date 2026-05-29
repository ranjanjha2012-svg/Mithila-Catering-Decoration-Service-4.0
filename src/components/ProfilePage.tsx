import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  User as UserIcon, Mail, Phone, MapPin, Loader2, Save, 
  Package, Clock, CheckCircle2, ShoppingBag, ArrowRight
} from 'lucide-react';

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
  status: 'Pending' | 'Approved' | 'Delivered' | 'Archived';
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

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    address: '',
    location: ''
  });

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
        await fetchUserOrders(currentUser.uid);
      } else {
        // If not logged in, boot back to main website
        setUser(null);
        window.location.href = '/';
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

  const fetchUserOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const list: FirestoreOrder[] = [];
      ordersSnap.forEach((doc) => {
        const data = doc.data();
        if (data.userId === userId) {
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
        }
      });
      // Sort newest first
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setPastOrders(list);
    } catch (err) {
      console.error('Error fetching past orders:', err);
    } finally {
      setLoadingOrders(false);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Top Banner Greetings card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-850 rounded-[2rem] p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
                Namaste, {profileData.name || 'Mithila Guest'}!
              </h2>
              <p className="text-orange-100 text-xs md:text-sm mt-1 font-semibold">
                Manage your catering delivery address and browse past purchases.
              </p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-mono">
            ID: <span className="text-orange-200">{user.uid.substring(0, 10)}...</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Editing Form Column */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl border border-stone-200/60 p-6 shadow-sm space-y-6"
          >
            <div>
              <h3 className="text-lg font-black text-rose-950 flex items-center gap-2">
                <UserIcon size={18} className="text-orange-600" />
                <span>Account Profile</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">Keep your delivery contact verified.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={profileData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold text-stone-800"
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
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={profileData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="WhatsApp contact"
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold text-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Locality region (City)</label>
                <select
                  name="location"
                  required
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold text-stone-800 cursor-pointer"
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
                  value={profileData.address}
                  onChange={handleInputChange}
                  placeholder="Complete door/flat number, block details..."
                  className="w-full px-4 py-3 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-1 focus:ring-orange-500 outline-none font-semibold text-stone-800 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/10 active:scale-[0.98]"
              >
                {saving ? (
                  <>Saving Profile... <Loader2 className="animate-spin" size={14} /></>
                ) : (
                  <>Update Profile <Save size={14} /></>
                )}
              </button>

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
                <h3 className="text-lg font-black text-rose-950 flex items-center gap-2">
                  <Package size={18} className="text-orange-600" />
                  <span>Past Orders History</span>
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
                {pastOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="border border-stone-200/60 rounded-2xl p-5 hover:bg-neutral-50/30 transition-all duration-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-3.5 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono uppercase text-stone-500">Order #{order.id.slice(-6)}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-black border uppercase ${
                            order.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            order.status === 'Delivered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            order.status === 'Archived' ? 'bg-stone-50 text-stone-400 border-stone-200' :
                            'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                          }`}>
                            {order.status}
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

                    <p className="text-[10px] text-stone-500 font-semibold">
                      <Clock size={11} className="inline mr-1 text-stone-400" />
                      Shipped doorstep to: <strong className="text-stone-700 font-bold">{order.address}, {order.location}</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
