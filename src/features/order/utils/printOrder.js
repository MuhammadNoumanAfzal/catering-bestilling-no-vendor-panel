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
        const note = item?.specialInstructions
          ? `<br /><small class="kitchen-note"><strong>Kitchen note:</strong> ${escapeHtml(item.specialInstructions)}</small>`
          : "";

        return `<tr><td><strong>${escapeHtml(item?.productName || item?.name || "Item")}</strong>${options ? `<br /><small>${options}</small>` : ""}${note}</td><td>${escapeHtml(item?.quantity || 1)}</td><td>${money(item?.lineTotal ?? item?.price ?? 0)}</td></tr>`;
      }).join("")
    : `<tr><td colspan="3">No item details returned.</td></tr>`;
  const preparationDetails = items
    .map((item) => {
      const title = item?.productName || item?.name || "Item";
      const description = item?.description || item?.product?.description || "";
      const menuItems = Array.isArray(item?.product?.menuItems) ? item.product.menuItems : [];
      const itemAllergens = Array.isArray(item?.allergens)
        ? item.allergens.map((allergen) => allergen?.name || allergen?.slug || allergen).filter(Boolean)
        : [];
      const menuItemAllergens = menuItems.flatMap((menuItem) =>
        Array.isArray(menuItem?.allergens)
          ? menuItem.allergens.map((allergen) => allergen?.name || allergen?.slug).filter(Boolean)
          : [],
      );
      const allergens = [...new Set([...itemAllergens, ...menuItemAllergens])];
      const includedItems = menuItems.length
        ? `<div class="included-items"><div class="detail-label">Included dishes</div><ul>${menuItems
            .map((menuItem) => `<li><strong>${escapeHtml(menuItem?.title || menuItem?.name || "Item")}</strong>${menuItem?.description ? ` - ${escapeHtml(menuItem.description)}` : ""}</li>`)
            .join("")}</ul></div>`
        : "";
      const allergenContent = allergens.length
        ? `Contains: ${escapeHtml(allergens.join(", "))}`
        : "No allergen information supplied.";

      return `<article class="prep-card"><div class="detail-label">Order item</div><h3>${escapeHtml(title)} <span>x${escapeHtml(item?.quantity || 1)}</span></h3>${description ? `<p class="description">${escapeHtml(description)}</p>` : ""}${includedItems}<div class="allergen-box"><div class="detail-label">Allergen information</div><strong>${allergenContent}</strong></div></article>`;
    })
    .join("");
  const summaryRows = financials.map((item) => `<tr><td>${escapeHtml(item?.label)}</td><td>${escapeHtml(item?.value)}</td></tr>`).join("");
  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Kitchen Order ${escapeHtml(order?.displayId || order?.id)}</title>
        <style>
          @page { size: A4 portrait; margin: 13mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #1f1a17; font: 14px/1.45 "Trebuchet MS", Arial, sans-serif; }
          .ticket { border: 2px solid #241d18; }
          .header { display: flex; justify-content: space-between; gap: 18px; padding: 18px 20px; background: #241d18; color: #fff; }
          .eyebrow { margin: 0 0 3px; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #f5c5a7; }
          h1 { margin: 0; font-size: 28px; line-height: 1; letter-spacing: -.03em; }
          .status { align-self: flex-start; border: 1px solid #f0ae86; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
          .meta { padding: 10px 20px; background: #f7efe9; border-bottom: 1px solid #d8cbc1; color: #5f5249; font-size: 11px; }
          .content { padding: 0 20px 20px; }
          h2 { margin: 20px 0 9px; color: #9e3f16; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .box { min-height: 105px; border: 1px solid #d8cbc1; border-radius: 7px; padding: 12px; background: #fffdfa; }
          .label { margin-bottom: 6px; color: #8c7668; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
          .primary { font-size: 16px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 8px 7px; background: #f7efe9; color: #68564a; font-size: 10px; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
          td { padding: 11px 7px; border-bottom: 1px solid #e3d8d0; vertical-align: top; }
          th:nth-child(2), td:nth-child(2) { width: 52px; text-align: center; font-weight: 800; }
          th:last-child, td:last-child { text-align: right; font-weight: 800; white-space: nowrap; }
          small { color: #6e6057; font-size: 11px; }
          .kitchen-note { color: #9e3f16; font-weight: 800; }
          .prep-grid { display: grid; gap: 12px; }
          .prep-card { border: 1px solid #d8cbc1; border-left: 4px solid #d65d22; border-radius: 7px; padding: 12px 14px; background: #fffdfa; }
          .detail-label { margin-bottom: 4px; color: #9e3f16; font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
          .prep-card h3 { margin: 0; font-size: 16px; }
          .prep-card h3 span { color: #806f64; font-size: 12px; }
          .description { margin: 6px 0 0; color: #5f5249; font-size: 12px; line-height: 1.5; }
          .included-items { margin-top: 10px; border-top: 1px solid #e8ddd5; padding-top: 9px; }
          .included-items ul { margin: 4px 0 0; padding-left: 17px; color: #4b3c33; font-size: 11px; line-height: 1.55; }
          .included-items li + li { margin-top: 3px; }
          .allergen-box { margin-top: 10px; border: 1px solid #f0c3a7; border-radius: 5px; padding: 8px 10px; background: #fff0e7; color: #8f3211; font-size: 11px; }
          .allergen-box .detail-label { color: #a33d16; }
          .note { border-left: 5px solid #d65d22; border-radius: 4px; padding: 12px 14px; background: #fff0e7; white-space: pre-wrap; font-size: 15px; font-weight: 800; }
          .summary { margin-left: auto; max-width: 330px; }
          .summary td { padding: 7px; }
          .summary tr:last-child td { border-top: 2px solid #241d18; border-bottom: 0; color: #9e3f16; font-size: 17px; font-weight: 900; }
          .footer { margin-top: 22px; color: #806f64; font-size: 10px; text-align: center; }
          @media print { .ticket { border-width: 1.5px; } }
        </style>
      </head>
      <body>
        <main class="ticket">
          <header class="header">
            <div><p class="eyebrow">GoCatering Kitchen Ticket</p><h1>Order ${escapeHtml(order?.displayId || order?.id)}</h1></div>
            <div class="status">${escapeHtml(order?.status || "New")}</div>
          </header>
          <div class="meta">Printed ${escapeHtml(new Date().toLocaleString())} | ${escapeHtml(logistics.serviceType || "Delivery")} | ${escapeHtml(logistics.eventDate || order?.date)} at ${escapeHtml(logistics.deliveryWindow || order?.time)}</div>
          <div class="content">
            <h2>Customer & Fulfilment</h2>
            <div class="grid"><section class="box"><div class="label">Customer contact</div><div class="primary">${escapeHtml(customer.name)}</div>${escapeHtml(customer.phone)}<br>${escapeHtml(customer.email)}</section><section class="box"><div class="label">${escapeHtml(logistics.serviceType || "Delivery")}</div><div class="primary">${escapeHtml(logistics.eventDate || order?.date)} · ${escapeHtml(logistics.deliveryWindow || order?.time)}</div>${escapeHtml(logistics.fullAddress || logistics.deliveryAddress)}</section></div>
            <h2>Order Items</h2><table><thead><tr><th>Order item / selected options</th><th>Qty</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table>
            ${preparationDetails ? `<h2>Preparation Details &amp; Allergens</h2><section class="prep-grid">${preparationDetails}</section>` : ""}
            ${order?.note ? `<h2>Special Instructions</h2><div class="note">${escapeHtml(order.note)}</div>` : ""}
            <h2>Payment & Total</h2><table class="summary"><tbody>${summaryRows || `<tr><td>Payment status</td><td>${escapeHtml(raw.paymentStatus || raw.status || order?.status)}</td></tr>`}</tbody></table>
            <div class="footer">Keep this ticket with the order until it is completed.</div>
          </div>
        </main>
        <script>window.onload=()=>window.print();<\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
