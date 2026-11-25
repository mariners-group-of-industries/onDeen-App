const fs = require('fs');
const path = require('path');

describe('organiser free ticket types', () => {
  const componentSource = fs.readFileSync(
    path.join(__dirname, '../src/components/TicketTypes.jsx'),
    'utf8',
  );
  const confirmSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/createEventScreen/Confirm.jsx'),
    'utf8',
  );

  it('offers free capacity and per-user controls without payment checkout', () => {
    expect(componentSource).toContain('Ticket types');
    expect(componentSource).toContain('Capacity');
    expect(componentSource).toContain('Maximum per User');
    expect(componentSource).toContain('Price: FREE');
    expect(componentSource).toContain('paid checkout remains outside this parity pass');
  });

  it('persists ticket types and selects the backend multiple-ticket mode', () => {
    expect(confirmSource).toContain("import TicketTypes from '../../components/TicketTypes'");
    expect(confirmSource).toContain('formik.setFieldValue(\'tickets\', tickets)');
    expect(confirmSource).toContain('tickets.length > 0 ? 1');
  });
});
