import {
  sessionBucket,
  sessionStatusLabel,
  sessionsForBucket,
} from '../src/screens/OneToOneSessions/sessionLifecycle';

describe('organiser one-to-one lifecycle', () => {
  const sessions = [
    {id: 1, status: 0},
    {id: 2, status: 3},
    {id: 3, status: 1},
    {id: 4, status: 5},
    {id: 5, status: 6},
    {id: 6, status: 2},
    {id: 7, status: 4},
  ];

  it('keeps pending and reschedule requests in the action queue', () => {
    expect(sessionsForBucket(sessions, 'pending').map(item => item.id)).toEqual([1, 4]);
  });

  it('groups approved and confirmed sessions without losing either state', () => {
    expect(sessionsForBucket(sessions, 'confirmed').map(item => item.id)).toEqual([2, 3]);
  });

  it('separates completed from declined and cancelled history', () => {
    expect(sessionBucket({status: 6})).toBe('completed');
    expect(sessionsForBucket(sessions, 'cancelled').map(item => item.id)).toEqual([6, 7]);
  });

  it('uses the backend status label when supplied', () => {
    expect(sessionStatusLabel({status: 5, status_label: 'RESCHEDULE_REQUESTED'})).toBe('RESCHEDULE REQUESTED');
    expect(sessionStatusLabel({status: 3})).toBe('APPROVED');
  });
});
