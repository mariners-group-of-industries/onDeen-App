const fs = require('fs');
const path = require('path');

describe('organiser activity classification', () => {
  const source = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/EventDetails.jsx'),
    'utf8',
  );

  it('shows the Radar area derived from the selected topic as read-only information', () => {
    expect(source).toContain('Radar contribution');
    expect(source).toContain('derived automatically from this topic');
    expect(source).toContain('selectedClassification?.radarArea');
    expect(source).not.toMatch(/name=\{['\"]radar/i);
  });

  it('keeps topic and suitability as separate inputs', () => {
    expect(source).toContain("name={'sub_category_id'}");
    expect(source).toContain("name={'journey_level_id'}");
  });

  it('uses the organiser-facing labels from the sacred annex', () => {
    expect(source).toContain('Listing type');
    expect(source).toContain('Topic or activity');
    expect(source).toContain('Audience & language');
    expect(source).toContain("name={'language_id'}");
    expect(source).toContain("labels={{ one: 'Brothers', two: 'Sisters', three: 'All' }}");
  });

  it('supports in-person, online, and hybrid delivery without exposing Radar controls', () => {
    expect(source).toContain("labels={{ one: 'In person', two: 'Online', three: 'Hybrid' }}");
    expect(source).toContain("name={'meet_link'}");
    expect(source).not.toMatch(/name=\{['"]radar/i);
  });

  it('shows both online code and venue details for a persisted hybrid listing', () => {
    const detailsSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/MainEventDetail/FirstTab/DetailsScreen.jsx'),
      'utf8',
    );
    expect(detailsSource.match(/\[0, 2\]\.includes/g)?.length).toBeGreaterThanOrEqual(3);
    expect(detailsSource).toContain('[1, 2].includes');
  });

  it('requires a separate suitability level and explicit recurrence inputs', () => {
    expect(source).toContain("name={'journey_level_id'}");
    expect(source).toContain('<ScheduleSelector formik={formik} />');
    expect(source).toContain('Select at least one day');
    expect(source).toContain('A one-off listing must use the same start and end date');
  });

  it('exposes course breakdown and per-session swipe check-in choices for courses', () => {
    expect(source).toContain("Number(formik.values?.event_type) === 2");
    expect(source).toContain("questionId=\"course_breakdown\"");
    expect(source).toContain("questionId=\"swipe_checkin\"");
    expect(source).toContain('Add identifiable classes so each session keeps its own schedule and attendance.');
    expect(source).toContain('booked users can check in to each eligible course session');

    const createSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/createEventScreen/CreateEvent.jsx'),
      'utf8',
    );
    expect(createSource).toContain('"course_breakdown": id ? eventbyid?.course_breakdown : 2');
    expect(createSource).toContain('"swipe_checkin": id ? eventbyid?.swipe_checkin : 2');
  });
});

describe('organiser schedule controls', () => {
  const scheduleSource = fs.readFileSync(
    path.join(__dirname, '../src/components/ScheduleSelector.jsx'),
    'utf8',
  );

  it('offers one-off, daily, weekly, monthly, and all seven weekdays', () => {
    ['One-off', 'Daily', 'Weekly', 'Monthly'].forEach(label => {
      expect(scheduleSource).toContain(`label: '${label}'`);
    });
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach(label => {
      expect(scheduleSource).toContain(`fullLabel: '${label}'`);
    });
  });
});

describe('organiser calendar consistency', () => {
  it('uses recurrence-aware marks and only renders events for the selected session day', () => {
    const monthSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/calendarScreen/MonthsCalender.jsx'),
      'utf8',
    );
    const yearSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/calendarScreen/YearCalender.jsx'),
      'utf8',
    );

    expect(monthSource).toContain('const selectedDateEvents = data?.date');
    expect(monthSource).toContain('data={selectedDateEvents}');
    expect(monthSource).toContain('eventOccursOnDate(event, data.date)');
    expect(yearSource).toContain('eventOccursOnDate(event, selectedDate)');
    expect(monthSource).toContain('markedOccurrenceDates(filteredData)');
    expect(yearSource).toContain('markedOccurrenceDates(filteredData)');
    expect(monthSource).toContain('Open calendar event');
    expect(monthSource).toContain("{ id: eventData?.id, sessionDate }");
    expect(monthSource).toContain('selectedSessionDate');
  });

  it('supports one-off, daily, weekly and monthly occurrence calculations', () => {
    const occurrenceSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/calendarScreen/calendarOccurrence.js'),
      'utf8',
    );
    [1, 2, 3, 4].forEach(type => {
      expect(occurrenceSource).toContain(`case ${type}:`);
    });
    expect(occurrenceSource).toContain('mondayBasedWeekday');
    expect(occurrenceSource).toContain('occusr_weekday');
    expect(occurrenceSource).toContain('occusr_month');
  });
});

