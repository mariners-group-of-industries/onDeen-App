export const ticketSelectionHint = (quantityPerUser) => {
  const limit = Number(quantityPerUser || 0);
  return limit > 0
    ? `Up to ${limit} tickets per person`
    : 'Choose your ticket quantity';
};

export const ticketAvailabilityStatus = (remaining) => (
  Number(remaining || 0) > 0 ? 'Tickets available' : 'Sold out'
);

export const ticketSelectionDecision = ({
  currentQuantity = 0,
  totalSelected = currentQuantity,
  quantityPerUser = 0,
  remaining = 0,
}) => {
  const limit = Number(quantityPerUser || 0);
  if (limit > 0 && Number(totalSelected || 0) >= limit) {
    return { allowed: false, message: `Maximum ${limit} tickets per user` };
  }
  if (Number(currentQuantity || 0) >= Number(remaining || 0)) {
    return { allowed: false, message: 'Selected quantity is no longer available' };
  }
  return { allowed: true, message: '' };
};
