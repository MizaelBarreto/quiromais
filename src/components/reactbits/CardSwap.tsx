'use client';

// React Bits — Card Swap (https://reactbits.dev), versão TS + Tailwind.
// Adaptações para a seção de avaliações:
// - `maxVisible`: com muitas cartas (ex.: 10 avaliações) só as primeiras formam a pilha; as demais
//   esperam escondidas atrás da última, em vez de se espalharem pela tela.
// - `containerClassName`: posicionamento do conjunto definido por quem usa.
// - Card sem cores fixas (bg/borda vêm por `customClass`).
// - Pausa com hover e com foco de teclado; sem troca automática com "reduzir movimento".
// - A primeira troca acontece após `delay` (e não no instante em que a página carrega).

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef
} from 'react';
import gsap from 'gsap';

export interface CardSwapProps {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (idx: number) => void;
  onSwap?: (frontIdx: number) => void;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
  maxVisible?: number;
  containerClassName?: string;
  children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
  <div
    ref={ref}
    {...rest}
    className={`absolute top-1/2 left-1/2 [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
));
Card.displayName = 'Card';

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number, maxVisible: number): Slot => {
  const k = Math.min(i, maxVisible - 1);
  return {
    x: k * distX,
    y: -k * distY,
    z: -k * distX * 1.5,
    zIndex: total - i
  };
};

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const DEFAULT_CONTAINER =
  'absolute bottom-0 right-0 transform translate-x-[5%] translate-y-[20%] origin-bottom-right perspective-[900px] overflow-visible max-[768px]:translate-x-[25%] max-[768px]:translate-y-[25%] max-[768px]:scale-[0.75] max-[480px]:translate-x-[25%] max-[480px]:translate-y-[25%] max-[480px]:scale-[0.55]';

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  onSwap,
  skewAmount = 6,
  easing = 'elastic',
  maxVisible = Infinity,
  containerClassName = DEFAULT_CONTAINER,
  children
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
  const refs = useMemo<CardRef[]>(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  const order = useRef<number[]>(Array.from({ length: childArr.length }, (_, i) => i));
  const onSwapRef = useRef(onSwap);
  onSwapRef.current = onSwap;

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number>(0);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total = refs.length;
    const visible = Math.max(1, Math.min(maxVisible, total));
    refs.forEach((r, i) =>
      placeNow(r.current!, makeSlot(i, cardDistance, verticalDistance, total, visible), skewAmount)
    );

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current!;
      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current!;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length, visible);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length, visible);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
        onSwapRef.current?.(rest[0]);
      });
    };

    intervalRef.current = window.setInterval(swap, delay);

    const node = container.current!;
    let hovered = false;
    let focused = false;
    const pause = () => {
      tlRef.current?.pause();
      clearInterval(intervalRef.current);
    };
    const resume = () => {
      if (hovered || focused) return;
      tlRef.current?.play();
      clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(swap, delay);
    };
    const onEnter = () => {
      if (!pauseOnHover) return;
      hovered = true;
      pause();
    };
    const onLeave = () => {
      hovered = false;
      resume();
    };
    const onFocusIn = () => {
      focused = true;
      pause();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (node.contains(e.relatedTarget as Node | null)) return;
      focused = false;
      resume();
    };
    node.addEventListener('mouseenter', onEnter);
    node.addEventListener('mouseleave', onLeave);
    node.addEventListener('focusin', onFocusIn);
    node.addEventListener('focusout', onFocusOut);
    return () => {
      node.removeEventListener('mouseenter', onEnter);
      node.removeEventListener('mouseleave', onLeave);
      node.removeEventListener('focusin', onFocusIn);
      node.removeEventListener('focusout', onFocusOut);
      clearInterval(intervalRef.current);
      tlRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, maxVisible]);

  const rendered = childArr.map((child, i) =>
    isValidElement<CardProps>(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => {
            child.props.onClick?.(e as React.MouseEvent<HTMLDivElement>);
            onCardClick?.(i);
          }
        } as CardProps & React.RefAttributes<HTMLDivElement>)
      : child
  );

  return (
    <div ref={container} className={containerClassName} style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
