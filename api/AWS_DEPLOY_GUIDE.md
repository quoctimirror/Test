# Deploy PDF Extract API to AWS Backend

## 1. Copy files to AWS server

Copy these files to your AWS backend:

```bash
# Files needed:
api/extract-invoice.py
requirements.txt
```

## 2. Install dependencies on AWS

```bash
pip install flask==3.0.0 pdfplumber==0.11.4
```

## 3. Create Flask app file

Create `pdf_extract_api.py` on AWS:

```python
"""
PDF Invoice Extractor API
Run: python pdf_extract_api.py
Or with gunicorn: gunicorn -w 4 -b 0.0.0.0:5000 pdf_extract_api:app
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import io
import re
from dataclasses import dataclass, asdict
from typing import List, Optional
import pdfplumber

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend


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
    invoiceCode: str
    invoiceNumber: str
    invoiceDate: str
    paymentMethod: str
    customerCompany: str
    customerName: str
    customerTaxCode: str
    customerAddress: str
    customerPhone: str
    customerIdNumber: str
    items: List[InvoiceItem]
    subtotal: int
    totalInWords: str


def parse_money(value: str) -> Optional[int]:
    if not value or value.strip() == '':
        return None
    cleaned = re.sub(r'[^\d]', '', value)
    return int(cleaned) if cleaned else None


def extract_invoice_items(table: list) -> List[InvoiceItem]:
    items = []
    if not table or len(table) < 2:
        return items

    for row in table[1:]:
        if not row or not row[0] or row[0].strip() == '':
            continue
        try:
            stt = int(row[0].strip())
        except (ValueError, AttributeError):
            continue

        name = row[1].replace('\n', ' ').strip() if row[1] else ''
        name = re.sub(r'\s+', ' ', name)

        quantity = 1
        if len(row) > 3 and row[3]:
            try:
                quantity = int(float(row[3].strip()))
            except (ValueError, AttributeError):
                quantity = 1

        unit_price = None
        if len(row) > 4 and row[4]:
            unit_price = parse_money(row[4])

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
    match = re.search(pattern, text, re.IGNORECASE)
    return match.group(group).strip() if match else ''


def extract_invoice_data(pdf_bytes: bytes) -> dict:
    pdf_file = io.BytesIO(pdf_bytes)

    with pdfplumber.open(pdf_file) as pdf:
        if len(pdf.pages) == 0:
            raise ValueError("PDF has no pages")

        page = pdf.pages[0]
        full_text = page.extract_text() or ''
        tables = page.extract_tables()
        items = []

        if tables:
            items = extract_invoice_items(tables[0])

        date_match = re.search(r'Ng[aà]y\s*(\d+)\s*th[aá]ng\s*(\d+)\s*n[aă]m\s*(\d+)', full_text)
        invoice_date = f"{date_match.group(1)}/{date_match.group(2)}/{date_match.group(3)}" if date_match else ''

        tax_code = extract_text_field(full_text, r'M[aã]\s*s[oố]\s*thu[eế]:\s*(\d+)')
        address = extract_text_field(full_text, r'[ĐD][iị]a\s*ch[iỉ]:\s*([^\n]+)')
        phone = extract_text_field(full_text, r'[ĐD]i[eệ]n\s*tho[aạ]i:\s*(\d+)')
        invoice_code = extract_text_field(full_text, r'K[yý]\s*hi[eệ]u:\s*(\w+)')
        invoice_number = extract_text_field(full_text, r'S[oố]:\s*([^\n]+)')
        customer_id = extract_text_field(full_text, r'CCCD\s*ng[uư][oờ]i\s*mua:\s*(\d+)')
        customer_phone = extract_text_field(full_text, r'[ĐD]i[eệ]n\s*tho[aạ]i:\s*(\d+).*CCCD')
        customer_name = extract_text_field(full_text, r'H[oọ]\s*t[eê]n\s*ng[uư][oờ]i\s*mua\s*h[aà]ng:\s*([^\n]+)')
        if not customer_name:
            customer_name = extract_text_field(full_text, r'T[eê]n\s*ng[uư][oờ]i\s*mua:\s*([^\n]+)')
        customer_company = extract_text_field(full_text, r'T[eê]n\s*[đd][oơ]n\s*v[iị]:\s*([^\n]+)')
        customer_address = extract_text_field(full_text, r'[ĐD][iị]a\s*ch[iỉ]\s*ng[uư][oờ]i\s*mua:\s*([^\n]+)')
        payment_method = extract_text_field(full_text, r'H[iì]nh\s*th[uứ]c\s*thanh\s*to[aá]n:\s*([^\n]+)')
        if not payment_method:
            payment_method = 'TM/CK'

        total_match = re.search(r'C[oộ]ng\s*ti[eề]n.*?:\s*([\d\.]+)', full_text)
        subtotal = parse_money(total_match.group(1)) if total_match else 0
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

        return asdict(invoice)


@app.route('/api/extract-invoice', methods=['POST', 'OPTIONS'])
def extract_invoice():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        if 'pdf' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No PDF file uploaded. Use form field name "pdf"'
            }), 400

        pdf_file = request.files['pdf']
        if pdf_file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        pdf_bytes = pdf_file.read()
        if not pdf_bytes:
            return jsonify({'success': False, 'error': 'Empty PDF file'}), 400

        invoice_data = extract_invoice_data(pdf_bytes)
        return jsonify({'success': True, 'data': invoice_data}), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'pdf-extract-api'}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

## 4. Run with Gunicorn (Production)

```bash
# Install gunicorn
pip install gunicorn flask-cors

# Run
gunicorn -w 4 -b 0.0.0.0:5000 pdf_extract_api:app
```

## 5. Systemd Service (Optional)

Create `/etc/systemd/system/pdf-extract.service`:

```ini
[Unit]
Description=PDF Extract API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/pdf-extract-api
ExecStart=/home/ubuntu/pdf-extract-api/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 pdf_extract_api:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable pdf-extract
sudo systemctl start pdf-extract
```

## 6. Update Frontend Environment Variable

Frontend đã được cấu hình sẵn sử dụng environment variable.

**Cách 1: Local development** - tạo file `.env.local`:
```bash
VITE_PDF_API_URL=http://localhost:5000
```

**Cách 2: Vercel production** - thêm env variable trong Vercel Dashboard:
```
VITE_PDF_API_URL=https://your-aws-backend.com
```

**Cách 3: Hoặc chỉnh sửa trực tiếp** trong `src/services/pdfExtractApi.js`:
```javascript
const API_BASE_URL = 'https://your-aws-backend.com';
```

## 7. Test API

```bash
curl -X POST -F "pdf=@invoice.pdf" https://your-aws-backend.com/api/extract-invoice
```

## Requirements

```
flask==3.0.0
flask-cors==4.0.0
pdfplumber==0.11.4
gunicorn==21.2.0
```
