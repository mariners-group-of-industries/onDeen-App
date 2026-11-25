import { buildOfflineTicketHtml, escapeTicketHtml } from '../src/FileDownload/ticketPdfTemplate';

describe('offline ticket PDF template', () => {
  it('escapes user-visible values', () => {
    expect(escapeTicketHtml('<Knowledge & Faith>')).toBe('&lt;Knowledge &amp; Faith&gt;');
  });

  it('embeds the reference ticket data and a scannable QR SVG', async () => {
    const html = await buildOfflineTicketHtml({
      eventTitle: 'The Knowledge Class',
      eventDate: '28 Jan 2026',
      eventTime: '8:30 pm',
      venue: '565A High Rd, London N17 6SN, UK',
      participants: [{
        ticket_no: '10',
        ticket_title: 'General Admission',
        paid_amount: '0.00',
        qrcode: 'ondeen://ticket/1/4',
      }],
    });

    expect(html).toContain('The Knowledge Class');
    expect(html).toContain('28 Jan 2026');
    expect(html).toContain('General Admission');
    expect(html).toContain('Free');
    expect(html).toContain('<svg');
    expect(html).toContain('Saved by OnDeen for offline entry');
  });
});
