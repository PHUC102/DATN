// lib/datetime.ts

/** Định dạng ngày giờ theo múi giờ Việt Nam (24h) */
export function formatDateVN(input: string | number | Date) {
  const d = new Date(input);
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
}
