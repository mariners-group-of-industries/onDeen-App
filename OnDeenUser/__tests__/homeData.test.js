import {
  buildHomeEventFilter,
  buildHomepageFeedFilter,
  extractEventList,
  normalizeCategories,
  shouldUseHomepageFeed,
} from '../src/screens/BottomHomePage/homeData';

describe('Home data source contract', () => {
  const defaultFilters = {
    category_id: [],
    start_date: '',
    end_date: '',
    address: 'London',
    journey_level_id: [],
    organizer_id: [],
    price_type: [],
    sort_Filter: [1],
    speaker_id: [],
    gender_id: [],
    location: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    keyword: '',
    location_type: '',
    date_type: '',
    status: 1,
  };

  it('uses the curated homepage feed for the default state', () => {
    const payload = buildHomeEventFilter(defaultFilters, { isIOS: true });
    expect(shouldUseHomepageFeed(payload)).toBe(true);
    expect(buildHomepageFeedFilter()).toEqual({ status: 1, sort: 1 });
  });

  it.each([
    ['category', { category_id: [4] }],
    ['search', { keyword: 'knowledge' }],
    ['date', { start_date: '2026-07-29' }],
    ['organiser', { organizer_id: [2] }],
    ['speaker', { speaker_id: [3] }],
    ['online/onsite', { location: [0] }],
    ['non-default sort', { sort_Filter: [2] }],
  ])('uses the filtered feed for an explicit %s filter', (_label, override) => {
    expect(shouldUseHomepageFeed({ ...defaultFilters, ...override })).toBe(false);
  });

  it('preserves homepage ordering while de-duplicating repeated sections', () => {
    const knowledge = { id: 1, title: 'The Knowledge Class' };
    const friday = { id: 2, title: 'Friday Weekly Circle' };
    const tafsir = { id: 3, title: 'Tafsir ul-Quran' };

    expect(extractEventList({
      response: {
        banner: { events: [knowledge, friday] },
        recent: { events: [knowledge, tafsir] },
      },
    }).map((event) => event.title)).toEqual([
      'The Knowledge Class',
      'Friday Weekly Circle',
      'Tafsir ul-Quran',
    ]);
  });

  it('reads all categories from the POST filter contract used on iOS', () => {
    const categories = [
      { id: 1, title: 'Events' },
      { id: 2, title: 'Courses' },
      { id: 3, title: 'Mosque Tours' },
    ];

    expect(normalizeCategories({
      response: { category: { categories } },
    })).toEqual(categories);
  });
});
