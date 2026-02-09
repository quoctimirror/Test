import React, { useRef, useCallback, useState } from "react";
import { Printer, Plus, Trash2, FileText } from "lucide-react";
import LuxuryInvoice from "./LuxuryInvoice";
import "./InvoicePreview.css";

const InvoiceGenerator = () => {
  const invoiceRef = useRef(null);

  // Customer info state
  const [customerInfo, setCustomerInfo] = useState({
    customerCompany: "",
    customerTaxCode: "",
    customerAddress: "",
    customerName: "",
    customerPhone: "",
    paymentMethod: "TM/CK",
  });

  // Invoice items state
  const [items, setItems] = useState([
    { id: 1, name: "", unit: "cái", quantity: 1, unitPrice: 0 }
  ]);

  // Default company info
  const companyInfo = {
    companyName: "CÔNG TY CỔ PHẦN MIRROR FUTURE DIAMOND",
    taxCode: "0318950980",
    companyAddress: "74 Nguyễn Cơ Thạch, Phường An Khánh, Thành phố Hồ Chí Minh",
    companyPhone: "0903657146",
    logoUrl: "/logo-mirror.png",
  };

  // Build invoice data
  const invoiceData = {
    ...companyInfo,
    invoiceCode: `MR${Date.now().toString().slice(-6)}`,
    invoiceNumber: "<Chưa cấp số>",
    invoiceDate: new Date(),
    ...customerInfo,
    items: items.filter(item => item.name.trim() !== ""),
  };

  // Handle customer info change
  const handleCustomerChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  // Handle item change
  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) || 0 : value } : item
    ));
  };

  // Add new item
  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now(),
      name: "",
      unit: "cái",
      quantity: 1,
      unitPrice: 0
    }]);
  };

  // Remove item
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  // Native print handler
  const handlePrint = useCallback(() => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) {
      alert("Vui lòng cho phép popup để in hóa đơn");
      return;
    }

    const stylesheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules || [])
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          if (sheet.href) {
            return `@import url("${sheet.href}");`;
          }
          return "";
        }
      })
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice_${invoiceData.invoiceCode}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
          <style>
            ${stylesheets}
            @media print {
              body { margin: 0; padding: 0; }
              .luxury-invoice { box-shadow: none !important; margin: 0 !important; }
            }
            body {
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
              display: flex;
              justify-content: center;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
          <script>
            document.fonts.ready.then(() => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }, [invoiceData.invoiceCode]);

  return (
    <div className="invoice-generator-page">
      <div className="invoice-generator-header">
        <FileText size={28} />
        <h1>Tạo Hóa Đơn / Báo Giá</h1>
      </div>

      <div className="invoice-generator-content">
        {/* Left side - Form */}
        <div className="invoice-form-section">
          {/* Customer Info */}
          <div className="form-section">
            <h3>Thông tin khách hàng</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Tên khách hàng / Công ty</label>
                <input
                  type="text"
                  value={customerInfo.customerName}
                  onChange={(e) => handleCustomerChange("customerName", e.target.value)}
                  placeholder="Khách lẻ không lấy hóa đơn"
                />
              </div>
              <div className="form-group">
                <label>Mã số thuế</label>
                <input
                  type="text"
                  value={customerInfo.customerTaxCode}
                  onChange={(e) => handleCustomerChange("customerTaxCode", e.target.value)}
                  placeholder="Để trống nếu khách lẻ"
                />
              </div>
              <div className="form-group full-width">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={customerInfo.customerAddress}
                  onChange={(e) => handleCustomerChange("customerAddress", e.target.value)}
                  placeholder="Địa chỉ khách hàng"
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={customerInfo.customerPhone}
                  onChange={(e) => handleCustomerChange("customerPhone", e.target.value)}
                  placeholder="Số điện thoại"
                />
              </div>
              <div className="form-group">
                <label>Hình thức thanh toán</label>
                <select
                  value={customerInfo.paymentMethod}
                  onChange={(e) => handleCustomerChange("paymentMethod", e.target.value)}
                >
                  <option value="TM/CK">Tiền mặt / Chuyển khoản</option>
                  <option value="TM">Tiền mặt</option>
                  <option value="CK">Chuyển khoản</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="form-section">
            <div className="section-header">
              <h3>Danh sách sản phẩm</h3>
              <button className="add-item-btn" onClick={addItem}>
                <Plus size={18} />
                Thêm sản phẩm
              </button>
            </div>

            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Tên sản phẩm</th>
                    <th style={{ width: "10%" }}>ĐVT</th>
                    <th style={{ width: "10%" }}>SL</th>
                    <th style={{ width: "20%" }}>Đơn giá</th>
                    <th style={{ width: "15%" }}>Thành tiền</th>
                    <th style={{ width: "5%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                          placeholder="Nhập tên sản phẩm"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                        />
                      </td>
                      <td className="subtotal">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                      <td>
                        <button
                          className="remove-item-btn"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" style={{ textAlign: "right", fontWeight: "bold" }}>
                      TỔNG CỘNG:
                    </td>
                    <td colSpan="2" style={{ fontWeight: "bold", color: "#bc224c" }}>
                      {formatCurrency(total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Print Button */}
          <div className="form-actions">
            <button className="print-invoice-btn" onClick={handlePrint}>
              <Printer size={20} />
              In hóa đơn / Xuất PDF
            </button>
          </div>
        </div>

        {/* Right side - Preview */}
        <div className="invoice-preview-section">
          <h3>Xem trước hóa đơn</h3>
          <div className="preview-container-small">
            <div className="preview-paper-small">
              <LuxuryInvoice ref={invoiceRef} {...invoiceData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
