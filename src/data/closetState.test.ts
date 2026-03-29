jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { closetReducer, defaultClosetState } from './closetState';

describe('closet state reducer', () => {
  it('hydrates with deterministic recency from provided timestamp', () => {
    const nowIso = '2026-03-20T00:00:00.000Z';
    const hydratedWardrobe = [
      {
        ...defaultClosetState.wardrobe[0],
        lastWornAt: '2026-03-18T00:00:00.000Z',
        lastWornDaysAgo: 999,
      },
    ];

    const nextState = closetReducer(defaultClosetState, {
      type: 'hydrate',
      payload: {
        state: {
          wardrobe: hydratedWardrobe,
        },
        nowIso,
      },
    });

    expect(nextState.wardrobe[0].lastWornDaysAgo).toBe(2);
  });

  it('adds and updates wardrobe items with deterministic recency from provided timestamp', () => {
    const nowIso = '2026-03-20T00:00:00.000Z';
    const baseItem = {
      ...defaultClosetState.wardrobe[0],
      id: 'item-deterministic',
      lastWornAt: '2026-03-19T00:00:00.000Z',
      lastWornDaysAgo: 999,
    };

    const withAddedItem = closetReducer(defaultClosetState, {
      type: 'addWardrobeItem',
      payload: {
        item: baseItem,
        nowIso,
      },
    });

    expect(withAddedItem.wardrobe[0].id).toBe('item-deterministic');
    expect(withAddedItem.wardrobe[0].lastWornDaysAgo).toBe(1);

    const updatedItem = {
      ...baseItem,
      color: 'Black',
      lastWornAt: '2026-03-17T00:00:00.000Z',
      lastWornDaysAgo: 999,
    };

    const withUpdatedItem = closetReducer(withAddedItem, {
      type: 'updateWardrobeItem',
      payload: {
        item: updatedItem,
        nowIso,
      },
    });

    const changedItem = withUpdatedItem.wardrobe.find((item) => item.id === updatedItem.id);
    expect(changedItem?.color).toBe('Black');
    expect(changedItem?.lastWornDaysAgo).toBe(3);
  });

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

  it('deleting an item preserves historical wear logs', () => {
    const itemIdToDelete = defaultClosetState.wardrobe[0].id;
    const previousLogs = defaultClosetState.wearLogs;

    const nextState = closetReducer(defaultClosetState, {
      type: 'deleteWardrobeItem',
      payload: itemIdToDelete,
    });

    expect(nextState.wardrobe.some((item) => item.id === itemIdToDelete)).toBe(false);
    expect(nextState.wearLogs).toEqual(previousLogs);
    expect(nextState.wearLogs.length).toBe(previousLogs.length);
  });
});
