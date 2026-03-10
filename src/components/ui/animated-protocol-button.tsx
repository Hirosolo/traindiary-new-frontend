"use client";

import React from "react";

type AnimatedProtocolButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function AnimatedProtocolButton({ ...rest }: AnimatedProtocolButtonProps) {
    return (
        <section className="flex justify-center items-center">
            <button
                {...rest}
                className="group relative flex justify-center p-2 rounded-md bg-white/5 border border-white/10 text-white font-semibold transition-colors hover:bg-white/10"
            >
                <span className="material-symbols-outlined w-5 h-5 flex items-center justify-center text-[20px] group-hover:text-primary transition-colors">
                    bolt
                </span>
                <span className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 text-primary text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-opacity pointer-events-none">
                    Set Goal
                </span>
            </button>
        </section>
    );
}
