import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, MapPin, DollarSign, Clock, FileText, Send, User, Phone, Mail, 
  Sparkles, CheckCircle2, ChevronRight, X, Loader2, AlertCircle 
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, addDoc, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import Header from './Header';
import Footer from './Footer';
import CurtainLoader from './CurtainLoader';

// Types as defined in blueprint
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

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'applications'>('listings');
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '1 Year',
    coverLetter: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Listen to Auth State
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      if (usr && (usr.emailVerified || usr.providerData.some(p => p.providerId === 'google.com'))) {
        setCurrentUser(usr);
        // Pre-fill form if display details are known
        setFormData(prev => ({
          ...prev,
          name: usr.displayName || '',
          email: usr.email || ''
        }));
      } else {
        setCurrentUser(null);
      }
    });

    fetchJobs();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications' && currentUser) {
      fetchUserApplications();
    }
  }, [activeTab, currentUser]);

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
      console.error("Error fetching jobs:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchUserApplications = async () => {
    if (!currentUser) return;
    setLoadingApps(true);
    try {
      const q = query(
        collection(db, 'applications'),
        where('userId', '==', currentUser.uid)
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
      console.error("Error fetching applications:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApplyClick = (job: JobPost) => {
    if (!currentUser) {
      // Trigger global Login Modal
      window.dispatchEvent(new CustomEvent('open-mithila-auth'));
      return;
    }
    setSelectedJob(job);
    setMessage(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedJob) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const newApp = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        userId: currentUser.uid,
        applicantName: formData.name,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        experience: formData.experience,
        coverLetter: formData.coverLetter,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'applications'), newApp);
      setMessage({ type: 'success', text: 'Application submitted successfully! Our HR team will contact you shortly.' });
      setFormData(prev => ({ ...prev, phone: '', coverLetter: '' }));
      
      // Refresh applications if in background
      if (activeTab === 'applications') {
        fetchUserApplications();
      }

      setTimeout(() => {
        setSelectedJob(null);
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      setMessage({ type: 'error', text: 'Failed to submit application. Please verify connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-orange-50/40">
      <CurtainLoader />
      <Header />

      <main className="pt-32 pb-24">
        {/* Banner Section */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4"
            >
              <Briefcase size={16} />
              Catering Careers
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-rose-950 mb-4 tracking-tight">Join Our Heritage</h1>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm md:text-base">
              Spread premium traditional flavors and luxurious culinary setups with Mithila Catering. Explore our active careers or view applications.
            </p>

            {currentUser && (
              <div className="flex justify-center gap-3 mt-8">
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                    activeTab === 'listings' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  Job Listings
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                    activeTab === 'applications' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  My Applied Jobs ({userApplications.length})
                </button>
              </div>
            )}
          </div>

          {activeTab === 'listings' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {loadingJobs ? (
                <div className="flex flex-col items-center py-16">
                  <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                  <p className="text-xs text-stone-400 font-extrabold mt-3">Loading active jobs list...</p>
                </div>
              ) : (
                <>
                  {/* Dynamic jobs from database */}
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-orange-50">
                        <div>
                          <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">{job.department}</span>
                          <h3 className="text-xl font-black text-rose-950 mt-1">{job.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-50 text-stone-600 text-xs font-bold rounded-lg border border-stone-100">
                            <MapPin size={12} className="text-orange-500" /> {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-black rounded-lg border border-orange-100/50">
                            <DollarSign size={12} /> {job.salary}
                          </span>
                        </div>
                      </div>

                      <p className="text-stone-600 text-sm leading-relaxed mb-6">{job.description}</p>
                      
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-6 bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                          <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-2">Pre-requisites:</h4>
                          <ul className="space-y-1.5 text-xs text-stone-600 font-medium">
                            {job.requirements.map((req, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => handleApplyClick(job)}
                        className="w-full md:w-auto px-6 py-3 bg-stone-900 hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        Apply for Job
                      </button>
                    </motion.div>
                  ))}

                  {/* Static Default opportunities */}
                  {staticJobs.map((sJob, sIdx) => (
                    <motion.div
                      key={`static-job-${sIdx}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/60 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100">
                        <div>
                          <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">{sJob.department}</span>
                          <h3 className="text-xl font-black text-rose-950 mt-1">{sJob.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-50 text-stone-600 text-xs font-bold rounded-lg border border-stone-100">
                            <MapPin size={12} className="text-orange-500" /> {sJob.location}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-stone-50 text-stone-700 text-xs font-black rounded-lg border border-stone-100">
                            <DollarSign size={12} /> {sJob.salary}
                          </span>
                        </div>
                      </div>

                      <p className="text-stone-600 text-sm leading-relaxed mb-6">{sJob.description}</p>
                      
                      <div className="mb-6 bg-stone-50/50 p-5 rounded-2xl border border-stone-100">
                        <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider mb-2">Pre-requisites:</h4>
                        <ul className="space-y-1.5 text-xs text-stone-600 font-medium">
                          {sJob.requirements.map((req, rIdx) => (
                            <li key={rIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleApplyClick({
                          id: `static-${sIdx}`,
                          title: sJob.title,
                          description: sJob.description,
                          department: sJob.department,
                          salary: sJob.salary,
                          location: sJob.location,
                          requirements: sJob.requirements,
                          createdBy: 'admin',
                          createdAt: null
                        })}
                        className="w-full md:w-auto px-6 py-3 bg-stone-900 hover:bg-orange-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        Apply for Job
                      </button>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          ) : (
            /* Applications toggle viewer */
            <div className="max-w-4xl mx-auto space-y-6">
              {loadingApps ? (
                <div className="flex flex-col items-center py-16">
                  <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                  <p className="text-xs text-stone-400 font-extrabold mt-3">Fetching your submissions history...</p>
                </div>
              ) : (
                <>
                  {userApplications.map((appItem) => (
                    <motion.div
                      key={appItem.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-3xl p-6 md:p-8 border border-stone-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Position Applied:</span>
                        <h3 className="text-lg font-black text-rose-950 mt-0.5">{appItem.jobTitle}</h3>
                        
                        <div className="mt-4 space-y-1.5 text-xs text-stone-500 font-medium">
                          <p>Applicant Name: <span className="font-bold text-stone-700">{appItem.applicantName}</span></p>
                          <p>Reference Contact: {appItem.applicantPhone}</p>
                          <p>Experience Specified: {appItem.experience}</p>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-start md:items-end gap-2 shrink-0">
                        <span className="text-[10px] text-stone-400 font-bold block">Application Status:</span>
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-black rounded-xl uppercase border ${
                          appItem.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                          appItem.status === 'Reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          appItem.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <Sparkles size={12} /> {appItem.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {userApplications.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-stone-100 p-8">
                      <Briefcase size={40} className="text-stone-300 mx-auto mb-4" />
                      <h3 className="text-lg font-black text-stone-800">No Job Submissions Yet</h3>
                      <p className="text-stone-400 text-xs font-medium mt-1">Explore our heritage careers from listings and submit your first application today!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Application Submission Form Modal */}
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
              >
                <X size={20} className="text-stone-400" />
              </button>

              <div className="mb-8">
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">Submit Application</span>
                <h3 className="text-2xl md:text-3xl font-black text-rose-955 mt-0.5">{selectedJob.title}</h3>
                <p className="text-stone-400 text-xs font-medium mt-1">Join Mithila Catering Hospitality Crew</p>
              </div>

              {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-start gap-2 ${
                  message.type === 'success' ? 'bg-green-50 text-green-700 border-l-4 border-green-500' : 'bg-red-50 text-red-700 border-l-4 border-red-500'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                      <User size={12} /> Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-neutral-800"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                      <Mail size={12} /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-neutral-800"
                      placeholder="Your active email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                      <Phone size={12} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-neutral-800"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                      Experience
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-neutral-800"
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                    <FileText size={12} /> Introduce Yourself / Describe Experience
                  </label>
                  <textarea
                    required
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                    rows={4}
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-100 rounded-xl focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-neutral-800 resize-none font-medium"
                    placeholder="Briefly state why you would like to join our heritage culinary operations..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>Submitting Resume... <Loader2 size={16} className="animate-spin" /></>
                  ) : (
                    <>Submit Application <Send size={14} /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
