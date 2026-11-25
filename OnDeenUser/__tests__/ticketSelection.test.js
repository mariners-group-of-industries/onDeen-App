import {
  ticketAvailabilityStatus,
  ticketSelectionDecision,
  ticketSelectionHint,
} from '../src/helpers/ticketSelection';

describe('ticket selection privacy and limits', () => {
  it('shows the per-user limit without exposing raw event capacity', () => {
    expect(ticketSelectionHint(4)).toBe('Up to 4 tickets per person');
    expect(ticketSelectionHint(null)).toBe('Choose your ticket quantity');
    expect(ticketSelectionHint(4)).not.toMatch(/available/i);
    expect(ticketAvailabilityStatus(300)).toBe('Tickets available');
    expect(ticketAvailabilityStatus(300)).not.toContain('300');
    expect(ticketAvailabilityStatus(0)).toBe('Sold out');
  });

  it('allows quantity changes below both limits', () => {
    expect(ticketSelectionDecision({
      currentQuantity: 1,
      totalSelected: 2,
      quantityPerUser: 4,
      remaining: 20,
    })).toEqual({ allowed: true, message: '' });
  });

  it('enforces the per-user maximum across multiple ticket types', () => {
    expect(ticketSelectionDecision({
      currentQuantity: 1,
      totalSelected: 4,
      quantityPerUser: 4,
      remaining: 20,
    })).toEqual({ allowed: false, message: 'Maximum 4 tickets per user' });
  });

  it('enforces capacity without revealing the remaining count', () => {
    const decision = ticketSelectionDecision({
      currentQuantity: 2,
      totalSelected: 2,
      quantityPerUser: 0,
      remaining: 2,
    });
    expect(decision).toEqual({
      allowed: false,
      message: 'Selected quantity is no longer available',
    });
    expect(decision.message).not.toContain('2');
  });
});
