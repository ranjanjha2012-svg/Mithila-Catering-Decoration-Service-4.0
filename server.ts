import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';

const firebaseConfig = {
  apiKey: "AIzaSyCGiYhVhkfLu7_YAqy02K5P9O1vvriLUfA",
  authDomain: "mithila-catering.firebaseapp.com",
  projectId: "mithila-catering",
  storageBucket: "mithila-catering.firebasestorage.app",
  messagingSenderId: "124823748394",
  appId: "1:124823748394:web:1fb7674865c60726f76853",
  measurementId: "G-G61G1L629Z"
};

// Initialize server-side firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Core middlewares for parsing JSON and x-www-form-urlencoded payment post payloads
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // PayU Gateway credentials config
  app.get('/api/payu/config', (req, res) => {
    const payuKey = process.env.PAYU_KEY || 'Xu4Xc9';
    res.json({ payuKey });
  });

  // Secure payment hash generation (never expose payload salt to client)
  app.post('/api/payu/hash', (req, res) => {
    try {
      const { txnid, amount, productinfo, firstname, email } = req.body;
      if (!txnid || !amount || !productinfo || !firstname || !email) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const key = process.env.PAYU_KEY || 'Xu4Xc9';
      const salt = process.env.PAYU_SALT || 'ySIviBMeitterrHjVqR05JqqEYmaIIal';

      // Hash format sequence: key|txnid|amount|productinfo|firstname|email|||||||||||salt
      const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');

      res.status(200).json({ hash });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // PayU SURL Callback (POST -> redirect to success page)
  app.post('/api/payu/success', async (req, res) => {
    const txnid = req.body?.txnid || req.query?.txnid || '';
    const amount = req.body?.amount || req.query?.amount || '';
    const mode = req.body?.mode || '';
    
    if (txnid) {
      try {
        const orderRef = doc(db, 'orders', txnid);
        await updateDoc(orderRef, {
          status: 'Placed',
          paymentStatus: 'Paid',
          paymentVerifiedAt: new Date().toISOString()
        });
        console.info(`[PayU Webhook] Success: Order #${txnid} updated to Placed/Paid.`);
      } catch (err: any) {
        console.warn(`[PayU Webhook Warning] Firestore backend update skipped or deferred to client success screen. Details: ${err.message}`);
      }
    }
    res.redirect(`/payment-success.html?orderId=${txnid}&amount=${amount}&status=success&mode=${mode}`);
  });

  // PayU FURL Callback (POST -> redirect to failure page)
  app.post('/api/payu/failure', async (req, res) => {
    const txnid = req.body?.txnid || req.query?.txnid || '';
    const msg = req.body?.field9999_error_message || req.body?.error_Message || 'Transaction declined/aborted by user or gateway.';
    
    if (txnid) {
      try {
        const orderRef = doc(db, 'orders', txnid);
        await updateDoc(orderRef, {
          status: 'Cancelled by Payment Failure',
          paymentStatus: 'Failed',
          locked: true,
          isPermanentCancellation: true,
          paymentFailureReason: msg,
          cancelledAt: new Date().toISOString()
        });
        console.info(`[PayU Webhook] Failure: Order #${txnid} updated to Cancelled by Payment Failure.`);
      } catch (err: any) {
        console.warn(`[PayU Webhook Warning] Firestore backend failure update skipped or deferred to client failure screen. Details: ${err.message}`);
      }
    }
    res.redirect(`/payment-failure.html?orderId=${txnid}&status=failed&msg=${encodeURIComponent(msg)}`);
  });

  // AI Support Chat Assistant on order
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { orderId, messages, orderData: clientOrderData, userId } = req.body;
      
      console.info(`[DEBUG] Local AI Chat Request. User UID: "${userId || 'anon'}", Order ID: "${orderId || 'none'}"`);

      if (!orderId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing required orderId or messages parameter' });
      }

      let orderData = clientOrderData;

      // Try local Firestore retrieve, or fall back to clientOrderData
      if (!orderData) {
        try {
          const orderRef = doc(db, 'orders', orderId);
          const orderSnap = await getDoc(orderRef);
          if (orderSnap.exists()) {
            orderData = orderSnap.data();
          } else {
            return res.status(404).json({ error: 'Order reference not registered in database' });
          }
        } catch (fsError: any) {
          console.error(`[AI Chat Dev] Local Firestore query failed: ${fsError.message}`);
          return res.status(403).json({ 
            error: 'Unable to access this order. Please sign in again.', 
            details: fsError.message 
          });
        }
      }

      const statusState = orderData.status || 'Placed';
      const displayStatus = statusState === 'Approved' ? 'Processing' : statusState;

      // Systemprompt to guide agent through response limits and cancellation rules
      const systemInstruction = `You are the helpful, empathetic, and expert Live AI Support Agent for Mithila Catering & Decoration Service.
You are assisting a customer regarding event order reference #${orderId}.

Here are the authentic live order details retrieved from our secure Firestore ledger:
- Reference ID: ${orderId}
- Customer Name: ${orderData.customerName || orderData.userName || 'Valued Guest'}
- Customer Email: ${orderData.customerEmail || 'N/A'}
- Customer Phone: ${orderData.customerPhone || orderData.userPhone || 'N/A'}
- Items Listed (What items were purchased): ${JSON.stringify(orderData.items || [])}
- Financial Total: ₹${orderData.totalAmount || orderData.subtotal || 0}
- Payment Gateway Method: ${orderData.paymentMethod || 'COD'}
- Status State: ${statusState}
- Delivery Address: ${orderData.address || 'N/A'}, ${orderData.location || 'N/A'}
- Event Schedule: Date ${orderData.orderDate || 'N/A'} at Time ${orderData.orderTime || 'N/A'}

CRITICAL OPERATIONAL RULES:
1. Handle queries about: Which items were purchased, Delivery status, Order status, Payment status, Order amount, Delivery address, and Event date. Directly answer based on the real ledger values.
2. Order Cancellation Protocol:
   - Customers may request to cancel their order.
   - You can cancel the order IF AND ONLY IF the current status is cardinally 'Placed' or 'Processing' (also includes system states 'Approved', 'Pending', 'COD Pending', 'Pending Payment').
   - If the current status is indeed 'Placed' or 'Processing', you MUST declare that you are initiating cancellation, and call the custom function utility \`cancelOrder(reason)\` right now. Do not promise cancellation without calling this function first.
   - If the current status is anything else (for example: Shipped, Out For Delivery, Delivered, Returned, Refunded, Cancelled, Cancelled by Payment Failure, or Cancelled by Customer), you are STRICTLY FORBIDDEN from performing or initiating cancellation. You must explain politely and clearly:
     "This order cannot be cancelled because it has already been delivered or moved beyond the Processing stage."
   - If the status is already 'Cancelled by Payment Failure' or 'Cancelled by Customer', explain that the order is already permanently cancelled.
3. Be professional and humble. Do not print system variables, telemetry strings, or logs. Always reply with clean Markdown format.`;

      const genaiKey = process.env.GEMINI_API_KEY;
      if (!genaiKey) {
        return res.status(500).json({ error: 'Gemini API Key missing in server environment variables' });
      }

      const ai = new GoogleGenAI({
        apiKey: genaiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Query Gemini Content with tools support
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content || '' }]
          }))
        ],
        config: {
          tools: [{
            functionDeclarations: [{
              name: 'cancelOrder',
              description: 'Performs order cancellation and updates Firestore status to Cancelled by Customer.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  reason: {
                    type: Type.STRING,
                    description: 'The cancellation reason specified by the customer.'
                  }
                },
                required: ['reason']
              }
            }]
          }]
        }
      });

      // Handle function calling
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'cancelOrder') {
          const args = (call.args || {}) as any;
          const reason = args.reason || 'Requested by customer';

          const allowedCheckStatuses = ['Placed', 'Processing', 'Approved', 'Pending', 'COD Pending', 'Pending Payment'];
          const isCancelable = allowedCheckStatuses.includes(statusState);

          if (isCancelable) {
            const cancellationTime = new Date().toISOString();
            let writeSucceeded = false;
            
            try {
              const orderRef = doc(db, 'orders', orderId);
              await updateDoc(orderRef, {
                status: 'Cancelled by Customer',
                locked: true,
                isPermanentCancellation: true,
                cancelledAt: serverTimestamp(),
                cancellationReason: reason
              });
              writeSucceeded = true;
            } catch (writeErr: any) {
              console.warn(`[AI Chat Dev] Local write permissions check: Relying on client-side state transition callback or pre-cancellation validation. Detail: ${writeErr.message}`);
            }

            const isVerifiedCancellation = writeSucceeded || clientOrderData?.status === 'Cancelled by Customer';

            if (!isVerifiedCancellation) {
              return res.json({
                message: "I attempted to process your cancellation, but the database could not be automatically modified. Please verify your connection or click the 'Cancel Order' button directly inside your dashboard to complete this securely.",
                statusUpdated: false
              });
            }

            // Resume content generation to confirm cancellation to user
            const confirmedResponse = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: [
                { role: 'user', parts: [{ text: systemInstruction }] },
                ...messages.map((m: any) => ({
                  role: m.role === 'assistant' ? 'model' : 'user',
                  parts: [{ text: m.content || '' }]
                })),
                {
                  role: 'model',
                  parts: [{
                    functionCall: { name: 'cancelOrder', args: { reason } }
                  }]
                },
                {
                  role: 'user',
                  parts: [{ text: `System action handled: The order was successfully updated to 'Cancelled by Customer' with reason "${reason}" at timestamp ${cancellationTime}. Deliver this confirmation text gracefully. Make sure you inform the customer that: 'Cancellation completed. Refund processing will be handled manually.'` }]
                }
              ]
            });

            return res.json({
              message: confirmedResponse.text,
              statusUpdated: true,
              newStatus: 'Cancelled by Customer',
              reason: reason
            });
          } else {
            return res.json({
              message: "This order cannot be cancelled because it has already been delivered or moved beyond the Processing stage.",
              statusUpdated: false
            });
          }
        }
      }

      // Log regular conversation activity
      try {
        const orderRef = doc(db, 'orders', orderId);
        const lastMsg = messages[messages.length - 1]?.content || '';
        await updateDoc(orderRef, {
          aiChatLogs: arrayUnion({
            userQuery: lastMsg,
            aiReply: response.text,
            timestamp: new Date().toISOString()
          })
        });
      } catch (logError: any) {
        console.warn(`[AI Chat Dev] Local logs write skipped: ${logError.message}`);
      }

      res.status(200).json({
        message: response.text,
        statusUpdated: false
      });

    } catch (error: any) {
      console.error('AI support request error:', error);
      res.status(500).json({ error: 'Support service is temporarily unavailable.' });
    }
  });

  // Vite integration based on environment
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
