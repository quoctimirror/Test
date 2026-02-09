import React, { forwardRef } from "react";
import "./LuxuryInvoice.css";
import MirrorLogo from "@/assets/images/Mirror_Horizontal_Slogan_Pink.svg";

// Convert number to Vietnamese words
const numberToVietnameseWords = (num) => {
  if (num === 0) return "Không đồng";

  const ones = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];

  const readThreeDigits = (n) => {
    let result = "";
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const one = n % 10;

    if (hundred > 0) {
      result += ones[hundred] + " trăm ";
    }
    if (ten > 1) {
      result += tens[ten] + " ";
      if (one === 1) result += "mốt ";
      else if (one === 5) result += "lăm ";
      else if (one > 0) result += ones[one] + " ";
    } else if (ten === 1) {
      result += "mười ";
      if (one === 1) result += "một ";
      else if (one === 5) result += "lăm ";
      else if (one > 0) result += ones[one] + " ";
    } else if (one > 0) {
      if (hundred > 0) result += "lẻ ";
      result += ones[one] + " ";
    }
    return result.trim();
  };

  const units = ["", "nghìn", "triệu", "tỷ"];
  let result = "";
  let unitIndex = 0;

  while (num > 0) {
    const threeDigits = num % 1000;
    if (threeDigits > 0) {
      const words = readThreeDigits(threeDigits);
      result = words + " " + units[unitIndex] + " " + result;
    }
    num = Math.floor(num / 1000);
    unitIndex++;
  }

  result = result.trim();
  result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng";

  if (num % 1000 === 0) {
    result += " chẵn";
  }

  return result;
};

