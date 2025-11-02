import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  } catch (error) {
    return '';
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return '';
  }
};


