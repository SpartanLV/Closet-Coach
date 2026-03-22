jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { closetReducer, defaultClosetState } from './closetState';

describe('closet state reducer', () => {
  it('logs wear and updates wear count + recency fields', () => {
    const trackedItemId = defaultClosetState.wardrobe[0].id;
    const beforeCount = defaultClosetState.wardrobe[0].wearCount;

    const nextState = closetReducer(defaultClosetState, {
      type: 'logWear',
      payload: {
        outfitItemIds: [trackedItemId],
        occasion: 'Work meeting',
        weatherLabel: '70°F · Clear',
        timestamp: '2026-03-22T10:00:00.000Z',
      },
    });

    const updatedItem = nextState.wardrobe.find((item) => item.id === trackedItemId);
    expect(updatedItem).toBeDefined();
    expect(updatedItem?.wearCount).toBe(beforeCount + 1);
    expect(updatedItem?.lastWornDaysAgo).toBe(0);
    expect(updatedItem?.lastWornAt).toBe('2026-03-22T10:00:00.000Z');

    expect(nextState.wearLogs[0].occasion).toBe('Work meeting');
    expect(nextState.wearLogs[0].outfitItemIds).toContain(trackedItemId);
  });
});
