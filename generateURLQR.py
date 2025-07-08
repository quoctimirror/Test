import qrcode
import os

# Đường dẫn tuyệt đối đến thư mục public của React
public_path = os.path.join("public", "ar_try_on_rings_qr.png")

# URL đích
url = "https://b8d74ae25ea9.ngrok-free.app"

# Tạo mã QR
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)

# Tạo hình ảnh từ QR
img = qr.make_image(fill_color="black", back_color="white")

# Lưu vào thư mục public của React
img.save(public_path)

print("✅ Mã QR đã được tạo thành công!")
print(f"📁 File lưu tại: {public_path}")
print(f"🔗 Khi quét mã QR, sẽ mở URL: {url}")
