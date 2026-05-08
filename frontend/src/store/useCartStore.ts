import { addToCartApi, clearCartApi, getCartApi, removeFromCartApi, updateQuantityApi } from '@/utils/user.api';
import { create } from 'zustand';

export interface CartItem {
    _id: string;
    name: string;
    price: number;
    images: string[];
    quantity: number;
    stock_quantity: number;
}

const mapCartItems = (data: any): CartItem[] => {
    const items = Array.isArray(data) ? data : (data?.items || []);
    return items
        .filter((item: any) => item.product || item._id)
        .map((item: any) => {
            const product = item.product || item;
            return {
                _id: product._id,
                name: product.name,
                price: product.price,
                images: product.images || [],
                quantity: item.quantity || 1,
                stock_quantity: product.stock_quantity || 0,
            };
        });
};

interface CartStore {
    items: CartItem[];
    isLoading: boolean;
    hasFetched: boolean;
    error: string | null;
    fetchCart: (accessToken: string) => Promise<void>;
    addItem: (product: IProduct, quantity: number, accessToken: string) => Promise<void>;
    removeItem: (productId: string, accessToken: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, accessToken: string) => Promise<void>;
    clearCart: (accessToken: string) => Promise<void>;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    isLoading: false,
    hasFetched: false,
    error: null,

    fetchCart: async (accessToken: string) => {
        set({ isLoading: true, error: null });
        try {
            const res = await getCartApi(accessToken);
            if (res?.data) {
                set({ items: mapCartItems(res.data), isLoading: false, hasFetched: true });
            } else {
                set({ items: [], isLoading: false, hasFetched: true });
            }
        } catch {
            set({ isLoading: false, error: 'Đã xảy ra lỗi khi tải giỏ hàng' });
        }
    },

    addItem: async (product, quantity, accessToken) => {
        const res = await addToCartApi(product._id, quantity, accessToken);
        if (res?.data) {
            set({ items: mapCartItems(res.data) });
        } else if (res?.statusCode === 200 || res?.statusCode === 201) {
            // Fallback if data is not returned but status is success
            const cartRes = await getCartApi(accessToken);
            if (cartRes?.data) set({ items: mapCartItems(cartRes.data) });
        }
    },

    removeItem: async (productId, accessToken) => {
        const res = await removeFromCartApi(productId, accessToken);
        if (res?.data) {
            set({ items: mapCartItems(res.data) });
        } else if (res?.statusCode === 200 || res?.statusCode === 201) {
            const cartRes = await getCartApi(accessToken);
            if (cartRes?.data) set({ items: mapCartItems(cartRes.data) });
        }
    },

    updateQuantity: async (productId, quantity, accessToken) => {
        const res = await updateQuantityApi(productId, quantity, accessToken);
        if (res?.data) {
            set({ items: mapCartItems(res.data) });
        } else if (res?.statusCode === 200 || res?.statusCode === 201) {
            const cartRes = await getCartApi(accessToken);
            if (cartRes?.data) set({ items: mapCartItems(cartRes.data) });
        }
    },

    clearCart: async (accessToken) => {
        const res = await clearCartApi(accessToken);
        if (res?.data) {
            set({ items: [] });
        }
    },

    getTotalPrice: () => {
        return get().items.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    },
}));
