import uuid
import magic
import os
import pdfkit
import base64
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError
from flask import has_request_context, request
from werkzeug.utils import secure_filename

# Maximum file size in bytes (25 MB)
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
# Organiser event materials are intentionally bounded to the non-payment
# reference target.  Ten MB is explicitly acceptable in the Product Owner
# material flow while keeping uploads practical on mobile networks.
EVENT_MATERIAL_MAX_FILE_SIZE = 10 * 1024 * 1024

DEFAULT_UPLOAD_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
)


def _upload_root():
    return os.getenv("UPLOAD_ROOT") or DEFAULT_UPLOAD_ROOT


def _public_upload_url(folder, filename):
    base_url = os.getenv("UPLOAD_PUBLIC_BASE_URL")
    if not base_url and has_request_context():
        base_url = request.host_url.rstrip("/")

    local_static_uploads = os.path.abspath(_upload_root()) == DEFAULT_UPLOAD_ROOT
    if os.getenv("ONDEEN_LOCAL") == "1" and local_static_uploads:
        path = f"static/uploads/{folder}/{filename}"
    else:
        path = f"uploads/{folder}/{filename}"

    if not base_url:
        return f"/{path}"
    return f"{base_url.rstrip('/')}/{path}"


def _mime_extension(mime_type):
    return {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "application/pdf": "pdf",
        "application/msword": "doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
        "application/vnd.ms-powerpoint": "ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
        "application/zip": "zip",
        "application/x-zip-compressed": "zip",
    }.get(mime_type, "bin")


def _replace_extension(filename, extension):
    path = Path(filename)
    stem = secure_filename(path.stem) or str(uuid.uuid4())
    return f"{stem}.{extension}"


def _image_has_alpha(image):
    return (
        image.mode in ("RGBA", "LA")
        or (image.mode == "P" and "transparency" in image.info)
    )


def optimize_image(file_data, mime_type):
    if mime_type == "image/svg+xml":
        return file_data, "svg", mime_type

    try:
        image = Image.open(BytesIO(file_data))
    except UnidentifiedImageError:
        return file_data, _mime_extension(mime_type), mime_type

    image = ImageOps.exif_transpose(image)
    max_dimension = int(os.getenv("IMAGE_MAX_DIMENSION", "2048"))
    if max(image.size) > max_dimension:
        image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

    output = BytesIO()
    if _image_has_alpha(image) or mime_type == "image/png":
        if image.mode not in ("RGBA", "LA"):
            image = image.convert("RGBA" if _image_has_alpha(image) else "RGB")
        image.save(output, format="PNG", optimize=True, compress_level=9)
        return output.getvalue(), "png", "image/png"

    if image.mode != "RGB":
        image = image.convert("RGB")
    image.save(
        output,
        format="JPEG",
        quality=int(os.getenv("IMAGE_JPEG_QUALITY", "84")),
        optimize=True,
        progressive=True,
    )
    return output.getvalue(), "jpg", "image/jpeg"


def store_file(file_data, folder="project", filename=None, content_type=None):
    folder = secure_filename(folder or "project") or "project"
    filename = secure_filename(filename or str(uuid.uuid4()))
    if not filename:
        filename = str(uuid.uuid4())

    if content_type and content_type.startswith("image/"):
        file_data, extension, content_type = optimize_image(file_data, content_type)
        filename = _replace_extension(filename, extension)

    upload_dir = Path(_upload_root()) / folder
    upload_dir.mkdir(parents=True, exist_ok=True)
    local_path = upload_dir / filename
    local_path.write_bytes(file_data)
    return {
        "url": _public_upload_url(folder, filename),
        "path": str(local_path),
        "content_type": content_type,
    }

def is_valid_file_type(file_data):
    """Check if the file is a valid image, PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, or ZIP."""
    file_type = magic.from_buffer(file_data, mime=True)
    return file_type in [
        # Images
        'image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp',

        # PDF
        'application/pdf',

        # Word
        'application/msword',  # .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # .docx

        # Excel
        'application/vnd.ms-excel',  # .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  # .xlsx

        # PowerPoint
        'application/vnd.ms-powerpoint',  # .ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',  # .pptx

        # ZIP
        'application/zip',
        'application/x-zip-compressed',
    ]


