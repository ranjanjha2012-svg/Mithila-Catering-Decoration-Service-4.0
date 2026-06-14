import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { 
  collection, query, getDocs, doc, updateDoc, addDoc, deleteDoc, where, orderBy, onSnapshot, setDoc 
} from 'firebase/firestore';
import { 
  User as UserIcon, Shield, LogOut, CheckCircle, Clock, Search, ListFilter,
  DollarSign, FileText, Settings, UserCheck, Calendar, MapPin, Sparkles, Send, Phone,
  Coffee, ChevronRight, Calculator, CheckSquare, Plus, Trash2, Mail, ShoppingBag, Layers,
  Activity, Tag, ExternalLink, Loader2, X, Star, Users
} from 'lucide-react';

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  event: string;
  date: string;
  guests: number;
  package: string;
  status: 'Pending' | 'Contacted' | 'Approved' | 'Archived';
  location: string;
}

interface FirestoreOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    size?: string;
  }[];
  subtotal: number;
  packingCharge: number;
  deliveryCharge: number;
  totalAmount: number;
  address: string;
  location: string;
  state?: string;
  instructions?: string;
  orderDate?: string;
  orderTime?: string;
  paymentMethod: string;
  status: 'Placed' | 'Processing' | 'On the way' | 'Delivered' | 'Pending' | 'Approved' | 'Archived' | 'Cancelled' | 'Cancelled by Payment Failure' | 'Cancelled by Customer' | 'Pending Payment' | 'COD Pending';
  createdAt: string;
  userId: string;
  paymentStatus?: string;
  locked?: boolean;
  isPermanentCancellation?: boolean;
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
  createdAt: string;
}

export interface TiffinCustomer {
  id: string;
  referenceId: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  preference: 'Veg' | 'Non-Veg';
  monthlyPrice: number;
  balanceAmount: number;
  status: 'Registered' | 'Active' | 'Preparing' | 'Out For Delivery' | 'Delivered' | 'Paused' | 'Cancelled';
  createdAt: string;
  userId?: string;
  orderId?: string;
  mealTimings?: string;
  planName?: string;
  nextDeliveryDate?: string;
  todayDeliveryStatus?: string;
}

interface TiffinCardProps {
  key?: any;
  customer: TiffinCustomer;
  onUpdate: (id: string, fields: Partial<TiffinCustomer>) => any;
  onActivateTrigger?: (id: string) => void;
}

