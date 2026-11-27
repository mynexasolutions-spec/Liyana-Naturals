import {
  Check,
  Droplet,
  FlaskConical,
  Heart,
  Leaf,
  Lock,
  ShieldCheck,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import type { BadgeIconKey } from "@/lib/content/badges";

const ICONS: Record<BadgeIconKey, LucideIcon> = {
  leaf: Leaf,
  shield: ShieldCheck,
  sparkles: Sparkles,
  droplet: Droplet,
  heart: Heart,
  flask: FlaskConical,
  sun: Sun,
  check: Check,
  lock: Lock,
};

export function BadgeIcon({ icon, className }: { icon: BadgeIconKey; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden="true" className={className} />;
}
