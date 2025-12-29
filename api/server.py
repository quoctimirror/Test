#!/usr/bin/env python3
"""
Local Python Server for PDF Invoice Extraction
Run: python api/server.py
Server: http://localhost:3000
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import io
import re
import sys
import os

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed. Run: pip install pdfplumber")
    sys.exit(1)

from dataclasses import dataclass, asdict, field
from typing import List, Optional


@dataclass
class InvoiceItem:
    """San pham trong hoa don"""
    stt: int
    name: str
    unit: str
    quantity: int
    unitPrice: Optional[int]
    total: Optional[int]


@dataclass
class InvoiceData:
    """Du lieu hoa don - extract dung theo PDF, khong them khong bot"""

    # === THONG TIN CONG TY BAN ===
    sellerName: str                  # Ten cong ty ban
    sellerTaxCode: str               # Ma so thue cong ty ban
    sellerAddress: str               # Dia chi cong ty ban
    sellerPhone: str                 # Dien thoai cong ty ban

    # === THONG TIN HOA DON ===
    invoiceCode: str                 # Ky hieu: 2C25MYY
    invoiceNumber: str               # So: <Chua cap so>
    invoiceDate: str                 # Ngay 25 thang 12 nam 2025
    maCQT: str                       # Ma CQT

    # === THONG TIN KHACH HANG (NGUOI MUA) ===
    customerCompany: str             # Ten don vi
    customerTaxCode: str             # MST/CCCD chu ho
    customerAddress: str             # Dia chi
    customerName: str                # Ho va ten nguoi mua hang
    customerPhone: str               # Dien thoai
    customerIdNumber: str            # CCCD nguoi mua
    paymentMethod: str               # Hinh thuc thanh toan

    # === DANH SACH SAN PHAM ===
    items: List[InvoiceItem]

    # === TONG TIEN ===
    subtotal: Optional[int]          # Cong tien ban hang hoa, dich vu
    totalInWords: str                # So tien viet bang chu


def parse_money(value: str) -> Optional[int]:
    """Chuyen chuoi tien VN sang so nguyen"""
    if not value or value.strip() == '':
        return None
    cleaned = re.sub(r'[^\d]', '', value)
    return int(cleaned) if cleaned else None


def extract_text_field(text: str, pattern: str, group: int = 1) -> str:
    """Extract field tu text bang regex, tra ve '' neu khong tim thay"""
    match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    if match:
        result = match.group(group).strip()
        # Loai bo cac ky tu thua o cuoi
        result = re.sub(r'\s+', ' ', result)
        return result
    return ''


def extract_invoice_items(table: list) -> List[InvoiceItem]:
    """Extract danh sach san pham tu table"""
    items = []
    if not table or len(table) < 2:
        return items

    for row in table[1:]:  # Bo header row
        if not row or len(row) < 1:
            continue

        # Kiem tra STT co phai la so khong
        if not row[0] or row[0].strip() == '':
            continue
        try:
            stt = int(row[0].strip())
        except (ValueError, AttributeError):
            continue

        # Ten san pham
        name = ''
        if len(row) > 1 and row[1]:
            name = row[1].replace('\n', ' ').strip()
            name = re.sub(r'\s+', ' ', name)

        # Don vi tinh
        unit = ''
        if len(row) > 2 and row[2]:
            unit = row[2].strip()

        # So luong
        quantity = None
        if len(row) > 3 and row[3]:
            try:
                quantity = int(float(row[3].strip()))
            except (ValueError, AttributeError):
                quantity = None

        # Don gia
        unit_price = None
        if len(row) > 4 and row[4]:
            unit_price = parse_money(row[4])

        # Thanh tien
        total = None
        if len(row) > 5 and row[5]:
            total = parse_money(row[5])

        item = InvoiceItem(
            stt=stt,
            name=name,
            unit=unit,
            quantity=quantity,
            unitPrice=unit_price,
            total=total
        )
        items.append(item)

    return items


def extract_invoice_data(pdf_bytes: bytes) -> dict:
    """Extract tat ca du lieu tu PDF hoa don"""

    pdf_file = io.BytesIO(pdf_bytes)

    with pdfplumber.open(pdf_file) as pdf:
        if len(pdf.pages) == 0:
            raise ValueError("PDF has no pages")

        page = pdf.pages[0]
        full_text = page.extract_text() or ''

        # Debug: In ra text de kiem tra
        print("=" * 60)
        print("EXTRACTED TEXT FROM PDF:")
        print("=" * 60)
        print(full_text)
        print("=" * 60)

        # Extract tables
        tables = page.extract_tables()
        items = []
        if tables:
            items = extract_invoice_items(tables[0])

        # === THONG TIN CONG TY BAN ===
        # Ten cong ty: dong dau tien thuong la ten cong ty
        seller_name = extract_text_field(
            full_text,
            r'^(CÔNG TY[^\n]+|CTY[^\n]+)',
            1
        )
        if not seller_name:
            # Thu tim theo pattern khac
            seller_name = extract_text_field(full_text, r'(CÔNG TY CỔ PHẦN[^\n]+)', 1)

        # Ma so thue cong ty ban (dong dau tien co "Ma so thue:")
        seller_tax = extract_text_field(
            full_text,
            r'Mã\s*số\s*thuế:\s*(\d+)',
            1
        )

        # Dia chi cong ty ban
        seller_address = extract_text_field(
            full_text,
            r'Địa\s*chỉ:\s*([^\n]+?)(?=\s*Điện\s*thoại|\s*Tên\s*đơn\s*vị|$)',
            1
        )

        # Dien thoai cong ty ban
        seller_phone = extract_text_field(
            full_text,
            r'Điện\s*thoại:\s*(\d+)',
            1
        )

        # === THONG TIN HOA DON ===
        # Ky hieu
        invoice_code = extract_text_field(
            full_text,
            r'Ký\s*hiệu:\s*(\w+)',
            1
        )

        # So hoa don
        invoice_number = extract_text_field(
            full_text,
            r'Số:\s*([^\n]+)',
            1
        )

        # Ngay thang nam
        date_match = re.search(
            r'Ngày\s*(\d+)\s*tháng\s*(\d+)\s*năm\s*(\d+)',
            full_text
        )
        invoice_date = ''
        if date_match:
            invoice_date = f"{date_match.group(1)}/{date_match.group(2)}/{date_match.group(3)}"

        # Ma CQT - chi lay neu co gia tri thuc (ma CQT thuong dai hon 3 ky tu)
        ma_cqt_match = re.search(r'Mã\s*CQT:\s*([A-Z0-9\-]{3,})', full_text)
        ma_cqt = ma_cqt_match.group(1).strip() if ma_cqt_match else ''

        # === THONG TIN KHACH HANG ===
        # Ten don vi - stop truoc cac field khac
        customer_company_match = re.search(
            r'Tên\s*đơn\s*vị:\s*([^:\n]+?)(?:\s*(?:MST|Mã\s*số|Địa\s*chỉ|$))',
            full_text
        )
        customer_company = customer_company_match.group(1).strip() if customer_company_match else ''

        # MST/CCCD chu ho - chi lay so
        customer_tax_match = re.search(
            r'MST/CCCD\s*chủ\s*hộ:\s*(\d+)',
            full_text
        )
        customer_tax = customer_tax_match.group(1).strip() if customer_tax_match else ''

        # Dia chi khach hang - tim dong "Địa chỉ:" sau phan thong tin cong ty
        # Va lay gia tri neu khong phai la field khac
        customer_address_match = re.search(
            r'MST/CCCD\s*chủ\s*hộ:[^\n]*\nĐịa\s*chỉ:\s*([^:\n]*?)(?:\s*(?:Họ|Tên|Điện|$))',
            full_text
        )
        customer_address = ''
        if customer_address_match:
            addr = customer_address_match.group(1).strip()
            # Chi lay neu khong phai la field name
            if addr and not re.match(r'^(Họ|Tên|Điện|MST|CCCD)', addr):
                customer_address = addr

        # Ho va ten nguoi mua hang
        customer_name_match = re.search(
            r'Họ\s*(?:và\s*)?tên\s*người\s*mua\s*hàng:\s*([^:\n]+?)(?:\s*(?:Điện\s*thoại|CCCD|Hình\s*thức|$))',
            full_text
        )
        customer_name = customer_name_match.group(1).strip() if customer_name_match else ''

        # Dien thoai khach hang - chi lay so
        customer_phone_match = re.search(
            r'Điện\s*thoại:\s*(\d+)\s*CCCD\s*người\s*mua:',
            full_text
        )
        customer_phone = customer_phone_match.group(1).strip() if customer_phone_match else ''

        # CCCD nguoi mua - chi lay so
        customer_id_match = re.search(
            r'CCCD\s*người\s*mua:\s*(\d+)',
            full_text
        )
        customer_id = customer_id_match.group(1).strip() if customer_id_match else ''

        # Hinh thuc thanh toan
        payment_match = re.search(
            r'Hình\s*thức\s*thanh\s*toán:\s*([A-Za-z/]+)',
            full_text
        )
        payment_method = payment_match.group(1).strip() if payment_match else ''

        # === TONG TIEN ===
        # Cong tien ban hang hoa, dich vu
        subtotal_match = re.search(
            r'Cộng\s*tiền\s*(?:bán\s*)?(?:hàng\s*)?(?:hóa)?[^:]*:\s*([\d\.,]+)',
            full_text
        )
        subtotal = None
        if subtotal_match:
            subtotal = parse_money(subtotal_match.group(1))

        # So tien viet bang chu
        total_words = extract_text_field(
            full_text,
            r'Số\s*tiền\s*viết\s*bằng\s*chữ:\s*([^\n]+)',
            1
        )

        # Tao object InvoiceData
        invoice = InvoiceData(
            # Thong tin cong ty ban
            sellerName=seller_name,
            sellerTaxCode=seller_tax,
            sellerAddress=seller_address,
            sellerPhone=seller_phone,

            # Thong tin hoa don
            invoiceCode=invoice_code,
            invoiceNumber=invoice_number,
            invoiceDate=invoice_date,
            maCQT=ma_cqt,

            # Thong tin khach hang
            customerCompany=customer_company,
            customerTaxCode=customer_tax,
            customerAddress=customer_address,
            customerName=customer_name,
            customerPhone=customer_phone,
            customerIdNumber=customer_id,
            paymentMethod=payment_method,

            # San pham va tong tien
            items=items,
            subtotal=subtotal,
            totalInWords=total_words
        )

        result = asdict(invoice)

        # Debug: In ra ket qua
        print("\n" + "=" * 60)
        print("EXTRACTED DATA:")
        print("=" * 60)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print("=" * 60 + "\n")

        return result


class PDFHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_error_response(400, "No file uploaded")
                return

            body = self.rfile.read(content_length)
            content_type = self.headers.get('Content-Type', '')

            if 'multipart/form-data' in content_type:
                pdf_bytes = self.parse_multipart(body, content_type)
            elif 'application/pdf' in content_type:
                pdf_bytes = body
            else:
                self.send_error_response(400, f"Unsupported content type: {content_type}")
                return

            if not pdf_bytes:
                self.send_error_response(400, "Could not extract PDF from request")
                return

            invoice_data = extract_invoice_data(pdf_bytes)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {'success': True, 'data': invoice_data}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            self.send_error_response(500, str(e))

    def parse_multipart(self, body: bytes, content_type: str) -> Optional[bytes]:
        boundary_match = re.search(r'boundary=(.+)', content_type)
        if not boundary_match:
            return None

        boundary = boundary_match.group(1).encode()
        if boundary.startswith(b'"') and boundary.endswith(b'"'):
            boundary = boundary[1:-1]

        parts = body.split(b'--' + boundary)

        for part in parts:
            if b'filename=' in part and (b'application/pdf' in part or b'.pdf' in part.lower()):
                header_end = part.find(b'\r\n\r\n')
                if header_end == -1:
                    header_end = part.find(b'\n\n')
                    if header_end != -1:
                        return part[header_end + 2:].rstrip(b'\r\n--')
                else:
                    return part[header_end + 4:].rstrip(b'\r\n--')

        return None

    def send_error_response(self, status: int, message: str):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        response = {'success': False, 'error': message}
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

    def log_message(self, format, *args):
        print(f"[PDF Server] {format%args}")


def run_server(port=3000):
    server = HTTPServer(('0.0.0.0', port), PDFHandler)
    print(f"=" * 50)
    print(f"PDF Extract Server running at http://localhost:{port}")
    print(f"Endpoint: POST /api/extract-invoice")
    print(f"=" * 50)
    print("Press Ctrl+C to stop\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        server.shutdown()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    run_server(port)