def is_valid_material_file_type(file_data):
    """Allow the document and audio formats used by event materials."""
    file_type = magic.from_buffer(file_data, mime=True)
    return file_type in {
        'image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip', 'application/x-zip-compressed',
        'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/aac',
    }

def upload_base64_file(base64_string, module='project'):
    FOLDER = module
    try:
        # Remove the metadata prefix if present (e.g., "data:image/png;base64,...")
        if "base64," in base64_string:
            base64_string = base64_string.split("base64,")[1]

        # Decode the base64 string into binary data
        file_data = base64.b64decode(base64_string)

        # Check file size
        if len(file_data) > MAX_FILE_SIZE:
            return "File size exceeds the maximum limit of 25 MB"

        # Validate file type
        if not is_valid_file_type(file_data):
            return "Invalid file type. Only images (JPG, PNG, SVG, WebP), PDFs, DOC/DOCX, XLS/XLSX, PPT/PPTX, or ZIP files are allowed. karthik"

        # Determine file type and generate a storage filename.
        file_type_magic = magic.from_buffer(file_data, mime=True)

        unique_filename = f"{uuid.uuid4()}.{_mime_extension(file_type_magic)}"

        return store_file(file_data, FOLDER, unique_filename, file_type_magic)

    except Exception as e:
        return str(e)



