"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import ImageUploader from "./ImageUploader";
import { toast } from "react-hot-toast";
import { Loader2, Save, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import imageCompression from 'browser-image-compression';

interface ProductFormProps {
    initialData?: any;
}

export default function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "sunglasses",
        stock: 0,
        description: "",
        is_featured: false,
        is_bestseller: false
    });

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch("/api/categories");
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        }
        fetchCategories();
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                price: (initialData.price || "").replace(/[^0-9]/g, ""),
                category: initialData.category || "sunglasses",
                stock: initialData.stock || 0,
                description: initialData.description || "",
                is_featured: initialData.is_featured || false,
                is_bestseller: initialData.is_bestseller || false
            });
            setExistingImages(initialData.images || []);
        }
    }, [initialData]);

    const handleImageChange = (files: File[], previews: string[]) => {
        setImages(files);
        setPreviews(previews);
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);
        setImages(newImages);
        setPreviews(newPreviews);
    };

    const handleRemoveExistingImage = (index: number) => {
        const newExistingImages = [...existingImages];
        newExistingImages.splice(index, 1);
        setExistingImages(newExistingImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For editing, allow submission even without new images if existing images are present
        if (!initialData && images.length === 0) {
            toast.error("Please upload at least one artifact image.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading(initialData ? "Updating mission data..." : "Processing mission data...");

        try {
            const uploadedUrls: string[] = [...existingImages]; // Keep existing images
            const compressionOptions = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1200,
                useWebWorker: true,
            };

            // 1. Process and Upload New Images
            for (let i = 0; i < images.length; i++) {
                const file = images[i];

                // Client-side compression
                toast.loading(`Optimizing artifact ${i + 1}/${images.length}...`, { id: toastId });
                const compressedFile = await imageCompression(file, compressionOptions);

                const fileExt = compressedFile.name.split('.').pop() || 'png';
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `products/${fileName}`;

                const { data, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, compressedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            const productData = {
                name: formData.name,
                price: `₩${formData.price.replace(/[^0-9]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                category: formData.category,
                description: formData.description,
                stock: formData.stock,
                images: uploadedUrls,
                is_featured: formData.is_featured,
                is_bestseller: formData.is_bestseller
            };

            // 2. Insert or Update Product in Database
            if (initialData) {
                // Update existing product
                const { error: dbError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', initialData.id);

                if (dbError) throw dbError;
                toast.success("Artifact manifest updated successfully!", { id: toastId });
            } else {
                // Insert new product
                const { error: dbError } = await supabase
                    .from('products')
                    .insert([productData]);

                if (dbError) throw dbError;
                toast.success("Artifact manifest synchronized successfully!", { id: toastId });
            }

            router.push('/admin/products');
            router.refresh();
        } catch (error: any) {
            console.error("Upload Error:", error);
            toast.error(`Sync Failed: ${error.message || "Unknown anomaly"}`, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/admin/products" className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all">
                        <ArrowLeft size={18} />
                    </Link>
                    <h2 className="text-3xl font-black italic tracking-tight uppercase">
                        {initialData ? "Edit Archive Entry" : "New Archive Entry"}
                    </h2>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="px-8 py-4 bg-blue-500 text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {loading ? (initialData ? "Updating..." : "Synchronizing...") : (initialData ? "Update Manifest" : "Synchronize Manifest")}
                </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Information Section */}
                <div className="lg:col-span-7 space-y-10">
                    <section className="p-10 rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 pb-2 border-b border-white/5">Primary Data</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Artifact Designation</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter Product Name"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Price Unit (KRW)</label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 font-bold">₩</span>
                                        <input
                                            required
                                            type="text"
                                            placeholder="280,000"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono font-bold"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/[^0-9]/g, "") })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Stock Count</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-mono font-bold"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Artifact Category</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-black uppercase text-xs tracking-widest appearance-none"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.value} className="bg-[#0a0a0c] text-white">
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Detailed Log</label>
                                <textarea
                                    required
                                    rows={6}
                                    placeholder="Enter artifact specifications and lore..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium text-sm leading-relaxed"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="is_featured"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                />
                                <label htmlFor="is_featured" className="flex-1 cursor-pointer">
                                    <div className="text-sm font-bold text-blue-400">Display on Main Page</div>
                                    <div className="text-xs text-slate-500 mt-1">Feature this product on the homepage hero section</div>
                                </label>
                            </div>

                            <div className="flex items-center gap-4 p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="is_bestseller"
                                    checked={formData.is_bestseller}
                                    onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                                    className="w-5 h-5 rounded bg-white/5 border-white/10 text-yellow-500 focus:ring-2 focus:ring-yellow-500/50 cursor-pointer"
                                />
                                <label htmlFor="is_bestseller" className="flex-1 cursor-pointer">
                                    <div className="text-sm font-bold text-yellow-400">Mark as Best Seller</div>
                                    <div className="text-xs text-slate-500 mt-1">Display in the Best Sellers section</div>
                                </label>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Media Section */}
                <div className="lg:col-span-5 space-y-10">
                    <section className="p-10 rounded-[2.5rem] bg-[#0a0a0c] border border-white/5">
                        <ImageUploader
                            images={images}
                            previews={previews}
                            existingImages={existingImages}
                            onChange={handleImageChange}
                            onRemove={handleRemoveImage}
                            onRemoveExisting={handleRemoveExistingImage}
                        />
                    </section>

                    {/* Status Box */}
                    <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
                        <div className="flex items-center gap-3 text-blue-400">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Uplink Status: Ready</span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 leading-relaxed uppercase">
                            Warning: Synchronizing data with the main archive will make these artifacts immediately visible to all active pilots across the globe.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
