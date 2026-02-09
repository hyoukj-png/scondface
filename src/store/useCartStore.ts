import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    selectedOption?: string;
}

interface CartState {
    cartItems: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (id: string, selectedOption?: string) => void;
    updateQuantity: (id: string, quantity: number, selectedOption?: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
    setIsOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            cartItems: [],
            isOpen: false,
            addItem: (item) =>
                set((state) => {
                    const existingItemIndex = state.cartItems.findIndex(
                        (i) => i.id === item.id && i.selectedOption === item.selectedOption
                    );

                    if (existingItemIndex > -1) {
                        const newCartItems = [...state.cartItems];
                        newCartItems[existingItemIndex].quantity += item.quantity;
                        return { cartItems: newCartItems };
                    }

                    return { cartItems: [...state.cartItems, item] };
                }),
            removeItem: (id, selectedOption) =>
                set((state) => ({
                    cartItems: state.cartItems.filter(
                        (i) => !(i.id === id && i.selectedOption === selectedOption)
                    ),
                })),
            updateQuantity: (id, quantity, selectedOption) =>
                set((state) => ({
                    cartItems: state.cartItems.map((i) =>
                        i.id === id && i.selectedOption === selectedOption
                            ? { ...i, quantity: Math.max(1, quantity) }
                            : i
                    ),
                })),
            clearCart: () => set({ cartItems: [] }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            setIsOpen: (open) => set({ isOpen: open }),
        }),
        {
            name: 'antigravity-cart',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
