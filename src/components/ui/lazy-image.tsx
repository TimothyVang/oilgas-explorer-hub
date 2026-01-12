import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  blurPlaceholder?: boolean;
}

/**
 * LazyImage - Image component with lazy loading and placeholder support
 *
 * Features:
 * - Intersection Observer for lazy loading
 * - Smooth fade-in transition when loaded
 * - Optional blur placeholder while loading
 * - Native loading="lazy" as fallback
 *
 * Usage:
 * ```tsx
 * <LazyImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   className="w-full h-64 object-cover"
 * />
 * ```
 */
export const LazyImage = ({
  src,
  alt,
  placeholder,
  blurPlaceholder = false,
  className,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before element is in view
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div
          className={cn(
            "absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse",
            blurPlaceholder && "backdrop-blur-sm"
          )}
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder || ""}
        alt={alt}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
        className={cn(
          "transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0",
          "w-full h-full object-cover"
        )}
        {...props}
      />
    </div>
  );
};

/**
 * OptimizedImage - Image with srcset support for responsive images
 *
 * Usage:
 * ```tsx
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   srcSet="/path/to/image-400.webp 400w, /path/to/image-800.webp 800w"
 *   sizes="(max-width: 768px) 100vw, 50vw"
 *   alt="Description"
 * />
 * ```
 */
export const OptimizedImage = ({
  src,
  srcSet,
  sizes,
  alt,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  srcSet?: string;
  sizes?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          "w-full h-full object-cover"
        )}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