def create_pdf_file(ticket_id, event, participant):
    try:
        # Debug options for wkhtmltopdf
        # options = {
            # 'debug-javascript': '',
            # 'no-stop-slow-scripts': '',
            # 'enable-local-file-access': ''
        # }
        options = {
            'debug-javascript': '',
            'no-stop-slow-scripts': '',
            'enable-local-file-access': '',
            'margin-top': '0mm',
            'margin-bottom': '0mm',
            'margin-left': '0mm',
            'margin-right': '0mm',
            'disable-smart-shrinking': '',
            'page-width': '80mm',
            'page-height': '140mm'
        }

        # Create the HTML structure with increased size
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }}
                .ticket-container {{
                    width: 100%;  
                    max-width: 100%;
                    margin: auto;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    background-color: #f8f8f8;
                    padding: 30px;  /* Increased padding */
                    text-align: center;
                }}
                .header h1 {{
                    margin: 5px 0;
                    font-size: 21px;  /* Increased font size */
                    font-weight: bold;
                }}
                .header p {{
                    margin: 0;
                    font-size: 16px;  /* Increased font size */
                    color: #555;
                }}
                .event-details {{
                    display: flex;
                    justify-content: space-between;
                    padding: 25px 30px;  /* Increased padding */
                    border-bottom: 1px dashed #ccc;
                }}
                .event-details div {{
                    text-align: center;
                }}
                .event-details p {{
                    margin: 5px 0;
                    font-size: 16px;  /* Increased font size */
                    color: #555;
                }}
                .event-details .label {{
                    font-weight: bold;
                    color: #000;
                }}
                .venue-details {{
                    background-color: #ffe4b5;
                    padding: 30px;  /* Increased padding */
                    text-align: center;
                }}
                .venue-details h3 {{
                    margin: 5px 0;
                    font-size: 18px;  /* Increased font size */
                    font-weight: bold;
                }}
                .venue-details p {{
                    margin: 5px 0;
                    font-size: 14px;  /* Increased font size */
                    line-height: 1.5;
                }}
                .qr-code-wrapper {{
                    background-color: #ffe4b5; /* Cream color */
                    padding: 20px;  /* Increased padding */
                    display: inline-block;
                }}
                .qr-code {{
                    background-color: #ffe4b5;
                    text-align: center;
                }}
                .qr-code img {{
                    width: 200px;  /* Increased QR code size */
                    height: 200px;  /* Increased QR code size */
                }}
                .amount {{
                    background-color: #ffe4b5;
                    padding: 20px;  /* Increased padding */
                    text-align: center;
                    font-weight: bold;
                    font-size: 16px;  /* Increased font size */
                }}
            </style>
        </head>
        <body>
            <div class="ticket-container">
                <div class="header">
                    <p>Ticket No. {ticket_id}0</p>
                    <h1>{event.title}</h1>
                </div>
                <div class="event-details">
                    <div>
                        <p class="label">Event date</p>
                        <p><i class="fas fa-calendar-day calendar-icon"></i> {participant.date.strftime('%d %b %Y') if event.category_id==3 else event.start_date.strftime('%d %b %Y')}</p>
                    </div>
                    <div>
                        <p class="label">Event time</p>
                        <p>{participant.start_time.strftime('%I:%M %p') if event.category_id==3 else event.start_time.strftime('%I:%M %p')}</p>
                    </div>
                </div>
        """
        if event.location_type==1:
            html_content += f"""
                    <div class="venue-details">
                        <h3>Venue Details</h3>
                        <p>{event.location}</p>
                    </div>
            """
        else:
            if event.meet_link:
                html_content += f"""
                        <div class="venue-details">
                            <h3>Event Link</h3>
                            <p>{event.meet_link}</p>
                        </div>
                """
        html_content += f"""
                <div class="qr-code">
                    <div class="qr-code-wrapper">
                        <img src="{participant.qrcode_path}" alt="QR Code">
                    </div>
                </div>
                <div class="amount">
        """
        if participant.paid_amount>0:
            html_content += f"""
                    Amount: {participant.paid_amount} (Paid)
            """
        else:
            html_content += f"""
                    Free
            """
        html_content += f"""
                </div>
            </div>
        </body>
        </html>
        """

        # Save PDF to a temporary directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        temp_dir = os.path.join(current_dir, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        output_path = os.path.join(temp_dir, f"ticket_{ticket_id}.pdf")

        #pdfkit.from_string(html_content, output_path, options=options)
        config = pdfkit.configuration(wkhtmltopdf='/usr/bin/wkhtmltopdf')
        pdfkit.from_string(html_content, output_path, options=options, configuration=config)

        # Read PDF and convert to base64
        with open(output_path, "rb") as pdf_file:
            pdf_data = pdf_file.read()
        base64_pdf = base64.b64encode(pdf_data).decode()

        # Upload to storage and get the URL
        upload_url = upload_base64_file(base64_pdf, 'tickets')
        return upload_url['url']

    except Exception:
        try:
            from fpdf import FPDF

            current_dir = os.path.dirname(os.path.abspath(__file__))
            temp_dir = os.path.join(current_dir, "temp")
            os.makedirs(temp_dir, exist_ok=True)
            fallback_path = os.path.join(temp_dir, f"ticket_{ticket_id}_fallback.pdf")

            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Helvetica", "B", 18)
            pdf.cell(0, 12, "OnDeen Ticket", ln=True, align="C")
            pdf.set_font("Helvetica", size=12)
            pdf.ln(6)
            pdf.cell(0, 8, f"Ticket ID: {ticket_id}", ln=True)
            pdf.cell(0, 8, f"Event: {event.title}", ln=True)
            pdf.cell(0, 8, f"Location: {event.location or event.meet_link or 'To be confirmed'}", ln=True)
            pdf.cell(0, 8, f"Amount: {'Free' if participant.paid_amount <= 0 else participant.paid_amount}", ln=True)
            if participant.qrcode_path:
                pdf.multi_cell(0, 8, f"QR Code: {participant.qrcode_path}")
            pdf.output(fallback_path)

            with open(fallback_path, "rb") as pdf_file:
                pdf_data = pdf_file.read()
            base64_pdf = base64.b64encode(pdf_data).decode()
            upload_url = upload_base64_file(base64_pdf, 'tickets')
            return upload_url.get('url') if isinstance(upload_url, dict) else participant.qrcode_path or ''
        except Exception:
            return participant.qrcode_path or ''
