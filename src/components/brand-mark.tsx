import { cn } from "@/lib/utils";

export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/fixmysite-icon.png"
      alt=""
      aria-hidden="true"
      className={cn("shrink-0 rounded-[26%] bg-white object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
