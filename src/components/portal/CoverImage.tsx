import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";

interface CoverImageProps {
  src: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/** Cover image with graceful fallback when the URL is missing or fails to load. */
export function CoverImage({ src, alt, className, loading = "lazy" }: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
        <ImageIcon className="h-6 w-6 opacity-50" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
