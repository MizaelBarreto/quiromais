import type { ReactNode, MouseEventHandler } from "react";
import StarBorder from "./reactbits/StarBorder";

// Botão dourado da marca com o Star Border do React Bits.
// `tone`: cor do brilho que percorre a borda — escuro em fundo claro, claro em fundo escuro.
const SIZES = {
  sm: "text-sm px-5 py-2.5 gap-2",
  md: "text-[0.95rem] px-7 py-3.5 gap-2",
  lg: "text-base px-8 py-4 gap-3",
};

interface GoldButtonProps {
  children: ReactNode;
  href?: string;
  external?: boolean;
  type?: "button" | "submit";
  size?: keyof typeof SIZES;
  tone?: "onLight" | "onDark";
  fullWidth?: boolean;
  wrap?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLElement>;
}

export default function GoldButton({
  children,
  href,
  external = true,
  type = "button",
  size = "md",
  tone = "onLight",
  fullWidth = false,
  wrap = false,
  className = "",
  id,
  ariaLabel,
  onClick,
}: GoldButtonProps) {
  const inner = `flex items-center justify-center min-h-11 ${wrap ? "text-center" : "whitespace-nowrap"} font-semibold rounded-[9px] bg-gold text-dark border-white/35 transition-colors duration-300 group-hover/gold:bg-gold-light ${SIZES[size]}`;
  const outer = `group/gold ${fullWidth ? "block w-full" : "inline-block"} rounded-[11px] shadow-[0_8px_24px_rgba(201,161,92,0.28)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(201,161,92,0.4)] active:translate-y-0 ${className}`;
  const shared = {
    className: outer,
    innerClassName: inner,
    color: tone === "onDark" ? "#FFF1CC" : "#6B4F1F",
    speed: "5s",
    thickness: 2,
    id,
    "aria-label": ariaLabel,
    onClick,
  };

  if (href) {
    return (
      <StarBorder
        as="a"
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...shared}
      >
        {children}
      </StarBorder>
    );
  }
  return (
    <StarBorder as="button" type={type} {...shared}>
      {children}
    </StarBorder>
  );
}
