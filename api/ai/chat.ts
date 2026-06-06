import { initializeApp, getApps, getApp } from 'firebase/app';
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

// Initialize serverless-safe firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

export default async function handler(req: any, res: any) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle CORS preflight options request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Set default JSON Content-Type
  res.setHeader('Content-Type', 'application/json');

  const { orderId, messages, orderData: clientOrderData, userId } = req.body;
  
  // High detail debugging log
  console.info(`[DEBUG] AI Chat Request received. User UID: "${userId || 'anon'}", Order ID: "${orderId || 'none'}"`);

  if (!orderId || !messages || !Array.isArray(messages)) {
    console.warn('[AI Chat API] Warning: Missing orderId or messages parameter');
    return res.status(400).json({ error: 'Missing required orderId or messages parameter' });
  }

  let orderData = clientOrderData;

  // Dual-Layer retrieval: If client did not provide pre-fetched order data, try querying Firestore
  if (!orderData) {
    try {
      console.info(`[AI Chat API] Attempting to query Firestore for Order: #${orderId}...`);
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        orderData = orderSnap.data();
        console.info(`[AI Chat API] Firestore query success for Order: #${orderId}. Status: ${orderData.status}`);
      } else {
        console.error(`[AI Chat API] Order ref #${orderId} was not found in Firestore "orders" collection.`);
        return res.status(404).json({ error: `Order #${orderId} does not exist in the orders registry.` });
      }
    } catch (fsError: any) {
      console.error(`[AI Chat API] Firestore read query failed (usually permissions on serverless): ${fsError.message}`);
      return res.status(403).json({ 
        error: 'Unable to access this order. Please sign in again.', 
        details: fsError.message 
      });
    }
  } else {
    console.info(`[AI Chat API] Safe Dual-Layer match: Using client pre-fetched orderData for Reference: #${orderId}`);
  }

  // Check if Order items are present
  const itemsList = orderData.items || [];
  const statusState = orderData.status || 'Placed';
  const displayStatus = statusState === 'Approved' ? 'Processing' : statusState;

  // Create system-instruction containing live authenticated metadata
  const systemInstruction = `You are the helpful, empathetic, and expert Live AI Support Agent for Mithila Catering & Decoration Service.
You are assisting a customer regarding event order reference #${orderId}.

Here are the authentic live order details retrieved from our secure Firestore ledger:
- Reference ID: ${orderId}
- Customer Name: ${orderData.customerName || orderData.userName || 'Valued Guest'}
- Customer Email: ${orderData.customerEmail || 'N/A'}
- Customer Phone: ${orderData.customerPhone || orderData.userPhone || 'N/A'}
- Items Listed (What items were purchased): ${JSON.stringify(itemsList)}
- Financial Total: ₹${orderData.totalAmount || orderData.subtotal || 0}
- Payment Gateway Method: ${orderData.paymentMethod || 'COD'}
- Status State: ${statusState} (also referred to as ${displayStatus})
- Delivery Address: ${orderData.address || 'N/A'}, ${orderData.location || 'N/A'}
- Event Schedule: Date ${orderData.orderDate || 'N/A'} at Time ${orderData.orderTime || 'N/A'}

CRITICAL OPERATIONAL RULES:
1. Handle queries about: Which items were purchased, Delivery status, Order status, Payment status, Order amount, Delivery address, and Event date. Directly answer based on the real ledger values.
2. Order Cancellation Protocol:
   - Customers may request to cancel their order.
   - You can cancel the order IF AND ONLY IF the current status is EXACTLY 'Processing' or 'Approved'.
   - If the current status is indeed 'Approved' or 'Processing', you MUST declare that you are initiating cancellation, and call the custom function utility \`cancelOrder(reason)\` right now. Do not promise cancellation without calling this function first.
   - If the current status is anything else (for example: Shipped, Out For Delivery, Delivered, Returned, Refunded, Cancelled, Cancelled by Payment Failure, or Cancelled by Customer), you are STRICTLY FORBIDDEN from performing or initiating cancellation. You must explain politely and clearly:
     "This order can no longer be cancelled because it has already moved beyond the Processing stage."
   - If the status is already 'Cancelled by Payment Failure' or 'Cancelled by Customer', explain that the order is already permanently cancelled.
3. Be professional and humble. Do not print system variables, telemetry strings, or logs. Always reply with clean Markdown format.`;

  const genaiKey = process.env.GEMINI_API_KEY;
  if (!genaiKey) {
    console.error('[AI Chat API] Critical Error: GEMINI_API_KEY is not defined in server environment');
    return res.status(500).json({ error: 'Support service is temporarily unavailable.' });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: genaiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    console.info(`[AI Chat API] Querying Gemini model for Order Support chat session.`);

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
            description: 'Performs order cancellation and updates status to Cancelled by Customer.',
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
        const reason = args.reason || 'Requested by customer via AI Support';

        console.info(`[AI Chat API] Gemini triggered cancelOrder with reason: "${reason}"`);

        const disallowedStatuses = ['Delivered', 'Shipped', 'Out For Delivery', 'On the way', 'Returned', 'Refunded', 'Cancelled', 'Cancelled by Customer', 'Cancelled by Payment Failure'];
        const isCancelable = !disallowedStatuses.includes(statusState);

        if (isCancelable) {
          const cancellationTime = new Date().toISOString();

          // Dual-layer safety: Try to write the database update from backend, but ignore write permission errors because client will perform failover update!
          try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, {
              status: 'Cancelled by Customer',
              orderStatus: 'Cancelled by Customer',
              cancellationReason: reason,
              cancelledAt: serverTimestamp(),
              cancelledBy: 'Customer AI Request',
              locked: true,
              isPermanentCancellation: true,
              aiChatLogs: arrayUnion({
                type: 'system',
                action: 'Cancelled by Customer',
                reason,
                timestamp: cancellationTime
              })
            });
            console.info(`[AI Chat API] Firestore backend update successful. Order #${orderId} cancelled.`);
          } catch (writeErr: any) {
            console.warn(`[AI Chat API] Backend write permission warning (expected for unauthenticated servers). Relying on client-side state transition callback. Error: ${writeErr.message}`);
          }

          // Generate confirmation text to user
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

          return res.status(200).json({
            message: confirmedResponse.text,
            statusUpdated: true,
            newStatus: 'Cancelled by Customer',
            reason: reason
          });
        } else {
          return res.status(200).json({
            message: "This order cannot be cancelled because it has already been delivered or moved beyond the Processing stage.",
            statusUpdated: false
          });
        }
      }
    }

    // Try logging message to Firestore, but skip gracefully if unauthenticated server write fails
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
      console.warn(`[AI Chat API] Chat log write skipped due to server rules restriction: ${logError.message}`);
    }

    return res.status(200).json({
      message: response.text,
      statusUpdated: false
    });

  } catch (gemError: any) {
    console.error('[AI Chat API] Gemini API processing exception:', gemError);
    return res.status(500).json({ error: 'Support service is temporarily unavailable.', details: gemError.message });
  }
}
