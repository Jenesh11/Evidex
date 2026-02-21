import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistance } from 'date-fns';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date) {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy');
}

export function formatDateTime(date) {
    if (!date) return '';
    return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function formatRelativeTime(date) {
    if (!date) return '';
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

export function getStatusColor(status) {
    const colors = {
        NEW: 'status-new',
        PACKING: 'status-packing',
        PACKED: 'status-packed',
        SHIPPED: 'status-shipped',
        DELIVERED: 'status-delivered',
        RETURN: 'status-return',
        RTO: 'status-rto',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
}

export function getStatusLabel(status) {
    const labels = {
        NEW: 'New',
        PACKING: 'Packing',
        PACKED: 'Packed',
        SHIPPED: 'Shipped',
        DELIVERED: 'Delivered',
        RETURN: 'Return',
        RTO: 'RTO',
    };
    return labels[status] || status;
}
