import QRCodeGenerator from 'qrcode';

export const escapeTicketHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const ticketPriceLabel = (participant) => {
  const amount = Number.parseFloat(participant?.paid_amount || 0);
  if (!Number.isFinite(amount) || amount === 0) {
    return 'Free';
  }
  return `£${new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)} (Paid)`;
};

export const buildOfflineTicketHtml = async ({
  eventTitle,
  eventDate,
  eventTime,
  venue,
  participants = [],
}) => {
  const ticketCards = await Promise.all(participants.map(async (participant, index) => {
    const qrValue = participant?.qrcode || participant?.qr_code || '';
    const qrSvg = qrValue
      ? await QRCodeGenerator.toString(String(qrValue), {
        type: 'svg',
        margin: 1,
        width: 180,
        errorCorrectionLevel: 'M',
      })
      : '';

    return `
      <section class="ticket-card">
        <div class="ticket-copy">
          <p class="eyebrow">TICKET ID</p>
          <h2>${escapeTicketHtml(participant?.ticket_no || index + 1)}</h2>
          <p>${escapeTicketHtml(participant?.ticket_title || 'General Admission')}</p>
          <p class="price">${escapeTicketHtml(ticketPriceLabel(participant))}</p>
        </div>
        <div class="qr">${qrSvg || '<span>QR unavailable</span>'}</div>
      </section>`;
  }));

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; color: #222; background: #fff9e9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        main { padding: 42px; }
        .brand { color: #4a147f; font-size: 16px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; }
        h1 { margin: 10px 0 26px; font-size: 32px; line-height: 1.15; }
        .event-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .meta-card { padding: 16px; border-radius: 14px; background: #fff; border: 1px solid #eadfc9; }
        .meta-label, .eyebrow { margin: 0 0 4px; color: #6d6670; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
        .meta-value { margin: 0; font-size: 15px; font-weight: 650; }
        .venue { margin-bottom: 24px; }
        .ticket-card { display: flex; align-items: center; justify-content: space-between; margin: 0 0 18px; padding: 22px; border-radius: 20px; background: #fff; border: 2px dashed #e4c86d; page-break-inside: avoid; }
        .ticket-copy { width: 58%; }
        .ticket-copy h2 { margin: 0 0 8px; font-size: 27px; }
        .ticket-copy p { margin: 5px 0; font-size: 16px; }
        .ticket-copy .price { color: #279640; font-weight: 800; }
        .qr { width: 180px; height: 180px; display: flex; align-items: center; justify-content: center; background: #fff; }
        .qr svg { width: 180px; height: 180px; }
        .offline { margin-top: 26px; color: #6d6670; font-size: 12px; text-align: center; }
      </style>
    </head>
    <body>
      <main>
        <div class="brand">OnDeen e-ticket</div>
        <h1>${escapeTicketHtml(eventTitle || 'OnDeen Event')}</h1>
        <div class="event-meta">
          <div class="meta-card"><p class="meta-label">Event date</p><p class="meta-value">${escapeTicketHtml(eventDate || 'N/A')}</p></div>
          <div class="meta-card"><p class="meta-label">Event time</p><p class="meta-value">${escapeTicketHtml(eventTime || 'N/A')}</p></div>
        </div>
        <div class="meta-card venue"><p class="meta-label">Venue</p><p class="meta-value">${escapeTicketHtml(venue || 'N/A')}</p></div>
        ${ticketCards.join('')}
        <p class="offline">Saved by OnDeen for offline entry. Keep this document available on your device.</p>
      </main>
    </body>
  </html>`;
};
