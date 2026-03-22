import { inferOccasionFromEventTitle } from './calendarService';

describe('calendar occasion inference', () => {
  it('maps work keywords to Work meeting', () => {
    expect(inferOccasionFromEventTitle('Client meeting with design team')).toBe('Work meeting');
  });

  it('maps social keywords to Social', () => {
    expect(inferOccasionFromEventTitle('Birthday dinner downtown')).toBe('Social');
  });

  it('maps active keywords to Active', () => {
    expect(inferOccasionFromEventTitle('Morning gym workout')).toBe('Active');
  });

  it('defaults to Casual when no keyword match exists', () => {
    expect(inferOccasionFromEventTitle('Read and plan the week')).toBe('Casual');
  });
});