const LuxuryInvoice = forwardRef(({
  // Company info
  companyName = "CÔNG TY CỔ PHẦN MIRROR FUTURE DIAMOND",
  taxCode = "0318950980",
  companyAddress = "74 Nguyễn Cơ Thạch, P. An Khánh, TP. Hồ Chí Minh",

  // Invoice info
  invoiceCode = "2C25MYY",
  invoiceNumber = "Chưa cấp số",
  invoiceDate = new Date(),

  // Customer info
  customerCompany = "Khách lẻ không lấy hóa đơn",
  customerName = "Khách lẻ không lấy hóa đơn",
  customerAddress = "",
  paymentMethod = "TM / CK",

  // Items - each item can have: name, description, unit, quantity, unitPrice
  items = [],
}, ref) => {

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format currency with thousand separators
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Calculate total
  const totalAmount = items.reduce((sum, item) => {
    const price = item.unitPrice || item.price || 0;
    const qty = item.quantity || 1;
    return sum + (price * qty);
  }, 0);

  // Amount in words
  const amountInWords = numberToVietnameseWords(totalAmount);

  return (
    <div className="luxury-invoice" ref={ref}>
      {/* Header */}
      <header className="luxury-invoice__header">
        <div className="luxury-invoice__header-left">
          <div className="luxury-invoice__logo">
            <img src={MirrorLogo} alt="Mirror - Created by Science, Crafted for Eternity" className="luxury-invoice__logo-img" />
          </div>
          <div className="luxury-invoice__company">
            <h2 className="luxury-invoice__company-name">{companyName}</h2>
            <p className="luxury-invoice__company-detail">
              <span>MST: {taxCode}</span>
              <span className="luxury-invoice__separator">|</span>
              <span>{companyAddress}</span>
            </p>
          </div>
        </div>
        <div className="luxury-invoice__header-right">
          <h2 className="luxury-invoice__title">
            <span className="luxury-invoice__title-vi">HOÁ ĐƠN</span>
            <span className="luxury-invoice__title-en">/Invoice</span>
          </h2>
          <div className="luxury-invoice__meta">
            <p>
              <span className="luxury-invoice__meta-label">Ngày</span>
              <span className="luxury-invoice__meta-label-en">/Date:</span>
              <span className="luxury-invoice__meta-value">{formatDate(invoiceDate)}</span>
            </p>
            <p>
              <span className="luxury-invoice__meta-label">Ký hiệu</span>
              <span className="luxury-invoice__meta-label-en">/Ref no:</span>
              <span className="luxury-invoice__meta-value">{invoiceCode}</span>
            </p>
            <p>
              <span className="luxury-invoice__meta-label">Số</span>
              <span className="luxury-invoice__meta-label-en">/Invoice no:</span>
              <span className="luxury-invoice__meta-value">{invoiceNumber}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Customer Info */}
      <section className="luxury-invoice__customer">
        <div className="luxury-invoice__customer-row">
          <div className="luxury-invoice__customer-field">
            <span className="luxury-invoice__field-label">Người mua</span>
            <span className="luxury-invoice__field-label-en">/Issued to:</span>
            <span className="luxury-invoice__field-value">{customerName}</span>
          </div>
          <div className="luxury-invoice__customer-field">
            <span className="luxury-invoice__field-label">Hình thức tt</span>
            <span className="luxury-invoice__field-label-en">/Payment info:</span>
            <span className="luxury-invoice__field-value">{paymentMethod}</span>
          </div>
        </div>
        <div className="luxury-invoice__customer-row">
          <div className="luxury-invoice__customer-field">
            <span className="luxury-invoice__field-label">Đơn vị</span>
            <span className="luxury-invoice__field-label-en">/Recipient:</span>
            <span className="luxury-invoice__field-value">{customerCompany}</span>
          </div>
          <div className="luxury-invoice__customer-field">
            <span className="luxury-invoice__field-label">Địa chỉ</span>
            <span className="luxury-invoice__field-label-en">/Address:</span>
            <span className="luxury-invoice__field-value">{customerAddress || ""}</span>
          </div>
        </div>
      </section>

      {/* Items Table */}
      <section className="luxury-invoice__items">
        <table className="luxury-invoice__table">
          <thead>
            <tr>
              <th className="luxury-invoice__col-stt">#</th>
              <th className="luxury-invoice__col-name">
                <span className="luxury-invoice__th-vi">Tên hàng hoá, dịch vụ</span>
                <span className="luxury-invoice__th-en">/Description unit</span>
              </th>
              <th className="luxury-invoice__col-qty">
                <span className="luxury-invoice__th-vi">LS</span>
                <span className="luxury-invoice__th-en">/Qty</span>
              </th>
              <th className="luxury-invoice__col-price">
                <span className="luxury-invoice__th-vi">Đơn giá</span>
                <span className="luxury-invoice__th-en">/Rate</span>
              </th>
              <th className="luxury-invoice__col-total">
                <span className="luxury-invoice__th-vi">Thành tiền</span>
                <span className="luxury-invoice__th-en">/Amount</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const price = item.unitPrice || item.price || 0;
              const qty = item.quantity || 1;
              const itemTotal = price * qty;

              return (
                <tr key={index}>
                  <td className="luxury-invoice__col-stt">{String(index + 1).padStart(2, '0')}</td>
                  <td className="luxury-invoice__col-name">
                    <div className="luxury-invoice__item-name">{item.name}</div>
                    {item.description && (
                      <div className="luxury-invoice__item-desc">{item.description}</div>
                    )}
                  </td>
                  <td className="luxury-invoice__col-qty">{qty}</td>
                  <td className="luxury-invoice__col-price">{price ? formatCurrency(price) : "–"}</td>
                  <td className="luxury-invoice__col-total">{itemTotal ? formatCurrency(itemTotal) : "–"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Total Section */}
      <section className="luxury-invoice__total">
        <div className="luxury-invoice__total-row">
          <span className="luxury-invoice__total-label">
            <span className="luxury-invoice__total-label-vi">Cộng tiền hàng</span>
            <span className="luxury-invoice__total-label-en">/Subtotal:</span>
          </span>
          <span className="luxury-invoice__total-value">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="luxury-invoice__total-words">
          {amountInWords}
        </div>
      </section>

      {/* Footer */}
      <footer className="luxury-invoice__footer">
        <p className="luxury-invoice__footer-website">mirrorfuturediamond.com</p>
        <p className="luxury-invoice__footer-tagline">OR ALL INQUIRIES & INFORMATION</p>
      </footer>
    </div>
  );
});

LuxuryInvoice.displayName = "LuxuryInvoice";

export default LuxuryInvoice;
