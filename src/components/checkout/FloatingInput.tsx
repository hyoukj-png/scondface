"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { useState } from "react";

interface FloatingInputProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    rules?: object;
    readOnly?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FloatingInput({ name, label, type = "text", placeholder = "", rules = {}, readOnly = false, onChange: customOnChange }: FloatingInputProps) {
    const { register, formState: { errors }, watch } = useFormContext();
    const { onChange, ...restRegister } = register(name, rules);
    const value = watch(name);
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = value && value.length > 0;
    const isError = !!errors[name];

    return (
        <div className="relative w-full group">
            <motion.label
                initial={false}
                animate={{
                    y: (isFocused || hasValue) ? -24 : 0,
                    scale: (isFocused || hasValue) ? 0.9 : 1,
                    color: isError ? "#f87171" : isFocused ? "#60a5fa" : "#94a3b8",
                }}
                className="absolute left-4 top-4 pointer-events-none font-mono text-xs uppercase tracking-[0.2em] transform-gpu origin-left"
            >
                {label}
            </motion.label>

            <input
                {...restRegister}
                onChange={(e) => {
                    onChange(e);
                    if (customOnChange) customOnChange(e);
                }}
                type={type}
                readOnly={readOnly}
                placeholder={isFocused ? placeholder : ""}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`
          w-full bg-white/5 border rounded-xl px-4 py-4 pt-7 text-base font-medium transition-all duration-300 outline-none
          ${isError ? "border-red-500/50 ring-1 ring-red-500/20" : "border-white/10 group-hover:border-white/20"}
          ${isFocused ? "border-blue-500/50 ring-2 ring-blue-500/20 bg-white/10" : ""}
          ${readOnly ? "opacity-60 cursor-not-allowed" : ""}
        `}
            />

            <AnimatePresence>
                {isError && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-xs text-red-500 font-mono mt-1 ml-1 uppercase"
                    >
                        {errors[name]?.message as string || "필수 입력 항목"}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Glow Effect */}
            {isFocused && (
                <motion.div
                    layoutId={`${name}-glow`}
                    className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 -z-10 blur-sm"
                />
            )}
        </div>
    );
}
