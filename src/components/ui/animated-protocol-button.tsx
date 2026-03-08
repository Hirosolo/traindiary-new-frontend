"use client";

import React from "react";

type AnimatedProtocolButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function AnimatedProtocolButton({ ...rest }: AnimatedProtocolButtonProps) {
    return (
        <section className="flex justify-center items-center">
            <button
                {...rest}
                className="group relative flex justify-center p-2 rounded-md drop-shadow-xl bg-gradient-to-r from-gray-800 to-black text-white font-semibold hover:translate-y-3 hover:rounded-[50%] transition-all duration-500 hover:from-primary hover:to-primary-dark"
            >
                <span className="material-symbols-outlined w-5 h-5 flex items-center justify-center text-[20px]">
                    bolt
                </span>
                <span className="absolute opacity-0 group-hover:opacity-100 group-hover:text-primary group-hover:text-[10px] group-hover:font-black group-hover:uppercase group-hover:tracking-widest group-hover:-translate-y-10 duration-700 whitespace-nowrap">
                    Set Goal
                </span>
            </button>
        </section>
    );
}
