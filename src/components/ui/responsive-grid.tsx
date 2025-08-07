import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid = ({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 }, 
  gap = 4,
  className 
}: ResponsiveGridProps) => {
  const gridClasses = cn(
    "grid",
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: number;
  className?: string;
}

export const ResponsiveContainer = ({ 
  children, 
  maxWidth = "2xl", 
  padding = 4,
  className 
}: ResponsiveContainerProps) => {
  const containerClasses = cn(
    "mx-auto w-full",
    `p-${padding}`,
    maxWidth !== "full" && `max-w-${maxWidth}`,
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;