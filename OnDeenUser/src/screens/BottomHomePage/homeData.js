const DEFAULT_ACTIVE_STATUS = 1;
const DEFAULT_HOME_SORT = 1;

export const hasCoordinate = (value) => {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  return Number.isFinite(Number(value));
};

export const isEmptyFilterValue = (value) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value === null || value === undefined || value === '';
};

export const buildHomeEventFilter = (filters, { isIOS }) => {
  const hasLocation = hasCoordinate(filters?.latitude) && hasCoordinate(filters?.longitude);
  const payload = {};

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (isEmptyFilterValue(value)) {
      return;
    }
    payload[key] = value;
  });

  if (!hasLocation) {
    delete payload.latitude;
    delete payload.longitude;

    if (
      isIOS &&
      Array.isArray(payload.sort_Filter) &&
      payload.sort_Filter.length === 1 &&
      payload.sort_Filter[0] === DEFAULT_HOME_SORT
    ) {
      delete payload.sort_Filter;
    }
  }

  return payload;
};

export const extractEventList = (response) => {
  const payload = response?.response ?? response;
  const candidates = [
    payload?.events,
    payload?.banner?.events,
    payload?.recent?.events,
    payload?.data?.events,
  ];
  const uniqueEvents = new Map();

  candidates.forEach((candidate) => {
    if (!Array.isArray(candidate)) {
      return;
    }

    candidate.forEach((event, index) => {
      if (!event || typeof event !== 'object') {
        return;
      }
      const key = event.id ?? event.event_id ?? `${event.title || 'event'}-${event.start_date || index}`;
      if (!uniqueEvents.has(String(key))) {
        uniqueEvents.set(String(key), event);
      }
    });
  });

  return Array.from(uniqueEvents.values());
};

export const extractNotificationCount = (response) => {
  const count = response?.response?.new_notification_count;
  return Number.isFinite(Number(count)) ? Number(count) : 0;
};

export const buildHomepageFeedFilter = () => ({
  status: DEFAULT_ACTIVE_STATUS,
  sort: DEFAULT_HOME_SORT,
});

export const normalizeCategories = (response) => {
  const candidates = [
    response?.response,
    response?.response?.category,
    response?.response?.category?.categories,
    response?.response?.HomeCategory,
    response?.response?.categories,
    response?.category,
    response?.category?.categories,
    response?.categories,
  ];

  return candidates.find(Array.isArray) || [];
};

export const hasExplicitHomeFilter = (filters) => Object.entries(filters || {}).some(([key, value]) => {
  if (isEmptyFilterValue(value)) {
    return false;
  }

  if (key === 'latitude' || key === 'longitude' || key === 'address') {
    return false;
  }

  // A text location is the device/geocoded city. An array is a Product Owner
  // location-type filter (online/onsite) and must keep using the filtered feed.
  if (key === 'location') {
    return Array.isArray(value) && value.length > 0;
  }

  if (key === 'status') {
    return Number(value) !== DEFAULT_ACTIVE_STATUS;
  }

  if (key === 'sort_Filter') {
    return !(
      Array.isArray(value) &&
      value.length === 1 &&
      Number(value[0]) === DEFAULT_HOME_SORT
    );
  }

  return true;
});

export const shouldUseHomepageFeed = (filters) => !hasExplicitHomeFilter(filters);
