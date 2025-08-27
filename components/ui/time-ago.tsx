// components/ui/time-ago.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export type TimeAgoProps = {
  /** Prop mới (khuyên dùng) */
  date?: Date | number | string;
  /** Prop cũ để tương thích ngược */
  value?: Date | number | string;
  /** Tần suất cập nhật label (ms) - mặc định 30s */
  refreshMs?: number;
};

export default function TimeAgo({
  date,
  value,
  refreshMs = 30_000,
}: TimeAgoProps) {
  // Ưu tiên prop mới, nếu không có dùng prop cũ
  const src = useMemo(() => (date ?? value) ?? null, [date, value]);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (src == null) {
      setLabel("");
      return;
    }
    const d = new Date(src);
    const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

    const update = () => {
      const diff = Date.now() - d.getTime();
      const sec = Math.round(diff / 1000);

      if (Math.abs(sec) < 60) {
        setLabel(rtf.format(-sec, "seconds"));
        return;
      }
      const min = Math.round(sec / 60);
      if (Math.abs(min) < 60) {
        setLabel(rtf.format(-min, "minutes"));
        return;
      }
      const hour = Math.round(min / 60);
      if (Math.abs(hour) < 24) {
        setLabel(rtf.format(-hour, "hours"));
        return;
      }
      const day = Math.round(hour / 24);
      setLabel(rtf.format(-day, "days"));
    };

    update();
    const id = setInterval(update, refreshMs);
    return () => clearInterval(id);
  }, [src, refreshMs]);

  if (src == null) return null;
  return <span>{label}</span>;
}
