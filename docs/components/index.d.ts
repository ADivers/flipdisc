import type * as React from 'react';

export interface DiscDisplayProps {
  /** One message to show. Letters are uppercased; unsupported characters render as a blank. */
  text?: string;
  /** Several messages; the board flips from one to the next every `interval` ms. Overrides `text`. */
  messages?: string[];
  /** Milliseconds each message stays up when cycling. Default 3200. */
  interval?: number;
  /** Lit disc colour. Default 'white'. */
  color?: 'white' | 'orange';
  /** Disc pitch: a token step or a number of px. Ignored when `fit` is set. Default 'md'. */
  pitch?: 'sm' | 'md' | 'lg' | number;
  /** Stretch the board to its container's width; discs scale to fit. */
  fit?: boolean;
  /** Board height in discs (min 7, the font height). Default 9. */
  rows?: number;
  /** Board width in discs. Default: widest message + 2 × padX. Longer text is cut off. */
  cols?: number;
  /** Empty disc columns on each side. Default 1. */
  padX?: number;
  align?: 'left' | 'center' | 'right';
  /** Delay between columns when flipping, in ms. Default 14. */
  stagger?: number;
  /** Start blank and flip the first message in on mount. Default true. */
  boot?: boolean;
  /** Accessible name. Default: the message text. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function DiscDisplay(props: DiscDisplayProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
  /** Leading disc in the text colour. */
  dot?: boolean;
  /** Renders an <a> instead of a <button>. */
  href?: string;
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface NavLink { label: string; href?: string; active?: boolean }
export interface NavBarProps {
  /** Wordmark text, rendered as a small DiscDisplay. */
  brand: string;
  brandHref?: string;
  brandColor?: 'white' | 'orange';
  brandPitch?: 'sm' | 'md' | number;
  links?: NavLink[];
  /** Right-hand slot, usually one Button. */
  action?: React.ReactNode;
  className?: string;
}
export declare function NavBar(props: NavBarProps): React.ReactElement;

export interface PanelProps {
  /** Uppercase mono label above the title. */
  label?: string;
  title?: string;
  /** 'board' sets the panel on black housing in every theme. */
  tone?: 'default' | 'board';
  children?: React.ReactNode;
  className?: string;
}
export declare function Panel(props: PanelProps): React.ReactElement;

export interface StatusDiscProps {
  state?: 'on' | 'off' | 'alert';
  /** The status word — always provide one; the disc alone carries no meaning. */
  children: React.ReactNode;
}
export declare function StatusDisc(props: StatusDiscProps): React.ReactElement;


export interface DiscFieldProps {
  /** Disc pitch in px on wide screens. Default 8. */
  pitch?: number;
  /** Disc pitch in px below `breakpoint`. Default 5. */
  pitchSm?: number;
  /** Container width (px) below which pitchSm is used. Default 640. */
  breakpoint?: number;
  /** ms each message of a data-disc-messages element stays up. Default 3200. */
  interval?: number;
  /** Longest time (ms) a change takes to sweep across the field. Default 700. */
  sweep?: number;
  /**
   * Page content. Opt elements into the board with attributes:
   * data-disc="text" (draw the element's text, or data-disc-messages="A|B|C", in dot type; data-disc-scale, data-disc-align),
   * data-disc="fill" | "outline" (light the element's box or its edge), data-disc="clear" (force discs off behind it),
   * data-disc-color="white|orange", data-disc-hover="white|orange" (colour on hover/focus).
   */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function DiscField(props: DiscFieldProps): React.ReactElement;

declare global {
  interface Window {
    Flipdisc: {
      DiscDisplay: typeof DiscDisplay; Button: typeof Button; NavBar: typeof NavBar;
      Panel: typeof Panel; StatusDisc: typeof StatusDisc; DiscField: typeof DiscField;
    };
  }
}
