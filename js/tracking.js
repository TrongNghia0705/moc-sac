/**
 * MỘC SẮC - KHUNG TRANH TIỂU CẢNH
 * Order Tracking Module: Live Status Query from Google Sheets & LocalStorage
 */

const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyd4hlyGx6K_QZ6QALSEdbillWNr8v1qfVgTjN8_hUnRkH4vIEc6erEW21DO0_swWW2/exec';
const ZALO_CONTACT_URL = 'https://zalo.me/0372342970';

export function initTracking() {
  const form = document.getElementById('tracking-form');
  const input = document.getElementById('tracking-phone-input');
  const submitBtn = document.getElementById('tracking-submit-btn');
  const errorMsg = document.getElementById('tracking-error-msg');
  const resultContainer = document.getElementById('tracking-result-container');

  if (!form || !input) return;

  function setLoading(isLoading) {
    if (!submitBtn) return;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = isLoading;
    if (btnText) btnText.style.display = isLoading ? 'none' : 'inline-block';
    if (btnSpinner) btnSpinner.style.display = isLoading ? 'inline-block' : 'none';
  }

  function showError(msg) {
    if (!errorMsg) return;
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    input.classList.add('is-invalid');
  }

  function clearError() {
    if (!errorMsg) return;
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
    input.classList.remove('is-invalid');
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }

  // Phân loại trạng thái từ chữ trên Google Sheet sang mã CSS & cấp độ Stepper
  function parseOrderStatus(statusStr) {
    const raw = (statusStr || '').toLowerCase().trim();

    if (raw.includes('hoàn tất') || raw.includes('đã giao') || raw.includes('thành công') || raw.includes('hoàn thành')) {
      return {
        code: 'completed',
        label: statusStr || 'Đã giao thành công',
        stepIndex: 4,
        progressPercent: 100
      };
    }

    if (raw.includes('hủy') || raw.includes('huy') || raw.includes('cancel')) {
      return {
        code: 'cancelled',
        label: statusStr || 'Đã hủy',
        stepIndex: 0,
        progressPercent: 0
      };
    }

    if (raw.includes('giao') || raw.includes('vận chuyển') || raw.includes('đang ship') || raw.includes('đang gửi')) {
      return {
        code: 'shipping',
        label: statusStr || 'Đang vận chuyển',
        stepIndex: 3,
        progressPercent: 75
      };
    }

    if (raw.includes('đóng gói') || raw.includes('chế tác') || raw.includes('chuẩn bị') || raw.includes('xử lý')) {
      return {
        code: 'processing',
        label: statusStr || 'Đang đóng gói & chuẩn bị',
        stepIndex: 2,
        progressPercent: 50
      };
    }

    // Mặc định: Chờ xác nhận / Đã tiếp nhận
    return {
      code: 'pending',
      label: statusStr || 'Chờ xác nhận',
      stepIndex: 1,
      progressPercent: 25
    };
  }

  // Tra cứu online từ Google Sheet Webhook (doGet)
  async function fetchOrdersFromGoogleSheet(cleanPhone) {
    if (!GOOGLE_SHEET_WEBHOOK_URL) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500); // 7.5s timeout

    try {
      const url = `${GOOGLE_SHEET_WEBHOOK_URL}?phone=${encodeURIComponent(cleanPhone)}&t=${Date.now()}`;
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('Tra cứu Google Sheets online:', err);
      return null;
    }
  }

  // Tra cứu dự phòng trong LocalStorage của máy
  function findOrdersInLocalStorage(cleanPhone) {
    try {
      const raw = localStorage.getItem('mocsac_orders');
      if (!raw) return [];
      const orders = JSON.parse(raw);
      if (!Array.isArray(orders)) return [];

      return orders.filter(item => {
        const itemPhone = (item.customerPhone || '').replace(/\D/g, '');
        return itemPhone && (itemPhone === cleanPhone || itemPhone.endsWith(cleanPhone) || cleanPhone.endsWith(itemPhone));
      });
    } catch (e) {
      return [];
    }
  }

  // Render các đơn hàng tìm thấy ra giao diện
  function renderOrderResults(orders, cleanPhone, isFromLocalStorage = false) {
    if (!resultContainer) return;

    if (!orders || orders.length === 0) {
      resultContainer.style.display = 'block';
      resultContainer.innerHTML = `
        <div class="tracking-empty-card">
          <div class="tracking-empty-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          <h3 class="tracking-empty-title">Không Tìm Thấy Đơn Hàng</h3>
          <p class="tracking-empty-desc">
            Không có đơn hàng nào khớp với số điện thoại <strong>${cleanPhone}</strong>. Vui lòng kiểm tra lại số điện thoại hoặc liên hệ với Mộc Sắc qua Zalo để chúng tôi kiểm tra hỗ trợ bạn ngay.
          </p>
          <div style="margin-top: 8px;">
            <a href="${ZALO_CONTACT_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 10px 22px;">
              Nhắn Tin Zalo Hỗ Trợ
            </a>
          </div>
        </div>
      `;
      return;
    }

    resultContainer.style.display = 'block';

    const cardsHtml = orders.map((order, idx) => {
      const orderId = order.orderId || ('MS' + (Date.now() - idx * 1000).toString().slice(-6));
      const orderTime = order.timestamp || 'Mới đặt gần đây';
      const customerName = order.customerName || 'Khách hàng';
      const customerPhone = order.customerPhone || cleanPhone;
      const customerAddress = order.customerAddress || 'Đang cập nhật';
      const productModel = order.productModel || 'Khung tranh Mộc Sắc';
      const quantity = order.quantity || 1;
      const totalAmount = typeof order.totalAmount === 'number' ? formatCurrency(order.totalAmount) : (order.totalAmount || '150.000đ');
      const paymentMethod = order.paymentMethod || 'Thanh toán COD khi nhận';
      const note = order.customerNote || order.note || 'Không có';

      const statusInfo = parseOrderStatus(order.orderStatus);

      // Trạng thái các bước trên Stepper
      const step1Class = statusInfo.stepIndex >= 1 ? (statusInfo.stepIndex === 1 ? 'is-active' : 'is-done') : '';
      const step2Class = statusInfo.stepIndex >= 2 ? (statusInfo.stepIndex === 2 ? 'is-active' : 'is-done') : '';
      const step3Class = statusInfo.stepIndex >= 3 ? (statusInfo.stepIndex === 3 ? 'is-active' : 'is-done') : '';
      const step4Class = statusInfo.stepIndex >= 4 ? (statusInfo.stepIndex === 4 ? 'is-active' : 'is-done') : '';

      return `
        <article class="order-tracking-card" id="tracking-card-${orderId}">
          <div class="order-tracking-header">
            <div>
              <span class="order-code-badge">MÃ ĐƠN HÀNG: #${orderId}</span>
              <h3 class="order-tracking-title">${productModel}</h3>
              <span class="order-tracking-time">Thời gian đặt: ${orderTime}</span>
            </div>
            <div>
              <span class="order-status-pill status-${statusInfo.code}">
                <span class="status-dot"></span>
                <span>${statusInfo.label}</span>
              </span>
            </div>
          </div>

          <!-- Stepper Tiến Độ Trực Quan -->
          <div class="order-stepper" aria-label="Tiến độ đơn hàng">
            <div class="stepper-progress-track">
              <div class="stepper-progress-fill" style="width: ${statusInfo.progressPercent}%;"></div>
            </div>

            <!-- Bước 1 -->
            <div class="stepper-step ${step1Class}">
              <div class="stepper-icon-circle">
                <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              </div>
              <span class="stepper-title">Đã Tiếp Nhận</span>
            </div>

            <!-- Bước 2 -->
            <div class="stepper-step ${step2Class}">
              <div class="stepper-icon-circle">
                <svg viewBox="0 0 24 24"><path d="M20 8h-3V4H7v4H4c-1.1 0-2 .9-2 2v10h20V10c0-1.1-.9-2-2-2zM9 6h6v2H9V6zm11 12H4v-6h16v6z"/></svg>
              </div>
              <span class="stepper-title">Đóng Gói &amp; Kiểm Tra</span>
            </div>

            <!-- Bước 3 -->
            <div class="stepper-step ${step3Class}">
              <div class="stepper-icon-circle">
                <svg viewBox="0 0 24 24"><path d="M20 8h-3V4H1v13h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
              </div>
              <span class="stepper-title">Đang Vận Chuyển</span>
            </div>

            <!-- Bước 4 -->
            <div class="stepper-step ${step4Class}">
              <div class="stepper-icon-circle">
                <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <span class="stepper-title">Giao Thành Công</span>
            </div>
          </div>

          <!-- Bảng Chi Tiết Đơn Hàng -->
          <div class="order-details-table">
            <div class="detail-item">
              <span class="detail-label">Người nhận hàng</span>
              <span class="detail-value">${customerName}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Số điện thoại</span>
              <span class="detail-value">${customerPhone}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Số lượng &amp; Tác phẩm</span>
              <span class="detail-value">${productModel} (x${quantity})</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Tổng thanh toán</span>
              <span class="detail-value" style="color: var(--color-accent); font-weight: 700;">${totalAmount}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Hình thức thanh toán</span>
              <span class="detail-value">${paymentMethod}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Vận chuyển</span>
              <span class="detail-value" style="color: var(--color-success); font-weight: 600;">Miễn phí toàn quốc</span>
            </div>
            <div class="detail-item detail-item-full">
              <span class="detail-label">Địa chỉ giao hàng</span>
              <span class="detail-value">${customerAddress}</span>
            </div>
            ${note && note !== 'Không có' ? `
              <div class="detail-item detail-item-full">
                <span class="detail-label">Ghi chú lời nhắn</span>
                <span class="detail-value" style="font-style: italic;">"${note}"</span>
              </div>
            ` : ''}
          </div>

          <!-- Hành động hỗ trợ -->
          <div class="tracking-footer-actions">
            <a href="${ZALO_CONTACT_URL}" target="_blank" rel="noopener noreferrer" class="tracking-zalo-btn">
              <svg viewBox="0 0 24 24" class="tracking-zalo-icon" aria-hidden="true">
                <path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.8 1.5 5.28 3.84 6.84l-.84 3.08c-.1.38.27.71.63.56l3.52-1.46c.92.27 1.88.42 2.85.42 5.52 0 10-3.92 10-8.75S17.52 2 12 2z"/>
              </svg>
              <span>Cần hỗ trợ về đơn hàng? Nhắn tin Zalo ngay</span>
              <span class="tracking-zalo-arrow">&rarr;</span>
            </a>
          </div>
        </article>
      `;
    }).join('');

    resultContainer.innerHTML = cardsHtml;

    // Cuộn mượt tới kết quả
    setTimeout(() => {
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  // Submit form handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const rawVal = input.value.trim();
    const cleanPhone = rawVal.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 11) {
      showError('Vui lòng nhập số điện thoại hợp lệ (9 đến 11 chữ số).');
      input.focus();
      return;
    }

    setLoading(true);

    try {
      // 1. Thử gọi trực tiếp Google Sheets Webhook
      const remoteResult = await fetchOrdersFromGoogleSheet(cleanPhone);

      if (remoteResult && remoteResult.status === 'success' && Array.isArray(remoteResult.orders) && remoteResult.orders.length > 0) {
        renderOrderResults(remoteResult.orders, cleanPhone, false);
      } else {
        // 2. Dự phòng: Kiểm tra LocalStorage nếu Google Sheets chưa deploy doGet hoặc chưa có mạng
        const localOrders = findOrdersInLocalStorage(cleanPhone);
        if (localOrders && localOrders.length > 0) {
          renderOrderResults(localOrders, cleanPhone, true);
        } else {
          renderOrderResults([], cleanPhone, false);
        }
      }
    } catch (err) {
      // Nếu có lỗi, fallback sang local
      const localOrders = findOrdersInLocalStorage(cleanPhone);
      renderOrderResults(localOrders, cleanPhone, true);
    } finally {
      setLoading(false);
    }
  });

  input.addEventListener('input', () => {
    if (input.classList.contains('is-invalid')) {
      clearError();
    }
  });
}
