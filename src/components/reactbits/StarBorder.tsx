'use client';

// React Bits — Star Border (https://reactbits.dev), versão TS + Tailwind.
// Adaptações: `innerClassName` para controlar tamanho/raio/cores por classes, display/raio do
// container sobrescrevíveis por `className`, cores opcionais
// (sem estilo inline quando não informadas) e spans no lugar de divs (HTML válido dentro de <button>/<a>).

import React from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
};

const StarBorder = <T extends React.ElementType = 'button'>({
  as,
  className = '',
  innerClassName = 'text-center text-[16px] py-[16px] px-[26px] rounded-[20px] bg-black text-white border-[#222222]',
  color = 'white',
  speed = '6s',
  thickness = 1,
  backgroundColor,
  textColor,
  borderColor,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'button';
  // Defaults só entram quando quem usa não define display/raio (evita classes conflitantes)
  const display = /(^|\s|:)(block|inline-block|inline-flex|flex|grid|hidden)(\s|$)/.test(className) ? '' : 'inline-block';
  const rounded = /(^|\s|:)rounded/.test(className) ? '' : 'rounded-[20px]';

  return (
    <Component
      className={`relative overflow-hidden ${display} ${rounded} ${className}`}
      {...(rest as any)}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as any).style
      }}
    >
      <span
        aria-hidden="true"
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      ></span>
      <span
        aria-hidden="true"
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed
        }}
      ></span>
      <span
        className={`relative z-1 block border ${innerClassName}`}
        style={{ background: backgroundColor, color: textColor, borderColor }}
      >
        {children}
      </span>
    </Component>
  );
};

export default StarBorder;
