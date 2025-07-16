"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-black/30 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-white/20 group-[.toaster]:text-white group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-white/80",
          actionButton: "group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:border-white/30 group-[.toast]:hover:bg-white/30",
          cancelButton: "group-[.toast]:bg-white/10 group-[.toast]:text-white/70 group-[.toast]:border-white/20 group-[.toast]:hover:bg-white/20",
          success: "group-[.toaster]:bg-green-500/20 group-[.toaster]:border-green-400/30 group-[.toaster]:text-green-100",
          error: "group-[.toaster]:bg-red-500/20 group-[.toaster]:border-red-400/30 group-[.toaster]:text-red-100",
          warning: "group-[.toaster]:bg-yellow-500/20 group-[.toaster]:border-yellow-400/30 group-[.toaster]:text-yellow-100",
          info: "group-[.toaster]:bg-blue-500/20 group-[.toaster]:border-blue-400/30 group-[.toaster]:text-blue-100",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(0, 0, 0, 0.3)",
          "--normal-text": "rgba(255, 255, 255, 0.9)",
          "--normal-border": "rgba(255, 255, 255, 0.2)",
          "--success-bg": "rgba(34, 197, 94, 0.2)",
          "--success-text": "rgba(240, 253, 244, 1)",
          "--success-border": "rgba(74, 222, 128, 0.3)",
          "--error-bg": "rgba(239, 68, 68, 0.2)",
          "--error-text": "rgba(254, 242, 242, 1)",
          "--error-border": "rgba(248, 113, 113, 0.3)",
          "--warning-bg": "rgba(245, 158, 11, 0.2)",
          "--warning-text": "rgba(254, 252, 232, 1)",
          "--warning-border": "rgba(251, 191, 36, 0.3)",
          "--info-bg": "rgba(59, 130, 246, 0.2)",
          "--info-text": "rgba(239, 246, 255, 1)",
          "--info-border": "rgba(96, 165, 250, 0.3)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
