import {
  Facebook,
  Instagram,
  Youtube,
  Music,
  Twitter,
  MessageCircle,
} from "lucide-react"
import { siteConfig } from "@/config/siteConfig"
import { cn } from "@/utils/cn"

const socialLinks = [
  { name: "Facebook", icon: Facebook, url: siteConfig.socials.facebook },
  { name: "Instagram", icon: Instagram, url: siteConfig.socials.instagram },
  { name: "YouTube", icon: Youtube, url: siteConfig.socials.youtube },
  { name: "TikTok", icon: Music, url: siteConfig.socials.tiktok },
  { name: "X", icon: Twitter, url: siteConfig.socials.x },
  { name: "WhatsApp", icon: MessageCircle, url: `https://wa.me/${siteConfig.whatsappNumber}` },
] as const

export function Footer() {
  return (
    <footer className="border-t bg-white py-6 text-center text-sm text-muted-foreground dark:bg-card">
      <div className="mx-auto max-w-6xl px-4">
        <p className="font-medium">{siteConfig.branchName}</p>
        <p className="mt-1">{siteConfig.organizationName}</p>
        <div className="flex justify-center gap-4 mt-4">
          {socialLinks.map(({ name, icon: Icon, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-muted-foreground hover:text-primary transition-colors",
                !url && "pointer-events-none opacity-40"
              )}
              aria-label={name}
              aria-disabled={!url}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}