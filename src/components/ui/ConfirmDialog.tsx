"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface-dark border border-white/10 rounded-3xl w-full max-w-md p-6 lg:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDangerous ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                <span className={`material-symbols-outlined text-2xl ${isDangerous ? 'text-red-500' : 'text-primary'}`}>
                  {isDangerous ? 'warning' : 'help'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold uppercase tracking-tight mb-2">
                  {title}
                </h3>
                <p className="text-sm text-text-dim leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-white/5 text-white font-bold uppercase tracking-widest text-[11px] hover:bg-white/10 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-colors ${
                  isDangerous
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
