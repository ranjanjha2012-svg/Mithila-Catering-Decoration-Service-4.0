import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, arrayUnion, serverTimestamp, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  ShoppingBag, Clock, Package, HelpCircle, Loader2, ArrowRight, CheckCircle2,
  AlertTriangle, MessageSquare, Send, X, ShieldAlert, CreditCard, ClipboardCheck, AlertCircle, RefreshCw, Check, Search
} from 'lucide-react';

interface FirestoreOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  total?: number;
}

interface FirestoreOrder {
  id: string;
  items: FirestoreOrderItem[];
  subtotal: number;
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
  paymentFailureReason?: string;
  cancellationReason?: string;
  cancelledAt?: any;
  cancelledBy?: string;
  orderStatus?: string;
  locked?: boolean;
  isPermanentCancellation?: boolean;
  paymentStatus?: string;
  orderType?: string;
  referenceId?: string;
  tiffinReferenceId?: string;
  planName?: string;
  plan?: string;
  subscriptionType?: string;
}

export default function MyOrdersPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<FirestoreOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Help Center / AI Assistant Modal States
  const [selectedOrderForHelp, setSelectedOrderForHelp] = useState<FirestoreOrder | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');
  
  const [tiffinOrders, setTiffinOrders] = useState<any[]>([]);
  const [tiffinCustomers, setTiffinCustomers] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  // Tiffin tracker states for non-logged in direct tracking
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [trackerRefId, setTrackerRefId] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [trackerError, setTrackerError] = useState('');
  const [trackerResult, setTrackerResult] = useState<any | null>(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);
  const tiffinUnsubRef = useRef<(() => void) | null>(null);
  const tiffinCustomersUnsubRef = useRef<(() => void) | null>(null);
  const trackerUnsubRef = useRef<(() => void) | null>(null);

  const ordersUnsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserOrders(currentUser.uid);
        fetchUserTiffinOrders(currentUser.uid);
      } else {
        setUser(null);
        setOrders([]);
        setTiffinOrders([]);
        setTiffinCustomers([]);
        window.location.href = '/';
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (ordersUnsubscribeRef.current) {
        ordersUnsubscribeRef.current();
      }
      if (tiffinUnsubRef.current) {
        tiffinUnsubRef.current();
      }
      if (tiffinCustomersUnsubRef.current) {
        tiffinCustomersUnsubRef.current();
      }
      if (trackerUnsubRef.current) {
        trackerUnsubRef.current();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiTyping]);

  useEffect(() => {
    const q = collection(db, 'tiffinNotices');
    const unsub = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((dt) => {
        const data = dt.data();
        list.push({
          id: dt.id,
          ...data
        });
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setNotices(list);
    }, (error) => {
      console.error("Failed to load news notices: ", error);
    });

    return () => {
      unsub();
    };
  }, []);

  const fetchUserTiffinOrders = (userId: string) => {
    if (tiffinUnsubRef.current) {
      tiffinUnsubRef.current();
    }
    if (tiffinCustomersUnsubRef.current) {
      tiffinCustomersUnsubRef.current();
    }

    try {
      const q = query(
        collection(db, 'tiffinOrders'), 
        where('userId', '==', userId)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((dt) => {
          const data = dt.data();
          // Migration logic: If old records does not contain orderType "tiffin", write it to Firestore
          if (data.orderType !== 'tiffin') {
            updateDoc(doc(db, 'tiffinOrders', dt.id), { orderType: 'tiffin' })
              .catch(err => console.error("Error migrating tiffinOrders record to 'tiffin':", err));
          }
          list.push({
            id: dt.id,
            ...data,
            orderType: 'tiffin'
          });
        });
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        
        // Ensure only tiffin entries appear
        const filteredList = list.filter(item => 
          item.orderType === 'tiffin' || 
          item.referenceId?.startsWith('MTS-TF-')
        );

        console.log("Tiffin Orders:", filteredList);
        setTiffinOrders(filteredList);
      }, (err) => {
        console.error('Real-time sync of customer tiffin subscriptions failed: ', err);
      });

      tiffinUnsubRef.current = unsub;

      const qCust = query(collection(db, 'tiffinCustomers'), where('userId', '==', userId));
      const unsubCust = onSnapshot(qCust, (snapshot) => {
        const listCust: any[] = [];
        snapshot.forEach((doc) => {
          listCust.push({ id: doc.id, ...doc.data() });
        });
        setTiffinCustomers(listCust);
      }, (err) => {
        console.error('Real-time sync of active tiffin customers failed: ', err);
      });

      tiffinCustomersUnsubRef.current = unsubCust;
    } catch (err) {
      console.error('Error establishing real-time tiffin subscription log:', err);
    }
  };

  const handleTrackerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackerError('');
    setTrackerResult(null);

    const inputCode = captchaInput.toUpperCase().trim();
    if (inputCode !== captchaCode) {
      setTrackerError("CAPTCHA verification failed. Please verify exact characters.");
      generateCaptcha();
      return;
    }

    const trimmedRefId = trackerRefId.trim();
    if (!trimmedRefId) {
      setTrackerError("Please enter a valid Reference ID.");
      return;
    }

    if (trackerUnsubRef.current) {
      trackerUnsubRef.current();
      trackerUnsubRef.current = null;
    }

    setIsTracking(true);
    try {
      const docRef = doc(db, 'tiffinCustomers', trimmedRefId);
      const unsub = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setTrackerResult({ id: docSnap.id, ...docSnap.data() });
          setIsTracking(false);
        } else {
          // If the doc doesn't exist by direct ID, check if referenceId matches via query.
          const q = query(
            collection(db, 'tiffinCustomers'),
            where('referenceId', '==', trimmedRefId)
          );
          
          const queryUnsub = onSnapshot(q, (qSnap) => {
            if (!qSnap.empty) {
              const firstDoc = qSnap.docs[0];
              setTrackerResult({ id: firstDoc.id, ...firstDoc.data() });
              setIsTracking(false);
            } else {
              setTrackerError(`No active Tiffin subscription profile found matching reference tag "${trimmedRefId}". Keep in mind IDs are structured as MTS-TF-XXXXXX.`);
              generateCaptcha();
              setIsTracking(false);
            }
          }, (err) => {
            setTrackerError("Realtime sync failed: " + err.message);
            setIsTracking(false);
          });
          
          trackerUnsubRef.current = queryUnsub;
        }
      }, (err) => {
        console.error("Tracker snapshot failed:", err);
        setTrackerError("Live tracker sync connection disrupted. Reconnecting...");
        setIsTracking(false);
      });
      
      trackerUnsubRef.current = unsub;
    } catch (err: any) {
      console.error("Error direct tracking subscriber on orders dashboard:", err);
      setTrackerError("Failed to fetch current status: " + err.message);
      setIsTracking(false);
      generateCaptcha();
    }
  };

  const fetchUserOrders = (userId: string) => {
    setLoadingOrders(true);
    if (ordersUnsubscribeRef.current) {
      ordersUnsubscribeRef.current();
    }

    try {
      // Query on user's orders. To prevent index mismatch and support dynamic migration of 
      // old orders, we load all user orders and apply direct migration state checks inside the handler.
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', userId)
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const list: FirestoreOrder[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          
          // Identity & metadata check: Detect if it is a Tiffin Subscription in any form
          const isTiffinRef = data.referenceId?.startsWith('MTS-TF-') || data.tiffinReferenceId?.startsWith('MTS-TF-');
          const isTiffinType = data.orderType === 'tiffin';
          const isTiffinField = data.isTiffinOrder === true;
          const hasTiffinPlan = data.planName?.toLowerCase().includes('tiffin') || data.plan?.toLowerCase().includes('tiffin');
          const hasSubscription = !!data.subscriptionType;
          const hasTiffinInItems = data.items?.some((item: any) => 
            item.name?.toLowerCase().includes('tiffin') || item.size?.toLowerCase().includes('mts-tf')
          );

          const isReallyTiffin = isTiffinRef || isTiffinType || isTiffinField || hasTiffinPlan || hasSubscription || hasTiffinInItems;

          // Database on-the-fly migration: write missing orderType to Firestore for consistency
          if (isReallyTiffin) {
            if (data.orderType !== 'tiffin') {
              updateDoc(doc(db, 'orders', docSnap.id), { orderType: 'tiffin' })
                .catch(err => console.error("Error migrating orders record to 'tiffin':", err));
            }
          } else {
            if (data.orderType !== 'catering') {
              updateDoc(doc(db, 'orders', docSnap.id), { orderType: 'catering' })
                .catch(err => console.error("Error migrating orders record to 'catering':", err));
            }
          }

          list.push({
            id: docSnap.id,
            items: data.items || [],
            subtotal: data.subtotal || 0,
            totalAmount: data.totalAmount || 0,
            address: data.address || '',
            location: data.location || '',
            state: data.state || '',
            instructions: data.instructions || '',
            orderDate: data.orderDate || '',
            orderTime: data.orderTime || '',
            paymentMethod: data.paymentMethod || 'COD',
            status: data.status || 'Placed',
            createdAt: data.createdAt || '',
            userId: data.userId || '',
            paymentFailureReason: data.paymentFailureReason || '',
            cancellationReason: data.cancellationReason || '',
            cancelledAt: data.cancelledAt || null,
            cancelledBy: data.cancelledBy || '',
            orderStatus: data.orderStatus || '',
            locked: data.locked || false,
            isPermanentCancellation: data.isPermanentCancellation || false,
            paymentStatus: data.paymentStatus || '',
            orderType: isReallyTiffin ? 'tiffin' : 'catering',
            referenceId: data.referenceId,
            tiffinReferenceId: data.tiffinReferenceId,
            planName: data.planName,
            plan: data.plan,
            subscriptionType: data.subscriptionType
          });
        });

        // Sort newest first
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        
        // Filter catering orders strictly using both schema markers and fields (for Zero Duplication Guarantee)
        const filteredCateringList = list.filter(order => {
          const isTiffinRef = order.referenceId?.startsWith('MTS-TF-') || order.tiffinReferenceId?.startsWith('MTS-TF-');
          const isTiffinType = order.orderType === 'tiffin';
          const isTiffinField = (order as any).isTiffinOrder === true;
          const hasTiffinPlan = order.planName?.toLowerCase().includes('tiffin') || order.plan?.toLowerCase().includes('tiffin');
          const hasSubscription = !!order.subscriptionType;
          const hasTiffinInItems = order.items?.some(item => 
            item.name?.toLowerCase().includes('tiffin') || item.size?.toLowerCase().includes('mts-tf')
          );

          // Exclude any Tiffin orders from Catering list
          if (isTiffinRef || isTiffinType || isTiffinField || hasTiffinPlan || hasSubscription || hasTiffinInItems) {
            return false;
          }

          // Exclude pending/failed payment entries
          return order.status !== 'Pending Payment' && 
                 order.status !== 'Cancelled by Payment Failure' &&
                 order.paymentStatus !== 'Failed';
        });
        
        console.log("Catering Orders:", filteredCateringList);
        setOrders(filteredCateringList);
        setLoadingOrders(false);

        // Update selected order in help modal in real-time to reflect state changes
        if (selectedOrderForHelp) {
          const updated = filteredCateringList.find(o => o.id === selectedOrderForHelp.id);
          if (updated && updated.status !== selectedOrderForHelp.status) {
            setSelectedOrderForHelp(updated);
          }
        }
      }, (err) => {
        console.error('Real-time sync of customer orders failed: ', err);
        setLoadingOrders(false);
      });

      ordersUnsubscribeRef.current = unsub;
    } catch (err) {
      console.error('Error establishing order ledger logs:', err);
      setLoadingOrders(false);
    }
  };

  const handleOpenHelpCenter = (order: FirestoreOrder) => {
    setSelectedOrderForHelp(order);
    
    // Initialize chat messages with a friendly greeting
    const welcomeText = `Hello! I am your Mithila AI support agent. I'm connected to your Order Reference: **#${order.id.slice(-6).toUpperCase()}**. 
    
    How can I assist you with your catering package today? You can ask me about:
    * **Delivery estimate & scheduling details**
    * **Adding special delivery or chef instructions**
    * **Cancelling this order** (Note: cancellation is valid only before shipment, during the **Processing** stage).`;

    setChatMessages([
      { role: 'assistant', content: welcomeText }
    ]);
  };

  const proceedWithCancellation = async (reason: string) => {
    if (!selectedOrderForHelp || !user) return;
    setIsAiTyping(true);

    const textToSend = "Please cancel my order.";
    const updatedMessages = [...chatMessages, { role: 'user', content: textToSend } as const];
    setChatMessages(prev => {
      if (prev.length > 0 && prev[prev.length - 1].content === textToSend) {
        return prev;
      }
      return [...prev, { role: 'user', content: textToSend }];
    });
    setInputValue('');

    console.info(`[AI Help Center] Triggering cancellation with reason: "${reason}"`);
    try {
      const orderRef = doc(db, 'orders', selectedOrderForHelp.id);
      const orderSnap = await getDoc(orderRef);
      if (!orderSnap.exists()) {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "⚠️ Error: This order reference was not found in the database system."
        }]);
        setIsAiTyping(false);
        return;
      }

      const freshDBData = orderSnap.data();
      const dbStatus = freshDBData.status || 'Placed';

      // Normalize status to match standard Placed/Processing check
      const normalizedStatus = 
        dbStatus === 'Pending Payment' ? 'Placed' : 
        dbStatus === 'COD Pending' ? 'Placed' :
        dbStatus === 'Pending' ? 'Placed' : 
        dbStatus === 'Approved' ? 'Processing' : 
        dbStatus;

      // Rule 3: Allow cancellation ONLY check Placed or Processing
      const isCancelable = normalizedStatus === 'Placed' || normalizedStatus === 'Processing';

      if (!isCancelable) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: "This order cannot be cancelled because it has already been delivered or moved beyond the Processing stage."
        }]);
        setIsAiTyping(false);
        return;
      }

      // Rule 4: Firestore update
      try {
        await updateDoc(orderRef, {
          status: 'Cancelled by Customer',
          locked: true,
          isPermanentCancellation: true,
          cancelledAt: serverTimestamp(),
          cancellationReason: reason
        });
        console.log("[AI Help Center] Success! Firestore document has been updated & locked with reason.");
      } catch (dbWriteErr: any) {
        // Rule 6: Log exact Firestore update error in console
        console.error("Firestore update error:", dbWriteErr);
        // Rule 5: User verification failover
        const authFailed = !auth.currentUser;
        const errorMessage = authFailed 
          ? "⚠️ Failed to execute cancellation database transactions. Please sign in again."
          : `⚠️ Failed to execute cancellation database transactions. Details: ${dbWriteErr.message}`;
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: errorMessage
        }]);
        setIsAiTyping(false);
        return;
      }

      // Call the AI chat API to format confirmation
      const systemPromptOverride = `System Notice: Customer selected to cancel this order with reason: "${reason}". The client has successfully updated the order status in Firestore to 'Cancelled by Customer' with locked=true, isPermanentCancellation=true, and cancelledAt=serverTimestamp(). Please generate the final cancellation confirmation response. Answer with: 'Cancellation completed. Reason: ${reason}. Refund processing will be handled manually.'`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderForHelp.id,
          messages: [...updatedMessages, { role: 'user', content: systemPromptOverride }],
          orderData: {
            ...selectedOrderForHelp,
            status: 'Cancelled by Customer',
            locked: true,
            isPermanentCancellation: true,
            cancellationReason: reason
          },
          userId: user.uid
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Cancellation completed. Reason: ${reason}. Refund processing will be handled manually.`
        }]);
      }

      // Log conversation activity inside Firestore order
      try {
        const finishedRef = doc(db, 'orders', selectedOrderForHelp.id);
        await updateDoc(finishedRef, {
          aiChatLogs: arrayUnion({
            userQuery: "Customer AI Cancellation Request",
            aiReply: data.message || `Cancellation completed. Reason: ${reason}.`,
            timestamp: new Date().toISOString()
          })
        });
      } catch (logErr) {
        console.warn("[AI Help Center] Client chat log update skipped:", logErr);
      }

    } catch (err: any) {
      console.error("AI connection exceptions: ", err);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Cancellation completed. Reason: ${reason}. Refund processing will be handled manually.` 
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || !selectedOrderForHelp || !user) return;

    // Check cancellation interception path
    const normalizedLower = textToSend.toLowerCase();
    const isCancelRequest = normalizedLower.includes('cancel') && !normalizedLower.includes('cannot cancel') && !normalizedLower.includes('why was');

    if (isCancelRequest) {
      setIsCancelModalOpen(true);
      return;
    }

    // Add user message to state
    const updatedMessages = [...chatMessages, { role: 'user', content: textToSend } as const];
    setChatMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInputValue('');
    setIsAiTyping(true);

    // Regular conversation flow
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderForHelp.id,
          messages: updatedMessages,
          orderData: selectedOrderForHelp,
          userId: user.uid
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
        
        // Keep logs saved inside database using authenticated customer request permissions
        try {
          const orderRef = doc(db, 'orders', selectedOrderForHelp.id);
          await updateDoc(orderRef, {
            aiChatLogs: arrayUnion({
              userQuery: textToSend,
              aiReply: data.message,
              timestamp: new Date().toISOString()
            })
          });
        } catch (logErr) {
          console.warn("[AI Help Center] Local client logging skipped:", logErr);
        }

      } else {
        let friendlyError = '';
        if (response.status === 404 || data.error?.includes('404') || data.error?.includes('Not Found')) {
          friendlyError = 'Support service is temporarily unavailable.';
        } else if (response.status === 403 || data.error?.toLowerCase().includes('permission') || data.error?.toLowerCase().includes('insufficient')) {
          friendlyError = 'Unable to access this order. Please sign in again.';
        } else {
          friendlyError = data.error || 'Support service is temporarily unavailable.';
        }
        setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${friendlyError}` }]);
      }
    } catch (err: any) {
      console.error("AI client connection failed: ", err);
      let friendlyError = 'Support service is temporarily unavailable.';
      if (err?.message?.toLowerCase().includes('permission') || err?.message?.toLowerCase().includes('insufficient')) {
        friendlyError = 'Unable to access this order. Please sign in again.';
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${friendlyError}` }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
        <p className="text-stone-500 text-xs font-black uppercase tracking-wider">Loading your order center...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Customer Access Room</span>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight mt-0.5">My Orders Dashboard</h2>
          <p className="text-xs text-stone-400 mt-1 uppercase font-bold">Track and manage your premium caterings in real-time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              generateCaptcha();
              setTrackerError('');
              setTrackerResult(null);
              setCaptchaInput('');
              setShowTrackerModal(true);
            }}
            className="text-[11px] bg-[#800000] hover:bg-black text-white px-4 py-2 font-black rounded-2xl shadow-sm uppercase tracking-wider cursor-pointer transition-colors border-b-2 border-[#5a0000]"
          >
            🔍 Track Your Tiffin Service
          </button>

          <span className="text-[11px] bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 font-black rounded-2xl shadow-sm">
            🚨 Active Records: {orders.length}
          </span>
        </div>
      </div>

      {loadingOrders ? (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-xs font-black uppercase tracking-wide">Synchronizing orders history list...</p>
        </div>
      ) : (orders.length === 0 && tiffinOrders.length === 0) ? (
        <div className="text-center py-24 bg-white border border-stone-200/60 rounded-3xl p-8 shadow-sm">
          <div className="w-16 h-16 bg-neutral-50 border border-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-stone-300" size={32} />
          </div>
          <h3 className="text-xl font-black text-stone-850">No Subscriptions or Orders Recorded</h3>
          <p className="text-stone-400 text-sm mt-1 max-w-md mx-auto">
            You haven't purchased a tiffin service or placed any online cooking orders with Mithila Catering yet. Explore our menus today!
          </p>
          <div className="mt-8">
            <a 
              href="/order.html" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C2185B] hover:bg-[#a0134b] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              Order Online Menu <ArrowRight size={14} />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Tiffin Notice Board section */}
          {notices.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200/80 rounded-[2rem] p-6 shadow-sm relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 left-0 bottom-0 w-2.5 bg-amber-500" />
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">📢</span>
                <h4 className="text-xs sm:text-sm font-black uppercase text-amber-950 tracking-wider">Mithila Tiffin Service Notice Board</h4>
                <span className="ml-auto text-[9px] font-black bg-amber-200 text-amber-850 px-2.5 py-1 rounded-full uppercase">Notice Center</span>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {notices.map((notice) => (
                  <div key={notice.id} className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
                    <h5 className="font-black text-amber-950 text-xs sm:text-sm">{notice.title}</h5>
                    <p className="text-[10px] text-stone-400 font-extrabold block mt-0.5">
                      Published: {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : 'recently'}
                    </p>
                    <p className="text-xs text-stone-700 leading-relaxed font-semibold mt-2.5 whitespace-pre-line">{notice.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tiffin Subscriptions Section */}
          {tiffinOrders.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-5 bg-[#800000] p-4 rounded-3xl text-white shadow-md border-b-4 border-[#5a0000]">
                <span className="w-2.5 h-6 bg-white rounded-full inline-block" />
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">My Tiffin Subscriptions</h3>
                <span className="bg-white text-[#800000] text-[10px] px-3 py-1 rounded-full font-black ml-auto shadow-sm">
                  {tiffinOrders.length} Subscriptions
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tiffinOrders.map((sub) => {
                  const activeCustProfile = tiffinCustomers.find(c => c.referenceId === sub.referenceId);
                  const rawStatus = activeCustProfile ? activeCustProfile.status : (sub.status || 'Pending Activation');
                  const displayStatus = rawStatus.replace(/\s+text-black$/gi, '');
                  const balanceVal = activeCustProfile ? activeCustProfile.balanceAmount : 0;
                  const rawDeliveryStatus = activeCustProfile ? activeCustProfile.todayDeliveryStatus : 'Not Started';
                  const currentDeliveryStatus = rawDeliveryStatus.replace(/\s+text-black$/gi, '');

                  return (
                    <div 
                      key={sub.id} 
                      className="bg-white border-2 border-stone-100 hover:border-[#800000]/20 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                    >
                      {/* Border accent */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#800000]" />
                      
                      <div>
                        <div className="flex justify-between items-start border-b border-stone-150 pb-4 mb-4">
                          <div>
                            <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider block">Tiffin Reference ID</span>
                            <h4 className="text-sm font-extrabold font-mono tracking-tight text-[#800000] mt-0.5 font-sans">
                              {sub.referenceId || 'MTS-TF-PENDING'}
                            </h4>
                          </div>
                          <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${
                            displayStatus === 'Active' || displayStatus === 'Delivered'
                              ? 'bg-green-600 text-white border-green-700 font-extrabold'
                              : displayStatus === 'Cancelled' || displayStatus.toLowerCase().includes('canc')
                              ? 'bg-red-600 text-white border-red-700 font-extrabold'
                              : displayStatus === 'Paused' || displayStatus === 'Preparing'
                              ? 'bg-amber-500 text-white border-amber-600 font-extrabold'
                              : 'bg-rose-50 text-[#800000] border-rose-200 animate-pulse'
                          }`}>
                            {displayStatus}
                          </span>
                        </div>

                        <div className="space-y-3 text-xs font-semibold text-stone-600 font-sans">
                          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex justify-between items-center text-xs">
                            <span className="text-stone-400 font-bold">Plan Name</span>
                            <span className="text-stone-900 font-extrabold">{sub.plan || sub.planName || 'Tiffin Subscription'}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              <span className="text-stone-400 block text-[9.5px]">Amount Paid</span>
                              <span className="text-stone-950 font-bold">₹{sub.amount}</span>
                            </div>
                            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              <span className="text-stone-400 block text-[9.5px]">Payment Status</span>
                              <span className="text-green-600 font-extrabold uppercase text-[10px]">{sub.paymentStatus || 'PAID'}</span>
                            </div>
                          </div>

                          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex justify-between">
                            <span className="text-stone-400">Purchase Date</span>
                            <span className="text-stone-700">{sub.orderDate || sub.createdAt?.split('T')[0] || 'N/A'}</span>
                          </div>

                          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex justify-between">
                            <span className="text-[#800000] font-bold">Remaining Balance</span>
                            <span className="font-mono text-stone-950 font-extrabold">{balanceVal}</span>
                          </div>

                          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex justify-between items-center">
                            <span className="text-stone-400 font-bold">Current Service Status</span>
                            <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                              currentDeliveryStatus === 'Delivered'
                                ? 'bg-green-600 text-white border-green-700 font-extrabold'
                                : currentDeliveryStatus === 'Cancelled'
                                ? 'bg-red-600 text-white border-red-700 font-extrabold'
                                : currentDeliveryStatus === 'Out For Delivery'
                                ? 'bg-blue-600 text-white border-blue-700 font-extrabold'
                                : currentDeliveryStatus === 'Preparing'
                                ? 'bg-amber-500 text-white border-amber-600 font-extrabold'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}>
                              {currentDeliveryStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-stone-100 pt-4 text-center">
                        {displayStatus === 'Active' ? (
                          <p className="text-[10.5px] text-green-600 font-bold uppercase tracking-wide">
                            ✅ Subscription is active. Daily deliveries are underway!
                          </p>
                        ) : (
                          <p className="text-[10.5px] text-stone-500 font-semibold leading-relaxed">
                            ⏳ Awaiting admin verification and delivery route assignment. Usually activated within 2-4 hours. Refer Reference ID of this subscription ticket.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catering Orders Section */}
          <div className="pt-2">
            <div className="flex items-center gap-3 mb-5 bg-[#800000] p-4 rounded-3xl text-white shadow-md border-b-4 border-[#5a0000]">
              <span className="w-2.5 h-6 bg-white rounded-full inline-block" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">My Food Catering Orders</h3>
              <span className="bg-white text-[#800000] text-[10px] px-3 py-1 rounded-full font-black ml-auto shadow-sm">
                {orders.length} Catering Orders
              </span>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-10 bg-white border border-stone-200/60 rounded-3xl p-8 shadow-sm">
                <h4 className="text-md font-bold text-stone-700">No Food Catering orders placed yet</h4>
                <p className="text-stone-400 text-xs mt-1">Ready to treat your events or family dinners? Place an order now!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {orders.map((order) => {
            const isFailureCancelled = order.status === 'Cancelled by Payment Failure';
            const isCustomerCancelled = order.status === 'Cancelled by Customer';
            const isAnyCancelled = order.status === 'Cancelled' || isFailureCancelled || isCustomerCancelled;

            // Resolve friendly stepper mapping
            const currentMappedStatus = 
              order.status === 'Pending Payment' ? 'Placed' : 
              order.status === 'COD Pending' ? 'Placed' :
              order.status === 'Pending' ? 'Placed' : 
              order.status === 'Approved' ? 'Processing' : 
              order.status === 'Ready' ? 'Processing' : 
              order.status === 'Out For Delivery' ? 'On the way' : 
              order.status;

            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow"
              >
                {/* Upper Order Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-150 pb-4 mb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-400 font-mono uppercase tracking-wider">Invoice Reference</span>
                      <span className="text-[10px] font-mono font-black text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                        #{order.id.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-stone-500">
                      <span>Date Placed: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {order.paymentMethod === 'ONLINE' ? <CreditCard size={13} className="text-blue-500" /> : <ClipboardCheck size={13} className="text-emerald-500" />}
                        Pay Mode: <strong>{order.paymentMethod}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Pricing & Help Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">Catering Total</span>
                      <span className="text-base sm:text-xl font-black text-orange-600 block">₹{order.totalAmount}</span>
                    </div>
                    
                    <button
                      onClick={() => handleOpenHelpCenter(order)}
                      className="px-4 py-2.5 bg-neutral-900 hover:bg-orange-600 text-white font-extrabold rounded-xl transition-all text-xs flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      <MessageSquare size={13} />
                      Help Center
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Items Purchased */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      <Package size={13} />
                      <span>Ordered Menu Recipies</span>
                    </div>

                    <div className="bg-stone-50/50 border border-stone-100 p-4 rounded-2xl space-y-2.5 divide-y divide-stone-150">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-semibold text-stone-800 pt-2.5 first:pt-0 border-transparent">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-extrabold truncate text-stone-900">{it.name}</p>
                            <p className="text-[10px] text-stone-400 capitalize">Size: {it.size || 'single'}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-orange-600 font-extrabold text-[11px] block">{it.quantity}x</span>
                            <span className="text-[10px] text-stone-400 font-mono">₹{it.price * it.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mid Column: Locations & Scheduled Details */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                        <Clock size={13} />
                        <span>Execution &amp; Delivery Location</span>
                      </div>

                      <div className="bg-stone-50/50 border border-stone-100 p-4 rounded-2xl text-xs text-stone-605 space-y-2.5">
                        <div>
                          <strong className="text-stone-800 block mb-0.5">Catering Scheduled Date</strong>
                          <p className="font-extrabold text-orange-600 block">{order.orderDate} at {order.orderTime}</p>
                        </div>
                        <div>
                          <strong className="text-stone-800 block mb-0.5">Catering Address Venue</strong>
                          <p className="font-bold text-stone-600 leading-relaxed">{order.address}, {order.location}, {order.state || 'NCR'}</p>
                        </div>
                        {order.instructions && (
                          <div className="text-[10px] bg-orange-50/50 border border-orange-100 text-orange-900 p-2.5 rounded-xl font-bold">
                            <span className="text-[8px] font-extrabold uppercase text-orange-600 block tracking-wider">Special Chef Instructions:</span>
                            {order.instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Real-time Status Stepper Tracking */}
                  <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider">Real-time Order Status</span>
                        {/* Dynamic Top Badge */}
                        <span className={`text-[10px] px-2.5 py-0.5 font-black uppercase tracking-wider rounded-lg border ${
                          isFailureCancelled ? 'bg-red-50 text-red-700 border-red-200' :
                          isCustomerCancelled ? 'bg-red-50 text-red-700 border-red-250' :
                          order.status === 'Placed' ? 'bg-yellow-50 text-yellow-700 border-yellow-250' :
                          order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'On the way' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          order.status === 'Pending Payment' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {isFailureCancelled ? 'Payment Failed' : isCustomerCancelled ? 'Permanently Cancelled' : order.status}
                        </span>
                      </div>

                      {/* Display warning details for payment failures */}
                      {isFailureCancelled && (
                        <div className="bg-red-50/70 border border-red-100 p-3.5 rounded-2xl flex items-start gap-2 text-red-900 mb-2">
                          <ShieldAlert size={16} className="text-red-600 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-extrabold block uppercase tracking-wider font-sans">Permanently Cancelled - Payment Failed</span>
                            <p className="text-[10px] text-red-800 leading-relaxed mt-0.5 font-semibold">
                              This online transaction could not be compiled successfully. It has been permanently locked for safety.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Display cancellation info if cancelled by customer */}
                      {isCustomerCancelled && (
                        <div className="bg-red-50/70 border border-red-100 p-3.5 rounded-2xl flex items-start gap-2 text-red-900 mb-2">
                          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-extrabold block uppercase tracking-wider text-red-700">Permanently Cancelled</span>
                            <p className="text-[10.5px] text-red-800 leading-relaxed mt-0.5 font-semibold font-sans">
                              This order has been permanently cancelled. {order.cancellationReason && `Reason: "${order.cancellationReason}"`}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Stepper tracking Progress Line bar */}
                      {!isAnyCancelled && (
                        <div className="bg-stone-50/50 border border-stone-150 p-4 rounded-3xl relative mt-1.5">
                          {/* Inner connector progress line */}
                          <div className="absolute top-[26px] left-[12.5%] right-[12.5%] h-1 bg-stone-200 rounded-full z-0">
                            <div 
                              className="h-full bg-orange-600 rounded-full transition-all duration-500"
                              style={{
                                width: 
                                  currentMappedStatus === 'Placed' ? '0%' :
                                  currentMappedStatus === 'Processing' ? '33.33%' :
                                  currentMappedStatus === 'On the way' ? '66.66%' :
                                  currentMappedStatus === 'Delivered' ? '100%' : '0%'
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
                                  <span className={`text-[8px] font-black mt-2 uppercase tracking-wide text-center block ${
                                    isCurrent ? 'text-orange-600 font-black' :
                                    isFinished ? 'text-green-600 font-bold' :
                                    'text-stone-400'
                                  }`}>
                                    {stepName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== CHAT-BASED AI SUPPORT ASSISTANT MODAL ===================== */}
      <AnimatePresence>
        {selectedOrderForHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-end md:p-6 p-0">
            {/* Backdrop Blur screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrderForHelp(null)}
              className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Support Sliding panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', damping: 24, stiffness: 140 }}
              className="bg-white w-full md:max-w-md h-full md:h-[95vh] md:rounded-[2rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border-l border-orange-100"
            >
              {/* Box Header details */}
              <div className="bg-neutral-900 px-6 py-5 flex items-center justify-between text-white border-b border-white/5 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black text-sm relative">
                    AI
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight text-neutral-50 flex items-center gap-1.5">
                      Order Support Agent
                    </h3>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider font-mono">Ref: #{selectedOrderForHelp.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedOrderForHelp(null)}
                  className="p-1.5 hover:bg-white/10 rounded-full text-stone-300 hover:text-white transition-colors cursor-pointer select-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Order Status Ribbon indicators */}
              <div className="px-6 py-2.5 bg-stone-100/90 border-b border-stone-200 text-[10.5px] font-semibold text-stone-605 flex justify-between items-center">
                <span>Database Status: <strong className="text-stone-900 uppercase font-bold">{selectedOrderForHelp.status}</strong></span>
                {['Placed', 'Processing', 'Approved', 'Pending', 'COD Pending', 'Pending Payment'].includes(selectedOrderForHelp.status) && (
                  <span className="text-orange-600 font-black flex items-center gap-1 animate-pulse">
                    ● Cancelable
                  </span>
                )}
              </div>

              {/* Chat conversations area */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-[#F9FAFB] space-y-4">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] md:max-w-[75%] rounded-[1.25rem] p-3.5 text-xs inline-block leading-relaxed shadow-sm font-sans divide-y divide-transparent ${
                        msg.role === 'user'
                          ? 'bg-[#DC2626] text-white rounded-br-none border border-transparent'
                          : 'bg-white text-[#111827] border border-stone-200 rounded-bl-none font-medium'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-[#111827] border border-stone-200 rounded-[1.25rem] rounded-bl-none p-3.5 flex items-center gap-1.5 text-xs shadow-xs max-w-[85%] md:max-w-[75%]">
                      <Loader2 className="w-4 h-4 text-orange-600 animate-spin shrink-0" />
                      <span className="font-semibold text-[10px] uppercase tracking-wider text-stone-500">AI is auditing order logs...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Quick suggestions shortcuts */}
              <div className="px-4 py-3 bg-stone-50 border-t border-stone-150 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => handleSendMessage("What is my delivery status?")}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:border-orange-500 rounded-xl text-[10.5px] font-bold text-stone-700 hover:text-orange-600 transition-colors shadow-xs"
                >
                  📍 Check Delivery Details
                </button>
                <button
                  onClick={() => handleSendMessage("Which items did I purchase in this invoice?")}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:border-orange-500 rounded-xl text-[10.5px] font-bold text-stone-700 hover:text-orange-600 transition-colors shadow-xs"
                >
                  📋 Summary of Items
                </button>
                {['Placed', 'Processing', 'Approved', 'Pending', 'COD Pending', 'Pending Payment'].includes(selectedOrderForHelp.status) ? (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-[10.5px] font-black text-red-700 transition-colors shadow-xs"
                  >
                    🚫 Cancel Order
                  </button>
                ) : (
                  <button
                    onClick={() => setChatMessages(prev => [...prev, { role: 'user', content: 'Can I cancel this order?' }, { role: 'assistant', content: 'This order cannot be cancelled because it has already been delivered or moved beyond the Processing stage.' }])}
                    className="px-2.5 py-1.5 bg-stone-200 opacity-60 rounded-xl text-[10.5px] font-bold text-stone-500 cursor-not-allowed select-none"
                    title="Cancelled permanently or moved past processing check"
                  >
                    ❌ Cannot Cancel
                  </button>
                )}
              </div>

              {/* Form Send prompt field */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-4 bg-white border-t border-stone-200 flex gap-2 sm:gap-3"
              >
                <input
                  type="text"
                  required
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question about your order..."
                  className="flex-1 px-4 py-3 border border-stone-250 focus:border-orange-500 rounded-full text-xs font-semibold bg-stone-50/50 text-stone-900 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-11 h-11 shrink-0 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancellation Reason Modal Dialog */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCancelModalOpen(false)}
              className="fixed inset-0 bg-[#0c0a09]/80 backdrop-blur-xs cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-md bg-white border border-stone-200 shadow-2xl rounded-3xl overflow-hidden p-6 text-left flex flex-col z-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 text-red-650 rounded-2xl flex items-center justify-center">
                  <X size={20} className="stroke-[3] text-red-650" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">Confirm Cancellation</h3>
                  <p className="text-[10.5px] font-bold text-stone-400 uppercase tracking-widest font-mono mt-0.5">Order Ref: #{selectedOrderForHelp?.id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              
              <p className="text-xs text-stone-500 leading-relaxed mb-4">
                Please provide a brief reason for cancelling your catering order. This helps Mithila Catering improve our premium services.
              </p>

              <textarea
                required
                rows={3}
                value={cancellationReasonInput}
                onChange={(e) => setCancellationReasonInput(e.target.value)}
                placeholder="e.g., Change of plans, entered incorrect details, ordered by accident..."
                className="w-full px-4 py-3 border border-stone-250 focus:border-red-500 rounded-2xl text-xs font-semibold bg-stone-50/50 text-stone-900 outline-none transition-colors mb-5 resize-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setCancellationReasonInput('');
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  disabled={!cancellationReasonInput.trim()}
                  onClick={() => {
                    const reason = cancellationReasonInput.trim();
                    setIsCancelModalOpen(false);
                    setCancellationReasonInput('');
                    proceedWithCancellation(reason);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors shadow-md shadow-red-200 cursor-pointer"
                >
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Direct Tiffin Order Direct Tracking Popup */}
      <AnimatePresence>
        {showTrackerModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white border border-stone-200 shadow-2xl rounded-3xl overflow-hidden p-8 text-left z-10 flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setShowTrackerModal(false)}
                className="absolute top-6 right-6 p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} className="text-stone-600" />
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 text-[#800000] border border-[#ffcccc] rounded-2xl flex items-center justify-center font-black text-xl">
                  🥣
                </div>
                <div>
                  <h3 className="text-xl font-black text-stone-900 tracking-tight">Direct Tracker: Tiffin Service Profile</h3>
                  <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest font-mono mt-0.5">Track live subscription status with Reference ID & Captcha code.</p>
                </div>
              </div>

              {!trackerResult ? (
                /* INPUT SEARCH FORM */
                <form onSubmit={handleTrackerSubmit} className="space-y-4">
                  {trackerError && (
                    <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl text-[11px] font-black uppercase text-red-700 tracking-wide">
                      🛑 {trackerError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#800000] uppercase tracking-wider block">Reference Subscription ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MTS-TF-827364"
                      value={trackerRefId}
                      onChange={(e) => setTrackerRefId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-[#800000] outline-none text-black placeholder-stone-600 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#800000] uppercase tracking-wider block">Enter CAPTCHA Code</label>
                      <input
                        type="text"
                        required
                        placeholder="Case insensitive"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:ring-1 focus:ring-[#800000] outline-none text-black placeholder-stone-400 font-black tracking-widest font-mono uppercase"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      <div className="bg-stone-100 hover:bg-stone-200 text-stone-900 font-mono font-black border border-stone-250 select-none tracking-widest px-5 py-3 rounded-xl text-lg flex items-center justify-center relative shadow-inner">
                        <span className="line-through decoration-[#800000] decoration-2 skew-x-12 select-none">{captchaCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="p-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-all cursor-pointer"
                        title="Reload CAPTCHA"
                      >
                        <RefreshCw size={15} className="text-stone-700 hover:rotate-180 transition-all duration-305" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isTracking || !trackerRefId.trim() || !captchaInput.trim()}
                    className="w-full py-4 mt-2 bg-[#800000] hover:bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isTracking ? <Loader2 size={16} className="animate-spin text-white" /> : <Search size={16} />} 
                    Verify Captcha & Look up Status
                  </button>
                </form>
              ) : (
                /* LIVE TRACKER STATUS PROFILE CARD */
                <div className="space-y-6 overflow-y-auto pr-1 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl space-y-2 leading-relaxed">
                      <h4 className="font-black text-[#000000] uppercase text-[10px] tracking-wider mb-2">Delivery Details</h4>
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Recipient Name:</span> {trackerResult.fullName || trackerResult.name || 'N/A'}</p>
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Mobile Number:</span> {trackerResult.phone || trackerResult.mobile || 'N/A'}</p>
                      {trackerResult.customerEmail && <p className="truncate font-semibold text-[#000000]"><span className="text-[#000000]">Contact Email:</span> {trackerResult.customerEmail}</p>}
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Address:</span> {trackerResult.address || 'N/A'}</p>
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Timings:</span> {Array.isArray(trackerResult.selectedTimings) ? trackerResult.selectedTimings.join(', ') : 'N/A'}</p>
                    </div>

                    <div className="bg-stone-50 border border-stone-150 p-4 rounded-2xl space-y-2 leading-relaxed">
                      <h4 className="font-black text-[#000000] uppercase text-[10px] tracking-wider mb-2">Subscription & Pricing</h4>
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Reference ID:</span> <span className="font-mono text-xs text-[#000000] font-black bg-stone-200 px-1.5 py-0.5 rounded">{trackerResult.referenceId || trackerResult.id}</span></p>
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Plan Selected:</span> {trackerResult.planName || 'N/A'}</p>
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Food Preference:</span> {trackerResult.preference === 'Veg' ? 'Vegetarian (Pure Veg)' : 'Non-Vegetarian (Fish / Curry)'}</p>
                      <p className="font-semibold text-[#000000]"><span className="text-[#000000]">Remaining Balance:</span> <strong className="font-mono text-[#000000] bg-stone-200 px-1.5 py-0.5 rounded border border-stone-300">{trackerResult.balanceAmount || trackerResult.remainingBalance || 0}</strong></p>
                    </div>
                  </div>

                  {/* Real-time Status Details */}
                  <div className="border-t border-stone-100 pt-5 space-y-4 text-left font-sans">
                    <div className="bg-stone-50 border border-stone-150 p-5 rounded-3xl space-y-3.5">
                      <div className="flex justify-between items-center pb-2 border-b border-stone-200/50">
                        <span className="text-xs font-black uppercase text-[#000000] tracking-wider font-sans">Plan Active Status</span>
                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${
                          trackerResult.status === 'Active' || trackerResult.status === 'Delivered'
                            ? 'bg-green-600 text-white border-green-700 font-extrabold' 
                            : trackerResult.status === 'Cancelled'
                            ? 'bg-red-600 text-white border-red-700 font-extrabold'
                            : trackerResult.status === 'Paused' || trackerResult.status === 'Preparing'
                            ? 'bg-amber-500 text-white border-amber-600 font-extrabold'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {trackerResult.status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center transition-all">
                        <span className="text-xs font-black uppercase text-[#000000] tracking-wider font-sans">Today's Meal Delivery Status</span>
                        {(() => {
                          const todayClean = (trackerResult.todayDeliveryStatus || 'Not Started').replace(/\s+text-black$/gi, '');
                          return (
                            <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border ${
                              todayClean === 'Delivered'
                                ? 'bg-green-600 text-white border-green-700 font-extrabold'
                                : todayClean === 'Cancelled'
                                ? 'bg-red-600 text-white border-red-700 font-extrabold'
                                : todayClean === 'Out For Delivery'
                                ? 'bg-blue-600 text-white border-blue-700 animate-pulse font-extrabold'
                                : todayClean === 'Preparing'
                                ? 'bg-amber-500 text-white border-amber-600 font-extrabold'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}>
                              {todayClean}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-[10px] text-stone-400 font-bold leading-relaxed pt-1.5 font-sans">
                        ℹ️ Standard tiffin dispatches activate in real-time. Any changes made by the kitchen operator will reflect above instantly.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setTrackerResult(null);
                        setTrackerRefId('');
                        setCaptchaInput('');
                        generateCaptcha();
                      }}
                      className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 font-bold text-stone-850 text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Track Another Reference ID
                    </button>
                    <button
                      onClick={() => {
                        setShowTrackerModal(false);
                      }}
                      className="px-6 py-3 bg-[#800000] hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                    >
                      Close Tracker
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
