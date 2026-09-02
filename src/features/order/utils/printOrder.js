function escapeHtml(value) {
  return String(value ?? "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? `kr ${amount.toFixed(2)}` : escapeHtml(value);
}

export function printVendorOrder(order) {
  const raw = order?.raw || {};
  const items = Array.isArray(raw.items) ? raw.items : [];
  const financials = Array.isArray(order?.financialSummary) ? order.financialSummary : [];
  const customer = order?.customer || {};
  const logistics = order?.logistics || {};
  const itemRows = items.length
    ? items.map((item) => {
        const options = Object.entries(item?.selectedOptions || {})
          .map(([label, value]) => `${escapeHtml(label)}: ${escapeHtml(value)}`)
          .join("<br />");
        return `<tr><td><strong>${escapeHtml(item?.productName || item?.name || "Item")}</strong>${options ? `<br /><small>${options}</small>` : ""}${item?.specialInstructions ? `<br /><small><strong>Note:</strong> ${escapeHtml(item.specialInstructions)}</small>` : ""}</td><td>${escapeHtml(item?.quantity || 1)}</td><td>${money(item?.lineTotal ?? item?.price ?? 0)}</td></tr>`;
      }).join("")
    : `<tr><td colspan="3">No item details returned.</td></tr>`;
  const summaryRows = financials.map((item) => `<tr><td>${escapeHtml(item?.label)}</td><td>${escapeHtml(item?.value)}</td></tr>`).join("");
  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`<!doctype html><html><head><title>Kitchen Order ${escapeHtml(order?.displayId || order?.id)}</title><style>body{font:14px Arial,sans-serif;color:#17120e;margin:28px}h1{margin:0 0 4px}h2{margin:26px 0 8px;border-bottom:2px solid #17120e;padding-bottom:5px;font-size:17px}.meta{color:#62584f;margin-bottom:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.box{border:1px solid #bdb4ad;padding:10px}.label{font-size:11px;font-weight:bold;text-transform:uppercase;color:#665b53}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #d8d0ca;padding:9px 5px;text-align:left;vertical-align:top}th:last-child,td:last-child{text-align:right}small{color:#5f554d}.note{white-space:pre-wrap;background:#fff5df;border:1px solid #e5bd65;padding:12px;font-weight:bold}@media print{body{margin:12mm}}</style></head><body><h1>Kitchen Order ${escapeHtml(order?.displayId || order?.id)}</h1><div class="meta">Print time: ${escapeHtml(new Date().toLocaleString())} | Order status: <strong>${escapeHtml(order?.status)}</strong></div><div class="grid"><div class="box"><div class="label">Customer</div><strong>${escapeHtml(customer.name)}</strong><br>${escapeHtml(customer.phone)}<br>${escapeHtml(customer.email)}</div><div class="box"><div class="label">Fulfilment</div><strong>${escapeHtml(logistics.serviceType || "Delivery")}</strong><br>${escapeHtml(logistics.eventDate || order?.date)} at ${escapeHtml(logistics.deliveryWindow || order?.time)}<br>${escapeHtml(logistics.fullAddress || logistics.deliveryAddress)}</div></div><h2>Items</h2><table><thead><tr><th>Item / options</th><th>Qty</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table>${order?.note ? `<h2>Special Notes</h2><div class="note">${escapeHtml(order.note)}</div>` : ""}<h2>Payment & Total</h2><table><tbody>${summaryRows || `<tr><td>Payment status</td><td>${escapeHtml(raw.paymentStatus || raw.status || order?.status)}</td></tr>`}</tbody></table><script>window.onload=()=>window.print();<\/script></body></html>`);
  printWindow.document.close();
}
