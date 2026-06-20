import cat1 from "@/assets/cat-1.png";
import cat2 from "@/assets/cat-2.png";
import cat3 from "@/assets/cat-3.png";
import cat4 from "@/assets/cat-4.png";

const CATS = [cat1, cat2, cat3, cat4];

interface CatProps {
  pose?: 1 | 2 | 3 | 4;
  className?: string;
  float?: boolean;
  alt?: string;
}

export function Cat({ pose = 1, className = "h-24 w-24", float = false, alt = "솔하우징 마스코트 고양이" }: CatProps) {
  const src = CATS[(pose - 1) % CATS.length];
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={512}
      height={512}
      className={`${className} ${float ? "animate-float-cat" : ""} select-none drop-shadow-sm`}
      draggable={false}
    />
  );
}