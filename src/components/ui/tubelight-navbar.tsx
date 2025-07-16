"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  isScrolled?: boolean
  logoComponent?: React.ReactNode
  authButtonsComponent?: React.ReactNode
  hasWhiteBackground?: boolean
}

export function NavBar({ 
  items, 
  className, 
  isScrolled, 
  logoComponent,
  authButtonsComponent, 
  hasWhiteBackground
}: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  // isMobile state is not used with the new design, can be removed if not needed elsewhere
  // const [isMobile, setIsMobile] = useState(false)

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth < 768)
  //   }
  //   handleResize()
  //   window.addEventListener("resize", handleResize)
  //   return () => window.removeEventListener("resize", handleResize)
  // }, [])

  return (
    <div
      className={cn(
        "flex", 
        isScrolled ? "justify-center w-full" : "justify-center", // Ensure it can expand if needed
        className,
      )}
    >
      <div className={cn(
        "flex items-center transition-all duration-300 ease-in-out",
        isScrolled 
          ? "gap-4 px-4 py-2 w-full max-w-4xl justify-center"
          : "gap-3 py-1 px-1"
      )}>
        {isScrolled && logoComponent}
        
        {/* Navigation items container - needed for proper centering when not scrolled 
            and for grouping nav items when scrolled */}
        <div className={cn(
          "flex items-center",
          isScrolled ? "gap-1" : "gap-3"
        )}>
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <Link
                key={item.name}
                href={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold rounded-full transition-colors",
                  isScrolled ? "px-3 py-1.5" : "px-6 py-2",
                  hasWhiteBackground 
                    ? "text-neutral-900 hover:text-neutral-700"
                    : "text-white hover:text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]",
                  isActive && (hasWhiteBackground ? "text-blue-600" : "text-white")
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className={cn(
                        "absolute inset-0 w-full rounded-full -z-10",
                        hasWhiteBackground ? "bg-transparent" : "bg-transparent"
                    )}
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    {/* Lamp effect styling - updated to match provided example */}
                    <div className={cn(
                        "absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full",
                        hasWhiteBackground ? "bg-transparent" : "bg-transparent"
                    )}>
                      <div className={cn("absolute w-12 h-6 rounded-full blur-md -top-2 -left-2", hasWhiteBackground ? "bg-transparent" : "bg-transparent")} />
                      <div className={cn("absolute w-8 h-6 rounded-full blur-md -top-1", hasWhiteBackground ? "bg-transparent" : "bg-transparent")} />
                      <div className={cn("absolute w-4 h-4 rounded-full blur-sm top-0 left-2", hasWhiteBackground ? "bg-transparent" : "bg-transparent")} />
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
        </div>

        {isScrolled && authButtonsComponent}
      </div>
    </div>
  )
}
