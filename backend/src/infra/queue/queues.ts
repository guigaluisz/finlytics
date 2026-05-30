export const QUEUES = {
  ALERTS: 'alerts',
  QUOTES: 'quotes',
  INVOICES: 'invoices',
  NETWORTH: 'networth',
} as const;

export type QueueName = (typeof QUEUES)[keyof typeof QUEUES];
