import { getTimeZone } from 'react-native-localize';
import { DateTime } from 'luxon';

const deviceTimeZone = getTimeZone(); // e.g., Asia/Kolkata

// Main formatter function
export const timezoneformatDateTime = (dateTimeString, sourceTimeZone, formatType) => {



    try {
        const parsedDate = parseDateTimeWithTimeZone(dateTimeString, sourceTimeZone);

        if (!parsedDate || !parsedDate.isValid) {

            return dateTimeString;
        }

        switch (formatType) {
            case 'dd-mm-yyyy':
                return parsedDate.setZone(deviceTimeZone).toFormat('dd-MM-yyyy');
            case 'dd-month-yyyy':
                return parsedDate.setZone(deviceTimeZone).toFormat('dd LLLL yyyy');
            case 'weekday-time':
                return parsedDate.setZone(deviceTimeZone).toFormat('ccc, hh:mm a');
            case 'time-only':
                return parsedDate.setZone(deviceTimeZone).toFormat('hh:mm a');
            default:
                return parsedDate.setZone(deviceTimeZone)?.toString(); // fallback
        }
    } catch (e) {

        return dateTimeString;
    }
};

// Helper to parse string from any known format into a Luxon DateTime in sourceTimeZone
const parseDateTimeWithTimeZone = (dateTimeString, sourceTimeZone) => {
    // Attempt ISO
    let dt = DateTime.fromISO(dateTimeString, { zone: sourceTimeZone });
    if (dt.isValid) return dt;

    // Attempt RFC 2822 (Tue, 29 Apr 2025 14:30:00 GMT)
    dt = DateTime.fromRFC2822(dateTimeString, { zone: sourceTimeZone });
    if (dt.isValid) return dt;

    // Attempt custom format like "14:30:00"
    const timeOnlyMatch = /^(\d{2}):(\d{2}):(\d{2})$/.exec(dateTimeString);
    if (timeOnlyMatch) {
        const now = DateTime.now().setZone(sourceTimeZone);
        return DateTime.fromObject(
            {
                year: now.year,
                month: now.month,
                day: now.day,
                hour: parseInt(timeOnlyMatch[1]),
                minute: parseInt(timeOnlyMatch[2]),
                second: parseInt(timeOnlyMatch[3])
            },
            { zone: sourceTimeZone }
        );
    }

    return DateTime.invalid("Unsupported date format");
};

// Usage Examples:
// const time2 = timezoneformatDateTime("14:30:00", "Europe/London", "time-only");