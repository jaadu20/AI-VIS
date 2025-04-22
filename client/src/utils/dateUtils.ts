import { formatDistanceToNow } from 'date-fns';

export const formatPostedDate = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};