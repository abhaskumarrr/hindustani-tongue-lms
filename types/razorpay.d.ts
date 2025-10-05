declare module 'razorpay' {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
  }

  interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, any>;
  }

  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: number;
    receipt?: string;
    notes?: Record<string, any>;
  }

  interface RazorpayUtils {
    validateWebhookSignature(
      body: string,
      signature: string,
      secret: string
    ): boolean;
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    
    orders: {
      create(options: RazorpayOrderOptions): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
    };

    static utils: RazorpayUtils;
  }

  export = Razorpay;
}