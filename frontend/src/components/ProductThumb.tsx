import { useState } from 'react';
import { productEmoji, productImage } from '@/lib/product';

interface ProductThumbProps {
  material: string;
  /** Optional explicit photo URL; falls back to the category photo, then an emoji. */
  src?: string | null;
  className?: string;
  /** Classes applied to the emoji fallback wrapper (e.g. font size). */
  emojiClassName?: string;
}

/**
 * Renders a real product photo for a material, gracefully degrading to a
 * category emoji if the image is missing or fails to load.
 */
export default function ProductThumb({ material, src, className, emojiClassName }: ProductThumbProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={emojiClassName} aria-hidden>
        {productEmoji(material)}
      </span>
    );
  }

  return (
    <img
      src={src ?? productImage(material)}
      alt={material}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
