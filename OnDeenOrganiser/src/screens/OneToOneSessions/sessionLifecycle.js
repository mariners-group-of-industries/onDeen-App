export const SESSION_BUCKETS = [
  {id: 'pending', label: 'Pending'},
  {id: 'confirmed', label: 'Confirmed'},
  {id: 'completed', label: 'Completed'},
  {id: 'cancelled', label: 'Cancelled'},
];

export const sessionStatusLabel = session => {
  if (session?.status_label) {
    return String(session.status_label).replace(/_/g, ' ');
  }
  return {
    0: 'PENDING',
    1: 'CONFIRMED',
    2: 'CANCELLED',
    3: 'APPROVED',
    4: 'DECLINED',
    5: 'RESCHEDULE REQUESTED',
    6: 'COMPLETED',
  }[Number(session?.status)] || 'UNKNOWN';
};

export const sessionBucket = session => {
  const status = Number(session?.status);
  if ([0, 5].includes(status)) {
    return 'pending';
  }
  if ([1, 3].includes(status)) {
    return 'confirmed';
  }
  if (status === 6) {
    return 'completed';
  }
  return 'cancelled';
};

export const sessionsForBucket = (sessions, bucket) => (
  (sessions || []).filter(session => sessionBucket(session) === bucket)
);