function TiffinCustomerCard({ customer, onUpdate, onActivateTrigger }: TiffinCardProps) {
  const [localPrice, setLocalPrice] = useState(customer.monthlyPrice);
  const [localBalance, setLocalBalance] = useState(customer.balanceAmount);
  const [localNextDate, setLocalNextDate] = useState(customer.nextDeliveryDate || '');
  const [localTodayStatus, setLocalTodayStatus] = useState(customer.todayDeliveryStatus || 'Not Started');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setLocalPrice(customer.monthlyPrice);
    setLocalBalance(customer.balanceAmount);
    setLocalNextDate(customer.nextDeliveryDate || '');
    setLocalTodayStatus(customer.todayDeliveryStatus || 'Not Started');
  }, [customer]);

  const handleUpdateClick = async () => {
    setUpdating(true);
    try {
      await onUpdate(customer.id, {
        monthlyPrice: Number(localPrice) || 0,
        balanceAmount: Number(localBalance) || 0,
        nextDeliveryDate: localNextDate,
        todayDeliveryStatus: localTodayStatus as any
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (nextStatus: string) => {
    await onUpdate(customer.id, { status: nextStatus as any });
  };

  const handleAdjustBalance = async (offset: number) => {
    const nextBalance = Math.max(0, Number(localBalance) + offset);
    setLocalBalance(nextBalance);
    await onUpdate(customer.id, { balanceAmount: nextBalance });
  };

  const isRegistered = customer.status === 'Registered';

  if (isRegistered) {
    // Registered Customer Card: Background White, Text Black, Border Light Gray
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow text-black">
        <div>
          <div className="flex justify-between items-start gap-2 border-b border-stone-150 pb-3 mb-3">
            <div>
              <h5 className="font-extrabold text-black text-sm">{customer.name}</h5>
              <span className="font-mono text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                Ref ID: {customer.referenceId}
              </span>
            </div>
            <span className={`text-[8px] px-2 py-1 font-black rounded uppercase text-white ${
              customer.preference === 'Veg' ? 'bg-green-600' : 'bg-[#C2185B]'
            }`}>
              {customer.preference}
            </span>
          </div>

          <div className="text-xs text-stone-850 space-y-2 mb-4 leading-relaxed font-semibold">
            <p>☎ <strong>Phone:</strong> {customer.phone}</p>
            {customer.email && <p className="truncate">✉ <strong>Email:</strong> {customer.email}</p>}
            <p>📍 <strong>Address:</strong> {customer.address}</p>
            <p>💰 <strong>Monthly Price:</strong> ₹{customer.monthlyPrice}</p>
            <p>⚖ <strong>Balance:</strong> {customer.balanceAmount}</p>
            <p>📅 <strong>Registration Date:</strong> {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onActivateTrigger && onActivateTrigger(customer.id)}
          className="w-full mt-4 py-3 bg-[#C2185B] hover:bg-[#a0134b] text-white font-black text-xs uppercase rounded-xl tracking-widest shadow-md transition-all active:scale-95 cursor-pointer"
        >
          Activate Tiffin
        </button>
      </div>
    );
  }

  // Active Customer Card: Background and indicators dynamically styled according to today's status colors
  const statClean = (localTodayStatus || 'Not Started').replace(/\s+text-black$/gi, '');
  
  let bgClass = "bg-[#C2185B] border-stone-205 text-white";
  if (statClean === 'Delivered') {
    bgClass = "bg-green-600 border-green-700 text-white";
  } else if (statClean === 'Cancelled') {
    bgClass = "bg-red-600 border-red-700 text-white";
  } else if (statClean === 'Preparing') {
    bgClass = "bg-amber-500 border-amber-600 text-white";
  } else if (statClean === 'Out For Delivery') {
    bgClass = "bg-blue-600 border-blue-700 text-white";
  }

  return (
    <div className={`${bgClass} border rounded-3xl p-5 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all relative overflow-hidden`}>
      <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6 pointer-events-none" />
      
      <div>
        <div className="flex justify-between items-start gap-2 border-b border-white/20 pb-3 mb-3">
          <div>
            <h5 className="font-black text-white text-sm sm:text-base">{customer.name}</h5>
            <span className="font-mono text-[10px] font-black text-rose-100 bg-black/20 border border-white/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">
              Ref ID: {customer.referenceId}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[9.5px] px-2.5 py-1 font-black rounded uppercase ${
              customer.preference === 'Veg' ? 'bg-emerald-500 text-white' : 'bg-white text-[#C2185B]'
            }`}>
              {customer.preference}
            </span>
            <span className={`text-[8.5px] font-black px-2 py-0.5 uppercase rounded-full border ${
              statClean === 'Delivered' ? 'bg-green-750 text-white border-green-800' :
              statClean === 'Cancelled' ? 'bg-red-750 text-white border-red-800' :
              statClean === 'Preparing' ? 'bg-amber-600 text-white border-amber-700' :
              statClean === 'Out For Delivery' ? 'bg-blue-700 text-white border-blue-800 animate-pulse' :
              'bg-white/25 text-white border-white/30'
            }`}>
              {statClean}
            </span>
          </div>
        </div>

        <div className="text-xs text-rose-105 space-y-2 mb-4 leading-relaxed font-bold">
          <p>☎ <strong className="text-white">Phone:</strong> {customer.phone}</p>
          <p className="line-clamp-2">📍 <strong className="text-white">Address:</strong> {customer.address}</p>
          <div className="flex justify-between items-center bg-black/15 rounded-xl p-2.5 my-3 border border-white/5">
            <div>
              <span className="text-[9px] text-rose-200 uppercase block font-black">Plan price</span>
              <span className="text-white font-black text-sm">₹{customer.monthlyPrice}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-rose-200 uppercase block font-black font-sans">Current Balance</span>
              <span className="text-yellow-300 font-extrabold text-sm font-mono">{customer.balanceAmount}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3.5 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-black">
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-black text-rose-200 uppercase tracking-wide">Update Balance</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  value={localBalance}
                  onChange={(e) => setLocalBalance(Number(e.target.value))}
                  className="w-full px-1.5 py-1 bg-white rounded-lg outline-none font-bold text-black text-xs"
                />
                <button
                  type="button"
                  onClick={async () => {
                    await onUpdate(customer.id, { balanceAmount: Number(localBalance) || 0 });
                    alert("Balance Amount updated successfully!");
                  }}
                  className="bg-white text-[#C2185B] font-black text-[9px] uppercase px-1.5 rounded-lg hover:bg-rose-50"
                >
                  Set
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-black text-rose-200 uppercase tracking-wide">Plan Price</label>
              <input
                type="number"
                value={localPrice}
                onChange={(e) => setLocalPrice(Number(e.target.value))}
                className="px-2 py-1 bg-white rounded-lg outline-none font-bold text-black text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-black">
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-black text-rose-200 uppercase tracking-wide">Daily Status</label>
              <select
                value={statClean}
                onChange={(e) => setLocalTodayStatus(e.target.value)}
                className="px-2 py-1.5 bg-white rounded-lg font-bold text-black cursor-pointer text-xs"
              >
                <option value="Not Started">Not Started</option>
                <option value="Preparing">Preparing</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] font-black text-rose-200 uppercase tracking-wide">Next Date</label>
              <input
                type="date"
                value={localNextDate}
                onChange={(e) => setLocalNextDate(e.target.value)}
                className="px-2 py-1 bg-white rounded-lg outline-none font-bold text-black text-xs"
              />
            </div>
          </div>

          <div className="flex flex-col gap-0.5 text-xs font-semibold">
            <label className="text-[9px] font-black text-rose-200 uppercase tracking-wide">Overall Tiffin Status</label>
            <select
              value={customer.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-2 py-1.5 bg-white text-[#C2185B] rounded-lg font-bold cursor-pointer outline-none text-xs"
            >
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={updating}
        onClick={handleUpdateClick}
        className="w-full mt-4 py-2 bg-white text-[#C2185B] font-extrabold text-[10px] uppercase rounded-xl hover:bg-rose-50 tracking-wider shadow-sm transition-colors cursor-pointer"
      >
        {updating ? "Saving Details..." : "Save Custom Properties"}
      </button>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('orders');

  // Firestore Database items
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Tiffin Service active management states
  const [tiffinCustomers, setTiffinCustomers] = useState<TiffinCustomer[]>([]);
  const [tiffinOrders, setTiffinOrders] = useState<any[]>([]);
  const [tiffinSubTab, setTiffinSubTab] = useState<'registered' | 'active' | 'orders' | 'paused_cancelled' | 'notices' | 'register'>('registered');
  const [ordersSubTab, setOrdersSubTab] = useState<'active' | 'finalised'>('active');
  const [notices, setNotices] = useState<any[]>([]);
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });
  const [publishingNotice, setPublishingNotice] = useState(false);
  const [tiffinForm, setTiffinForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    preference: 'Veg' as 'Veg' | 'Non-Veg',
    monthlyPrice: '',
    balanceAmount: '0',
    referenceId: ''
  });
  const [registeringTiffin, setRegisteringTiffin] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Activation Captcha Confirmation states
  const [activeActivationId, setActiveActivationId] = useState<string | null>(null);
  const [orderActivationTarget, setOrderActivationTarget] = useState<any | null>(null);
  const [activationCaptchaInput, setActivationCaptchaInput] = useState('');
  const [activationError, setActivationError] = useState('');

  // Filters and Builders state
  const [orderFilter, setOrderFilter] = useState<string>('All');
  const [showJobModal, setShowJobModal] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);

  // New Job Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Culinaries & Kitchens',
    salary: '₹22,000 - ₹32,000 / month',
    location: 'Delhi & NCR Sites',
    description: '',
    requirementsCsv: 'Punctual and polished hospitality habit, Able to travel to event sites promptly, Strong team coordinate nature'
  });

  // Local/Classic enquiries fallback
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('mithila_inquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const ordersUnsubscribeRef = React.useRef<(() => void) | null>(null);
  const tiffinCustomersUnsubRef = React.useRef<(() => void) | null>(null);
  const tiffinOrdersUnsubRef = React.useRef<(() => void) | null>(null);
  const tiffinNoticesUnsubRef = React.useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        let savedRole = localStorage.getItem('userRole');
        if (currentUser.email === 'mithilacateringservices@gmail.com') {
          savedRole = 'admin';
          localStorage.setItem('userRole', 'admin');
        }
        
        if (savedRole !== 'admin') {
          // If customer, redirect immediately away from the dashboard back to index
          window.location.href = '/';
        } else {
          setUser(currentUser);
          setRole('admin');
          // Load database values
          fetchAdminData(currentUser.uid);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (ordersUnsubscribeRef.current) {
        ordersUnsubscribeRef.current();
      }
      if (tiffinCustomersUnsubRef.current) {
        tiffinCustomersUnsubRef.current();
      }
      if (tiffinOrdersUnsubRef.current) {
        tiffinOrdersUnsubRef.current();
      }
      if (tiffinNoticesUnsubRef.current) {
        tiffinNoticesUnsubRef.current();
      }
    };
  }, []);

  const fetchAdminData = async (adminUid: string) => {
    setLoadingDb(true);
    if (ordersUnsubscribeRef.current) {
      ordersUnsubscribeRef.current();
    }
    try {
      // 1. Fetch customer online orders with onSnapshot for real-time live synchronization
      const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
        const ordersList: FirestoreOrder[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const isTiffinRef = doc.id.startsWith('TIF-') || data.referenceId?.startsWith('MTS-TF-') || data.tiffinReferenceId?.startsWith('MTS-TF-');
          const isTiffinType = data.orderType === 'tiffin';
          const isTiffinField = data.isTiffinOrder === true;
          const hasTiffinPlan = data.planName?.toLowerCase().includes('tiffin') || data.plan?.toLowerCase().includes('tiffin');

          if (isTiffinRef || isTiffinType || isTiffinField || hasTiffinPlan) {
            // Strictly exclude Tiffin orders from regular Catering dashboard
            return;
          }

          ordersList.push({
            id: doc.id,
            customerName: data.customerName || data.userName || '',
            customerEmail: data.customerEmail || '',
            customerPhone: data.customerPhone || data.userPhone || '',
            items: data.items || [],
            subtotal: data.subtotal || 0,
            packingCharge: data.packingCharge || 0,
            deliveryCharge: data.deliveryCharge || 0,
            totalAmount: data.totalAmount || 0,
            address: data.address || '',
            location: data.location || '',
            state: data.state || '',
            instructions: data.instructions || '',
            orderDate: data.orderDate || '',
            orderTime: data.orderTime || '',
            paymentMethod: data.paymentMethod || 'COD',
            status: data.status || 'Pending',
            createdAt: data.createdAt || '',
            userId: data.userId || '',
            paymentStatus: data.paymentStatus || '',
            locked: data.locked || false,
            isPermanentCancellation: data.isPermanentCancellation || false
          });
        });
        // Sort orders by creation date descending
        ordersList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setOrders(ordersList);
      }, (error) => {
        console.error("Real-time order sync failed:", error);
      });

      ordersUnsubscribeRef.current = unsubscribeOrders;

      // 2. Fetch jobs posted by ONLY this admin
      // 2. Fetch jobs posted by ONLY this admin
      try {
        const jobsQuery = query(collection(db, 'jobs'), where('createdBy', '==', adminUid));
        const jobsSnap = await getDocs(jobsQuery);
        const jobsList: JobPost[] = [];
        jobsSnap.forEach((doc) => {
          const data = doc.data();
          jobsList.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            department: data.department || '',
            salary: data.salary || '',
            location: data.location || '',
            requirements: data.requirements || [],
            createdBy: data.createdBy || ''
          });
        });
        setJobs(jobsList);
      } catch (err) {
        console.error("Failed to load admin jobs:", err);
      }

      // 3. Fetch all job candidate submissions
      try {
        const appsSnap = await getDocs(collection(db, 'applications'));
        const appsList: Application[] = [];
        appsSnap.forEach((doc) => {
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
            createdAt: data.createdAt || ''
          });
        });
        appsList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setApplications(appsList);
      } catch (err) {
        console.error("Failed to load application submissions:", err);
      }

      // Clean old listeners
      if (tiffinCustomersUnsubRef.current) {
        tiffinCustomersUnsubRef.current();
      }
      if (tiffinOrdersUnsubRef.current) {
        tiffinOrdersUnsubRef.current();
      }
      if (tiffinNoticesUnsubRef.current) {
        tiffinNoticesUnsubRef.current();
      }

      // 4. Real-time Tiffin Customers
      const unsubTiffinCust = onSnapshot(collection(db, 'tiffinCustomers'), (snapshot) => {
        const list: TiffinCustomer[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            referenceId: data.referenceId || '',
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            address: data.address || '',
            preference: data.preference || 'Veg',
            monthlyPrice: Number(data.monthlyPrice) || 0,
            balanceAmount: Number(data.balanceAmount) || 0,
            status: data.status || 'Active',
            createdAt: data.createdAt || '',
            userId: data.userId || '',
            todayDeliveryStatus: data.todayDeliveryStatus || 'Not Started',
            nextDeliveryDate: data.nextDeliveryDate || '',
            planName: data.planName || ''
          });
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const customers = list;
        console.log("Loaded Customers:", customers.length);
        setTiffinCustomers(customers);
      }, (error) => {
        console.error("Real-time tiffinCustomers sync failed:", error);
      });
      tiffinCustomersUnsubRef.current = unsubTiffinCust;

      // 5. Real-time Tiffin Orders
      const unsubTiffinOrd = onSnapshot(collection(db, 'tiffinOrders'), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            status: data.status || 'Pending',
            ...data
          });
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const orders = list;
        console.log("Loaded Tiffin Orders:", orders.length);
        setTiffinOrders(orders);
      }, (error) => {
        console.error("Real-time tiffinOrders sync failed:", error);
      });
      tiffinOrdersUnsubRef.current = unsubTiffinOrd;

      // 6. Real-time Tiffin Notices
      const unsubTiffinNotices = onSnapshot(collection(db, 'tiffinNotices'), (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            title: data.title || '',
            content: data.content || '',
            createdAt: data.createdAt || ''
          });
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setNotices(list);
      }, (error) => {
        console.error("Real-time tiffinNotices sync failed:", error);
      });
      tiffinNoticesUnsubRef.current = unsubTiffinNotices;

    } catch (error) {
      console.error("Error loading admin collections:", error);
    } finally {
      setLoadingDb(false);
    }
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.content.trim()) return;
    setPublishingNotice(true);
    try {
      await addDoc(collection(db, 'tiffinNotices'), {
        title: noticeForm.title,
        content: noticeForm.content,
        createdAt: new Date().toISOString()
      });
      setNoticeForm({ title: '', content: '' });
      alert("Notice published successfully to Customer Notice Board.");
    } catch (err: any) {
      alert("Error publishing notice: " + err.message);
    } finally {
      setPublishingNotice(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        await deleteDoc(doc(db, 'tiffinNotices', noticeId));
        alert("Notice deleted successfully.");
      } catch (err: any) {
        alert("Error deleting notice: " + err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      window.location.href = '/';
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  // Status updates for orders
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: FirestoreOrder['status']) => {
    try {
      const existing = orders.find(o => o.id === orderId);
      if (!existing) return;
      
      const isFailedPay = existing.status === 'Cancelled by Payment Failure';
      const isCustCancel = existing.status === 'Cancelled by Customer';
      const isLocked = (existing as any).locked || (existing as any).isPermanentCancellation;

      if (isFailedPay || isCustCancel || isLocked) {
        alert("Error: This order is permanently locked and cannot be modified.");
        return;
      }

      // Sequential Status Checker (Placed -> Processing -> Ready -> Out For Delivery -> Delivered)
      // Normalize existing statuses
      let current = existing.status || 'Placed';
      if (current === 'Pending' || current === 'Pending Payment' || current === 'COD Pending') {
        current = 'Placed';
      } else if (current === 'Approved') {
        current = 'Processing';
      } else if (current === 'On the way') {
        current = 'Out For Delivery';
      }

      const ns = nextStatus as any;
      const allowed = 
        (current === 'Placed' && (ns === 'Processing' || ns === 'Cancelled')) ||
        (current === 'Processing' && ns === 'Ready') ||
        (current === 'Ready' && ns === 'Out For Delivery') ||
        (current === 'Out For Delivery' && ns === 'Delivered');

      if (!allowed && current !== nextStatus) {
        alert(`Rule Violation: Cannot transition status from "${current}" directly to "${nextStatus}". Updates must progress sequentially in order: Placed ↓ Processing ↓ Ready ↓ Out For Delivery ↓ Delivered.`);
        return;
      }

      const orderRef = doc(db, 'orders', orderId);
      const timestamp = new Date().toISOString();
      const updatedHistory = existing.statusHistory 
        ? [...existing.statusHistory, { status: nextStatus, timestamp }]
        : [{ status: existing.status || 'Placed', timestamp: existing.createdAt || timestamp }, { status: nextStatus, timestamp }];

      await updateDoc(orderRef, { 
        status: nextStatus,
        statusHistory: updatedHistory
      });

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus, statusHistory: updatedHistory } : o));
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  // Tiffin Customers Admin updates
  const handleUpdateTiffinCustomer = async (customerId: string, fields: Partial<TiffinCustomer>) => {
    try {
      const customerRef = doc(db, 'tiffinCustomers', customerId);
      await updateDoc(customerRef, fields);
      alert("Successfully updated customer details!");
    } catch (err) {
      console.error("Error updating tiffin customer:", err);
      alert("Failed to update: " + (err as Error).message);
    }
  };

  // Generate reference ID MTS-TF-XXXXXX
  const handleGenerateReferenceId = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const generatedId = `MTS-TF-${randomDigits}`;
    setTiffinForm(prev => ({ ...prev, referenceId: generatedId }));
  };

  // Copy reference ID to clipboard
  const handleCopyId = () => {
    if (tiffinForm.referenceId) {
      navigator.clipboard.writeText(tiffinForm.referenceId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Submit Register Tiffin Customer form
  const handleRegisterTiffinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tiffinForm.referenceId) {
      alert("Please generate a Reference ID first.");
      return;
    }
    setRegisteringTiffin(true);
    try {
      const payload = {
        referenceId: tiffinForm.referenceId,
        name: tiffinForm.name,
        phone: tiffinForm.phone,
        email: tiffinForm.email || '',
        address: tiffinForm.address,
        preference: tiffinForm.preference,
        monthlyPrice: Number(tiffinForm.monthlyPrice) || 0,
        balanceAmount: Number(tiffinForm.balanceAmount) || 0,
        status: 'Registered',
        createdAt: new Date().toISOString(),
        todayDeliveryStatus: 'Not Started',
        nextDeliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      };

      await setDoc(doc(db, 'tiffinCustomers', tiffinForm.referenceId), payload);
      alert("Tiffin Service Customer successfully registered and verified!");
      // Reset form
      setTiffinForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        preference: 'Veg',
        monthlyPrice: '',
        balanceAmount: '0',
        referenceId: ''
      });
    } catch (err) {
      console.error("Error registering tiffin customer:", err);
      alert("Registration failed: " + (err as Error).message);
    } finally {
      setRegisteringTiffin(false);
    }
  };

  // Status updates for application reviews
  const handleUpdateAppStatus = async (appId: string, nextStatus: Application['status']) => {
    try {
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, { status: nextStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: nextStatus } : a));
    } catch (err) {
      console.error("Error updating application status:", err);
    }
  };

  // Delete Job Posting
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job posting permanently?")) return;
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      console.error("Error deleting job posting:", err);
    }
  };

  // Add new Job Posting
  const handleCreateJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingJob(true);

    try {
      const parsedReqs = jobForm.requirementsCsv
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const newJobDraft = {
        title: jobForm.title,
        department: jobForm.department,
        salary: jobForm.salary,
        location: jobForm.location,
        description: jobForm.description,
        requirements: parsedReqs,
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'jobs'), newJobDraft);
      setJobs(prev => [...prev, { id: docRef.id, ...newJobDraft }]);
      
      // Reset form
      setJobForm({
        title: '',
        department: 'Culinaries & Kitchens',
        salary: '₹22,000 - ₹32,000 / month',
        location: 'Delhi & NCR Sites',
        description: '',
        requirementsCsv: ''
      });
      setShowJobModal(false);
    } catch (err) {
      console.error("Error creating job posting:", err);
      alert("Failed to create job posting. Please verify permissions.");
    } finally {
      setSubmittingJob(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
        <p className="text-stone-850 font-extrabold mt-4 animate-pulse">Establishing Admin Environment...</p>
      </div>
    );
  }

  // Route fallback for unauthorized logins
  if (!user || role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border border-red-100"
        >
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-black text-rose-950">Access Refused</h2>
          <p className="text-stone-500 mt-2 text-sm">
            This dashboard is dedicated exclusively to Mithila Catering Store Administrators.
          </p>
          <div className="mt-8">
            <a
              href="/"
              className="block w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl transition-all shadow-md"
            >
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-10 max-w-7xl">
      {/* Upper Account Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stone-900 rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30 overflow-hidden p-1 border border-stone-800">
            <img 
              src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
              alt="Mithila Catering Corporate Brand Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2 text-neutral-50 font-sans">
                Admin Control Room
              </h2>
              <span className="text-[10px] px-2 py-0.5 font-black uppercase rounded-lg bg-orange-600 text-white tracking-widest animate-pulse">
                Live Store
              </span>
            </div>
            <p className="text-stone-400 text-xs mt-1 font-semibold">Store Manager Email: <span className="text-orange-400">{user.email}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button 
            onClick={() => fetchAdminData(user.uid)}
            className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl transition-colors text-xs inline-flex items-center gap-1.5"
          >
            <Activity size={14} className={loadingDb ? "animate-spin text-orange-500" : ""} />
            Sync Data
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg transition-all text-xs inline-flex items-center gap-1.5"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Side Selection Panels */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-stone-200/60 rounded-3xl p-5 shadow-sm">
            <p className="text-[10px] font-black text-stone-400 tracking-widest uppercase mb-4 px-2">Operational Hub</p>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black transition-all ${activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/10' : 'text-stone-700 hover:bg-stone-50'}`}
              >
                <ShoppingBag size={16} />
                <span>Customer Orders</span>
                {orders.filter(o => o.status === 'Pending' || o.status === 'Placed').length > 0 && (
                  <span className="ml-auto w-5 h-5 bg-orange-150 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black border border-orange-100">
                    {orders.filter(o => o.status === 'Pending' || o.status === 'Placed').length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('enquiries')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black transition-all ${activeTab === 'enquiries' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/10' : 'text-stone-700 hover:bg-stone-50'}`}
              >
                <Calendar size={16} />
                <span>Event Inquiries</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black transition-all ${activeTab === 'reviews' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/10' : 'text-stone-700 hover:bg-stone-50'}`}
              >
                <Star size={16} />
                <span>Customer Reviews</span>
                {orders.filter(o => (o as any).rating > 0).length > 0 && (
                  <span className="ml-auto w-5 h-5 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-[10px] font-black border border-yellow-200">
                    {orders.filter(o => (o as any).rating > 0).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('tiffin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black transition-all ${activeTab === 'tiffin' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/10' : 'text-stone-700 hover:bg-stone-50'}`}
              >
                <Coffee size={16} />
                <span>Tiffin Service</span>
                {tiffinCustomers.length > 0 && (
                  <span className="ml-auto w-5 h-5 bg-rose-100 text-rose-800 rounded-full flex items-center justify-center text-[10px] font-black border border-rose-200">
                    {tiffinCustomers.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Console Workspace panel */}
        <div className="lg:col-span-3">
          {loadingDb ? (
            <div className="bg-white border border-stone-100 rounded-3xl p-12 text-center shadow-sm">
              <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
              <p className="text-stone-500 text-xs font-black uppercase tracking-wider">Syncing Firestore collections...</p>
            </div>
          ) : (
            <>
              {/* ===================== CUSTOMER ORDERS VIEW ===================== */}
              {activeTab === 'orders' && (
                <div className="bg-white border border-stone-200/55 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-black text-rose-950 tracking-tight">Customer Orders Console</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase mt-1">Total Placed: {orders.length} orders</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-400 uppercase tracking-wider">Status:</span>
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value as any)}
                        className="text-xs font-bold border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                      >
                        <option value="All">All statuses</option>
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="On the way">On the way</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Subtab Selectors */}
                  <div className="flex border-b border-stone-200 gap-4 mb-2 pb-0.5">
                    <button
                      onClick={() => setOrdersSubTab('active')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        ordersSubTab === 'active' ? 'border-orange-600 text-orange-600' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Active Orders ({orders.filter(o => o.status !== 'Delivered' && !(o.status || '').toLowerCase().includes('cancel')).length})
                    </button>
                    <button
                      onClick={() => setOrdersSubTab('finalised')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        ordersSubTab === 'finalised' ? 'border-orange-600 text-orange-600' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Finalised ({orders.filter(o => o.status === 'Delivered' || (o.status || '').toLowerCase().includes('cancel')).length})
                    </button>
                  </div>

                  {/* Redefined Magenta Order Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders
                      .filter((order) => {
                        const status = order.status || 'Placed';
                        const isFinalised = status === 'Delivered' || status.toLowerCase().includes('cancel');

                        if (ordersSubTab === 'active' && isFinalised) return false;
                        if (ordersSubTab === 'finalised' && !isFinalised) return false;

                        let mapped = status;
                        if (mapped === 'Pending' || mapped === 'Pending Payment' || mapped === 'COD Pending') {
                          mapped = 'Placed';
                        } else if (mapped === 'Approved') {
                          mapped = 'Processing';
                        } else if (mapped === 'On the way') {
                          mapped = 'Out For Delivery';
                        }
                        if (orderFilter === 'All') return true;
                        return mapped === orderFilter;
                      })
                      .map((order) => {
                        let currentMappedStatus = order.status || 'Placed';
                        if (currentMappedStatus === 'Pending' || currentMappedStatus === 'Pending Payment' || currentMappedStatus === 'COD Pending') {
                          currentMappedStatus = 'Placed';
                        } else if (currentMappedStatus === 'Approved') {
                          currentMappedStatus = 'Processing';
                        } else if (currentMappedStatus === 'On the way') {
                          currentMappedStatus = 'Out For Delivery';
                        }

                        const isFailedPay = order.status === 'Cancelled by Payment Failure';
                        const isCustCancel = order.status === 'Cancelled by Customer';
                        const isPermanentLock = (order as any).locked || (order as any).isPermanentCancellation || isFailedPay || isCustCancel;

                        // Calculate available next statuses sequentially
                        const allowedStatuses: string[] = [];
                        if (currentMappedStatus === 'Placed') {
                          allowedStatuses.push('Placed', 'Processing', 'Cancelled');
                        } else if (currentMappedStatus === 'Processing') {
                          allowedStatuses.push('Processing', 'Ready');
                        } else if (currentMappedStatus === 'Ready') {
                          allowedStatuses.push('Ready', 'Out For Delivery');
                        } else if (currentMappedStatus === 'Out For Delivery') {
                          allowedStatuses.push('Out For Delivery', 'Delivered');
                        } else {
                          allowedStatuses.push(currentMappedStatus);
                        }

                        return (
                          <div 
                            key={order.id}
                            className="bg-[#C2185B] text-white rounded-3xl p-6 shadow-xl border border-rose-300/10 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-2xl duration-200"
                          >
                            <div>
                              {/* Order Header / Invoice Info */}
                              <div className="flex justify-between items-start gap-3 border-b border-white/20 pb-4 mb-4">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-rose-200 tracking-wider block">Reference Ticket</span>
                                  <h4 className="text-sm font-black font-mono tracking-tight text-white mt-1">#{order.id.slice(-8).toUpperCase()}</h4>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black uppercase text-rose-200 tracking-wider block">Received At</span>
                                  <span className="text-[10px] font-bold text-white mt-1 block">
                                    {order.orderDate ? `${order.orderDate} @ ${order.orderTime}` : new Date(order.createdAt || '').toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Customer / Client Contact Card */}
                              <div className="space-y-1 bg-black/10 rounded-2xl p-3.5 mb-4 border border-white/5 font-sans">
                                <span className="text-[9px] font-black uppercase text-rose-200 tracking-widest block">Client Contact</span>
                                <p className="text-sm font-black leading-tight text-white mt-0.5">{order.customerName || 'Mithila Guest'}</p>
                                <p className="text-xs font-medium text-rose-100 block truncate">{order.customerEmail || 'No Email Registered'}</p>
                                <p className="text-xs font-bold text-yellow-300 block font-mono mt-1">☎ {order.customerPhone}</p>
                                {order.whatsapp && <p className="text-[10px] text-green-300 font-bold block">💬 Whatsapp: {order.whatsapp}</p>}
                                <p className="text-xs font-semibold text-rose-50 leading-snug mt-1.5 border-t border-white/10 pt-1.5">
                                  📍 <strong className="text-white font-black">{order.location}:</strong> {order.address}
                                </p>
                              </div>

                              {/* Order Items Purchased */}
                              <div className="mb-4">
                                <span className="text-[9px] font-black uppercase text-rose-200 tracking-widest block mb-2">Purchased Items</span>
                                <div className="space-y-1.5 bg-black/10 rounded-2xl p-3.5 border border-white/5">
                                  {(order.items || []).map((it, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs font-semibold text-rose-50">
                                      <span className="truncate max-w-[200px]"><strong className="text-yellow-300 pr-1">{it.quantity}x</strong> {it.name} {it.size && it.size !== 'single' ? `(${it.size})` : ''}</span>
                                      <span className="font-mono text-white text-[11px]">₹{it.price * it.quantity}</span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between items-center text-xs font-black text-white pt-2 border-t border-white/10 mt-2">
                                    <span className="uppercase text-[9px] text-rose-200">Total Invoice Receipt</span>
                                    <span className="text-yellow-300 text-sm">₹{order.totalAmount}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Financial Details (Payment Options) */}
                              <div className="flex justify-between items-center gap-2 mb-4 bg-black/10 rounded-xl p-2.5 text-[10.5px] font-black border border-white/5 font-mono uppercase">
                                <span className="text-rose-100">Pay Mode: <strong className="text-white">{order.paymentMethod || 'COD'}</strong></span>
                                <span className={`px-2 py-0.5 rounded font-bold ${
                                  (order as any).paymentStatus === 'Paid' ? 'bg-green-500/30 text-green-200 border border-green-500/40' : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40'
                                }`}>
                                  {(order as any).paymentStatus || 'COD Pending'}
                                </span>
                              </div>

                              {/* Status History Steps Logger */}
                              {order.statusHistory && order.statusHistory.length > 0 && (
                                <div className="mb-4 bg-black/15 p-3 rounded-2xl border border-white/5 text-[10px] space-y-1">
                                  <span className="text-[8px] font-black text-rose-200 uppercase tracking-widest block mb-1">State Progress History Logs</span>
                                  {order.statusHistory.map((h: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-rose-100">
                                      <span className="font-bold">✓ {h.status}</span>
                                      <span className="font-mono text-[9px] text-rose-200 opacity-80">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Sequential Dropdown Controller */}
                            <div className="border-t border-white/20 pt-4 mt-2">
                              {isPermanentLock ? (
                                <div className="space-y-1 text-center bg-black/25 p-2.5 rounded-xl border border-red-500/30">
                                  <span className="inline-flex items-center gap-1.5 text-red-300 text-[10px] font-black uppercase tracking-wider">
                                    <Shield size={12} className="shrink-0 text-red-400" />
                                    Permanently Locked
                                  </span>
                                  <p className="text-[10px] text-rose-200 font-bold leading-normal">
                                    {isFailedPay ? 'Transaction failed at PayU gateway.' : 'This order has been finalized.'}
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black uppercase text-rose-200 tracking-wider">Admin Status Action</span>
                                    <span className="text-[9px] px-2 py-0.5 rounded bg-white/20 text-white font-extrabold uppercase">
                                      {currentMappedStatus}
                                    </span>
                                  </div>

                                  <select
                                    value={currentMappedStatus}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                                    className="w-full text-xs font-extrabold bg-[#880d3e] hover:bg-[#6b0930] text-white border border-rose-300/30 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-white cursor-pointer transition-colors shadow-inner"
                                  >
                                    {allowedStatuses.map((s) => (
                                      <option key={s} value={s} className="bg-[#880d3e] text-white font-bold">
                                        {s === currentMappedStatus ? `✓ Current: ${s}` : `→ Move to: ${s}`}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="text-[9px] text-rose-200 italic font-semibold text-center mt-1 progress-guidetext">
                                    * Progressive linear pipeline prevents status jumps.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {orders.length === 0 && (
                      <div className="col-span-3 text-center py-16 bg-stone-50/50 rounded-3xl border border-stone-200">
                        <ShoppingBag className="mx-auto text-stone-300 mb-2" size={36} />
                        <p className="text-stone-500 text-sm font-bold uppercase">No active customer orders matching criteria.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/*Customer reviews & live ratings tab view */}
              {activeTab === 'reviews' && (
                <div className="bg-white border border-stone-200/55 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-rose-950 tracking-tight">Real-time Customer Ratings & Reviews</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase mt-1">Real-time Feedback from Placed Orders</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders
                      .filter(o => (o as any).rating > 0)
                      .map((o) => (
                        <div key={o.id} className="bg-stone-50 border border-stone-250 p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <div>
                                <span className="text-xs font-black text-stone-900 block">{o.customerName || 'Mithila Guest'}</span>
                                <span className="text-[9px] font-mono font-bold text-stone-500 bg-stone-200 px-1.5 py-0.5 rounded">Order ID: {o.id.toUpperCase()}</span>
                              </div>
                              <div className="flex items-center gap-0.5 text-yellow-500">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                  <Star key={idx} size={14} fill={idx < (o as any).rating ? 'currentColor' : 'none'} className={idx < (o as any).rating ? 'text-yellow-500' : 'text-stone-300'} />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-stone-700 italic font-medium leading-relaxed mb-4">
                              "{o.review || 'No written review text provided.'}"
                            </p>
                          </div>
                          <p className="text-[10px] text-stone-400 font-bold border-t border-stone-200 pt-2 flex justify-between font-mono">
                            <span>Scheduled: {o.orderDate}</span>
                            <span>Review Date: {(o as any).reviewDate ? new Date((o as any).reviewDate).toLocaleDateString() : 'N/A'}</span>
                          </p>
                        </div>
                      ))}

                    {orders.filter(o => (o as any).rating > 0).length === 0 && (
                      <div className="col-span-2 text-center py-16 bg-stone-50/50 rounded-2xl border border-stone-150">
                        <Star className="mx-auto text-stone-300 mb-2" size={36} />
                        <p className="text-stone-500 text-sm font-bold uppercase">No reviews or ratings received yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===================== TRADITIONAL EVENT ENQUIRIES ===================== */}
              {activeTab === 'enquiries' && (
                <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-rose-950 tracking-tight">Catering Banqueting Inquiries</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase mt-1">Catering requests from local form enquiry boards ({inquiries.length})</p>
                  </div>

                  <div className="space-y-4">
                    {inquiries.map((inq) => (
                      <div 
                        key={inq.id}
                        className="bg-neutral-50/50 border border-neutral-100 rounded-2xl p-5 hover:bg-white transition-all grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-stone-900 text-sm">{inq.name}</h4>
                            <span className="text-[9px] px-2 py-0.5 rounded font-black bg-amber-50 rounded-md border border-amber-200 text-amber-700 uppercase">
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-xs text-orange-900 font-bold mt-1 inline-flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded border border-orange-100/50">
                            <Calendar size={12} /> {inq.event}
                          </p>
                        </div>

                        <div className="text-left md:text-center space-y-1">
                          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                            Capacity: <span className="text-stone-850 font-black">{inq.guests} Guest plates</span>
                          </p>
                          <p className="text-[10px] text-stone-400 font-bold font-mono">Book Date: {inq.date}</p>
                        </div>

                        <div className="flex justify-start md:justify-end gap-2 text-xs">
                          <a 
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Send size={12} /> WhatsApp Inquiry
                          </a>
                        </div>
                      </div>
                    ))}

                    {inquiries.length === 0 && (
                      <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-stone-200 border-dashed">
                        <Calendar className="mx-auto text-stone-300 mb-2" size={36} />
                        <p className="text-stone-400 text-xs font-black uppercase">No traditional banqueting enquiries submitted yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===================== TIFFIN SERVICE MANAGEMENT SYSTEM ===================== */}
              {activeTab === 'tiffin' && (
                <div className="bg-white border border-stone-200/55 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-black text-[#C2185B] tracking-tight">Mithila Tiffin Administration</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase mt-1">Manage active subscribers, plans, status updates, and registrations</p>
                    </div>
                  </div>

                  {/* Tiffin Subtab Selectors */}
                  <div className="flex flex-wrap border-b border-stone-200 gap-4 mb-6 pb-0.5">
                    <button
                      onClick={() => setTiffinSubTab('registered')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        tiffinSubTab === 'registered' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Registered Customers ({tiffinCustomers.filter(c => c.status === 'Registered').length})
                    </button>
                    <button
                      onClick={() => setTiffinSubTab('active')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        tiffinSubTab === 'active' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Active Tiffin Customers ({tiffinCustomers.filter(c => c.status === 'Active').length})
                    </button>
                    <button
                      onClick={() => setTiffinSubTab('paused_cancelled')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        tiffinSubTab === 'paused_cancelled' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Paused/Cancelled Tiffin Service ({tiffinCustomers.filter(c => c.status === 'Paused' || c.status === 'Cancelled').length})
                    </button>
                    <button
                      onClick={() => setTiffinSubTab('orders')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        tiffinSubTab === 'orders' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Tiffin Orders ({tiffinOrders.filter(o => o.status !== 'Active').length})
                    </button>
                    <button
                      onClick={() => setTiffinSubTab('notices')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        tiffinSubTab === 'notices' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Notice Board Editor ({notices.length})
                    </button>
                    <button
                      onClick={() => setTiffinSubTab('register')}
                      className={`pb-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                        tiffinSubTab === 'register' ? 'border-[#C2185B] text-[#C2185B]' : 'border-transparent text-stone-500 hover:text-stone-850'
                      }`}
                    >
                      Register Tiffin Service
                    </button>
                  </div>

                  {/* SUBTAB CONTENTS */}
                  {tiffinSubTab === 'registered' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tiffinCustomers
                        .filter(c => c.status === 'Registered')
                        .map((cust) => (
                          <TiffinCustomerCard 
                            key={cust.id} 
                            customer={cust} 
                            onUpdate={handleUpdateTiffinCustomer} 
                            onActivateTrigger={setActiveActivationId} 
                          />
                        ))}
                      {tiffinCustomers.filter(c => c.status === 'Registered').length === 0 && (
                        <div className="col-span-3 text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                          <Users size={32} className="mx-auto text-stone-400 mb-2" />
                          <p className="text-xs font-semibold text-stone-500">No Customers in Registered Status.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {tiffinSubTab === 'active' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tiffinCustomers
                        .filter(c => c.status === 'Active')
                        .map((cust) => (
                          <TiffinCustomerCard 
                            key={cust.id} 
                            customer={cust} 
                            onUpdate={handleUpdateTiffinCustomer} 
                            onActivateTrigger={setActiveActivationId} 
                          />
                        ))}
                      {tiffinCustomers.filter(c => c.status === 'Active').length === 0 && (
                        <div className="col-span-3 text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                          <Users size={32} className="mx-auto text-stone-400 mb-2" />
                          <p className="text-xs font-semibold text-stone-500">No Customers in Active status.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {tiffinSubTab === 'orders' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tiffinOrders
                        .filter(ord => ord.status !== 'Active')
                        .map((ord) => (
                          <div key={ord.id} className="bg-[#C2185B] text-white rounded-3xl p-6 shadow-xl border border-rose-300/10 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start border-b border-white/20 pb-4 mb-4">
                                <div>
                                  <span className="text-[10px] font-black uppercase text-rose-200 tracking-wider block">Reference Ticket</span>
                                  <h4 className="text-xs font-black font-mono tracking-tight text-white mt-1">{ord.id.toUpperCase()}</h4>
                                </div>
                                <span className="text-[10px] bg-green-500 text-white font-extrabold px-2.5 py-1 rounded-md uppercase">
                                  {ord.status || 'PAID'}
                                </span>
                              </div>

                              <div className="space-y-1 bg-black/10 rounded-2xl p-3.5 mb-4 border border-white/5 text-xs text-rose-50 leading-snug">
                                <p className="text-sm font-black text-white">{ord.customerName}</p>
                                <p className="font-mono text-yellow-300">☎ {ord.phone}</p>
                                <p className="mt-1">📍 {ord.address}</p>
                                {ord.referenceId && <p className="font-bold text-[10px] bg-white/10 text-white inline-block px-1.5 py-0.5 rounded mt-1">Ref ID: {ord.referenceId}</p>}
                              </div>

                              <div className="bg-black/10 rounded-2xl p-3.5 border border-white/5 space-y-1.5 text-xs mb-4">
                                <div className="flex justify-between">
                                  <span className="text-rose-200">Plan Option</span>
                                  <span className="font-bold text-white">{ord.plan || ord.planName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-rose-200">Amount Paid</span>
                                  <span className="font-bold text-yellow-300">₹{ord.amount}</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-rose-300">
                                  <span>Purchase Date</span>
                                  <span>{ord.orderDate || ord.createdAt?.split('T')[0]}</span>
                                </div>
                              </div>

                              {ord.status !== 'Cancelled' ? (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <button
                                    onClick={() => setOrderActivationTarget(ord)}
                                    className="py-2.5 bg-yellow-450 hover:bg-yellow-500 text-rose-950 text-xs font-black rounded-xl transition uppercase tracking-wider text-center select-none cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    Activate
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(`Are you sure you want to mark order for ${ord.customerName} as Cancelled?`)) {
                                        try {
                                          await updateDoc(doc(db, 'tiffinOrders', ord.id), {
                                            status: 'Cancelled',
                                            cancelledAt: new Date().toISOString()
                                          });
                                          alert("Order marked as Cancelled successfully!");
                                        } catch (err: any) {
                                          alert("Error: " + err.message);
                                        }
                                      }
                                    }}
                                    className="py-2.5 bg-red-650 hover:bg-red-750 text-white text-xs font-black rounded-xl transition uppercase tracking-wider text-center select-none cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                                  >
                                    Cancelled
                                  </button>
                                </div>
                              ) : (
                                <div className="mt-2 w-full py-2.5 bg-red-950 text-rose-300 border border-red-905 text-xs font-black rounded-xl text-center uppercase tracking-wider">
                                  Cancelled
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      {tiffinOrders.filter(ord => ord.status !== 'Active').length === 0 && (
                        <div className="col-span-3 text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                          <ShoppingBag size={32} className="mx-auto text-stone-400 mb-2" />
                          <p className="text-xs font-semibold text-stone-500">No Online Tiffin Orders recorded yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {tiffinSubTab === 'paused_cancelled' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tiffinCustomers
                        .filter(c => c.status === 'Paused' || c.status === 'Cancelled')
                        .map((cust) => {
                          const isCancelled = cust.status === 'Cancelled';
                          const cardClass = isCancelled 
                            ? "bg-red-600 border border-red-700 rounded-3xl p-5 flex flex-col justify-between shadow-xl text-white animate-fade-in" 
                            : "bg-stone-50 border border-stone-200 rounded-3xl p-5 flex flex-col justify-between shadow-sm text-black animate-fade-in";
                          
                          return (
                            <div key={cust.id} className={cardClass}>
                              <div>
                                <div className={`flex justify-between items-start gap-2 border-b pb-3 mb-3 ${isCancelled ? 'border-white/20' : 'border-stone-150'}`}>
                                  <div>
                                    <h5 className={`font-extrabold text-[#000000] text-sm ${isCancelled ? 'text-white' : 'text-black'}`}>{cust.name}</h5>
                                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                                      isCancelled ? 'text-red-100 bg-black/20 border border-white/10' : 'text-stone-600 bg-stone-100 border border-stone-200'
                                    }`}>
                                      Ref ID: {cust.referenceId}
                                    </span>
                                  </div>
                                  <span className={`text-[8px] px-2 py-1 font-black rounded uppercase text-white ${
                                    cust.status === 'Paused' ? 'bg-amber-500' : 'bg-red-800'
                                  }`}>
                                    {cust.status}
                                  </span>
                                </div>

                                <div className={`text-xs space-y-2 mb-4 leading-relaxed font-semibold ${isCancelled ? 'text-red-105' : 'text-stone-850'}`}>
                                  <p>☎ <strong className={isCancelled ? 'text-white' : 'text-black'}>Phone:</strong> {cust.phone}</p>
                                  {cust.email && <p className="truncate">✉ <strong className={isCancelled ? 'text-white' : 'text-black'}>Email:</strong> {cust.email}</p>}
                                  <p>📍 <strong className={isCancelled ? 'text-white' : 'text-black'}>Address:</strong> {cust.address}</p>
                                  <p>💰 <strong className={isCancelled ? 'text-white' : 'text-black'}>Plan Price:</strong> ₹{cust.monthlyPrice}</p>
                                  <p>⚖ <strong className={isCancelled ? 'text-white' : 'text-black'}>Balance:</strong> {cust.balanceAmount}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await handleUpdateTiffinCustomer(cust.id, { status: 'Active' });
                                      alert(`Tiffin service for ${cust.name} has been Activated.`);
                                    } catch (err: any) {
                                      alert("Error activating: " + err.message);
                                    }
                                  }}
                                  className="py-2.5 bg-green-500 hover:bg-green-600 text-black font-black text-xs uppercase rounded-xl tracking-wider shadow-sm transition-all cursor-pointer"
                                  style={{ color: '#000000' }}
                                >
                                  Activate
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await handleUpdateTiffinCustomer(cust.id, { status: 'Cancelled' });
                                      alert(`Tiffin service for ${cust.name} has been Cancelled.`);
                                    } catch (err: any) {
                                      alert("Error cancelling: " + err.message);
                                    }
                                  }}
                                  className="py-2.5 bg-red-500 hover:bg-red-600 text-black font-black text-xs uppercase rounded-xl tracking-wider shadow-sm transition-all cursor-pointer"
                                  style={{ color: '#000000' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      {tiffinCustomers.filter(c => c.status === 'Paused' || c.status === 'Cancelled').length === 0 && (
                        <div className="col-span-3 text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                          <Users size={32} className="mx-auto text-stone-400 mb-2" />
                          <p className="text-xs font-semibold text-stone-500">No customers currently in Paused or Cancelled status.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {tiffinSubTab === 'notices' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                      {/* Notice Creation Form Column */}
                      <div className="lg:col-span-1">
                        <div className="bg-stone-50 rounded-[2rem] border border-stone-150 p-6 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-black text-[#C2185B] uppercase mb-1 tracking-wide">Publish News Notice</h4>
                            <p className="text-[10px] text-stone-400 font-extrabold mb-5 uppercase">This notice will appear on all Tiffin customer pages immediately</p>

                            <form onSubmit={handlePublishNotice} className="space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Notice Title *</label>
                                <input
                                  type="text"
                                  required
                                  value={noticeForm.title}
                                  onChange={(e) => setNoticeForm(prev => ({ ...prev, title: e.target.value }))}
                                  placeholder="e.g. Festival Delivery Timings"
                                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">Detailed Notice Content *</label>
                                <textarea
                                  required
                                  rows={5}
                                  value={noticeForm.content}
                                  onChange={(e) => setNoticeForm(prev => ({ ...prev, content: e.target.value }))}
                                  placeholder="Type the notice terms, delivery alerts or schedule announcements here..."
                                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500 font-semibold"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={publishingNotice}
                                className="w-full py-3 bg-[#C2185B] hover:bg-[#a0134b] text-white text-xs font-black uppercase rounded-xl tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {publishingNotice ? 'Publishing...' : 'Publish Notice 📢'}
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>

                      {/* Notice Records List Column */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center border-b border-stone-200 pb-3 mb-1">
                          <h4 className="text-sm font-black text-stone-900 uppercase">Currently Active Notices</h4>
                          <span className="text-[10px] font-black bg-[#C2185B]/10 text-[#C2185B] px-2.5 py-1 rounded-full uppercase">{notices.length} notices</span>
                        </div>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                          {notices.map((notice) => (
                            <div key={notice.id} className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C2185B]" />
                              
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h5 className="font-extrabold text-stone-900 text-sm">{notice.title}</h5>
                                  <span className="text-[9px] font-bold text-stone-400 block mt-0.5">{notice.createdAt ? new Date(notice.createdAt).toLocaleString() : 'N/A'}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNotice(notice.id)}
                                  className="px-2.5 py-1 text-[9px] font-black text-red-650 bg-red-50 hover:bg-red-100 uppercase rounded-md tracking-wider transition-colors border border-red-200"
                                >
                                  Delete
                                </button>
                              </div>

                              <p className="text-xs text-stone-650 leading-relaxed font-semibold whitespace-pre-wrap">{notice.content}</p>
                            </div>
                          ))}

                          {notices.length === 0 && (
                            <div className="text-center py-12 bg-stone-50 border border-stone-200 rounded-3xl">
                              <p className="text-xs font-semibold text-stone-500">No announcements published on the notice board yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {tiffinSubTab === 'register' && (
                    <div className="bg-stone-50 rounded-[2rem] border border-stone-150 p-6 md:p-8 max-w-2xl mx-auto">
                      <h4 className="text-lg font-black text-[#C2185B] uppercase mb-1">Establish New Subscriber</h4>
                      <p className="text-xs text-stone-400 font-bold mb-6 uppercase">Save basic preferences and generate reference keys</p>

                      <form onSubmit={handleRegisterTiffinSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={tiffinForm.name}
                              onChange={(e) => setTiffinForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g. Ramesh Chandra Mishra"
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500"
                            />
                          </div>

                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Mobile Number *</label>
                            <input
                              type="text"
                              required
                              value={tiffinForm.phone}
                              onChange={(e) => setTiffinForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="e.g. +91900010002"
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Email (Optional)</label>
                            <input
                              type="email"
                              value={tiffinForm.email}
                              onChange={(e) => setTiffinForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="e.g. customer@gmail.com"
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500"
                            />
                          </div>

                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Dietary Preference *</label>
                            <select
                              value={tiffinForm.preference}
                              onChange={(e) => setTiffinForm(prev => ({ ...prev, preference: e.target.value as 'Veg' | 'Non-Veg' }))}
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black cursor-pointer"
                            >
                              <option value="Veg">Vegetarian (Mithila Pure Veg)</option>
                              <option value="Non-Veg">Non-Vegetarian (Mithila Styled Fish/Curry)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1 flex flex-col">
                          <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Doorstep Address *</label>
                          <textarea
                            required
                            rows={2}
                            value={tiffinForm.address}
                            onChange={(e) => setTiffinForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Full home or office delivery address..."
                            className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Monthly Subscription Price (₹) *</label>
                            <input
                              type="number"
                              required
                              value={tiffinForm.monthlyPrice}
                              onChange={(e) => setTiffinForm(prev => ({ ...prev, monthlyPrice: e.target.value }))}
                              placeholder="e.g. 2400"
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500"
                            />
                          </div>

                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-black text-stone-500 uppercase tracking-wider">Starting Balance Amount (₹) *</label>
                            <input
                              type="number"
                              required
                              value={tiffinForm.balanceAmount}
                              onChange={(e) => setTiffinForm(prev => ({ ...prev, balanceAmount: e.target.value }))}
                              className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-1 focus:ring-[#C2185B] outline-none text-xs font-bold text-black placeholder-stone-500"
                            />
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Generated Reference ID</span>
                            <span className="text-sm font-black font-mono text-black block mt-1 px-3 py-1 bg-yellow-150 border border-yellow-300 rounded-lg animate-pulse">
                              {tiffinForm.referenceId || "No Reference Activated"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleGenerateReferenceId}
                            className="px-4 py-3 bg-[#C2185B] hover:bg-[#a0134b] text-white text-xs font-black rounded-lg transition-colors shadow-sm select-none"
                          >
                            Generate Reference ID
                          </button>
                        </div>

                        {tiffinForm.referenceId && (
                          <div className="flex justify-between gap-3 pt-2">
                            <button
                              type="button"
                              onClick={handleCopyId}
                              className="px-4 py-2 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg border border-stone-250 transition-colors"
                            >
                              {copiedId ? "Copied ✓" : "Copy ID"}
                            </button>

                            <button
                              type="submit"
                              disabled={registeringTiffin}
                              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-lg transition-all shadow-md inline-flex items-center gap-1.5"
                            >
                              {registeringTiffin ? "Activating..." : "Register Tiffin Customer"}
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ===================== POST CAREER OPENING MODAL ===================== */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowJobModal(false)}
              className="fixed inset-0 bg-neutral-950/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl z-10 border border-orange-100"
            >
              <button 
                onClick={() => setShowJobModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-neutral-50 rounded-full transition-colors"
              >
                <X size={20} className="text-stone-400" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Publish Career</span>
                <h3 className="text-2xl md:text-3xl font-black text-rose-955 mt-0.5">Define New Job Offering</h3>
                <p className="text-stone-400 text-xs mt-1">Make a direct requirement post open to candidate submissions.</p>
              </div>

              <form onSubmit={handleCreateJobSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Job Offering Title</label>
                    <input
                      type="text"
                      required
                      value={jobForm.title}
                      onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                      placeholder="e.g. Senior Kitchen Curry Coordinator"
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-xs font-bold text-stone-850"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Operational Department</label>
                    <select
                      value={jobForm.department}
                      onChange={(e) => setJobForm({...jobForm, department: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-xs font-bold text-stone-850 cursor-pointer"
                    >
                      <option>Culinaries & Kitchens</option>
                      <option>Hospitality & Services</option>
                      <option>Logistics</option>
                      <option>Event Management</option>
                      <option>Support staff</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Compensation Segment (Salary)</label>
                    <input
                      type="text"
                      required
                      value={jobForm.salary}
                      onChange={(e) => setJobForm({...jobForm, salary: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-xs font-bold text-stone-850"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Workplace Location</label>
                    <input
                      type="text"
                      required
                      value={jobForm.location}
                      onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-xs font-bold text-stone-850"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Performance Duties (Description)</label>
                  <textarea
                    required
                    rows={3}
                    value={jobForm.description}
                    onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                    placeholder="Short summary detailing typical responsibilities, working hours, and benefits..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-xs font-semibold text-stone-850 resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider">Prerequisites list (Separate with commas)</label>
                  <input
                    type="text"
                    required
                    value={jobForm.requirementsCsv}
                    onChange={(e) => setJobForm({...jobForm, requirementsCsv: e.target.value})}
                    placeholder="e.g. 3+ Years Chef experience, Deep food safety knowledge, Immediate Joiner preferred"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-150 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none text-xs font-bold text-stone-850"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingJob}
                  className="w-full py-3.5 mt-2 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
                >
                  {submittingJob ? (
                    <>Uploading Record... <Loader2 size={14} className="animate-spin" /></>
                  ) : (
                    <>Publish Opening <Send size={12} /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tiffin Service Activation Captcha Confirmation Modal */}
      {activeActivationId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[2rem] border border-stone-200 max-w-sm w-full p-6 text-stone-900 shadow-2xl relative">
            <button 
              onClick={() => {
                setActiveActivationId(null);
                setActivationCaptchaInput('');
                setActivationError('');
              }}
              className="absolute top-5 right-5 p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-[#C2185B] uppercase tracking-wide mb-1">Confirm Subscription Activation</h3>
            <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wide leading-relaxed mb-4">
              Type <span className="text-black font-extrabold pr-0.5">ACTIVATE</span> to verify process
            </p>

            <div className="bg-stone-50 border border-stone-150 p-4 rounded-xl text-center mb-4">
              <span className="font-mono text-[11px] font-black tracking-widest text-[#C2185B] bg-yellow-100 px-3 py-1 rounded border border-yellow-250 uppercase select-none">
                ACTIVATE
              </span>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={activationCaptchaInput}
                onChange={(e) => setActivationCaptchaInput(e.target.value)}
                placeholder="Type ACTIVATE here..."
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-[#C2185B] text-xs font-bold text-black placeholder-stone-500 uppercase"
              />
              {activationError && (
                <p className="text-[10px] text-red-650 font-bold uppercase">{activationError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveActivationId(null);
                    setActivationCaptchaInput('');
                    setActivationError('');
                  }}
                  className="w-1/2 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black rounded-lg transition"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (activationCaptchaInput.trim() !== "ACTIVATE") {
                      setActivationError("Code mismatch. Please type exactly 'ACTIVATE'.");
                      return;
                    }
                    try {
                      const customerRef = doc(db, 'tiffinCustomers', activeActivationId);
                      await updateDoc(customerRef, {
                        status: 'Active',
                        activatedAt: new Date().toISOString()
                      });
                      alert("Tiffin Service activated successfully! Moved to operational stage.");
                      setActiveActivationId(null);
                      setActivationCaptchaInput('');
                      setActivationError('');
                    } catch (err: any) {
                      setActivationError("Error: " + err.message);
                    }
                  }}
                  className="w-1/2 py-2.5 bg-[#C2185B] hover:bg-[#a0134b] text-white text-xs font-black rounded-lg transition shadow-sm uppercase tracking-wider"
                >
                  ACTIVATE NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tiffin Order Activation Captcha Confirmation Modal */}
      {orderActivationTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-[2rem] border border-stone-200 max-w-sm w-full p-6 text-stone-900 shadow-2xl relative">
            <button 
              onClick={() => {
                setOrderActivationTarget(null);
                setActivationCaptchaInput('');
                setActivationError('');
              }}
              className="absolute top-5 right-5 p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-black text-[#C2185B] uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <span>Activate Order Subscription</span>
            </h3>
            <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wide leading-relaxed mb-4">
              Type <span className="text-black font-extrabold pr-0.5">ACTIVATE</span> to verify process
            </p>

            <div className="bg-stone-50 border border-stone-150 p-4 rounded-xl text-center mb-4">
              <span className="font-mono text-[11px] font-black tracking-widest text-[#C2185B] bg-yellow-100 px-3 py-1 rounded border border-yellow-250 uppercase select-none">
                ACTIVATE
              </span>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={activationCaptchaInput}
                onChange={(e) => setActivationCaptchaInput(e.target.value)}
                placeholder="Type ACTIVATE here..."
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl outline-none focus:ring-1 focus:ring-[#C2185B] text-xs font-bold text-black placeholder-stone-500 uppercase"
              />
              {activationError && (
                <p className="text-[10px] text-red-650 font-bold uppercase">{activationError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOrderActivationTarget(null);
                    setActivationCaptchaInput('');
                    setActivationError('');
                  }}
                  className="w-1/2 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black rounded-lg transition"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (activationCaptchaInput.trim() !== "ACTIVATE") {
                      setActivationError("Code mismatch. Please type exactly 'ACTIVATE'.");
                      return;
                    }
                    try {
                      const ord = orderActivationTarget;
                      const refId = ord.referenceId || `MTS-TF-${Math.floor(100000 + Math.random() * 900000)}`;
                      
                      // 1. Move to Active Tiffin Customers in tiffinCustomers
                      const custRef = doc(db, 'tiffinCustomers', refId);
                      const prefStr = (ord.plan || '').toLowerCase().includes('non') ? 'Non-Veg' : 'Veg';
                      
                      await setDoc(custRef, {
                        referenceId: refId,
                        name: ord.customerName || 'Customer',
                        phone: ord.phone || '',
                        email: ord.customerEmail || ord.email || '',
                        address: ord.address || '',
                        preference: prefStr,
                        monthlyPrice: Number(ord.amount) || 0,
                        balanceAmount: 0,
                        status: 'Active',
                        createdAt: ord.createdAt || new Date().toISOString(),
                        activatedAt: new Date().toISOString(),
                        todayDeliveryStatus: 'Not Started',
                        nextDeliveryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        userId: ord.userId || '',
                        orderId: ord.id,
                        planName: ord.plan || 'Tiffin Subscription'
                      }, { merge: true });

                      // 2. Set status to Active in tiffinOrders
                      const orderRef = doc(db, 'tiffinOrders', ord.id);
                      await updateDoc(orderRef, {
                        status: 'Active',
                        activatedAt: new Date().toISOString()
                      });

                      alert("Tiffin subscription successfully activated! Customer is now an Active Tiffin Subscriber.");
                      setOrderActivationTarget(null);
                      setActivationCaptchaInput('');
                      setActivationError('');
                    } catch (err: any) {
                      setActivationError("Error: " + err.message);
                    }
                  }}
                  className="w-1/2 py-2.5 bg-[#C2185B] hover:bg-[#a0134b] text-white text-xs font-black rounded-lg transition shadow-sm uppercase tracking-wider"
                >
                  CONFIRM ACTIVATION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
