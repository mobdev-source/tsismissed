"use client";

import Image from "next/image";
import { useTheme } from "./ThemeProvider";

interface ThemeLogoProps {
  /** "icon" renders logo.png; "full" renders the text logo (theme-aware) */
  variant: "icon" | "full";
  className?: string;
  /** Height in pixels — width auto-scales to maintain aspect ratio */
  height?: number;
  /** Width in pixels (optional, mainly for the icon variant) */
  width?: number;
  /** Alt text override */
  alt?: string;
}

// Intrinsic aspect ratio of the full text logo (width / height). Used to keep
// the width/height attributes proportional so Next.js doesn't warn when only
// one dimension is supplied.
const FULL_LOGO_RATIO = 280 / 56;

export function ThemeLogo({
  variant,
  className = "",
  height,
  width,
  alt = "TsisMissed",
}: ThemeLogoProps) {
  const { theme } = useTheme();

  if (variant === "icon") {
    const size = height ?? width ?? 32;
    return (
      <Image
        src="/logo.png"
        alt={alt}
        width={size}
        height={size}
        className={`object-contain ${className}`}
        priority
      />
    );
  }

  // Full text logo — switch by theme
  const src =
    theme === "light"
      ? "/logo_with_text_light.png"
      : "/logo_with_text_dark.png";

  // Derive the missing dimension from the intrinsic ratio, and when only one
  // axis is given let the other scale via CSS ("auto") to preserve the ratio.
  let finalWidth: number;
  let finalHeight: number;
  let autoStyle: React.CSSProperties | undefined;
  if (width !== undefined && height !== undefined) {
    finalWidth = width;
    finalHeight = height;
  } else if (height !== undefined) {
    finalHeight = height;
    finalWidth = Math.round(height * FULL_LOGO_RATIO);
    autoStyle = { width: "auto" };
  } else if (width !== undefined) {
    finalWidth = width;
    finalHeight = Math.round(width / FULL_LOGO_RATIO);
    autoStyle = { height: "auto" };
  } else {
    finalWidth = 280;
    finalHeight = 56;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={finalWidth}
      height={finalHeight}
      style={autoStyle}
      className={`object-contain ${className}`}
      priority
    />
  );
}
