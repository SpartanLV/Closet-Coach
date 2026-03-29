import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { ClosetState } from './src/types';

const mockGetContext = jest.fn();
const mockGetCalendarPermissionStatus = jest.fn();
const mockRequestCalendarPermission = jest.fn();
const mockGetNextOccasion = jest.fn();
const mockSetSettings = jest.fn();
const mockUseClosetState = jest.fn();

jest.mock('./src/data/weatherService', () => ({
  openMeteoWeatherService: {
    getContext: (...args: unknown[]) => mockGetContext(...args),
  },
}));

jest.mock('./src/data/calendarService', () => ({
  getCalendarPermissionStatus: (...args: unknown[]) =>
    mockGetCalendarPermissionStatus(...args),
  requestCalendarPermission: (...args: unknown[]) =>
    mockRequestCalendarPermission(...args),
  expoCalendarService: {
    getNextOccasion: (...args: unknown[]) => mockGetNextOccasion(...args),
  },
}));

jest.mock('./src/data/closetState', () => ({
  useClosetState: () => mockUseClosetState(),
}));

import App from './App';

function createMockState(): ClosetState {
  return {
    wardrobe: [
      {
        id: 'top-1',
        name: 'Blue Shirt',
        category: 'Top',
        color: 'Blue',
        season: 'All-season',
        occasionTags: ['Casual'],
        temperatureRange: ['cold', 'mild', 'warm'],
        wearCount: 2,
        lastWornDaysAgo: 2,
        lastWornAt: '2026-03-20T00:00:00.000Z',
      },
      {
        id: 'bottom-1',
        name: 'Gray Pants',
        category: 'Bottom',
        color: 'Gray',
        season: 'All-season',
        occasionTags: ['Casual'],
        temperatureRange: ['cold', 'mild', 'warm'],
        wearCount: 2,
        lastWornDaysAgo: 2,
        lastWornAt: '2026-03-20T00:00:00.000Z',
      },
      {
        id: 'shoes-1',
        name: 'Sneakers',
        category: 'Shoes',
        color: 'White',
        season: 'All-season',
        occasionTags: ['Casual'],
        temperatureRange: ['cold', 'mild', 'warm'],
        wearCount: 2,
        lastWornDaysAgo: 2,
        lastWornAt: '2026-03-20T00:00:00.000Z',
      },
    ],
    wearLogs: [],
    settings: {
      city: 'New York, US',
      calendarPermission: 'unknown',
      occasionOverride: null,
      lastContextRefresh: null,
      lastWeatherSnapshot: null,
    },
  };
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function findButtonByLabel(root: any, label: string) {
  return root.findAllByType(TouchableOpacity).find((touchable: any) => {
    const textNodes = touchable.findAllByType(Text);
    return textNodes.some((node: any) => {
      const children = node.props.children;
      if (Array.isArray(children)) {
        return children.join('') === label;
      }
      return children === label;
    });
  });
}

function hasText(root: any, value: string): boolean {
  return root.findAllByType(Text).some((node: any) => {
    const children = node.props.children;
    if (Array.isArray(children)) {
      return children.join('') === value;
    }
    return children === value;
  });
}

describe('App context input behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetContext.mockResolvedValue(null);
    mockGetCalendarPermissionStatus.mockResolvedValue('denied');
    mockRequestCalendarPermission.mockResolvedValue('denied');
    mockGetNextOccasion.mockResolvedValue(null);

    mockUseClosetState.mockReturnValue({
      state: createMockState(),
      isHydrated: true,
      addWardrobeItem: jest.fn(),
      updateWardrobeItem: jest.fn(),
      deleteWardrobeItem: jest.fn(),
      setSettings: mockSetSettings,
      logWear: jest.fn(),
    });
  });

  it('typing city does not trigger context API loops or persisted city updates', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await flushEffects();

    expect(mockGetContext).toHaveBeenCalledTimes(1);
    expect(mockGetContext).toHaveBeenCalledWith('New York, US');
    expect(mockGetCalendarPermissionStatus).toHaveBeenCalledTimes(1);

    const cityInput = tree.root.findByProps({
      placeholder: 'City (e.g. New York, US)',
    });

    await act(async () => {
      (cityInput as unknown as { props: { onChangeText: (value: string) => void } }).props.onChangeText(
        'Dhaka, Bangladesh',
      );
    });
    await flushEffects();

    expect(mockGetContext).toHaveBeenCalledTimes(1);
    expect(mockGetCalendarPermissionStatus).toHaveBeenCalledTimes(1);

    const typedCityPersisted = mockSetSettings.mock.calls.some(
      (call) => call[0]?.city === 'Dhaka, Bangladesh',
    );
    expect(typedCityPersisted).toBe(false);
  });

  it('commits city update only when refresh weather is explicitly pressed', async () => {
    mockGetContext
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        city: 'Dhaka, Bangladesh',
        temperatureC: 29,
        temperatureF: 84.2,
        temperatureBucket: 'warm',
        weatherCode: 1,
        weatherLabel: '84°F · Mostly clear',
        fetchedAt: '2026-03-22T00:00:00.000Z',
      });

    let tree: any;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await flushEffects();

    const cityInput = tree.root.findByType(TextInput);
    await act(async () => {
      cityInput.props.onChangeText('Dhaka, Bangladesh');
    });

    const refreshButton = findButtonByLabel(tree.root, 'Refresh weather');
    expect(refreshButton).toBeDefined();

    await act(async () => {
      refreshButton?.props.onPress();
    });
    await flushEffects();

    expect(mockGetContext).toHaveBeenCalledTimes(2);
    expect(mockGetContext.mock.calls[1][0]).toBe('Dhaka, Bangladesh');

    const committedCityPatch = mockSetSettings.mock.calls.some(
      (call) => call[0]?.city === 'Dhaka, Bangladesh',
    );
    expect(committedCityPatch).toBe(true);
  });

  it('shows fallback status when weather service throws', async () => {
    mockGetContext
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('weather down'));

    let tree: any;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await flushEffects();

    const refreshButton = findButtonByLabel(tree.root, 'Refresh weather');
    expect(refreshButton).toBeDefined();

    await act(async () => {
      refreshButton?.props.onPress();
    });
    await flushEffects();

    expect(hasText(tree.root, 'Weather unavailable, using wardrobe-only fallback.')).toBe(true);
  });

  it('shows calendar unavailable status when calendar sync throws', async () => {
    mockGetContext.mockResolvedValue(null);
    mockRequestCalendarPermission.mockRejectedValueOnce(new Error('calendar down'));

    let tree: any;
    await act(async () => {
      tree = renderer.create(<App />);
    });
    await flushEffects();

    const syncButton = findButtonByLabel(tree.root, 'Sync calendar');
    expect(syncButton).toBeDefined();

    await act(async () => {
      syncButton?.props.onPress();
    });
    await flushEffects();

    expect(hasText(tree.root, 'Calendar unavailable, continuing with manual occasion.')).toBe(
      true,
    );
  });
});
