import { getTimeZone } from 'react-native-localize';
import { DateTime } from 'luxon';

const deviceTimeZone = getTimeZone(); // e.g., Asia/Kolkata

// Main formatter function - always returns time only
export const formatTimeOnly = (dateTimeString, sourceTimeZone) => {



    try {
        const parsedDate = parseDateTimeWithTimeZone(dateTimeString, sourceTimeZone);

        if (!parsedDate || !parsedDate.isValid) {

            return dateTimeString; // or return empty string if preferred
        }

        // Always return time in device timezone, regardless of input format
        return parsedDate.setZone(deviceTimeZone).toFormat('hh:mm a');
    } catch (e) {

        return dateTimeString; // or return empty string if preferred
    }
};

// Helper to parse string from any known format into a Luxon DateTime in sourceTimeZone
const parseDateTimeWithTimeZone = (dateTimeString, sourceTimeZone) => {
    // Attempt ISO (including formats like "2025-07-04T12:11:28" and "2025-07-04")
    let dt = DateTime.fromISO(dateTimeString, { zone: sourceTimeZone });
    if (dt.isValid) return dt;

    // Attempt RFC 2822 (Tue, 29 Apr 2025 14:30:00 GMT)
    dt = DateTime.fromRFC2822(dateTimeString, { zone: sourceTimeZone });
    if (dt.isValid) return dt;

    // Attempt SQL format "2025-07-04 12:11:28"
    const sqlMatch = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/.exec(dateTimeString);
    if (sqlMatch) {
        return DateTime.fromISO(`${sqlMatch[1]}T${sqlMatch[2]}`, { zone: sourceTimeZone });
    }

    // Attempt time-only format "14:30:00" or "14:30"
    const timeOnlyMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(dateTimeString);
    if (timeOnlyMatch) {
        const now = DateTime.now().setZone(sourceTimeZone);
        return DateTime.fromObject(
            {
                year: now.year,
                month: now.month,
                day: now.day,
                hour: parseInt(timeOnlyMatch[1]),
                minute: parseInt(timeOnlyMatch[2]),
                second: timeOnlyMatch[3] ? parseInt(timeOnlyMatch[3]) : 0
            },
            { zone: sourceTimeZone }
        );
    }

    return DateTime.invalid("Unsupported date format");
};

// Usage Examples:
// formatTimeOnly("14:30:00", "Europe/London") => "08:00 PM" (example output in IST)
// formatTimeOnly("2025-07-04 12:11:28", "UTC") => "05:41 PM" (example output in IST)
// formatTimeOnly("2025-07-02T00:00:00", "America/New_York") => "09:30 AM" (example output in IST)
// formatTimeOnly("2025-06-26", "Asia/Tokyo") => "09:30 PM" (example output in IST, assumes midnight in Tokyo)
// formatTimeOnly("2025-07-02T12:47:55", "Australia/Sydney") => "08:17 AM" (example output in IST)