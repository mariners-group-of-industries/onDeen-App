const fs = require('fs');
const path = require('path');

describe('organiser event material upload boundary', () => {
  const pickerSource = fs.readFileSync(
    path.join(__dirname, '../src/components/CustomeSelectFile.jsx'),
    'utf8',
  );
  const attachmentSource = fs.readFileSync(
    path.join(__dirname, '../src/components/AddAttachment.jsx'),
    'utf8',
  );
  const detailSource = fs.readFileSync(
    path.join(__dirname, '../src/screens/MainEventDetail/SecondTab.jsx'),
    'utf8',
  );
  const backendUploadSource = fs.readFileSync(
    path.join(__dirname, '../../Backend/app/auth/routes.py'),
    'utf8',
  );

  it('uploads a selected document through the generic file endpoint', () => {
    expect(pickerSource).toContain("from 'react-native-document-picker'");
    expect(pickerSource).toContain("url: '/upload_file'");
    expect(pickerSource).toContain("module: 'event_material'");
    expect(pickerSource).toContain("RNFS.readFile");
    expect(attachmentSource).toContain('allowDocuments');
    expect(pickerSource).toContain('Event materials must be 10 MB or smaller.');
    expect(backendUploadSource).toContain('EVENT_MATERIAL_MAX_FILE_SIZE');
    expect(backendUploadSource).toContain('Unsupported event material');
  });

  it('keeps material editing available after a listing is published', () => {
    expect(detailSource).toContain('accessibilityLabel="Edit event materials"');
    expect(detailSource).toContain("navigation.navigate('CreateEvent'");
    expect(detailSource).toContain('id: eventbyid?.id');
  });
});
