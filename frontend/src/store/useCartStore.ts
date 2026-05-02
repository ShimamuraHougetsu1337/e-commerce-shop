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

const mapCartItems = (data: any[]): CartItem[] => {
    return data
        .filter((item: any) => item.product)
        .map((item: any) => ({
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            images: item.product.images || [],
            quantity: item.quantity,
            stock_quantity: item.product.stock_quantity,
        }));
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
            if (res?.data && Array.isArray(res.data)) {
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
        if (res?.data && Array.isArray(res.data)) {
            set({ items: mapCartItems(res.data) });
        }
    },

    removeItem: async (productId, accessToken) => {
        const res = await removeFromCartApi(productId, accessToken);
        if (res?.data && Array.isArray(res.data)) {
            set({ items: mapCartItems(res.data) });
        }
    },

    updateQuantity: async (productId, quantity, accessToken) => {
        const res = await updateQuantityApi(productId, quantity, accessToken);
        if (res?.data && Array.isArray(res.data)) {
            set({ items: mapCartItems(res.data) });
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
