import { createId } from './ids.js';

export class MockProcessorAdapter {
  authorizeAndCapture({ amount, method, methodDetails = {} }) {
    const cardNumber = String(methodDetails.card_number || '').replace(/\D/g, '');

    if (method === 'card' && cardNumber.endsWith('0000')) {
      return {
        status: 'failed',
        processor_reference: createId('processor'),
        failure_code: 'card_declined',
        failure_reason: 'Mock processor declined cards ending in 0000.',
      };
    }

    if (amount > 50000000) {
      return {
        status: 'failed',
        processor_reference: createId('processor'),
        failure_code: 'amount_limit_exceeded',
        failure_reason: 'Sandbox payments above ₹5,00,000 are declined.',
      };
    }

    return {
      status: 'captured',
      processor_reference: createId('processor'),
      failure_code: null,
      failure_reason: null,
    };
  }

  refund({ amount, capturedAmount, refundedAmount }) {
    if (refundedAmount + amount > capturedAmount) {
      return { status: 'failed', failure_code: 'refund_amount_exceeded' };
    }

    return { status: 'processed', failure_code: null };
  }
}
