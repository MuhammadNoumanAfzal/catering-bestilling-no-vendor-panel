import { Link, useParams } from "react-router-dom";
import ConfirmedLifecyclePanel from "../components/order-details/ConfirmedLifecyclePanel";
import CustomerInfoPanel from "../components/order-details/CustomerInfoPanel";
import FinancialSummaryPanel from "../components/order-details/FinancialSummaryPanel";
import LogisticsPanel from "../components/order-details/LogisticsPanel";
import OrderItemsPanel from "../components/order-details/OrderItemsPanel";
import { getAcceptedOrderDetailById } from "../data/orderData";

export default function AcceptedOrderPage() {
  const { orderId } = useParams();
  const orderDetail = getAcceptedOrderDetailById(orderId);

  if (!orderDetail) {
    return (
      <section className="flex flex-col gap-3">
        <Link className="text-[12px] font-bold text-[#5d7fc9] no-underline" to="/orders">
          &lt; Back to Orders
        </Link>
        <div className="rounded-xl border border-[#dfd8cf] bg-white px-2 pb-2.5 pt-2 shadow-[0_2px_8px_rgba(42,27,18,0.06)]">
          <h1 className="type-h3">Accepted order not found</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <Link className="text-[12px] font-bold text-[#5d7fc9] no-underline" to="/orders">
          &lt; Back to Orders
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="m-0 text-[34px] font-extrabold leading-none text-[#19130f]">
            Order<span className="ml-0.5">{orderDetail.id}</span>
          </h1>
          <p className="m-0 text-[12px] font-semibold text-[#8a7a6d]">
            {orderDetail.date} • {orderDetail.time}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(260px,0.95fr)] gap-3 max-[1180px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <CustomerInfoPanel customer={orderDetail.customer} />
          <OrderItemsPanel
            addOns={orderDetail.addOns}
            note={orderDetail.note}
            orderItem={orderDetail.orderItem}
          />
          <LogisticsPanel logistics={orderDetail.logistics} />
        </div>

        <aside className="flex flex-col gap-3">
          <ConfirmedLifecyclePanel
            actions={orderDetail.confirmedLifecycleActions}
            statusSubtitle={orderDetail.confirmedStatus.subtitle}
            statusTitle={orderDetail.confirmedStatus.title}
          />
          <FinancialSummaryPanel summary={orderDetail.financialSummary} />
        </aside>
      </div>
    </section>
  );
}
