import { MessageCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { siteConfig } from "@/config/siteConfig"
import { cn } from "@/utils/cn"

export function WhatsAppButton() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <a
      href={`https://wa.me/${siteConfig.whatsappNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:bg-green-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
        "animate-bounce-subtle"
      )}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  )
}