import i18n from "../../../i18n";

const tr = (key) => escapeHtml(i18n.t(`orders.print.${key}`));

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

function formatServiceType(value) {
  if (!value || /unavailable|^delivery$/i.test(String(value))) return i18n.t("orders.print.delivery");
  return /^(pickup|pick up|collection)$/i.test(value) ? i18n.t("orders.print.pickup") : value;
}

function translateSummaryLabel(label) {
  const key = { "delivery fee": "deliveryFee", "sales tax": "salesTax", "add-ons": "addOns", tip: "tip", "service fee": "serviceFee", discount: "discount", "customer responsibility": "customerResponsibility", "company responsibility": "companyResponsibility", total: "total" }[String(label || "").toLowerCase()];
  if (key) return i18n.t("orders.detail." + key);
  return String(label || "").replace(/^Subtotal/i, i18n.t("orders.detail.subtotal")).replace(/guests/i, i18n.t("orders.guests"));
}

function buildSummaryRows(financials, order, raw) {
  const rows = Array.isArray(financials) ? financials : [];
  const totalRow = rows.find((item) => `${item?.label ?? ""}`.trim().toLowerCase() === "total");
  const detailRows = rows.filter(
    (item) => `${item?.label ?? ""}`.trim().toLowerCase() !== "total",
  );
  const totalAmount =
    totalRow?.value ||
    order?.total ||
    money(raw?.pricing?.grandTotal ?? raw?.finalPrice ?? raw?.amount?.total ?? 0);

  return [
    ...detailRows.map(
      (item) => `<tr><td>${escapeHtml(translateSummaryLabel(item?.label))}</td><td>${escapeHtml(item?.value)}</td></tr>`,
    ),
    `<tr class="total-row"><td>${tr("totalAmount")}</td><td>${escapeHtml(totalAmount)}</td></tr>`,
  ].join("");
}

