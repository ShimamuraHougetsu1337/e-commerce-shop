import { addToWishlist, getWishlist, removeFromWishlist } from '@/utils/user.api';
import { create } from 'zustand';

interface WishlistStore {
    items: IProduct[];
    isLoading: boolean;
    hasFetched: boolean;
    error: string | null;
    fetchWishlist: (accessToken: string) => Promise<void>;
    addItem: (product: IProduct, accessToken: string) => Promise<void>;
    removeItem: (productId: string, accessToken: string) => Promise<void>;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>((set) => ({
    items: [],
    isLoading: false,
    hasFetched: false,
    error: null,

    fetchWishlist: async (accessToken) => {
        set({ isLoading: true, error: null });
        try {
            const res = await getWishlist(accessToken);
            if (res?.data) {
                set({ items: res.data, isLoading: false, hasFetched: true });
            } else {
                set({ items: [], isLoading: false, hasFetched: true, error: res?.message ?? 'Không thể tải danh sách yêu thích' });
            }
        } catch {
            set({ isLoading: false, error: 'Đã xảy ra lỗi khi tải danh sách yêu thích' });
        }
    },
    addItem: async (product, accessToken) => {
        const res = await addToWishlist(product._id, accessToken);
        if (res?.statusCode === 200 || res?.statusCode === 201) {
            set((state) => {
                if (state.items.find((item) => item._id === product._id)) return state;
                return { items: [...state.items, product] };
            });
        }
    },

    removeItem: async (productId, accessToken) => {
        const res = await removeFromWishlist(productId, accessToken);
        if (res?.statusCode === 200 || res?.statusCode === 201) {
            set((state) => ({
                items: state.items.filter((item) => item._id !== productId),
            }));
        }
    },

    clearWishlist: () => set({ items: [], hasFetched: false, error: null }),
}));