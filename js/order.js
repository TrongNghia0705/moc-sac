/**
 * MỘC SẮC - KHUNG TRANH TIỂU CẢNH
 * Order Module: Product Sync, Live Calculation, Validation, VietQR & Google Sheets
 */

const PRICES = {
  'model-1': { name: 'Mẫu 01: Góc Phố Ẩm Thực & Trà Đá Hà Nội', unitPrice: 150000 },
  'model-2': { name: 'Mẫu 02: Ký Ức Phố Hàng Đào', unitPrice: 150000 },
  'combo-both': { name: 'Bộ đôi 2 mẫu (Ẩm Thực + Phố Hàng Đào)', unitPrice: 250000 }
};

// Cấu hình tài khoản ngân hàng nhận thanh toán VietQR
const BANK_CONFIG = {
  bankId: 'MB', // MBBank (hoặc VCB, TCB, ACB, VPB, TPB,...)
  accountNo: '0988123456', // Số tài khoản ngân hàng của xưởng
  accountName: 'MOC SAC KHUNG TRANH' // Tên chủ tài khoản
};

// Cấu hình Google Sheet Webhook (Dán link Webhook Google Apps Script của bạn vào đây)
const GOOGLE_SHEET_WEBHOOK_URL = '';

export function initOrder() {
  const form = document.getElementById('order-form');
  const modelInputs = document.querySelectorAll('input[name="product_model"]');
  const qtyInput = document.getElementById('order-qty');
  const qtyMinusBtn = document.getElementById('qty-minus');
  const qtyPlusBtn = document.getElementById('qty-plus');
  const productSelectBtns = document.querySelectorAll('.product-buy-btn');

  // Input & Error elements
  const inputName = document.getElementById('customer-name');
  const inputPhone = document.getElementById('customer-phone');
  const inputAddress = document.getElementById('customer-address');
  const inputNote = document.getElementById('customer-note');

  const errorName = document.getElementById('error-name');
  const errorPhone = document.getElementById('error-phone');
  const errorAddress = document.getElementById('error-address');

  // Summary elements
  const summaryModelName = document.getElementById('summary-model-name');
  const summaryUnitPrice = document.getElementById('summary-unit-price');
  const summaryQty = document.getElementById('summary-qty');
  const summaryTotal = document.getElementById('summary-total');

  // Modal elements
  const modal = document.getElementById('order-success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDetailCustomer = document.getElementById('modal-detail-customer');
  const modalDetailPhone = document.getElementById('modal-detail-phone');
  const modalDetailProduct = document.getElementById('modal-detail-product');
  const modalDetailTotal = document.getElementById('modal-detail-total');
  const modalDetailPayment = document.getElementById('modal-detail-payment');
  const modalPaymentSection = document.getElementById('modal-payment-section');

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }

  function getSelectedModelKey() {
    const checked = document.querySelector('input[name="product_model"]:checked');
    return checked ? checked.value : 'model-1';
  }

  function getSelectedPaymentMethod() {
    const checked = document.querySelector('input[name="payment_method"]:checked');
    return checked ? checked.value : 'cod';
  }

  function updateOrderSummary() {
    const modelKey = getSelectedModelKey();
    const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : '1', 10) || 1);
    const itemData = PRICES[modelKey] || PRICES['model-1'];
    const total = itemData.unitPrice * qty;

    if (summaryModelName) summaryModelName.textContent = itemData.name;
    if (summaryUnitPrice) summaryUnitPrice.textContent = formatCurrency(itemData.unitPrice);
    if (summaryQty) summaryQty.textContent = `x ${qty}`;
    if (summaryTotal) summaryTotal.textContent = formatCurrency(total);
  }

  // Model selection listener
  modelInputs.forEach(input => {
    input.addEventListener('change', updateOrderSummary);
  });

  // Quantity stepper
  if (qtyMinusBtn && qtyInput) {
    qtyMinusBtn.addEventListener('click', () => {
      let current = parseInt(qtyInput.value, 10) || 1;
      if (current > 1) {
        qtyInput.value = current - 1;
        updateOrderSummary();
      }
    });
  }

  if (qtyPlusBtn && qtyInput) {
    qtyPlusBtn.addEventListener('click', () => {
      let current = parseInt(qtyInput.value, 10) || 1;
      if (current < 50) {
        qtyInput.value = current + 1;
        updateOrderSummary();
      }
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 50) val = 50;
      qtyInput.value = val;
      updateOrderSummary();
    });
  }

  // Hook product showcase buttons to form
  productSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetModel = btn.getAttribute('data-model');
      if (targetModel) {
        const matchingRadio = document.querySelector(`input[name="product_model"][value="${targetModel}"]`);
        if (matchingRadio) {
          matchingRadio.checked = true;
          updateOrderSummary();
        }
      }

      // Smooth scroll to order section
      const orderSection = document.getElementById('dat-hang');
      if (orderSection) {
        orderSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ===================== FORM VALIDATION LOGIC =====================
  function validateName() {
    const val = inputName.value.trim();
    if (!val) {
      showError(inputName, errorName, 'Vui lòng nhập họ và tên của bạn.');
      return false;
    }
    if (/\d/.test(val)) {
      showError(inputName, errorName, 'Họ tên không được chứa chữ số. Vui lòng chỉ nhập chữ cái.');
      return false;
    }
    // Chấp nhận chữ cái Latin và tiếng Việt có dấu, khoảng trắng
    const nameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s'.]{2,60}$/;
    if (!nameRegex.test(val)) {
      showError(inputName, errorName, 'Họ và tên không hợp lệ (không chứa ký tự đặc biệt).');
      return false;
    }
    clearError(inputName, errorName);
    return true;
  }

  function validatePhone() {
    const val = inputPhone.value.trim().replace(/\s+/g, '');
    if (!val) {
      showError(inputPhone, errorPhone, 'Vui lòng nhập số điện thoại liên hệ.');
      return false;
    }
    if (/[a-zA-Z]/.test(val)) {
      showError(inputPhone, errorPhone, 'Số điện thoại chỉ được chứa số, không được chứa chữ cái.');
      return false;
    }
    // Số điện thoại Việt Nam chuẩn: 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09
    const phoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!phoneRegex.test(val)) {
      showError(inputPhone, errorPhone, 'Số điện thoại không hợp lệ (cần đúng 10 số, ví dụ: 0912345678).');
      return false;
    }
    clearError(inputPhone, errorPhone);
    return true;
  }

  function validateAddress() {
    const val = inputAddress.value.trim();
    if (!val) {
      showError(inputAddress, errorAddress, 'Vui lòng nhập địa chỉ nhận hàng.');
      return false;
    }
    if (val.length < 6) {
      showError(inputAddress, errorAddress, 'Địa chỉ quá ngắn. Vui lòng ghi rõ số nhà, đường, phường/xã, quận/huyện.');
      return false;
    }
    clearError(inputAddress, errorAddress);
    return true;
  }

  function showError(inputEl, errorEl, msg) {
    if (inputEl) inputEl.classList.add('is-invalid');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function clearError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('is-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  // Real-time input validation listeners
  if (inputName) {
    inputName.addEventListener('blur', validateName);
    inputName.addEventListener('input', () => {
      if (inputName.classList.contains('is-invalid')) validateName();
    });
  }

  if (inputPhone) {
    inputPhone.addEventListener('blur', validatePhone);
    inputPhone.addEventListener('input', () => {
      if (inputPhone.classList.contains('is-invalid')) validatePhone();
    });
  }

  if (inputAddress) {
    inputAddress.addEventListener('blur', validateAddress);
    inputAddress.addEventListener('input', () => {
      if (inputAddress.classList.contains('is-invalid')) validateAddress();
    });
  }

  // ===================== AUTO-EXPAND LOGIC (Nở 2-3 dòng) =====================
  function setupAutoExpand(el) {
    if (!el) return null;
    const adjust = () => {
      el.style.height = 'auto';
      const maxH = 105; // Khoảng 3-4 dòng
      const scrollH = el.scrollHeight;
      if (scrollH > maxH) {
        el.style.height = maxH + 'px';
        el.style.overflowY = 'auto';
      } else {
        el.style.height = Math.max(48, scrollH) + 'px';
        el.style.overflowY = 'hidden';
      }
    };
    el.addEventListener('input', adjust);
    adjust();
    return adjust;
  }

  const resetAddressHeight = setupAutoExpand(inputAddress);
  const resetNoteHeight = setupAutoExpand(inputNote);

  // ===================== GOOGLE SHEETS SYNC =====================
  async function sendOrderToGoogleSheets(orderData) {
    // Luôn lưu đơn hàng dự phòng vào localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('mocsac_orders') || '[]');
      existing.push(orderData);
      localStorage.setItem('mocsac_orders', JSON.stringify(existing));
    } catch (e) {
      console.warn('Lưu localStorage:', e);
    }

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      console.info('Google Sheet Webhook URL chưa được cài đặt. Đơn hàng được lưu tại LocalStorage.');
      return;
    }

    try {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      console.info('Đã gửi thông tin đơn hàng tới Google Sheets thành công!');
    } catch (err) {
      console.error('Không thể gửi đơn hàng tới Google Sheets:', err);
    }
  }

  // ===================== FORM SUBMISSION =====================
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateName();
      const isPhoneValid = validatePhone();
      const isAddressValid = validateAddress();

      if (!isNameValid || !isPhoneValid || !isAddressValid) {
        // Focus vào ô lỗi đầu tiên
        if (!isNameValid) inputName.focus();
        else if (!isPhoneValid) inputPhone.focus();
        else if (!isAddressValid) inputAddress.focus();
        return;
      }

      const customerName = inputName.value.trim();
      const customerPhone = inputPhone.value.trim().replace(/\s+/g, '');
      const customerAddress = inputAddress.value.trim();
      const customerNote = inputNote ? inputNote.value.trim() : '';

      const modelKey = getSelectedModelKey();
      const paymentMethod = getSelectedPaymentMethod();
      const qty = parseInt(qtyInput?.value || '1', 10);
      const itemData = PRICES[modelKey] || PRICES['model-1'];
      const totalAmount = itemData.unitPrice * qty;

      const orderData = {
        orderId: 'MS' + Date.now().toString().slice(-6),
        timestamp: new Date().toLocaleString('vi-VN'),
        customerName,
        customerPhone,
        customerAddress,
        customerNote,
        productModel: itemData.name,
        quantity: qty,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Thanh toán khi nhận hàng (COD)'
      };

      // Gửi đơn về Google Sheets
      sendOrderToGoogleSheets(orderData);

      // Điền thông tin vào Modal
      if (modalDetailCustomer) modalDetailCustomer.textContent = customerName;
      if (modalDetailPhone) modalDetailPhone.textContent = customerPhone;
      if (modalDetailProduct) modalDetailProduct.textContent = `${itemData.name} (x${qty})`;
      if (modalDetailTotal) modalDetailTotal.textContent = formatCurrency(totalAmount);
      if (modalDetailPayment) {
        modalDetailPayment.textContent = paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Thanh toán COD khi nhận';
      }

      // Hiển thị phần VietQR nếu khách chọn chuyển khoản
      if (modalPaymentSection) {
        if (paymentMethod === 'vietqr') {
          const transferMemo = `MOCSAC ${customerPhone}`;
          const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transferMemo)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;

          modalPaymentSection.style.display = 'block';
          modalPaymentSection.innerHTML = `
            <h4 class="modal-payment-title">Quét Mã VietQR Để Thanh Toán</h4>
            <img class="modal-qr-img" src="${qrUrl}" alt="Mã VietQR thanh toán Mộc Sắc">
            <div class="modal-bank-info">
              <div class="bank-info-row">
                <span>Ngân hàng:</span>
                <span class="bank-info-val">${BANK_CONFIG.bankId}</span>
              </div>
              <div class="bank-info-row">
                <span>Số tài khoản:</span>
                <span class="bank-info-val">
                  <strong>${BANK_CONFIG.accountNo}</strong>
                  <button type="button" class="btn-copy" id="btn-copy-stk" data-copy="${BANK_CONFIG.accountNo}">Sao chép</button>
                </span>
              </div>
              <div class="bank-info-row">
                <span>Chủ tài khoản:</span>
                <span class="bank-info-val">${BANK_CONFIG.accountName}</span>
              </div>
              <div class="bank-info-row">
                <span>Nội dung chuyển:</span>
                <span class="bank-info-val">
                  <strong>${transferMemo}</strong>
                  <button type="button" class="btn-copy" id="btn-copy-memo" data-copy="${transferMemo}">Sao chép</button>
                </span>
              </div>
            </div>
            <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-top: 10px; font-style: italic;">
              Xưởng sẽ kiểm tra giao dịch và gọi điện thông báo cho bạn ngay khi nhận được thanh toán.
            </p>
          `;

          // Xử lý nút sao chép
          setTimeout(() => {
            document.querySelectorAll('.btn-copy').forEach(btn => {
              btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-copy');
                if (text) {
                  navigator.clipboard.writeText(text).then(() => {
                    const original = btn.textContent;
                    btn.textContent = 'Đã chép!';
                    setTimeout(() => btn.textContent = original, 1800);
                  });
                }
              });
            });
          }, 50);

        } else {
          modalPaymentSection.style.display = 'none';
        }
      }

      // Mở modal
      if (modal) {
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      }

      // Reset form
      form.reset();
      resetAddressHeight?.();
      resetNoteHeight?.();
      const defaultRadio = document.querySelector('input[name="product_model"][value="model-1"]');
      if (defaultRadio) defaultRadio.checked = true;
      const defaultPayment = document.querySelector('input[name="payment_method"][value="cod"]');
      if (defaultPayment) defaultPayment.checked = true;
      if (qtyInput) qtyInput.value = '1';
      updateOrderSummary();
    });
  }

  // Đóng modal
  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  }

  // Khởi tạo tính toán ban đầu
  updateOrderSummary();
}
