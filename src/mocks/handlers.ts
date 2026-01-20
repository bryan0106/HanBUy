import { http, HttpResponse } from 'msw';

// MSW handlers - Use pattern matching to catch requests regardless of base URL
// MSW will match requests that match these patterns

export const handlers = [
  // Mock bank types endpoint
  // Matches: */api/bank-type (any base URL)
  http.get('*/api/bank-type', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { 
          code: 'GCASH', 
          name: 'GCash', 
          type: 'qr_code', 
          icon: 'gcash', 
          description: 'Pay via GCash QR code',
          color: 'bg-blue-500'
        },
        { 
          code: 'MAYA', 
          name: 'Maya', 
          type: 'qr_code', 
          icon: 'maya', 
          description: 'Pay via Maya QR code',
          color: 'bg-green-600'
        },
        { 
          code: 'BPI', 
          name: 'BPI', 
          type: 'qr_code', 
          icon: 'bpi', 
          description: 'Pay via BPI QR code',
          color: 'bg-red-600'
        },
        { 
          code: 'BDO', 
          name: 'BDO', 
          type: 'qr_code', 
          icon: 'bdo', 
          description: 'Pay via BDO QR code',
          color: 'bg-blue-600'
        },
        { 
          code: 'GOTYME', 
          name: 'GoTyme', 
          type: 'qr_code', 
          icon: 'gotyme', 
          description: 'Pay via GoTyme QR code',
          color: 'bg-purple-600'
        },
      ],
    });
  }),

  // Mock QR code generation endpoint
  // Matches: */api/payments/qr-code (any base URL)
  http.post('*/api/payments/qr-code', async ({ request }) => {
    const body: any = await request.json().catch(() => ({}));
    const bank = (body?.payment_method?.bank || 'GCASH').toUpperCase();
    const amount = Number(body?.amount || 0).toFixed(2);

    // Generate a nicer-looking mock QR code SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="360">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3a4b6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff6b9d;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="320" height="360" fill="#ffffff" stroke="url(#grad1)" stroke-width="3" rx="12" />
        <text x="160" y="32" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ff6b9d">MSW TEST MODE</text>
        <text x="160" y="52" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">Mock QR Code</text>
        <rect x="60" y="80" width="200" height="200" fill="#fafafa" stroke="#ddd" stroke-width="2" rx="4" />
        <rect x="80" y="100" width="20" height="20" fill="#000" />
        <rect x="220" y="100" width="20" height="20" fill="#000" />
        <rect x="80" y="240" width="20" height="20" fill="#000" />
        <rect x="220" y="240" width="20" height="20" fill="#000" />
        <rect x="140" y="140" width="40" height="40" fill="#000" />
        <text x="160" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#333">${bank}</text>
        <text x="160" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#ff6b9d">₱${amount}</text>
        <text x="160" y="348" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">Not scannable - Test Mode</text>
      </svg>
    `.trim();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    console.log('🎭 MSW: Mocking QR code generation', { bank, amount });

    return HttpResponse.json({
      success: true,
      data: {
        qr_code: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        qr_code_data: `MSW_MOCK_QR_${Date.now()}_${bank}`,
        amount: Number(amount),
        payment_method: body.payment_method || {
          type: 'qr_code',
          bank: bank,
        },
        payment_id: crypto.randomUUID(),
        expires_at: expiresAt,
      },
    });
  }),

  // Mock payment confirmation endpoint
  // Matches: */api/payments/confirm (any base URL)
  http.post('*/api/payments/confirm', async ({ request }) => {
    const formData = await request.formData().catch(() => null);
    
    console.log('🎭 MSW: Mocking payment confirmation - Auto-verified');

    return HttpResponse.json({
      success: true,
      data: {
        payment_id: formData?.get('payment_id')?.toString() || crypto.randomUUID(),
        order_id: formData?.get('order_id')?.toString() || '',
        amount: Number(formData?.get('amount') || 0),
        status: 'verified' as const,
        verified: true,
      },
      message: 'Payment proof uploaded and automatically verified (MSW Mock).',
    });
  }),

  // Mock payment status endpoint
  // Matches: */api/payments/:id (any base URL)
  http.get('*/api/payments/:id', ({ params }) => {
    const paymentId = params.id as string;
    
    console.log('🎭 MSW: Mocking payment status - Auto-verified', { paymentId });

    return HttpResponse.json({
      success: true,
      data: {
        id: paymentId,
        order_id: crypto.randomUUID(),
        amount: 100.00,
        currency: 'PHP',
        payment_type: 'full_payment',
        payment_method: {
          type: 'qr_code',
          bank: 'GCASH',
        },
        status: 'verified' as const,
        verified: true,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
    });
  }),
];

