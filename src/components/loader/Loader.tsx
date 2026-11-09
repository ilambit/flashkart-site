'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
// import { useTheme } from 'next-themes';
import loaderAnimation from '../../assets/shopping.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// Yellow accent tones for recoloring Lottie animation
const ACCENT_TONES: [number, number, number][] = [
  [1, 0.784313785329, 0.180392156863],
  [0.921568627451, 0.682352941176, 0.078431372549],
];

const SHADE_FACTOR = 0.82;

const hexToLottieRgb = (hex?: string | null): [number, number, number] | null => {
  if (!hex) return null;
  let h = hex.trim().replace(/^#/, '');
  if (/^[a-f\d]{3}$/i.test(h)) {
    h = h.split('').map((c) => c + c).join('');
  }
  const m = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
  if (!m) return null;
  return [1, 2, 3].map((i) => parseInt(m[i], 16) / 255) as [number, number, number];
};

const near = (a: number, b: number) => Math.abs(a - b) < 0.02;

// Recolor Lottie animation accent tones
const recolorAccent = (anim: any, rgb: [number, number, number] | null) => {
  if (!rgb) return anim;
  const clone = JSON.parse(JSON.stringify(anim));
  const shade = rgb.map((c) => c * SHADE_FACTOR);

  const walk = (node: any) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== 'object') return;
    if (
      node.ty === 'fl' || node.ty === 'st'
    ) {
      const k = node.c?.k;
      if (Array.isArray(k)) {
        const toneIdx = ACCENT_TONES.findIndex((tone) =>
          tone.every((c, i) => near(k[i], c)),
        );
        if (toneIdx !== -1) {
          const target = toneIdx === 0 ? rgb : shade;
          node.c.k = [...target, k[3] ?? 1];
        }
      }
    }
    Object.values(node).forEach(walk);
  };
  walk(clone.layers || []);
  return clone;
};

interface LoaderProps {
  background?: string;
  height?: string | number;
  width?: string | number;
  screen?: string;
  size?: number;
}

/** Loading spinner and full-screen Lottie component */
const Loader = ({ background, height, width, screen, size }: LoaderProps) => {
  // Primary color for Lottie animation theme
  const webSettings = useSelector(
    (state: any) => state.Setting?.setting?.web_settings,
  );
  const resolvedTheme: string = "light";
  const primaryColor = useMemo(() => {
    const isDark = resolvedTheme === 'dark';
    const fromSettings = isDark
      ? webSettings?.dark_mode_color || webSettings?.color
      : webSettings?.light_mode_color || webSettings?.color;
    if (fromSettings) return fromSettings;
    if (typeof window === 'undefined') return null;
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-color');
  }, [webSettings, resolvedTheme]);

  const animationData = useMemo(() => {
    if (screen !== 'full') return loaderAnimation;
    return recolorAccent(loaderAnimation, hexToLottieRgb(primaryColor));
  }, [screen, primaryColor]);

  if (screen === 'full') {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="h-48 w-48"
        />
      </div>
    );
  }

  const dim = size || 36;
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width,
        height,
        background: background || 'transparent',
      }}
    >
      <span
        className="loaderRing inline-block"
        style={{ width: dim, height: dim }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default Loader;
