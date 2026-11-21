"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareArticleButtonProps {
  title: string;
}

export function ShareArticleButton({ title }: ShareArticleButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled native share or it wasn't available; fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EAF1DF] hover:bg-[#DCE8D0] text-[#263D18] text-xs sm:text-sm font-medium border border-[#A8B88A]/40 transition-all duration-200 active:scale-95 cursor-pointer"
      aria-label="Share this article"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#536B35]" />
          <span>Link Copied</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-[#536B35]" />
          <span>Share Article</span>
        </>
      )}
    </button>
  );
}
