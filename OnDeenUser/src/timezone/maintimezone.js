import { getTimeZone } from 'react-native-localize';
import { DateTime } from 'luxon';

const deviceTimeZone = getTimeZone(); // e.g., Asia/Kolkata

const parseSessionDateTime = (dateString, timeString, sourceTimeZone) => {
    if (!dateString || !timeString) {
        return DateTime.invalid('Missing session date or time');
    }

    const date = String(dateString).slice(0, 10);
    const zone = sourceTimeZone || 'GMT';
    return DateTime.fromISO(`${date}T${timeString}`, { zone });
};

export const formatSessionTime = (dateString, timeString, sourceTimeZone) => {
    const parsedDate = parseSessionDateTime(dateString, timeString, sourceTimeZone);
    if (!parsedDate.isValid) {
        return timeString || '';
    }

    return parsedDate.setZone(deviceTimeZone).toFormat('hh:mm a');
};

export const formatDateMonthYear = (date) => {
    if (!date) {
        return '';
    }

    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short', // Mon
        day: '2-digit', // 27
        month: 'short', // Aug
        year: 'numeric', // 2024
    });
};

// Main formatter function - always returns time only
export const formatTimeOnly = (dateTimeString, sourceTimeZone) => {
    // console.log(dateTimeString, sourceTimeZone, 'Input values');
    // console.log(deviceTimeZone, 'Device TimeZone');

    if (!dateTimeString) {
        return '';
    }

    try {
        // Default to GMT if no timezone is specified
        const effectiveSourceTimeZone = sourceTimeZone || 'GMT';
        const parsedDate = parseDateTimeWithTimeZone(dateTimeString, effectiveSourceTimeZone);

        if (!parsedDate || !parsedDate.isValid) {
            console.warn('Invalid date:', parsedDate?.invalidExplanation || 'Unknown error');
            return dateTimeString; // or return empty string if preferred
        }

        // Always return time in device timezone, regardless of input format
        return parsedDate.setZone(deviceTimeZone).toFormat('hh:mm a');
    } catch (e) {
        console.error("DateTime formatting error:", e);
        return dateTimeString; // or return empty string if preferred
    }
};

// Helper to parse string from any known format into a Luxon DateTime in sourceTimeZone
const parseDateTimeWithTimeZone = (dateTimeString, sourceTimeZone) => {
    if (!dateTimeString) {
        return DateTime.invalid("Missing date value");
    }

    // First try to parse with the specified timezone
    let dt = tryParseWithTimeZone(dateTimeString, sourceTimeZone);
    if (dt.isValid) return dt;

    // If that fails and we have an ISO string without timezone, try GMT
    if (isISODateWithoutTimezone(dateTimeString)) {
        dt = tryParseWithTimeZone(dateTimeString, 'GMT');
        if (dt.isValid) return dt;
    }

    return DateTime.invalid("Unsupported date format");
};

const tryParseWithTimeZone = (dateTimeString, timeZone) => {
    if (!dateTimeString) {
        return DateTime.invalid("Missing date value");
    }

    // Attempt ISO (including formats like "2025-07-04T12:11:28" and "2025-07-04")
    let dt = DateTime.fromISO(dateTimeString, { zone: timeZone });
    if (dt.isValid) return dt;

    // Attempt RFC 2822 (Tue, 29 Apr 2025 14:30:00 GMT)
    dt = DateTime.fromRFC2822(dateTimeString, { zone: timeZone });
    if (dt.isValid) return dt;

    // Attempt SQL format "2025-07-04 12:11:28"
    const sqlMatch = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/.exec(dateTimeString);
    if (sqlMatch) {
        return DateTime.fromISO(`${sqlMatch[1]}T${sqlMatch[2]}`, { zone: timeZone });
    }

    // Attempt time-only format "14:30:00" or "14:30"
    const timeOnlyMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(dateTimeString);
    if (timeOnlyMatch) {
        const now = DateTime.now().setZone(timeZone);
        return DateTime.fromObject(
            {
                year: now.year,
                month: now.month,
                day: now.day,
                hour: parseInt(timeOnlyMatch[1]),
                minute: parseInt(timeOnlyMatch[2]),
                second: timeOnlyMatch[3] ? parseInt(timeOnlyMatch[3]) : 0
            },
            { zone: timeZone }
        );
    }

    return DateTime.invalid("Unsupported date format");
};

const isISODateWithoutTimezone = (dateTimeString) => {
    if (!dateTimeString) {
        return false;
    }

    // Matches ISO format without timezone (e.g., "2025-07-18T13:01:12")
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(dateTimeString);
};

// Updated Usage Examples:
// formatTimeOnly("2025-07-18T13:01:12", undefined) => "06:31 PM" (assuming device in IST, treats input as GMT)
// formatTimeOnly("14:30:00", "Europe/London") => "08:00 PM" (example output in IST)
// formatTimeOnly("2025-07-04 12:11:28", "UTC") => "05:41 PM" (example output in IST)
// formatTimeOnly("2025-07-02T00:00:00", "America/New_York") => "09:30 AM" (example output in IST)
// formatTimeOnly("2025-06-26", "Asia/Tokyo") => "09:30 PM" (example output in IST, assumes midnight in Tokyo)
// formatTimeOnly("2025-07-02T12:47:55", "Australia/Sydney") => "08:17 AM" (example output in IST)
