import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  priority?: boolean;
}

export function Logo({
  className,
  size = "md",
  href = "/",
  priority = true,
}: LogoProps) {
  const sizeMap = {
    sm: "h-8 sm:h-9 w-auto",
    md: "h-10 sm:h-12 md:h-13 w-auto",
    lg: "h-14 sm:h-16 md:h-20 w-auto",
  };

  const image = (
    <Image
      src="/images/logo/logo.png"
      alt="Liyana Naturals"
      width={687}
      height={224}
      priority={priority}
      className={cn(
        "object-contain shrink-0 select-none transition-transform duration-200 hover:scale-[1.02]",
        sizeMap[size],
        className
      )}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536B35] rounded-lg"
        aria-label="Liyana Naturals Homepage"
      >
        {image}
      </Link>
    );
  }

  return image;
}
