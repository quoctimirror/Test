"""
PDF Invoice Extractor API for Mirror Future Diamond
Vercel Serverless Python Function (Flask)

Endpoint: POST /api/extract-invoice
"""

from flask import Flask, request, jsonify
import io
import re
from dataclasses import dataclass, asdict
from typing import List, Optional

# pdfplumber import
try:
    import pdfplumber
except ImportError:
    pdfplumber = None

app = Flask(__name__)


@dataclass
class InvoiceItem:
    stt: int
    name: str
    unit: str
    quantity: int
    unitPrice: Optional[int]
    total: Optional[int]


@dataclass
class InvoiceData:
    # Invoice info
    invoiceCode: str
    invoiceNumber: str
    invoiceDate: str
    paymentMethod: str

    # Customer info
    customerCompany: str
    customerName: str
    customerTaxCode: str
    customerAddress: str
    customerPhone: str
    customerIdNumber: str

    # Items
    items: List[InvoiceItem]

    # Totals
    subtotal: int
    totalInWords: str


def parse_money(value: str) -> Optional[int]:
    """Convert Vietnamese currency string to integer"""
    if not value or value.strip() == '':
        return None
    cleaned = re.sub(r'[^\d]', '', value)
    return int(cleaned) if cleaned else None


def extract_invoice_items(table: list) -> List[InvoiceItem]:
    """Extract product list from PDF table"""
    items = []

    if not table or len(table) < 2:
        return items

    # Skip header row
    for row in table[1:]:
        if not row or not row[0] or row[0].strip() == '':
            continue

        # Check if this is a product row (STT is a number)
        try:
            stt = int(row[0].strip())
        except (ValueError, AttributeError):
            continue

        # Clean product name
        name = row[1].replace('\n', ' ').strip() if row[1] else ''
        name = re.sub(r'\s+', ' ', name)

        # Parse quantity
        quantity = 1
        if len(row) > 3 and row[3]:
            try:
                quantity = int(float(row[3].strip()))
            except (ValueError, AttributeError):
                quantity = 1

        # Parse unit price
        unit_price = None
        if len(row) > 4 and row[4]:
            unit_price = parse_money(row[4])

        # Parse total
        total = None
        if len(row) > 5 and row[5]:
            total = parse_money(row[5])

        item = InvoiceItem(
            stt=stt,
            name=name,
            unit=row[2].strip() if len(row) > 2 and row[2] else 'cai',
            quantity=quantity,
            unitPrice=unit_price,
            total=total
        )
        items.append(item)

    return items


def extract_text_field(text: str, pattern: str, group: int = 1) -> str:
    """Extract field from text using regex"""
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(group).strip() if match else ''


