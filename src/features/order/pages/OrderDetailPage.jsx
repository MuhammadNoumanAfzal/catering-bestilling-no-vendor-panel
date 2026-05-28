import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import ConfirmedLifecyclePanel from "../components/order-details/ConfirmedLifecyclePanel";
import CustomerInfoPanel from "../components/order-details/CustomerInfoPanel";
import FinancialSummaryPanel from "../components/order-details/FinancialSummaryPanel";
import LifecyclePanel from "../components/order-details/LifecyclePanel";
import LogisticsPanel from "../components/order-details/LogisticsPanel";
import OrderItemsPanel from "../components/order-details/OrderItemsPanel";
import { getOrderDetailById } from "../data/orderData";
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
} from "../../../utils/vendorAlerts";

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const orderDetail = getOrderDetailById(orderId);
  const isAcceptedView = searchParams.get("stage") === "accepted";

  if (!orderDetail) {
    return (
      <section className="flex flex-col gap-3">
        <Link className="text-[12px] font-bold text-[#5d7fc9] no-underline" to="/orders">
          &lt; Back to Orders
        </Link>
        <div className="rounded-xl border border-[#dfd8cf] bg-white px-2 pb-2.5 pt-2 shadow-[0_2px_8px_rgba(42,27,18,0.06)]">
          <h1 className="type-h3">Order not found</h1>
        </div>
      </section>
    );
  }

  async function handleLifecycleActionClick(action) {
    if (action.navigateToAccepted) {
      const result = await confirmOrderStatusAction("Accept order", orderDetail.id);

      if (!result.isConfirmed) {
        return;
      }

      await showOrderStatusUpdated(`Order ${orderDetail.id} accepted.`);
      setSearchParams({ stage: "accepted" });
      return;
    }

    if (/reject/i.test(action.label)) {
      const result = await confirmOrderStatusAction("Reject order", orderDetail.id);

      if (!result.isConfirmed) {
        return;
      }

      await showOrderStatusUpdated(`Order ${orderDetail.id} rejected.`);
      navigate("/orders");
    }
  }

  async function handleConfirmedActionClick(action) {
    const result = await confirmOrderStatusAction(action.label, orderDetail.id);

    if (!result.isConfirmed) {
      return;
    }

    await showOrderStatusUpdated(`${orderDetail.id} updated to ${action.label.toLowerCase()}.`);
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
          {isAcceptedView ? (
            <ConfirmedLifecyclePanel
              actions={orderDetail.confirmedLifecycleActions}
              onActionClick={handleConfirmedActionClick}
              statusSubtitle={orderDetail.confirmedStatus.subtitle}
              statusTitle={orderDetail.confirmedStatus.title}
            />
          ) : (
            <LifecyclePanel
              actions={orderDetail.lifecycleActions}
              onActionClick={handleLifecycleActionClick}
            />
          )}
          <FinancialSummaryPanel summary={orderDetail.financialSummary} />
        </aside>
      </div>
    </section>
  );
}
