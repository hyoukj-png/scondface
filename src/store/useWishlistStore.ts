import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItem {
    id: string;
    name: string;
    price: string;
    image: string;
}

interface WishlistState {
    wishlistItems: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    toggleItem: (item: WishlistItem) => void;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            wishlistItems: [],
            addItem: (item) =>
                set((state) => {
                    if (state.wishlistItems.some((i) => i.id === item.id)) return state;
                    return { wishlistItems: [...state.wishlistItems, item] };
                }),
            removeItem: (id) =>
                set((state) => ({
                    wishlistItems: state.wishlistItems.filter((i) => i.id !== id),
                })),
            toggleItem: (item) => {
                const state = get();
                const exists = state.wishlistItems.some((i) => i.id === item.id);
                if (exists) {
                    state.removeItem(item.id);
                } else {
                    state.addItem(item);
                }
            },
            clearWishlist: () => set({ wishlistItems: [] }),
        }),
        {
            name: 'antigravity-wishlist',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
