"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col h-[100vh] items-center justify-center bg-transparent text-slate-950 transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `absolute -inset-[10px] opacity-60
            [background:radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15)_0%,_rgba(255,255,255,0.05)_30%,_transparent_70%)]
            animate-aurora
            pointer-events-none
            will-change-transform`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
          style={{
            backgroundSize: "200% 200%",
          }}
        ></div>
      </div>
      {children}
    </div>
  );
};