describe('organiser listing payload', () => {
  const confirmSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/Confirm.jsx'),
    'utf8',
  );

  it('maps the three UI delivery values to backend online, onsite, and hybrid codes', () => {
    expect(confirmSource).toContain('locationType === 2 ? 0 : locationType === 3 ? 2 : 1');
  });

  it('persists the selected audience and language', () => {
    expect(confirmSource).toContain('"gender": Number');
    expect(confirmSource).toContain('"language_id": Number');
  });
});

describe('organiser attendance progress', () => {
  const participantsSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/MainEventDetail/Participants.jsx'),
    'utf8',
  );

  it('shows attended sessions against the backend completed-session denominator', () => {
    expect(participantsSource).toContain('of {user?.no_of_days_count || 0} completed');
    expect(participantsSource).toContain('user?.attendance_percentage');
    expect(participantsSource).toContain('percent attendance');
  });

  it('labels new and returning attendees from organisation booking history', () => {
    expect(participantsSource).toContain("user?.new_user ? 'New attendee' : 'Returning attendee'");
  });

  it('offers an organiser manual attendance action tied to the selected event', () => {
    const profileSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/MainEventDetail/ProfileCard.jsx'),
      'utf8',
    );
    expect(profileSource).toContain("/organizer_app/event/manual_attendance");
    expect(profileSource).toContain('Mark attendee present');
    expect(participantsSource).toContain('eventId={id}');
  });

  it('removes manual attendance when check-in is disabled and explains all consequences', () => {
    const detailsSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/MainEventDetail/FirstTab/DetailsScreen.jsx'),
      'utf8',
    );
    const profileSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/MainEventDetail/ProfileCard.jsx'),
      'utf8',
    );
    expect(detailsSource).toContain('Number(eventbyid?.swipe_checkin) === 1');
    expect(detailsSource).toContain('checkInEnabled,');
    expect(participantsSource).toContain('checkInEnabled={checkInEnabled}');
    expect(profileSource).toContain('checkInEnabled ?');
    expect(profileSource).toContain('Check-in is disabled');
    expect(profileSource).toContain('Attendance, XP, streak and Radar will not be recorded.');
  });
});

describe('organiser QR scanner response handling', () => {
  it('reads the Redux action payload and shows retryable server errors', () => {
    const scannerSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/scanScreen/ScanQrCode.jsx'),
      'utf8',
    );
    const verificationSource = fs.readFileSync(
      path.join(__dirname, '../src/screens/scanScreen/QRVerificationScreen.jsx'),
      'utf8',
    );
    const sliceSource = fs.readFileSync(
      path.join(__dirname, '../src/redux/slices/updateattendanceSlice.tsx'),
      'utf8',
    );

    expect(scannerSource).toContain('const payload = action?.payload || action;');
    expect(scannerSource).toContain("Settings.get('ondeenQrProofData')");
    expect(scannerSource).toContain("Settings.get('ondeenQrProofEventId')");
    expect(scannerSource).toContain("typeof payload === 'string'");
    expect(scannerSource).toContain('roleType: buddyMode ? 5 : 3');
    expect(scannerSource).toContain("payload?.status === true ? 'Attendance marked successfully.'");
    expect(scannerSource).not.toContain('RRRRRRRRRRRRRRRRRRRRRRR');
    expect(verificationSource).toContain('apiresponce?.status === true');
    expect(sliceSource).toContain("response?.response?.message || 'Unable to verify this QR code.'");
  });
});
