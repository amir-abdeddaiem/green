import type { CSSProperties, ReactNode } from "react";

type LogoItem =
  | {
      src: string;
      srcSet?: string;
      sizes?: string;
      width?: number | string;
      height?: number | string;
      alt?: string;
      title?: string;
      href?: string;
      ariaLabel?: string;
    }
  | {
      node: ReactNode;
      title?: string;
      href?: string;
      ariaLabel?: string;
    };

type LogoLoopProps = {
  logos: LogoItem[];
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: string | number) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
};

declare function LogoLoop(props: LogoLoopProps): ReactNode;

declare const NamedLogoLoop: (props: LogoLoopProps) => ReactNode;

export { NamedLogoLoop as LogoLoop };
export default LogoLoop;
