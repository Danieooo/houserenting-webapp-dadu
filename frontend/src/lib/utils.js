import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
};

export const formatMonth = (month, year) => `Tháng ${month}/${year}`;

export const ROOM_STATUS_LABELS = {
  AVAILABLE: 'Trống',
  OCCUPIED: 'Có người',
  MAINTENANCE: 'Bảo trì',
};

export const ROOM_STATUS_COLORS = {
  AVAILABLE: 'bg-green-100 text-green-800',
  OCCUPIED: 'bg-blue-100 text-blue-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};
