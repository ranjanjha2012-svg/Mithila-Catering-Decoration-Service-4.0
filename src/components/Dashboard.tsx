import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  User as UserIcon, Shield, LogOut, CheckCircle, Clock, Search, ListFilter,
  DollarSign, FileText, Settings, UserCheck, Calendar, MapPin, Sparkles, Send, Phone,
  Coffee, ChevronRight, Calculator, CheckSquare
} from 'lucide-react';

type UserRole = 'customer' | 'admin';

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

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'INQ-402',
    name: 'Ramesh Kumar Jha',
    phone: '+91 9876543210',
    email: 'ramesh.jha@gmail.com',
    event: 'Sacred Thread Ceremony (Upanayana)',
    date: '2026-06-15',
    guests: 250,
    package: 'Mithilanchal Feast Special',
    status: 'Pending',
    location: 'Darbhanga, Bihar'
  },
  {
    id: 'INQ-403',
    name: 'Abhay Mishra',
    phone: '+91 9654123580',
    email: 'abhay.mishra@outlook.com',
    event: 'Grand Wedding Reception',
    date: '2026-07-02',
    guests: 400,
    package: 'Luxury Wedding Buffet (Pure Veg)',
    status: 'Contacted',
    location: 'Sarisab Pahi, Madhubani'
  },
  {
    id: 'INQ-404',
    name: 'Shreya Sharma',
    phone: '+91 9582146973',
    email: 'shreya.sharma@yahoo.com',
    event: 'First Birthday Celebration',
    date: '2026-06-20',
    guests: 80,
    package: 'Deluxe Party Bites & Starters',
    status: 'Approved',
    location: 'Sector 62, Noida'
  },
  {
    id: 'INQ-405',
    name: 'Pushpa Jha',
    phone: '+91 9312456789',
    email: 'pushpa.jha@gmail.com',
    event: 'Family Upananayam Gathering',
    date: '2026-06-25',
    guests: 180,
    package: 'Traditional Mithila Thali',
    status: 'Pending',
    location: 'Patna, Bihar'
  },
  {
    id: 'INQ-406',
    name: 'Vikram Aditya Roy',
    phone: '+91 9999888812',
    email: 'vikram.roy@techcorp.com',
    event: 'Annual Corporate Meet',
    date: '2026-08-10',
    guests: 150,
    package: 'Premium B2B Executive Platter',
    status: 'Archived',
    location: 'DLF CyberCity, Gurugram'
  }
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);

  // Layout Subsections
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Customer State
  const [guestCount, setGuestCount] = useState<number>(100);
  const [selectedPackage, setSelectedPackage] = useState<string>('mithila-feast');
  const [selectedItems, setSelectedItems] = useState<string[]>(['Macha', 'Dahi Vada', 'Kheer']);

  // Admin State
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('mithila_inquiries');
    return saved ? JSON.parse(saved) : INITIAL_INQUIRIES;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Contacted' | 'Approved' | 'Archived'>('All');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && (currentUser.emailVerified || currentUser.providerData.some(p => p.providerId === 'google.com'))) {
        setUser(currentUser);
        // Load role from localStorage
        const savedRole = localStorage.getItem('userRole') as UserRole;
        setRole(savedRole || 'customer');
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save admin inquiries state inside local storage
  useEffect(() => {
    localStorage.setItem('mithila_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userRole');
      window.location.href = '/';
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleUpdateInquiryStatus = (id: string, newStatus: Inquiry['status']) => {
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
  };

  // Cost estimates for Customer Planner
  const PACKAGES = {
    'mithila-feast': { name: 'Mithilanchal Royal Feast', pricePerPlate: 450, desc: 'Authentic Traditional flavors including Macha (Fish), Rice, Dal, Sabji, Dahi Vada, Maithilik sweets.' },
    'corporate-combo': { name: 'Executive Premium Platter', pricePerPlate: 380, desc: 'Professional Indian & Continental fusion catered exquisitely for business meets and parties.' },
    'delux-party': { name: 'Deluxe Celebrations Combo', pricePerPlate: 400, desc: 'Rich multi-course North Indian setup designed for grand birthdays, kitties, and events.' },
    'starters-only': { name: 'Cocktail & Starters Plate', pricePerPlate: 250, desc: 'Scrumptious assortments of 6 signature hot finger starters & traditional street appetizers.' }
  };

  const extraItems = [
    { id: 'Macha', name: 'Fresh Mithila Fish Curry (Macha)', price: 120 },
    { id: 'Dahi Vada', name: 'Traditional Soft Dahi Vada', price: 40 },
    { id: 'Kheer', name: 'Makhana & Kesar Rabdi Kheer', price: 50 },
    { id: 'Paneer Pasanda', name: 'Mithila Spiced Shahi Paneer', price: 60 },
    { id: 'Litti Chokha', name: 'Clay Oven Smoked Litti Chokha', price: 70 },
  ];

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    );
  };

  const currentPackageInfo = PACKAGES[selectedPackage as keyof typeof PACKAGES] || PACKAGES['mithila-feast'];
  const baseCost = currentPackageInfo.pricePerPlate * guestCount;
  const extrasCost = selectedItems.reduce((acc, itemId) => {
    const item = extraItems.find(x => x.id === itemId);
    return acc + (item ? item.price : 0);
  }, 0) * guestCount;
  const totalCost = baseCost + extrasCost;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="w-14 h-14 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-orange-900 font-bold mt-4 animate-pulse">Loading dashboard environment...</p>
      </div>
    );
  }

  // Route Guard: if user is not logged in, stop render and show visual warning
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg mt-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-orange-100"
        >
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-black text-neutral-800 tracking-tight">Unauthorized Access</h2>
          <p className="text-neutral-500 mt-2 text-sm leading-relaxed">
            Please log in or sign up first to view your personalized catering and event planning dashboard.
          </p>
          <div className="mt-8 space-y-3">
            <a
              href="/"
              className="block w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-2xl transition-all shadow-md active:scale-[0.99]"
            >
              Back to Home
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-12 max-w-7xl">
      {/* Upper Account Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-orange-600 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl mb-8 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-orange-500/20 rounded-full pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-24 w-48 h-48 bg-orange-700/10 rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            {role === 'admin' ? <Shield size={28} className="text-white" /> : <UserIcon size={28} className="text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">
                Namaste, {user.displayName || user.email?.split('@')[0]}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 font-bold uppercase rounded-full ${role === 'admin' ? 'bg-neutral-900 text-yellow-400' : 'bg-white/20 text-white'}`}>
                {role === 'admin' ? 'Admin Store' : 'Customer'}
              </span>
            </div>
            <p className="text-orange-100 text-xs md:text-sm mt-0.5 font-medium">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full md:w-auto">
          <button 
            onClick={handleLogout}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-black/20 hover:bg-black/30 text-white font-bold rounded-2xl border border-white/15 transition-all text-sm active:scale-[0.98]"
            id="dashboard-logout-btn"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>

      {role === 'admin' ? (
        /* ==================== ADMIN DASHBOARD ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side navigation */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 px-2">Catering Console</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/10' : 'text-gray-700 hover:bg-orange-50'}`}
                >
                  <ListFilter size={18} />
                  <span>Enquiries Live</span>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/10' : 'text-gray-700 hover:bg-orange-50'}`}
                >
                  <DollarSign size={18} />
                  <span>Catering Analytics</span>
                </button>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-100/50 rounded-3xl p-5 text-center">
              <h4 className="font-extrabold text-orange-950 text-sm">Need Service Support?</h4>
              <p className="text-xs text-orange-900/70 mt-1">If there are any system queries or technical updates required, write to contact.</p>
              <a 
                href="mailto:ranjanjha2012@gmail.com" 
                className="inline-block mt-3 px-4 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-extrabold hover:bg-orange-700"
              >
                Send Support Mail
              </a>
            </div>
          </div>

          {/* Main admin view panel */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-6">
                
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-neutral-800 tracking-tight">Active Inquiries</h3>
                    <p className="text-xs text-neutral-400 font-bold uppercase mt-0.5 font-mono">Total Found ({inquiries.length})</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 md:flex-none">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search Guest name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-48 pl-10 pr-4 py-2 border border-neutral-200 focus:border-orange-500 rounded-xl text-xs outline-none font-semibold text-neutral-800"
                      />
                    </div>

                    {/* Filter selector */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="border border-neutral-200 px-3 py-2 focus:border-orange-500 rounded-xl text-xs font-bold text-neutral-700 bg-white"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Approved">Approved</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

                {/* Inquiries Table or Listing Grid */}
                <div className="space-y-4">
                  {inquiries
                    .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter === 'All' || i.status === statusFilter))
                    .map((inq) => (
                      <motion.div
                        layout
                        key={inq.id}
                        className="p-5 border border-neutral-100 rounded-2xl hover:border-orange-100 bg-neutral-50/50 hover:bg-white transition-all grid grid-cols-1 md:grid-cols-3 gap-4 items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-neutral-800 text-base">{inq.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black ${
                              inq.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              inq.status === 'Contacted' ? 'bg-blue-100 text-blue-700' :
                              inq.status === 'Archived' ? 'bg-neutral-200 text-neutral-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-xs text-orange-850 font-bold mt-1 inline-flex items-center gap-1">
                            <Calendar size={12} /> {inq.event}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin size={12} /> {inq.location}
                          </p>
                        </div>

                        <div className="text-left md:text-center space-y-1">
                          <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider">
                            Guests: <span className="text-neutral-800 font-black">{inq.guests}</span>
                          </p>
                          <p className="text-xs text-neutral-500 font-bold">
                            Package: <span className="text-gray-700 text-xs font-medium">{inq.package}</span>
                          </p>
                          <p className="text-xs font-mono text-gray-500">Date: {inq.date}</p>
                        </div>

                        <div className="flex flex-wrap justify-start md:justify-end gap-2">
                          {inq.status !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'Approved')}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-black transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {inq.status !== 'Contacted' && inq.status !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'Contacted')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition-colors"
                            >
                              Contacted
                            </button>
                          )}
                          {inq.status !== 'Archived' && (
                            <button
                              onClick={() => handleUpdateInquiryStatus(inq.id, 'Archived')}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-black transition-colors"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}

                  {inquiries.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter === 'All' || i.status === statusFilter)).length === 0 && (
                    <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      <p className="text-neutral-500 text-sm font-bold">No catering inquiries found matching filters.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-neutral-800 tracking-tight">Catering Business Analytics</h3>
                  <p className="text-xs text-neutral-500 font-semibold mt-0.5">Real-time catering business revenue predictions & stats based on active bookings.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200/50">
                    <h4 className="text-xs font-black text-orange-900 uppercase tracking-widest">Estimated Gross Revenue</h4>
                    <p className="text-3xl font-black text-orange-700 mt-2">
                       ₹{(inquiries.filter(i => i.status === 'Approved').reduce((acc, current) => acc + (current.guests * 450), 0) + 120000).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[10px] text-orange-800 font-bold block mt-1">Based on Approved Event Bookings (₹450/Plate avg)</span>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50">
                    <h4 className="text-xs font-black text-green-950 uppercase tracking-widest">Active Conversions</h4>
                    <p className="text-3xl font-black text-green-700 mt-2">
                      {Math.round((inquiries.filter(i => i.status === 'Approved' || i.status === 'Contacted').length / inquiries.length) * 100)}%
                    </p>
                    <span className="text-[10px] text-green-800 font-bold block mt-1">Conversion of general enquiries to events</span>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border border-neutral-200/50">
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Total Guest Footprint</h4>
                    <p className="text-3xl font-black text-neutral-700 mt-2">
                      {inquiries.reduce((acc, current) => acc + current.guests, 0)} Guests
                    </p>
                    <span className="text-[10px] text-neutral-500 font-bold block mt-1">Planned capacity across upcoming events</span>
                  </div>
                </div>

                <div className="p-5 border border-neutral-100 rounded-2xl bg-neutral-50/50">
                  <h4 className="font-extrabold text-neutral-800 text-sm">Event Volume Breakdown</h4>
                  <div className="space-y-3 mt-4">
                    <div>
                      <div className="flex justify-between text-xs text-neutral-600 font-bold mb-1">
                        <span>Traditional Upanayana Thread Ceremonies</span>
                        <span>{inquiries.filter(i => i.event.includes('Upanayana')).length} Bookings</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="bg-orange-600 h-full rounded-full" style={{ width: `${(inquiries.filter(i => i.event.includes('Upanayana')).length / inquiries.length) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-neutral-600 font-bold mb-1">
                        <span>Grand Weddings & Receptions</span>
                        <span>{inquiries.filter(i => i.event.includes('Wedding')).length} Bookings</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full rounded-full" style={{ width: `${(inquiries.filter(i => i.event.includes('Wedding')).length / inquiries.length) * 100}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-neutral-600 font-bold mb-1">
                        <span>Birthdays & Kitties</span>
                        <span>{inquiries.filter(i => i.event.includes('Birthday')).length} Bookings</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(inquiries.filter(i => i.event.includes('Birthday')).length / inquiries.length) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================== CUSTOMER DASHBOARD ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side navigation */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 px-2">Customer Hub</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/10' : 'text-gray-700 hover:bg-orange-50'}`}
                >
                  <Calculator size={18} />
                  <span>Menu Cost Calculator</span>
                </button>
                <button
                  onClick={() => setActiveTab('tiffin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${activeTab === 'tiffin' ? 'bg-orange-600 text-white shadow-md shadow-orange-500/10' : 'text-gray-700 hover:bg-orange-50'}`}
                >
                  <Coffee size={18} />
                  <span>Tiffin Subscriptions</span>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 rounded-3xl p-5 text-center">
              <Sparkles size={24} className="text-orange-600 mx-auto mb-2 animate-bounce" />
              <h4 className="font-extrabold text-orange-950 text-sm">Need Custom Planning?</h4>
              <p className="text-xs text-orange-900/70 mt-1">Talk to our experts directly for custom pricing, items, and arrangements!</p>
              <a 
                href="/planner.html"
                className="inline-block mt-4 w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-extrabold transition-colors shadow"
              >
                Launch Mithila AI Planner
              </a>
            </div>
          </div>

          {/* Main customer view panel */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-neutral-800 tracking-tight">Interactive Event & Menu Cost Estimator</h3>
                  <p className="text-xs text-neutral-500 font-semibold mt-0.5">Define your guest count and choose packages to estimate catering costs instantly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column Controls */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Number of Guests</label>
                      <input
                        type="range"
                        min="50"
                        max="1000"
                        step="10"
                        value={guestCount}
                        onChange={(e) => setGuestCount(Number(e.target.value))}
                        className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                      <div className="flex justify-between items-center mt-2.5">
                        <span className="text-xs text-neutral-400 font-semibold">Min: 50</span>
                        <span className="text-sm px-3 py-1 bg-orange-50 text-orange-700 rounded-lg font-black border border-orange-100">{guestCount} Guests</span>
                        <span className="text-xs text-neutral-400 font-semibold">Max: 1000</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Select Catering Platter Package</label>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(PACKAGES).map(([key, pack]) => (
                          <label
                            key={key}
                            onClick={() => setSelectedPackage(key)}
                            className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${
                              selectedPackage === key ? 'border-orange-500 bg-orange-50/40 text-orange-900 shadow-sm' : 'border-neutral-200 hover:border-orange-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black">{pack.name}</span>
                              <span className="text-xs font-extrabold text-orange-600">₹{pack.pricePerPlate}/Plate</span>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 leading-relaxed">{pack.desc}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column Custom Addons & Output */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Include Traditional Mithila Extras (Per Plate)</label>
                      <div className="space-y-1.5 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                        {extraItems.map((item) => (
                          <label key={item.id} className="flex items-center gap-3 cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleItemToggle(item.id)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                            />
                            <div className="flex justify-between w-full text-xs font-medium text-neutral-700">
                              <span>{item.name}</span>
                              <span className="font-bold text-orange-600">+₹{item.price}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Total Estimate Calculation Block */}
                    <div className="p-5 bg-neutral-900 text-white rounded-3xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-orange-400 tracking-widest flex items-center gap-2">
                        <Calculator size={14} /> Total Cost Estimate
                      </h4>

                      <div className="space-y-1.5 text-xs text-neutral-300">
                        <div className="flex justify-between">
                          <span>Base Platter: {guestCount} x ₹{currentPackageInfo.pricePerPlate}</span>
                          <span>₹{baseCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Traditional Extras:</span>
                          <span> ₹{extrasCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t border-white/10 my-2 pt-2 flex justify-between font-extrabold text-neutral-100">
                          <span>Subtotal Estimate</span>
                          <span>₹{(totalCost).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="bg-white/10 rounded-2xl p-3 text-[11px] text-orange-100/90 leading-relaxed">
                        ★ This estimate covers catering staff, professional decorations assistance, food warmers, and pristine plate setups.
                      </div>

                      <a
                        href="/contact.html"
                        className="block text-center py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl transition-all shadow text-xs"
                      >
                        Submit Official Enquiry With This Setup
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tiffin' && (
              <div className="bg-white border border-orange-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-neutral-800 tracking-tight">Your Tiffin Service Dashboard</h3>
                  <p className="text-xs text-neutral-500 font-semibold mt-0.5">Explore authentic, piping hot daily office/home delivery plans with custom options.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/50">
                    <h4 className="font-extrabold text-neutral-800 text-sm">Pure Vegetarian</h4>
                    <p className="text-xs text-gray-500 mt-1">4 Roti + Rice + Sabji + Dal + Salad + Sweet/Raita</p>
                    <p className="text-lg font-black text-orange-600 mt-3">₹2,700 /Month</p>
                    <a href="/tiffin.html" className="inline-block mt-3 text-xs font-bold text-orange-600 hover:text-orange-700">Explore Plan →</a>
                  </div>

                  <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/50">
                    <h4 className="font-extrabold text-neutral-800 text-sm">Fresh Egg Base</h4>
                    <p className="text-xs text-gray-500 mt-1">Daily Menu with extra nutritious egg-based premium meals</p>
                    <p className="text-lg font-black text-orange-600 mt-3">₹2,900 /Month</p>
                    <a href="/tiffin.html" className="inline-block mt-3 text-xs font-bold text-orange-600 hover:text-orange-700">Explore Plan →</a>
                  </div>

                  <div className="p-4 border border-neutral-100 rounded-2xl bg-neutral-50/50">
                    <h4 className="font-extrabold text-neutral-800 text-sm">Non-Veg Special</h4>
                    <p className="text-xs text-gray-500 mt-1">Succulent Chicken/Mutton curries twice on weekdays</p>
                    <p className="text-lg font-black text-orange-600 mt-3">₹3,100 /Month</p>
                    <a href="/tiffin.html" className="inline-block mt-3 text-xs font-bold text-orange-600 hover:text-orange-700">Explore Plan →</a>
                  </div>
                </div>

                <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="font-black text-neutral-800 text-sm">Need quick custom adjustments to daily tiffins?</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Pause your deliveries, change timing, or choose specific daily side dishes immediately.</p>
                  </div>
                  <a
                    href="https://wa.me/919650254164"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1.5"
                  >
                    <Send size={14} /> WhatsApp Support
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
