"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TabProps {
  text: string
  selected: boolean
  setSelected: (text: string) => void
  discount?: boolean
}

export function PricingTab({
  text,
  selected,
  setSelected,
  discount = false,
}: TabProps) {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        "relative w-fit px-6 py-3 text-sm font-medium transition-all duration-300",
        selected 
          ? "text-white" 
          : "text-white/80 hover:text-white",
        discount && "flex items-center justify-center gap-2"
      )}
    >
      <span className="relative z-10 uppercase tracking-wider font-medium">{text}</span>
      {selected && (
        <motion.span
          layoutId="bubble"
          className="absolute inset-0 z-0 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {discount && (
        <span className="relative z-10 text-xs text-white/90 font-normal ml-2">
          (ECONOMIZE 20%)
        </span>
      )}
    </button>
  )
} 