"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface CountingNumberProps {
    value: number;
    duration?: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export default function CountingNumber({
    value,
    duration = 2,
    className = "",
    prefix = "",
    suffix = ""
}: CountingNumberProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 50,
        stiffness: 100,
    });
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [isInView, value, motionValue]);

    useEffect(() => {
        springValue.on("change", (latest) => {
            if (ref.current) {
                // Format number with commas
                const formatted = Math.floor(latest).toLocaleString();
                ref.current.textContent = `${prefix}${formatted}${suffix}`;
            }
        });

        return () => springValue.clearListeners();
    }, [springValue, prefix, suffix]);

    return <span ref={ref} className={className} />;
}
