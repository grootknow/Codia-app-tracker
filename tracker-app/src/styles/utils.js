import { colors, spacing, typography, shadows, borderRadius } from './design-tokens';

// Utility to get color with fallback
export const getColor = (path, fallback = colors.gray[500]) => {
  const keys = path.split('.');
  let value = colors;
  
  for (const key of keys) {
    if (value[key] === undefined) return fallback;
    value = value[key];
  }
  
  return value;
};

// Generate consistent gradient
export const gradient = (from, to) => 
  `linear-gradient(to right, ${getColor(from)}, ${getColor(to)})`;

// Status color helper
export const statusColor = (status) => {
  const statusMap = {
    DONE: colors.success,
    IN_PROGRESS: colors.primary[500],
    PENDING: colors.gray[400],
    BLOCKED: colors.error,
  };
  return statusMap[status] || colors.gray[400];
};

// Priority color helper
export const priorityColor = (priority) => {
  const priorityMap = {
    HIGH: colors.error,
    MEDIUM: colors.warning,
    LOW: colors.primary[500],
  };
  return priorityMap[priority] || colors.gray[400];
};

// Consistent spacing
export const space = (size) => spacing[size] || size;

// Consistent typography
export const text = (size, weight = 'normal') => ({
  fontSize: typography.fontSize[size],
  fontWeight: typography.fontWeight[weight],
});

// Consistent shadow
export const shadow = (size = 'md') => shadows[size];

// Consistent border radius
export const rounded = (size = 'md') => borderRadius[size];

// Generate className string
export const cn = (...classes) => classes.filter(Boolean).join(' ');
