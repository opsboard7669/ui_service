import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRelativeDate(date: string): string {
  const targetDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Overdue';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `In ${diffDays} days`;
  } else {
    return formatDate(date);
  }
}

export function getRelativeTime(date: string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return formatDate(date);
  }
}

export function isOverdue(date: string): boolean {
  return new Date(date) < new Date();
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    cicd: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    kubernetes: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    aws: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    security: 'bg-red-500/20 text-red-300 border-red-500/30',
    monitoring: 'bg-green-500/20 text-green-300 border-green-500/30',
    infrastructure: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };
  return colors[category] || 'bg-white/10 text-white border-white/20';
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    low: 'bg-green-500/20 text-green-300 border-green-500/30',
  };
  return colors[priority] || 'bg-white/10 text-white border-white/20';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'todo': 'bg-white/10 text-white border-white/20',
    'in-progress': 'bg-white/10 text-white border-white/20',
    'done': 'bg-white/10 text-white border-white/20',
  };
  return colors[status] || 'bg-white/10 text-white border-white/20';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getPriorityHoverShadow(priority: string): string {
  const shadows: Record<string, string> = {
    high: '0 8px 24px rgba(239, 68, 68, 0.35)',
    medium: '0 8px 24px rgba(245, 158, 11, 0.35)',
    low: '0 8px 24px rgba(16, 185, 129, 0.35)',
  };
  return shadows[priority] || '0 8px 24px rgba(255, 255, 255, 0.1)';
}

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All', color: '#ffffff' },
  { value: 'cicd', label: 'CI/CD', color: '#3b82f6' },
  { value: 'kubernetes', label: 'Kubernetes', color: '#8b5cf6' },
  { value: 'aws', label: 'AWS', color: '#f59e0b' },
  { value: 'security', label: 'Security', color: '#ef4444' },
  { value: 'monitoring', label: 'Monitoring', color: '#10b981' },
  { value: 'infrastructure', label: 'Infrastructure', color: '#06b6d4' },
] as const;
