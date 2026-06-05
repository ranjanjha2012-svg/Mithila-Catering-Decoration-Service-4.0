export default function handler(req: any, res: any) {
  const txnid = req.body?.txnid || req.query?.txnid || '';
  const amount = req.body?.amount || req.query?.amount || '';
  const mode = req.body?.mode || '';
  
  res.writeHead(302, {
    Location: `/payment-success.html?orderId=${txnid}&amount=${amount}&status=success&mode=${mode}`
  });
  res.end();
}
