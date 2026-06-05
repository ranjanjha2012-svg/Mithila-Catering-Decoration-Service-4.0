export default function handler(req: any, res: any) {
  const txnid = req.body?.txnid || req.query?.txnid || '';
  const msg = req.body?.field9999_error_message || req.body?.error_Message || '';
  
  res.writeHead(302, {
    Location: `/payment-failure.html?orderId=${txnid}&status=failed&msg=${encodeURIComponent(msg)}`
  });
  res.end();
}
