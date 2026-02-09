import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ShippingInfo {
    name: string;
    phone: string;
    postcode: string;
    roadAddress: string;
    detailAddress: string;
    memo: string;
}

interface CheckoutState {
    shippingInfo: ShippingInfo;
    setShippingInfo: (info: Partial<ShippingInfo>) => void;
    clearShippingInfo: () => void;
}

const initialShippingInfo: ShippingInfo = {
    name: '',
    phone: '',
    postcode: '',
    roadAddress: '',
    detailAddress: '',
    memo: '',
};

export const useCheckoutStore = create<CheckoutState>()(
    persist(
        (set) => ({
            shippingInfo: initialShippingInfo,
            setShippingInfo: (info) =>
                set((state) => ({
                    shippingInfo: { ...state.shippingInfo, ...info },
                })),
            clearShippingInfo: () => set({ shippingInfo: initialShippingInfo }),
        }),
        {
            name: 'antigravity-checkout',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
