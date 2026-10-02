'use client';

// React Bits — Card Swap (https://reactbits.dev), versão TS + Tailwind.
// Adaptações para a seção de avaliações:
// - `maxVisible`: com muitas cartas (ex.: 10 avaliações) só as primeiras formam a pilha; as demais
//   esperam escondidas atrás da última, em vez de se espalharem pela tela.
// - `containerClassName`: posicionamento do conjunto definido por quem usa.
// - Card sem cores fixas (bg/borda vêm por `customClass`).
// - Clicar num card de trás traz ele para a frente (os que estavam na frente dele vão para o fundo).
// - Giro automático com pausas confiáveis (useCarouselAutoplay): hover só de mouse, foco só de teclado,
//   parado fora da tela, com a aba oculta e com "reduzir movimento". A primeira troca acontece após `delay`.
// - A ordem muda na hora em que a troca começa; uma troca nova parte de onde os cards estão
//   (nunca duas animações brigando pelo mesmo card).
// - As posições iniciais já vêm no HTML do servidor: a pilha não "pula" quando o JS carrega.

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
  useRef,
  useState
} from 'react';
import gsap from 'gsap';
import useCarouselAutoplay from '@/hooks/useCarouselAutoplay';

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
  /** Nome acessível do botão que traz um card de trás para a frente */
  bringLabel?: (idx: number) => string;
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
  bringLabel,
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
  const total = childArr.length;
  const visible = Math.max(1, Math.min(maxVisible, total));
  const refs = useMemo<CardRef[]>(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length]
  );

  // `orderRef` comanda as animações; `order` (estado) só decide quais cards de trás têm botão
  const orderRef = useRef<number[]>(Array.from({ length: total }, (_, i) => i));
  const [order, setOrder] = useState<number[]>(() => orderRef.current);
  const onSwapRef = useRef(onSwap);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const focusNextBack = useRef(false);

  useEffect(() => {
    onSwapRef.current = onSwap;
  });

  // Posição inicial de cada card já no HTML do servidor (o GSAP assume a partir daí). Calculada uma
  // vez só: como o valor não muda, o React nunca reescreve o transform que o GSAP está animando.
  const [initialStyles] = useState(() =>
    Array.from({ length: total }, (_, i) => {
      const s = makeSlot(i, cardDistance, verticalDistance, total, visible);
      return {
        transform: `translate(-50%, -50%) translate3d(${s.x}px, ${s.y}px, ${s.z}px) skewY(${skewAmount}deg)`,
        zIndex: s.zIndex
      };
    })
  );

  const slotOf = (i: number) => makeSlot(i, cardDistance, verticalDistance, refs.length, visible);

  // Gira a pilha `steps` posições: os `steps` cards da frente caem e voltam pelo fundo
  const rotate = (steps: number) => {
    const cur = orderRef.current;
    if (steps <= 0 || steps >= cur.length) return;
    const goingBack = cur.slice(0, steps);
    const staying = cur.slice(steps);
    const next = [...staying, ...goingBack];
    orderRef.current = next;
    setOrder(next);
    onSwapRef.current?.(next[0]);

    tlRef.current?.kill();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      next.forEach((idx, i) => placeNow(refs[idx].current!, slotOf(i), skewAmount));
      return;
    }

    const tl = gsap.timeline();
    tlRef.current = tl;

    const dropY = slotOf(0).y + 500;
    goingBack.forEach((idx, j) => {
      tl.to(refs[idx].current!, { y: dropY, duration: config.durDrop, ease: config.ease }, j * 0.12);
    });

    tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
    staying.forEach((idx, i) => {
      const el = refs[idx].current!;
      const slot = slotOf(i);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(
        el,
        { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease },
        `promote+=${Math.min(i, visible) * 0.15}`
      );
    });

    tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    goingBack.forEach((idx, j) => {
      const el = refs[idx].current!;
      const slot = slotOf(staying.length + j);
      tl.set(el, { zIndex: slot.zIndex }, 'return');
      tl.to(
        el,
        { x: slot.x, y: slot.y, z: slot.z, duration: config.durReturn, ease: config.ease },
        `return+=${j * 0.08}`
      );
    });
  };

  const { ref: container, restart } = useCarouselAutoplay<HTMLDivElement>({
    delay,
    pauseOnHover,
    onAdvance: () => rotate(1)
  });

  useEffect(() => {
    const current = orderRef.current;
    current.forEach((idx, i) => {
      const el = refs[idx].current!;
      // Descarta o transform que veio do servidor antes de o GSAP assumir (senão ele o decompõe e soma)
      gsap.set(el, { clearProps: 'transform' });
      placeNow(el, slotOf(i), skewAmount);
    });
    return () => {
      tlRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, skewAmount, maxVisible]);

  const bringToFront = (idx: number, fromKeyboard: boolean) => {
    const pos = orderRef.current.indexOf(idx);
    if (pos <= 0) return;
    focusNextBack.current = fromKeyboard;
    rotate(pos);
    restart();
  };

  // Teclado: depois de trazer um card, o foco passa para o próximo card de trás (Enter de novo avança)
  useEffect(() => {
    if (!focusNextBack.current) return;
    focusNextBack.current = false;
    const nextBack = order[1];
    if (nextBack === undefined) return;
    refs[nextBack].current?.querySelector<HTMLButtonElement>('[data-bring-front]')?.focus();
  }, [order, refs]);

  const rendered = childArr.map((child, i) => {
    if (!isValidElement<CardProps>(child)) return child;
    const pos = order.indexOf(i);
    const isBack = pos > 0 && pos < visible;
    return cloneElement(child, {
      key: i,
      ref: refs[i],
      style: { width, height, ...initialStyles[i], ...(child.props.style ?? {}) },
      className: `${child.props.className ?? ''} ${isBack ? 'cursor-pointer' : ''}`.trim(),
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        child.props.onClick?.(e);
        onCardClick?.(i);
        if (e.defaultPrevented) return;
        bringToFront(i, false);
      },
      children: (
        <>
          {child.props.children}
          {isBack && (
            <button
              type="button"
              data-bring-front=""
              className="absolute inset-0 rounded-[inherit]"
              aria-label={bringLabel ? bringLabel(i) : 'Trazer este card para a frente'}
              onClick={e => {
                e.stopPropagation();
                bringToFront(i, e.detail === 0);
              }}
            />
          )}
        </>
      )
    } as CardProps & React.RefAttributes<HTMLDivElement>);
  });

  return (
    <div ref={container} className={containerClassName} style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
