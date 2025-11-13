import { Payment } from '../types';
import StorageService from './StorageService';
import { generateId } from '../utils/id';
import { APP_CONFIG } from '../utils/constants';

export interface CreatePaymentInput {
  userId: string;
  shopOwnerId?: string;
  type: Payment['type'];
  amount: number;
  currency?: string;
  status?: Payment['status'];
  method?: string;
  description?: string;
  metadata?: Record<string, any>;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

export function createPayment(input: CreatePaymentInput): Payment {
  const now = new Date();

  const payment: Payment = {
    id: generateId('payment'),
    user_id: input.userId,
    shop_owner_id: input.shopOwnerId,
    type: input.type,
    amount: input.amount,
    currency: input.currency || 'INR',
    status: input.status || 'pending',
    method: input.method,
    description: input.description,
    metadata: input.metadata,
    razorpay_payment_id: input.razorpayPaymentId,
    razorpay_order_id: input.razorpayOrderId,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  StorageService.savePayment(payment);
  return payment;
}

export function getPaymentHistory(userId: string): Payment[] {
  return StorageService.getPaymentsByUserId(userId).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getPaymentHistoryByType(userId: string, type: Payment['type']): Payment[] {
  return StorageService.getPaymentsByType(userId, type).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function updatePaymentStatus(paymentId: string, status: Payment['status']): Payment {
  const payments = StorageService.getPayments();
  const payment = payments.find(p => p.id === paymentId);

  if (!payment) {
    throw new Error('Payment not found');
  }

  const updated: Payment = {
    ...payment,
    status,
    updated_at: new Date().toISOString(),
  };

  StorageService.savePayment(updated);
  return updated;
}

export function getPaymentById(paymentId: string): Payment | null {
  return StorageService.getPayments().find(p => p.id === paymentId) || null;
}

/**
 * Generate a mock invoice for a payment (for testing)
 */
export function generateInvoice(payment: Payment): string {
  const invoiceNumber = `INV-${payment.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = new Date(payment.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const invoice = `
========================================
        MARKET YARD - INVOICE
========================================

Invoice Number: ${invoiceNumber}
Invoice Date: ${invoiceDate}
Payment ID: ${payment.id}

----------------------------------------
BILLING DETAILS
----------------------------------------
User ID: ${payment.user_id}
Payment Type: ${payment.type}
Payment Method: ${payment.method || 'N/A'}

----------------------------------------
PAYMENT DETAILS
----------------------------------------
Amount: ₹${payment.amount.toFixed(2)}
Currency: ${payment.currency}
Status: ${payment.status.toUpperCase()}

${payment.description ? `Description: ${payment.description}` : ''}

----------------------------------------
PAYMENT INFORMATION
----------------------------------------
Payment Date: ${new Date(payment.created_at).toLocaleString('en-IN')}
${payment.razorpay_payment_id ? `Razorpay Payment ID: ${payment.razorpay_payment_id}` : ''}
${payment.razorpay_order_id ? `Razorpay Order ID: ${payment.razorpay_order_id}` : ''}

----------------------------------------
Thank you for your business!
========================================
`;

  return invoice;
}

/**
 * Download invoice as text file (mock)
 */
export function downloadInvoice(payment: Payment): void {
  const invoice = generateInvoice(payment);
  const blob = new Blob([invoice], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${payment.id.slice(0, 8)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Mock Payment Simulation Result
 */
export interface MockPaymentResult {
  success: boolean;
  payment: Payment;
  error?: string;
}

/**
 * Simulate payment processing with configurable success/failure
 * @param input Payment input data
 * @param forceResult Optional: 'success' | 'failure' to force a specific result, or undefined to use random based on success rate
 * @returns Promise that resolves with payment result after simulated delay
 */
export async function simulatePayment(
  input: CreatePaymentInput,
  forceResult?: 'success' | 'failure'
): Promise<MockPaymentResult> {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, APP_CONFIG.MOCK_PAYMENT_DELAY_MS));

  // Determine payment result
  let willSucceed: boolean;
  if (forceResult === 'success') {
    willSucceed = true;
  } else if (forceResult === 'failure') {
    willSucceed = false;
  } else {
    // Use random based on success rate
    willSucceed = Math.random() < APP_CONFIG.MOCK_PAYMENT_SUCCESS_RATE;
  }

  // Create payment record with appropriate status
  const payment = createPayment({
    ...input,
    status: willSucceed ? 'success' : 'failed',
    method: input.method || 'Mock Payment Gateway',
    razorpayPaymentId: willSucceed ? `mock_pay_${generateId('payment').slice(0, 12)}` : undefined,
    razorpayOrderId: willSucceed ? `mock_order_${generateId('order').slice(0, 12)}` : undefined,
  });

  if (willSucceed) {
    return {
      success: true,
      payment,
    };
  } else {
    // Simulate common payment failure reasons
    const failureReasons = [
      'Insufficient funds',
      'Payment gateway timeout',
      'Card declined',
      'Network error',
      'Invalid payment method',
    ];
    const randomReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];

    return {
      success: false,
      payment,
      error: randomReason,
    };
  }
}

/**
 * Simulate payment success (for testing)
 */
export async function simulatePaymentSuccess(input: CreatePaymentInput): Promise<MockPaymentResult> {
  return simulatePayment(input, 'success');
}

/**
 * Simulate payment failure (for testing)
 */
export async function simulatePaymentFailure(input: CreatePaymentInput): Promise<MockPaymentResult> {
  return simulatePayment(input, 'failure');
}