def extract_invoice_data(pdf_bytes: bytes) -> dict:
    """Extract all data from PDF invoice"""

    if pdfplumber is None:
        raise ImportError("pdfplumber not installed")

    pdf_file = io.BytesIO(pdf_bytes)

    with pdfplumber.open(pdf_file) as pdf:
        if len(pdf.pages) == 0:
            raise ValueError("PDF has no pages")

        page = pdf.pages[0]

        # Get full text for header info
        full_text = page.extract_text() or ''

        # Extract tables
        tables = page.extract_tables()
        items = []

        if tables:
            # Main product table is usually the first one
            items = extract_invoice_items(tables[0])

        # Extract date (Vietnamese format)
        date_match = re.search(r'Ng[aà]y\s*(\d+)\s*th[aá]ng\s*(\d+)\s*n[aă]m\s*(\d+)', full_text)
        invoice_date = f"{date_match.group(1)}/{date_match.group(2)}/{date_match.group(3)}" if date_match else ''

        # Tax code
        tax_code = extract_text_field(full_text, r'M[aã]\s*s[oố]\s*thu[eế]:\s*(\d+)')

        # Company address
        address = extract_text_field(full_text, r'[ĐD][iị]a\s*ch[iỉ]:\s*([^\n]+)')

        # Company phone
        phone = extract_text_field(full_text, r'[ĐD]i[eệ]n\s*tho[aạ]i:\s*(\d+)')

        # Invoice code and number
        invoice_code = extract_text_field(full_text, r'K[yý]\s*hi[eệ]u:\s*(\w+)')
        invoice_number = extract_text_field(full_text, r'S[oố]:\s*([^\n]+)')

        # Customer ID
        customer_id = extract_text_field(full_text, r'CCCD\s*ng[uư][oờ]i\s*mua:\s*(\d+)')

        # Customer phone (before CCCD)
        customer_phone = extract_text_field(full_text, r'[ĐD]i[eệ]n\s*tho[aạ]i:\s*(\d+).*CCCD')

        # Customer name
        customer_name = extract_text_field(full_text, r'H[oọ]\s*t[eê]n\s*ng[uư][oờ]i\s*mua\s*h[aà]ng:\s*([^\n]+)')
        if not customer_name:
            customer_name = extract_text_field(full_text, r'T[eê]n\s*ng[uư][oờ]i\s*mua:\s*([^\n]+)')

        # Customer company
        customer_company = extract_text_field(full_text, r'T[eê]n\s*[đd][oơ]n\s*v[iị]:\s*([^\n]+)')

        # Customer address
        customer_address = extract_text_field(full_text, r'[ĐD][iị]a\s*ch[iỉ]\s*ng[uư][oờ]i\s*mua:\s*([^\n]+)')

        # Payment method
        payment_method = extract_text_field(full_text, r'H[iì]nh\s*th[uứ]c\s*thanh\s*to[aá]n:\s*([^\n]+)')
        if not payment_method:
            payment_method = 'TM/CK'

        # Total
        total_match = re.search(r'C[oộ]ng\s*ti[eề]n.*?:\s*([\d\.]+)', full_text)
        subtotal = parse_money(total_match.group(1)) if total_match else 0

        # Total in words
        total_words = extract_text_field(full_text, r'S[oố]\s*ti[eề]n\s*vi[eế]t\s*b[aằ]ng\s*ch[uữ]:\s*([^\n]+)')

        invoice = InvoiceData(
            invoiceCode=invoice_code or '2C25MYY',
            invoiceNumber=invoice_number or '',
            invoiceDate=invoice_date,
            paymentMethod=payment_method,
            customerCompany=customer_company or 'Khach le khong lay hoa don',
            customerName=customer_name or 'Khach le khong lay hoa don',
            customerTaxCode=tax_code or '',
            customerAddress=customer_address or '',
            customerPhone=customer_phone or '',
            customerIdNumber=customer_id or '',
            items=items,
            subtotal=subtotal or 0,
            totalInWords=total_words or ''
        )

        # Convert to dict with items as dicts
        result = asdict(invoice)
        return result


@app.route('/api/extract-invoice', methods=['POST', 'OPTIONS'])
def extract_invoice():
    """Handle PDF extraction request"""

    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response, 200

    try:
        # Check if pdfplumber is available
        if pdfplumber is None:
            return jsonify({
                'success': False,
                'error': 'pdfplumber library not installed on server'
            }), 500

        # Get uploaded file
        if 'pdf' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No PDF file uploaded. Use form field name "pdf"'
            }), 400

        pdf_file = request.files['pdf']

        if pdf_file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        # Read PDF bytes
        pdf_bytes = pdf_file.read()

        if not pdf_bytes:
            return jsonify({
                'success': False,
                'error': 'Empty PDF file'
            }), 400

        # Extract invoice data
        invoice_data = extract_invoice_data(pdf_bytes)

        response = jsonify({
            'success': True,
            'data': invoice_data
        })
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 200

    except Exception as e:
        response = jsonify({
            'success': False,
            'error': str(e)
        })
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500


# For Vercel
app.debug = False
