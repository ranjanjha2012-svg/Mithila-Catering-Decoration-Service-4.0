import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { 
  collection, query, getDocs, doc, updateDoc, addDoc, deleteDoc, where, orderBy 
} from 'firebase/firestore';
import { 
  User as UserIcon, Shield, LogOut, CheckCircle, Clock, Search, ListFilter,
  DollarSign, FileText, Settings, UserCheck, Calendar, MapPin, Sparkles, Send, Phone,
  Coffee, ChevronRight, Calculator, CheckSquare, Plus, Trash2, Mail, ShoppingBag, Layers,
  Activity, Tag, ExternalLink, Loader2, X
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
  orderDate?: string;
  orderTime?: string;
  paymentMethod: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Archived';
  createdAt: string;
  userId: string;
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

  // Filters and Builders state
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending' | 'Approved' | 'Delivered' | 'Archived'>('All');
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const savedRole = localStorage.getItem('userRole');
        
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

    return () => unsubscribe();
  }, []);

  const fetchAdminData = async (adminUid: string) => {
    setLoadingDb(true);
    try {
      // 1. Fetch customer online orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const ordersList: FirestoreOrder[] = [];
      ordersSnap.forEach((doc) => {
        const data = doc.data();
        ordersList.push({
          id: doc.id,
          customerName: data.customerName || '',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || '',
          items: data.items || [],
          subtotal: data.subtotal || 0,
          packingCharge: data.packingCharge || 0,
          deliveryCharge: data.deliveryCharge || 0,
          totalAmount: data.totalAmount || 0,
          address: data.address || '',
          location: data.location || '',
          orderDate: data.orderDate || '',
          orderTime: data.orderTime || '',
          paymentMethod: data.paymentMethod || 'COD',
          status: data.status || 'Pending',
          createdAt: data.createdAt || '',
          userId: data.userId || ''
        });
      });
      // Sort orders by creation date descending
      ordersList.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setOrders(ordersList);

      // 2. Fetch jobs posted by ONLY this admin
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

      // 3. Fetch all job candidate submissions
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

    } catch (error) {
      console.error("Error loading admin collections:", error);
    } finally {
      setLoadingDb(false);
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
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: nextStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update status. Please try again.");
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
          <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30 text-white font-black">
            MT
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
                {orders.filter(o => o.status === 'Pending').length > 0 && (
                  <span className="ml-auto w-5 h-5 bg-orange-150 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black border border-orange-100">
                    {orders.filter(o => o.status === 'Pending').length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black transition-all ${activeTab === 'jobs' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/10' : 'text-stone-700 hover:bg-stone-50'}`}
              >
                <Layers size={16} />
                <span>Active Job Openings</span>
                <span className="ml-auto text-[10px] bg-stone-100 px-1.5 py-0.5 rounded font-bold text-stone-500">
                  {jobs.length} open
                </span>
              </button>

              <button
                onClick={() => setActiveTab('resumes')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-black transition-all ${activeTab === 'resumes' ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/10' : 'text-stone-700 hover:bg-stone-50'}`}
              >
                <UserCheck size={16} />
                <span>Careers Applications</span>
                {applications.filter(a => a.status === 'Pending').length > 0 && (
                  <span className="ml-auto w-5 h-5 bg-orange-150 text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black border border-orange-100">
                    {applications.filter(a => a.status === 'Pending').length}
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
                <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-black text-rose-950 tracking-tight">Food Delivery Orders</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase mt-1">Total Placed: {orders.length} orders</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value as any)}
                        className="text-xs font-bold border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 text-stone-700 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                      >
                        <option value="All">All statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {orders
                      .filter(o => orderFilter === 'All' || o.status === orderFilter)
                      .map((order) => (
                        <div 
                          key={order.id}
                          className="bg-neutral-50/50 hover:bg-white border border-neutral-150 rounded-2xl p-6 transition-all duration-300"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-rose-950">{order.customerName}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-black uppercase ${
                                  order.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                  order.status === 'Delivered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  order.status === 'Archived' ? 'bg-stone-50 text-stone-500 border-stone-200' :
                                  'bg-amber-150 text-amber-800 border-amber-200 animate-pulse'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex gap-4 mt-2 text-[11px] text-stone-400 font-semibold uppercase">
                                <span>Phone: {order.customerPhone}</span>
                                <span>Pay: <strong className="text-stone-700 font-black">{order.paymentMethod}</strong></span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-stone-400 text-[10px] font-bold block uppercase">Date Created:</span>
                              <span className="font-mono text-stone-500 text-[11px] font-semibold">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>

                          {/* Ordered Menu list */}
                          <div className="bg-white p-4 rounded-xl border border-stone-100 mb-4 space-y-2.5">
                            <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider block">Menu Items Purchased:</span>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs font-semibold text-stone-700">
                                <span>{it.quantity}x {it.name} {it.size && it.size !== 'single' ? `(${it.size})` : ''}</span>
                                <span className="font-bold text-stone-900">₹{it.price * it.quantity}</span>
                              </div>
                            ))}

                            <div className="border-t border-stone-100 pt-3 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] font-bold text-stone-400">Address: <span className="text-stone-600 font-semibold">{order.address}, {order.location}</span></p>
                                {order.orderDate && (
                                  <p className="text-[10px] font-bold text-stone-400 mt-0.5">Scheduler: <span className="text-orange-600 font-bold">{order.orderDate} - {order.orderTime}</span></p>
                                )}
                              </div>
                              <span className="text-lg font-black text-orange-600">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          {/* Order Actions */}
                          <div className="flex flex-wrap gap-2.5 justify-end">
                            {order.status === 'Pending' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Approved')}
                                className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-black transition-colors"
                              >
                                Approve Order
                              </button>
                            )}
                            {order.status === 'Approved' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition-colors"
                              >
                                Mark Delivered
                              </button>
                            )}
                            {order.status !== 'Archived' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'Archived')}
                                className="px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-lg text-xs font-bold transition-colors"
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                    {orders.length === 0 && (
                      <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-stone-200 border-dashed">
                        <ShoppingBag className="mx-auto text-stone-300 mb-2" size={36} />
                        <p className="text-stone-400 text-xs font-black uppercase">No Online orders active on store.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===================== ACTIVE JOBS PANEL ===================== */}
              {activeTab === 'jobs' && (
                <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex justify-between items-center gap-4 border-b border-stone-50 pb-4">
                    <div>
                      <h3 className="text-xl font-black text-rose-950 tracking-tight">Your Recruitment Openings</h3>
                      <p className="text-xs text-stone-400 font-bold uppercase mt-1">Manage jobs hosted by you ({jobs.length})</p>
                    </div>

                    <button
                      onClick={() => setShowJobModal(true)}
                      className="px-4 py-2 bg-stone-900 hover:bg-orange-600 text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus size={14} />
                      Post Career
                    </button>
                  </div>

                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div 
                        key={job.id}
                        className="bg-white border border-stone-200 rounded-2xl p-6 relative hover:shadow-md transition-all duration-300"
                      >
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="absolute top-6 right-6 p-2 bg-stone-50 hover:bg-rose-50 rounded-lg text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>

                        <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider">{job.department}</span>
                        <h4 className="text-base font-black text-rose-955 mt-0.5">{job.title}</h4>
                        
                        <div className="flex flex-wrap gap-4 mt-2 text-xs font-bold text-stone-500">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                          <span className="flex items-center gap-1 text-orange-600"><DollarSign size={12} /> {job.salary}</span>
                        </div>

                        <p className="text-stone-600 text-xs mt-3 leading-relaxed font-semibold">{job.description}</p>

                        {job.requirements && job.requirements.length > 0 && (
                          <div className="mt-4 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
                            <span className="text-[10px] font-black text-stone-400 uppercase block mb-1">Pre-requisite Skills:</span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {job.requirements.map((req, rid) => (
                                <span key={rid} className="px-2.5 py-0.5 bg-white text-stone-600 text-[10px] font-black rounded-md border border-stone-100">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {jobs.length === 0 && (
                      <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-stone-200 border-dashed">
                        <Layers className="mx-auto text-stone-300 mb-2" size={36} />
                        <p className="text-stone-400 text-xs font-black uppercase">You haven't posted any jobs yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===================== CAREERS APPLICATIONS VIEWER ===================== */}
              {activeTab === 'resumes' && (
                <div className="bg-white border border-stone-200/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-rose-955 tracking-tight">Candidates Resume Ledger</h3>
                    <p className="text-xs text-stone-400 font-bold uppercase mt-1">Review candidates applied via Careers webpage ({applications.length})</p>
                  </div>

                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div 
                        key={app.id}
                        className="bg-stone-50/40 hover:bg-white border border-stone-150 rounded-2xl p-6 transition-all duration-300"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-4">
                          <div>
                            <span className="text-[9px] font-black uppercase text-stone-400">Position Profile:</span>
                            <h4 className="text-base font-black text-rose-955 mt-0.5">{app.jobTitle}</h4>
                            <div className="flex gap-4 mt-1.5 text-xs text-stone-500 font-bold">
                              <span>Applicant: {app.applicantName}</span>
                              <span>Exp: {app.experience}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] px-3 py-1 bg-white hover:bg-stone-50 text-stone-800 rounded-xl font-black border uppercase ${
                            app.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                            app.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            app.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 bg-white p-4 rounded-xl border border-stone-100/50 mb-4 font-medium leading-relaxed">
                          <p className="text-[9px] font-black text-stone-400 uppercase tracking-wider mb-1.5">Applicant Cover Statement:</p>
                          {app.coverLetter}
                          
                          <div className="mt-3 pt-3 border-t border-stone-100/70 grid grid-cols-2 gap-4 text-stone-500 font-semibold text-[11px]">
                            <span>Email: <a href={`mailto:${app.applicantEmail}`} className="text-orange-600 hover:underline">{app.applicantEmail}</a></span>
                            <span>Phone: <a href={`tel:${app.applicantPhone}`} className="text-orange-600 hover:underline">{app.applicantPhone}</a></span>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                          {app.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'Reviewed')}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition-colors"
                            >
                              Mark Reviewed
                            </button>
                          )}
                          {app.status !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'Approved')}
                              className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-black transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {app.status !== 'Declined' && (
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, 'Declined')}
                              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-black transition-colors"
                            >
                              Decline candidate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {applications.length === 0 && (
                      <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-stone-200 border-dashed">
                        <UserCheck className="mx-auto text-stone-300 mb-2" size={36} />
                        <p className="text-stone-400 text-xs font-black uppercase">No direct applications submitted yet.</p>
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
    </div>
  );
}
