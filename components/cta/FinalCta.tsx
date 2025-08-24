"use client";

import Link from "next/link";
import { ReactNode } from "react";
import CtaBadge from "@/components/cta/CtaBadge";

/** Pass a Lucide icon or any SVG component */
type IconType = (props: React.SVGProps<SVGSVGElement>) => JSX.Element;

<FinalCta
  extra={
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <CtaBadge>No credit card required</CtaBadge>
      <CtaBadge>Cancel anytime</CtaBadge>
      <CtaBadge>Trusted by 200+ customers</CtaBadge>
    </div>
  }
/>

type FinalCtaProps = {
  heading?: string;
  subheading?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  primaryEventLabel?: string;
  secondaryEventLabel?: string;
  eventPrefix?: string;
  theme?: "light" | "dark" | "gradient";

  /** Custom Tailwind class overrides */
  className?: string;
  headingClassName?: string;
  subheadingClassName?: string;
  primaryClassName?: string;
  secondaryClassName?: string;

  /** Optional media */
  imageSrc?: string;
  imageAlt?: string;
  /** "top" (default), "left", or "right" */
  imagePosition?: "top" | "left" | "right";
  imageClassName?: string;

  /** Optional icon (e.g., from lucide-react) */
  Icon?: IconType;
  iconClassName?: string;

  /** Optional extra content slot (badges, trust marks, etc.) */
  extra?: ReactNode;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

export default function FinalCta({
  heading = "Ready to never run out again?",
  subheading = "Auto-reorders for essentials + subscription tracking in one place.",
  primaryHref = "/pricing",
  primaryLabel = "Start in 60 seconds",
  secondaryHref = "#how-it-works",
  secondaryLabel = "Learn more →",
  primaryEventLabel,
  secondaryEventLabel,
  eventPrefix = "final",
  theme = "light",

  className = "",
  headingClassName = "",
  subheadingClassName = "",
  primaryClassName = "",
  secondaryClassName = "",

  imageSrc,
  imageAlt = "",
  imagePosition = "top",
  imageClassName = "",

  Icon,
  iconClassName = "h-10 w-10",

  extra,
}: FinalCtaProps) {
  const pLabel = primaryEventLabel ?? `${eventPrefix}_${slugify(primaryLabel)}`;
  const sLabel = secondaryEventLabel ?? `${eventPrefix}_${slugify(secondaryLabel)}`;

  const track = (label: string) => {
    (window as any)?.va?.track?.(`cta_${label}`);
    (window as any)?.gtag?.("event", "cta_click", { label });
  };

  const themes = {
    light: "border-white/10 bg-white text-gray-900",
    dark: "border-white/10 bg-gray-900 text-white",
    gradient: "border-none bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white shadow-xl",
  };

  const textSubtle = theme === "light" ? "text-gray-700" : "text-white/80";

  /** Layout:
   * - top: media above text (stacked)
   * - left/right: media beside text (2 columns on md+, stacked on mobile)
   */
  const sideBySide = imageSrc && (imagePosition === "left" || imagePosition === "right");

  const Media = () =>
    imageSrc ? (
      <div className="flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className={`max-h-48 w-auto rounded-xl shadow-md ${imageClassName}`}
        />
      </div>
    ) : null;

  const IconWrap = () =>
    Icon ? (
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10">
        <Icon className={`${iconClassName}`} aria-hidden="true" />
      </div>
    ) : null;

  return (
    <section className="py-14">
      <div className={`mx-auto max-w-5xl rounded-2xl shadow-lg ${themes[theme]} ${className}`}>
        <div className={`p-8 ${sideBySide ? "md:grid md:grid-cols-2 md:gap-8" : "text-center"}`}>
          {/* Left media if requested */}
          {sideBySide && imagePosition === "left" && <Media />}

          {/* Content */}
          <div className={`${sideBySide ? "text-left" : ""}`}>
            {!sideBySide && <IconWrap />}

            {/* Top media if stacked */}
            {!sideBySide && <Media />}

            <h3 className={`text-2xl font-bold ${sideBySide ? "" : "mt-1"} ${headingClassName}`}>{heading}</h3>

            <p className={`mt-2 ${textSubtle} ${subheadingClassName}`}>{subheading}</p>

            {extra ? <div className="mt-3">{extra}</div> : null}

            <div className={`mt-6 flex flex-col items-center gap-3 sm:flex-row ${sideBySide ? "" : "justify-center"}`}>
              <Link
                href={primaryHref}
                onClick={() => track(pLabel)}
                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition hover:opacity-90
                  ${
                    theme === "light"
                      ? "bg-black text-white"
                      : theme === "dark"
                      ? "bg-white text-gray-900"
                      : "bg-black/80 text-white hover:bg-black"
                  }
                  ${primaryClassName}`}
              >
                {primaryLabel}
              </Link>

              <Link
                href={secondaryHref}
                onClick={() => track(sLabel)}
                className={`inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition
                  ${
                    theme === "light"
                      ? "border border-black/10 bg-white text-gray-900 hover:bg-gray-50"
                      : theme === "dark"
                      ? "border border-white/20 text-white hover:bg-white/10"
                      : "border border-white/30 text-white/90 hover:bg-white/20"
                  }
                  ${secondaryClassName}`}
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>

          {/* Right media if requested */}
          {sideBySide && imagePosition === "right" && <Media />}
        </div>
      </div>
    </section>
  );
}
