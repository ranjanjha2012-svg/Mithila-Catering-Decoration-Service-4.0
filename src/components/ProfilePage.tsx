import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, addDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  User as UserIcon, Mail, Phone, MapPin, Loader2, Save, 
  Package, Clock, CheckCircle2, ShoppingBag, ArrowRight,
  Briefcase, Sparkles, Send, FileText, X, AlertCircle
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
  status: 'Placed' | 'Processing' | 'On the way' | 'Delivered' | 'Pending' | 'Approved' | 'Archived';
  createdAt: string;
  orderDate?: string;
  orderTime?: string;
}

interface JobPost {
  id: string;
  title: string;
  description: string;
  department: string;
  salary: string;
  location: string;
  requirements: string[];
  createdBy: string;
  createdAt: any;
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  experience: string;
  coverLetter: string;
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Declined';
  createdAt: any;
}

export default function ProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pastOrders, setPastOrders] = useState<FirestoreOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // History Column Toggles
  const [activeHistoryTab, setActiveHistoryTab] = useState<'orders' | 'careers'>('orders');

  // Careers States
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Application Form State
  const [appFormData, setAppFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '1 Year',
    coverLetter: ''
  });

  const staticJobs: Omit<JobPost, 'id' | 'createdBy' | 'createdAt'>[] = [
    {
      title: 'Kitchen Executive Chef',
      department: 'Culinaries & Kitchens',
      salary: '₹35,000 - ₹50,000 / month',
      location: 'Delhi & NCR Operations',
      description: 'Lead chef team in crafting premium traditional Mithilanchal cuisines, rich multi-course veg/non-veg platters for high-scale weddings and events.',
      requirements: [
        '5+ years experience in institutional or banqueting food services.',
        'Expertise in traditional Bihar, Mithila, and major North Indian specialities.',
        'High understanding of food hygiene, kitchen sanitization, and timing logistics.'
      ]
    },
    {
      title: 'Front Desk Hospitality Team Member',
      department: 'Hospitality & Services',
      salary: '₹18,000 - ₹25,000 / month',
      location: 'Delhi NCR Sites',
      description: 'Host guests, guide menu displays, coordinate buffet service desks, and deliver pristine traditional warmth to esteemed clients.',
      requirements: [
        'Strong communication skills, hospitable, polite, and energetic personality.',
        'Punctual and ready to handle fast-paced service workflows.',
        'Experience in high-end banquets or catering halls is preferred.'
      ]
    },
    {
      title: 'Supply Chain Coordinator',
      department: 'Logistics',
      salary: '₹20,000 - ₹30,000 / month',
      location: 'Sultanpur Storage Hub',
      description: 'Track fresh ingredient orders, manage inventory, coordinate delivery vehicles, and guarantee prompt site arrivals.',
      requirements: [
        'Familiarity with route coordination, local supply hubs in Delhi/NCR.',
        'Excellent organizational habits and intermediate tech usage skills.',
        'Immediate joiners with similar warehousing background are highly preferred.'
      ]
    }
  ];

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
        fetchJobs();
        fetchUserApplications(currentUser.uid);
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

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const q = collection(db, 'jobs');
      const querySnapshot = await getDocs(q);
      const jobsList: JobPost[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        jobsList.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          department: data.department || '',
          salary: data.salary || '',
          location: data.location || '',
          requirements: data.requirements || [],
          createdBy: data.createdBy || '',
          createdAt: data.createdAt
        });
      });
      setJobs(jobsList);
    } catch (err) {
      console.error("Error fetching jobs in profile:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchUserApplications = async (userId: string) => {
    setLoadingApps(true);
    try {
      const q = query(
        collection(db, 'applications'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const appsList: Application[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        appsList.push({
          id: doc.id,
          jobId: data.jobId || '',
          jobTitle: data.jobTitle || '',
          userId: data.userId || '',
          applicantName: data.applicantName || '',
          applicantEmail: data.applicantEmail || '',
          applicantPhone: data.applicantPhone || '',
          experience: data.experience || '',
          coverLetter: data.coverLetter || '',
          status: data.status || 'Pending',
          createdAt: data.createdAt
        });
      });
      setUserApplications(appsList);
    } catch (err) {
      console.error("Error fetching applications in profile:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApplyClick = (job: JobPost) => {
    setSelectedJob(job);
    setMessage(null);
    if (user) {
      setAppFormData({
        name: profileData.name || user.displayName || '',
        email: user.email || '',
        phone: profileData.phone || '',
        experience: '1 Year',
        coverLetter: ''
      });
    }
  };

  const handleAppFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJob) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const newApp = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        userId: user.uid,
        applicantName: appFormData.name,
        applicantEmail: appFormData.email,
        applicantPhone: appFormData.phone,
        experience: appFormData.experience,
        coverLetter: appFormData.coverLetter,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'applications'), newApp);
      setMessage({ type: 'success', text: 'Application submitted successfully! Our HR team will contact you shortly.' });
      
      // Refresh applications list
      fetchUserApplications(user.uid);

      setTimeout(() => {
        setSelectedJob(null);
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Submission error in profile:", error);
      setMessage({ type: 'error', text: 'Failed to submit application. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
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
        className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-16 -translate-y-16 w-64 h-64 bg-red-100/30 rounded-full pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-200/50 rounded-2xl flex items-center justify-center text-red-600 text-3xl font-black shadow-lg">
              {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-red-600 font-sans">
                Namaste, {profileData.name || 'Mithila Guest'}!
              </h2>
              <p className="text-red-500 text-xs md:text-sm mt-1 font-bold">
                Manage your catering delivery address and browse past purchases.
              </p>
            </div>
          </div>
          <div className="bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-xs font-mono text-red-600 font-bold">
            ID: <span className="text-red-700 font-black">{user.uid.substring(0, 10)}...</span>
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
            {/* Tab selection bar */}
            <div className="flex border-b border-stone-100 mb-6 gap-6 font-sans">
              <button
                onClick={() => setActiveHistoryTab('orders')}
                className={`pb-3 text-xs font-black transition-all border-b-2 uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
                  activeHistoryTab === 'orders'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                <Package size={15} />
                <span>Catering Orders History</span>
              </button>
              <button
                onClick={() => setActiveHistoryTab('careers')}
                className={`pb-3 text-xs font-black transition-all border-b-2 uppercase tracking-wider flex items-center gap-2 cursor-pointer ${
                  activeHistoryTab === 'careers'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-stone-400 hover:text-stone-600'
                }`}
              >
                <Briefcase size={15} />
                <span>Product Schemes & Careers</span>
              </button>
            </div>

            {activeHistoryTab === 'orders' ? (
              <>
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
              </>
            ) : (
              /* Products & Career Opportunities Transferred Here */
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-black text-rose-950 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="text-orange-600 w-4 h-4" /> Heritage Job Openings
                      </h4>
                      <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Explore job opportunities and schemes</p>
                    </div>
                  </div>

                  {loadingJobs ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-3" />
                      <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">Syncing opportunities list...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Dynamic database jobs */}
                      {jobs.map((job) => (
                        <div key={job.id} className="bg-stone-50 rounded-2xl p-5 border border-stone-150 hover:border-orange-200 transition-colors">
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div>
                              <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider bg-orange-100/50 px-2 py-0.5 rounded-md">{job.department}</span>
                              <h5 className="font-extrabold text-stone-850 text-sm mt-1">{job.title}</h5>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{job.description}</p>
                            </div>
                            <button
                              onClick={() => handleApplyClick(job)}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                          <div className="flex gap-4 mt-3 text-[10px] font-bold text-stone-400">
                            <span>📍 {job.location}</span>
                            <span>💵 {job.salary}</span>
                          </div>
                        </div>
                      ))}

                      {/* Static predefined job lists */}
                      {staticJobs.map((job, idx) => (
                        <div key={`static-${idx}`} className="bg-stone-50 rounded-2xl p-5 border border-stone-150 hover:border-orange-200 transition-colors">
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div>
                              <span className="text-[10px] font-black uppercase text-stone-400 bg-stone-150 px-2 py-0.5 rounded-md tracking-wider">{job.department}</span>
                              <h5 className="font-extrabold text-stone-850 text-sm mt-1">{job.title}</h5>
                              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{job.description}</p>
                            </div>
                            <button
                              onClick={() => handleApplyClick({
                                id: `static-${idx}`,
                                title: job.title,
                                description: job.description,
                                department: job.department,
                                salary: job.salary,
                                location: job.location,
                                requirements: job.requirements,
                                createdBy: 'admin',
                                createdAt: null
                              })}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                          <div className="flex gap-3 mt-3 text-[10px] font-bold text-stone-400">
                            <span>📍 {job.location}</span>
                            <span>💵 {job.salary}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submissions list representing dynamic applied record */}
                <div className="border-t border-stone-100 pt-6">
                  <h4 className="text-sm font-black text-rose-955 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Sparkles className="text-orange-600 w-4 h-4" /> My Career Applications
                  </h4>
                  {loadingApps ? (
                    <div className="py-6 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
                    </div>
                  ) : userApplications.length === 0 ? (
                    <div className="text-center py-8 text-xs font-bold text-stone-400 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                      You have not submitted any applications yet. Select a role above to apply!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userApplications.map((app) => (
                        <div key={app.id} className="border border-stone-150 p-4 rounded-xl flex justify-between items-center bg-white shadow-sm">
                          <div>
                            <h5 className="font-extrabold text-stone-800 text-xs">{app.jobTitle}</h5>
                            <p className="text-[9px] text-stone-400 font-bold mt-1 uppercase">Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}</p>
                          </div>
                          <span className={`text-[9px] px-2.5 py-1 font-black rounded-lg uppercase border ${
                            app.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            app.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            app.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Application Form Drawer / Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl z-10 border border-orange-100"
            >
              <button 
                onClick={() => setSelectedJob(null)}
                className="absolute top-6 right-6 p-2 hover:bg-neutral-50 rounded-full transition-colors"
                type="button"
              >
                <X size={20} className="text-stone-400" />
              </button>

              <div className="mb-8 font-sans">
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Submit Application</span>
                <h3 className="text-2xl md:text-3xl font-black text-rose-950 mt-0.5">{selectedJob.title}</h3>
                <p className="text-stone-400 text-xs font-semibold mt-1">Join Mithila Catering Hospitality Crew</p>
              </div>

              {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-start gap-2 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'bg-red-50 text-red-700 border-l-4 border-red-500'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleAppFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={appFormData.name}
                      onChange={(e) => setAppFormData({...appFormData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-xs font-bold text-neutral-800"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={appFormData.email}
                      onChange={(e) => setAppFormData({...appFormData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-xs font-bold text-neutral-800"
                      placeholder="Your active email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={appFormData.phone}
                      onChange={(e) => setAppFormData({...appFormData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-xs font-bold text-neutral-800"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                      Experience
                    </label>
                    <select
                      value={appFormData.experience}
                      onChange={(e) => setAppFormData({...appFormData, experience: e.target.value})}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-xs font-bold text-neutral-800"
                    >
                      <option>Less than 1 Year</option>
                      <option>1 Year</option>
                      <option>2 Years</option>
                      <option>3 Years</option>
                      <option>4 Years</option>
                      <option>5+ Years</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                    Introduce Yourself / Explain Background
                  </label>
                  <textarea
                    required
                    value={appFormData.coverLetter}
                    onChange={(e) => setAppFormData({...appFormData, coverLetter: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-xs font-bold text-neutral-800 resize-none font-medium leading-relaxed"
                    placeholder="Briefly state why you would like to join our team..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 mt-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl transition-all uppercase tracking-wider text-[11px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>Submitting Application... <Loader2 size={14} className="animate-spin" /></>
                  ) : (
                    <>Submit Application <Send size={12} /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
