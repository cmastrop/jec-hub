import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Music } from "lucide-react";

interface SongCardProps {
  id: string;
  title: string;
  artist?: string;
  songKey?: string;
  tags?: string[];
}

export function SongCard({ id, title, artist, songKey, tags }: SongCardProps) {
  return (
    <Link
      href={`/canciones/${id}`}
      className={cn(
        "block rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
        "transition-all hover:shadow-md hover:border-primary/30",
        "active:scale-[0.98]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          {artist && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{artist}</p>
          )}
        </div>
        {songKey && (
          <span
            className={cn(
              "inline-flex items-center gap-1 shrink-0",
              "rounded-md bg-primary/10 text-primary px-2 py-0.5",
              "text-xs font-bold"
            )}
          >
            <Music className="w-3 h-3" />
            {songKey}
          </span>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
