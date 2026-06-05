import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import crypto from 'crypto';

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
  app.post('/api/payu/success', (req, res) => {
    const txnid = req.body?.txnid || req.query?.txnid || '';
    const amount = req.body?.amount || req.query?.amount || '';
    const mode = req.body?.mode || '';
    res.redirect(`/payment-success.html?orderId=${txnid}&amount=${amount}&status=success&mode=${mode}`);
  });

  // PayU FURL Callback (POST -> redirect to failure page)
  app.post('/api/payu/failure', (req, res) => {
    const txnid = req.body?.txnid || req.query?.txnid || '';
    const msg = req.body?.field9999_error_message || req.body?.error_Message || '';
    res.redirect(`/payment-failure.html?orderId=${txnid}&status=failed&msg=${encodeURIComponent(msg)}`);
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
