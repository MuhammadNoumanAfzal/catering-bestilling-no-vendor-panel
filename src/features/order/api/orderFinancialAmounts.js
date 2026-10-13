import { parseMoney } from "../../../utils/formatMoney.js";

export function getOrderFinancialAmounts(order, pricing = {}) {
  const read = (value) => parseMoney(value);
  const grandTotal = read(pricing.grandTotal ?? order.finalPrice ?? order.grandTotal);
  const addOnsTotal = read(pricing.addOnsTotal ?? order.addOnsTotal);
  const deliveryFee = read(pricing.deliveryFee ?? order.deliveryFee);
  const tipAmount = read(pricing.tipAmount ?? order.tipAmount);
  const serviceFee = read(pricing.serviceFee);
  const discountAmount = read(pricing.discountAmount);
  return {
    grandTotal, addOnsTotal, deliveryFee, tipAmount, serviceFee, discountAmount,
    baseSubtotal: pricing.subtotal != null ? read(pricing.subtotal) :
      grandTotal - addOnsTotal - deliveryFee - tipAmount - serviceFee + discountAmount,
    taxAmount: read(pricing.taxAmount ?? order.taxAmount),
  };
}
