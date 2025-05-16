import { Plan, Coupon, Subscription, SubscriptionResponse, PlanResponse, CouponResponse, PaystackInitResponse } from '@/@types/db';
import { StackResponse } from '@/@types/generics';
import { stackbase } from '@/lib/stackbase'

// Get all plans
export const getPlans = async (): Promise<StackResponse<Plan[]>> => {
    try {
        const { data } = await stackbase.get('/subscriptions/plans/');
        return {
            message: data?.message,
            error: null,
            data: (data.data as Plan[]) || [],
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: [],
            status: error?.response?.status,
        };
    }
};

// Get all coupons
export const getCoupons = async (): Promise<StackResponse<Coupon[]>> => {
    try {
        const { data } = await stackbase.get('/subscriptions/coupons/');
        return {
            message: data?.message,
            error: null,
            data: (data.data as Coupon[]) || [],
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: [],
            status: error?.response?.status,
        };
    }
};

// Get all subscriptions for current user
export const getSubscriptions = async (): Promise<StackResponse<Subscription[]>> => {
    try {
        const { data } = await stackbase.get('/subscriptions/my/');
        return {
            message: data?.message,
            error: null,
            data: (data.data as Subscription[]) || [],
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: [],
            status: error?.response?.status,
        };
    }
};

// Get a single subscription by ID
export const getSubscription = async (id: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.get(`/subscriptions/${id}/`);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Create a new subscription
export const createSubscription = async (payload: Partial<Subscription>): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post('/subscriptions/', payload);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};


export const paystackInitialize = async ({ subscriptionId, planId }: { subscriptionId: string, planId: string }): Promise<StackResponse<PaystackInitResponse | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${subscriptionId}/paystack_initialize/`, { plan_id: planId });
        return {
            message: data?.message,
            error: null,
            data: data as PaystackInitResponse,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail || 'Paystack initialization failed',
            error: error?.response?.data || error,
            data: null,
            status: error?.response?.status || 500,
        };
    }
};

export const paystackInit = async (planId: string): Promise<StackResponse<PaystackInitResponse | null>> => {
    try {
        const { data } = await stackbase.post('/subscriptions/paystack_init/', { plan_id: planId });
        return {
            message: data?.message,
            error: null,
            data: data as PaystackInitResponse,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail || 'Paystack initialization failed',
            error: error?.response?.data || error,
            data: null,
            status: error?.response?.status || 500,
        };
    }
}

// Activate a subscription
export const activateSubscription = async (id: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${id}/activate/`);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Cancel a subscription
export const cancelSubscription = async (id: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${id}/cancel/`);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Renew a subscription
export const renewSubscription = async (id: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${id}/renew/`);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Start trial for a subscription
export const startTrial = async (id: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${id}/start_trial/`);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Start grace period for a subscription
export const startGrace = async (id: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${id}/start_grace/`);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Apply coupon to a subscription
export const applyCoupon = async (id: string, coupon_code: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${id}/apply_coupon/`, { coupon_code });
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Simulate payment for a subscription
export const simulatePayment = async (id: string): Promise<StackResponse<Subscription | null>> => {
    try {
        const { data } = await stackbase.post(`/subscriptions/${id}/simulate_payment/`);
        return {
            message: data?.message,
            error: null,
            data: data.data as Subscription,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Get API status for a subscription
export const getSubscriptionApiStatus = async (id: string): Promise<StackResponse<any>> => {
    try {
        const { data } = await stackbase.get(`/subscriptions/${id}/api_status/`);
        return {
            message: data?.message,
            error: null,
            data: data.data,
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
        };
    }
};

// Get current user's subscriptions (my)
export const getMySubscriptions = async (): Promise<StackResponse<Subscription[]>> => {
    try {
        const { data } = await stackbase.get('/subscriptions/my/');
        return {
            message: data?.message,
            error: null,
            data: (data.data as Subscription[]) || [],
            status: data?.status,
        };
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error?.response?.data?.detail,
            error: error?.response?.data,
            data: [],
            status: error?.response?.status,
        };
    }
};