export function printVendorOrder(order) {
  const raw = order?.raw || {};
  const items = Array.isArray(raw.items) ? raw.items : [];
  const customer = order?.customer || {};
  const logistics = order?.logistics || {};
  const serviceType = formatServiceType(logistics.serviceType);

  const itemRows = items.length
    ? items
        .map((item) => {
          const options = Object.entries(item?.selectedOptions || {})
            .map(([label, value]) => `${escapeHtml(label)}: ${escapeHtml(value)}`)
            .join("<br />");
          const note = item?.specialInstructions
            ? `<br /><small class="kitchen-note"><strong>${tr("kitchenNote")}</strong> ${escapeHtml(item.specialInstructions)}</small>`
            : "";

          return `<tr><td><strong>${escapeHtml(item?.productName || item?.name || i18n.t("orders.print.item"))}</strong>${options ? `<br /><small>${options}</small>` : ""}${note}</td><td>${escapeHtml(item?.quantity || 1)}</td><td>${money(item?.lineTotal ?? item?.price ?? 0)}</td></tr>`;
        })
        .join("")
    : `<tr><td colspan="3">${tr("noItems")}</td></tr>`;

  const preparationDetails = items
    .map((item) => {
      const title = item?.productName || item?.name || i18n.t("orders.print.item");
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
        ? `<div class="included-items"><div class="detail-label">${tr("includedDishes")}</div><ul>${menuItems
            .map((menuItem) => `<li><strong>${escapeHtml(menuItem?.title || menuItem?.name || i18n.t("orders.print.item"))}</strong>${menuItem?.description ? ` - ${escapeHtml(menuItem.description)}` : ""}</li>`)
            .join("")}</ul></div>`
        : "";
      const allergenContent = allergens.length
        ? `${tr("contains")} ${escapeHtml(allergens.join(", "))}`
        : tr("noAllergens");

      return `<article class="prep-card"><div class="detail-label">${tr("orderItem")}</div><h3>${escapeHtml(title)} <span>x${escapeHtml(item?.quantity || 1)}</span></h3>${description ? `<p class="description">${escapeHtml(description)}</p>` : ""}${includedItems}<div class="allergen-box"><div class="detail-label">${tr("allergens")}</div><strong>${allergenContent}</strong></div></article>`;
    })
    .join("");

  const printWindow = window.open("", "_blank", "width=900,height=700");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="${escapeHtml(i18n.resolvedLanguage || i18n.language)}">
      <head>
        <title>${tr("kitchenOrder")} ${escapeHtml(order?.displayId || order?.id)}</title>
        <style>
          @page { size: A4 portrait; margin: 13mm; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #f4efea; color: #1f1a17; font: 13px/1.4 "Trebuchet MS", Arial, sans-serif; }
          .print-actions { display: flex; justify-content: flex-end; gap: 8px; max-width: 760px; margin: 14px auto; }
          .print-actions button { cursor: pointer; border: 1px solid #d8cbc1; border-radius: 8px; background: #fffdfa; padding: 9px 14px; color: #1f1a17; font-weight: 800; }
          .print-actions button:first-child { border-color: #d65d22; background: #d65d22; color: #fff; }
          .print-hint { max-width: 760px; margin: -6px auto 12px; color: #7f7168; font-size: 12px; text-align: right; }
          .ticket { max-width: 760px; margin: 0 auto 18px; border: 2px solid #241d18; background: #fff; }
          .header { padding: 16px 20px; background: #241d18; color: #fff; }
          .eyebrow { margin: 0 0 3px; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #f5c5a7; }
          h1 { margin: 0; font-size: 27px; line-height: 1; letter-spacing: -.03em; }
          .meta { padding: 9px 20px; background: #f7efe9; border-bottom: 1px solid #d8cbc1; color: #5f5249; font-size: 11px; }
          .content { padding: 0 20px 18px; }
          h2 { margin: 15px 0 7px; color: #9e3f16; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .box { min-height: 88px; border: 1px solid #d8cbc1; border-radius: 7px; padding: 10px; background: #fffdfa; }
          .label, .detail-label { margin-bottom: 4px; color: #9e3f16; font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
          .primary { font-size: 15px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; }
          th { padding: 7px; background: #f7efe9; color: #68564a; font-size: 10px; letter-spacing: .08em; text-align: left; text-transform: uppercase; }
          td { padding: 8px 7px; border-bottom: 1px solid #e3d8d0; vertical-align: top; }
          th:nth-child(2), td:nth-child(2) { width: 52px; text-align: center; font-weight: 800; }
          th:last-child, td:last-child { text-align: right; font-weight: 800; white-space: nowrap; }
          small { color: #6e6057; font-size: 11px; }
          .kitchen-note { color: #9e3f16; font-weight: 800; }
          .summary { margin-left: auto; max-width: 380px; }
          .summary td { padding: 6px 7px; }
          .summary .total-row td { border-top: 2px solid #241d18; border-bottom: 0; color: #9e3f16; font-size: 17px; font-weight: 900; }
          .prep-grid { display: grid; gap: 9px; }
          .prep-card { break-inside: avoid; border: 1px solid #d8cbc1; border-left: 4px solid #d65d22; border-radius: 7px; padding: 10px 12px; background: #fffdfa; }
          .prep-card h3 { margin: 0; font-size: 15px; }
          .prep-card h3 span { color: #806f64; font-size: 12px; }
          .description { margin: 5px 0 0; color: #5f5249; font-size: 11px; line-height: 1.45; }
          .included-items { margin-top: 8px; border-top: 1px solid #e8ddd5; padding-top: 7px; }
          .included-items ul { margin: 4px 0 0; padding-left: 16px; color: #4b3c33; font-size: 10.5px; line-height: 1.45; }
          .included-items li + li { margin-top: 2px; }
          .allergen-box { margin-top: 8px; border: 1px solid #f0c3a7; border-radius: 5px; padding: 7px 9px; background: #fff0e7; color: #8f3211; font-size: 10.5px; }
          .note { border-left: 4px solid #d65d22; border-radius: 4px; padding: 10px 12px; background: #fff0e7; white-space: pre-wrap; font-size: 13px; font-weight: 800; }
          .footer { margin-top: 18px; color: #806f64; font-size: 10px; text-align: center; }
          @media print {
            body { background: #fff; }
            .print-actions { display: none; }
            .ticket { border-width: 1.5px; margin: 0; max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-actions">
          <button type="button" id="print-button">${tr("print")}</button>
          <button type="button" id="close-button">${tr("close")}</button>
        </div>
        <p class="print-hint">${tr("preview")}</p>
        <main class="ticket">
          <header class="header">
            <p class="eyebrow">${tr("ticket")}</p>
            <h1>${tr("order")} ${escapeHtml(order?.displayId || order?.id)}</h1>
          </header>
          <div class="meta">${tr("printed")} ${escapeHtml(new Date().toLocaleString(i18n.language === "nb" ? "nb-NO" : "en-GB"))} | ${escapeHtml(serviceType)} | ${escapeHtml(logistics.eventDate || order?.date)} ${tr("at")} ${escapeHtml(logistics.deliveryWindow || order?.time)}</div>
          <div class="content">
            <h2>${tr("fulfilment")}</h2>
            <div class="grid">
              <section class="box"><div class="label">${tr("contact")}</div><div class="primary">${escapeHtml(customer.name)}</div>${escapeHtml(customer.phone)}<br>${escapeHtml(customer.email)}</section>
              <section class="box"><div class="label">${escapeHtml(serviceType)}</div><div class="primary">${escapeHtml(logistics.eventDate || order?.date)} | ${escapeHtml(logistics.deliveryWindow || order?.time)}</div>${escapeHtml(logistics.fullAddress || logistics.deliveryAddress)}</section>
            </div>
            <h2>${tr("items")}</h2>
            <table><thead><tr><th>${tr("options")}</th><th>${tr("qty")}</th><th>${tr("total")}</th></tr></thead><tbody>${itemRows}</tbody></table>
            <h2>${tr("summary")}</h2>
            <table class="summary"><tbody>${buildSummaryRows(order?.financialSummary, order, raw)}</tbody></table>
            ${preparationDetails ? `<h2>${tr("preparation")}</h2><section class="prep-grid">${preparationDetails}</section>` : ""}
            ${order?.note ? `<h2>${tr("instructions")}</h2><div class="note">${escapeHtml(order.note)}</div>` : ""}
            <div class="footer">${tr("footer")}</div>
          </div>
        </main>
        <script>
          document.getElementById("print-button")?.addEventListener("click", () => window.print());
          document.getElementById("close-button")?.addEventListener("click", () => window.close());
          window.addEventListener("load", () => {
            window.setTimeout(() => window.print(), 450);
          });
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
