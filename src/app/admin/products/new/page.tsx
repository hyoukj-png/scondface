"use client";

import ProductForm from "@/components/admin/ProductForm";
import { Toaster } from "react-hot-toast";

export default function NewProductPage() {
    return (
        <div className="space-y-8">
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#1a1a1e',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        borderRadius: '1rem'
                    }
                }}
            />
            <ProductForm />
        </div>
    );
}
