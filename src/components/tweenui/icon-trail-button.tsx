/* Adapted from Tween UI Icon Trail Button. MIT © StaticMania.
 * https://github.com/StaticMania/tween-ui */
'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type Ref,
} from 'react';
import { cn } from '@/lib/utils';
import LogoMark from '../ui/LogoMark';

// Keep the original hover/focus state handling for the moving logo.
type IconSlideState = 'idle' | 'expand' | 'park';
type IconSlideDir = 'in' | 'out';

const EXPAND_MS = 340;
const PARK_MS = 260;

const canHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isButtonOn = (el: HTMLElement) =>
  !el.matches('[disabled]') &&
  (el.matches(':focus-visible') || (canHover() && el.matches(':hover')));

function useButtonIconSlide() {
  const [iconState, setIconState] = useState<IconSlideState>('idle');
  const dirRef = useRef<IconSlideDir | null>(null);
  const timerRef = useRef<number | null>(null);
  const stateRef = useRef<IconSlideState>('idle');
  const buttonRef = useRef<HTMLElement | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setState = useCallback((next: IconSlideState) => {
    stateRef.current = next;
    setIconState(next);
  }, []);

  const wait = useCallback(
    (ms: number, fn: () => void) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        fn();
      }, ms);
    },
    [clearTimer]
  );

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const step = () => {
      const on = isButtonOn(btn);

      if (prefersReducedMotion()) {
        clearTimer();
        setState(on ? 'park' : 'idle');
        return;
      }

      if (on) {
        if (stateRef.current === 'park') return;
        if (stateRef.current === 'idle') {
          setState('expand');
          dirRef.current = 'in';
          wait(EXPAND_MS, step);
          return;
        }
        if (dirRef.current === 'in' && timerRef.current) return;
        clearTimer();
        setState('park');
        dirRef.current = 'in';
        return;
      }

      if (stateRef.current === 'idle') return;
      if (stateRef.current === 'park') {
        setState('expand');
        dirRef.current = 'out';
        wait(PARK_MS, step);
        return;
      }
      if (dirRef.current === 'out' && timerRef.current) return;
      clearTimer();
      setState('idle');
      dirRef.current = 'out';
    };

    const sync = () => step();
    btn.addEventListener('pointerenter', sync);
    btn.addEventListener('pointerleave', sync);
    btn.addEventListener('focus', sync);
    btn.addEventListener('blur', sync);

    return () => {
      clearTimer();
      btn.removeEventListener('pointerenter', sync);
      btn.removeEventListener('pointerleave', sync);
      btn.removeEventListener('focus', sync);
      btn.removeEventListener('blur', sync);
    };
  }, [clearTimer, setState, wait]);

  return { iconState, buttonRef };
}

interface IconTrailButtonOwnProps {
  /** Extra classes for the label span. */
  labelClassName?: string;
}

/** Without `href` it is a button; with one it renders an anchor instead. */
export type IconTrailButtonProps =
  | (IconTrailButtonOwnProps & ComponentPropsWithoutRef<'button'> & { href?: never })
  | (IconTrailButtonOwnProps & ComponentPropsWithoutRef<'a'> & { href: string });

export default function IconTrailButton({
  children,
  labelClassName,
  className,
  ...props
}: IconTrailButtonProps) {
  const { iconState, buttonRef } = useButtonIconSlide();
  const isLink = typeof props.href === 'string';
  const Tag = isLink ? 'a' : 'button';
  const tagProps = isLink
    ? props
    : { type: 'button' as const, ...(props as ComponentPropsWithoutRef<'button'>) };

  return (
    <Tag
      {...(tagProps as ComponentPropsWithoutRef<'button'> & ComponentPropsWithoutRef<'a'>)}
      ref={buttonRef as Ref<HTMLButtonElement & HTMLAnchorElement>}
      data-btn-icon-slide
      data-icon-state={iconState}
      className={cn(
        'group relative inline-flex h-12 origin-center cursor-pointer items-center overflow-hidden rounded-full bg-[#1b5049] p-1 text-[#e5eee8] shadow-[0_1px_1px_rgba(16,24,40,0.16)] transition-[scale] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] outline-none select-none focus-visible:ring-2 focus-visible:ring-[#e5eee8] not-disabled:active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100',
        className
      )}
    >
      <span className="logo-trail-icon" aria-hidden="true"><span className="logo-trail-spin"><LogoMark size={23}/></span></span>
      <span className={cn("logo-trail-label",labelClassName)}>
        {children}
      </span>
    </Tag>
  );
}
