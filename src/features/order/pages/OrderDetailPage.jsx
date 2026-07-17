import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmedLifecyclePanel from "../components/order-details/ConfirmedLifecyclePanel";
import CustomerInfoPanel from "../components/order-details/CustomerInfoPanel";
import FinancialSummaryPanel from "../components/order-details/FinancialSummaryPanel";
import LifecyclePanel from "../components/order-details/LifecyclePanel";
import LogisticsPanel from "../components/order-details/LogisticsPanel";
import OrderItemsPanel from "../components/order-details/OrderItemsPanel";
import { getVendorOrderDetail, updateVendorOrderStatus } from "../api/orderApi";
import {
  getStatusMutationValue,
  mapVendorOrderDetail,
  normalizeBackendStatus,
} from "../api/orderMappers";
import { clearPendingAdjustment } from "../utils/pendingAdjustments";
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";
import { getEarlyDeliveryBlockMessage } from "../utils/orderSchedule";

function getStatusFromActionLabel(label) {
  return normalizeBackendStatus(label);
}

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const decodedOrderId = useMemo(() => decodeURIComponent(orderId || ""), [orderId]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadOrderDetail() {
      setIsLoading(true);

      try {
        const result = await getVendorOrderDetail(decodedOrderId);
        if (isCancelled) {
          return;
        }

        setOrderDetail(mapVendorOrderDetail(result, decodedOrderId));
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error instanceof Error ? error.message : "Unable to load the order details.",
          );
          setOrderDetail(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    if (decodedOrderId) {
      loadOrderDetail();
    }

    return () => {
      isCancelled = true;
    };
  }, [decodedOrderId]);

  async function refreshOrderDetail() {
    const result = await getVendorOrderDetail(decodedOrderId);
    setOrderDetail(mapVendorOrderDetail(result, decodedOrderId));
  }

  async function updateOrderStatus(nextStatus, message) {
    await updateVendorOrderStatus({
      id: decodedOrderId,
      status: getStatusMutationValue(nextStatus),
      note: "",
    });

    if (nextStatus !== "Modified") {
      clearPendingAdjustment(decodedOrderId);
    }

    await refreshOrderDetail();
    await showOrderStatusUpdated(message);
  }

  if (isLoading) {
    return (
      <section className="flex min-h-[360px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#cf6e38] border-t-transparent" />
      </section>
    );
  }

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

  const isAcceptedView = orderDetail.status !== "New";
  const lifecycleActions = isAcceptedView ? [] : orderDetail.actions;
  const confirmedLifecycleActions = isAcceptedView
    ? orderDetail.actions.filter((action) => action.label !== "View Details")
    : [];
  const latestAdjustment = Array.isArray(orderDetail.adjustments) ? orderDetail.adjustments[0] : null;

  async function handleLifecycleActionClick(action) {
    try {
      if (/accept/i.test(action.label)) {
        const result = await confirmOrderStatusAction("Accept order", orderDetail.id);
        if (!result.isConfirmed) {
          return;
        }

        await updateOrderStatus("Accepted", `Order ${orderDetail.id} accepted.`);
        return;
      }

      if (/reject/i.test(action.label)) {
        const result = await confirmOrderStatusAction("Reject order", orderDetail.id);
        if (!result.isConfirmed) {
          return;
        }

        await updateOrderStatus("Canceled", `Order ${orderDetail.id} rejected.`);
        navigate("/orders");
      }
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error ? error.message : "Unable to update the order right now.",
      );
    }
  }

  async function handleConfirmedActionClick(action) {
    try {
      if (action?.requestAdjustment || /request changes/i.test(action?.label || "")) {
        navigate(`/orders/${encodeURIComponent(decodedOrderId)}/adjust`);
        return;
      }

      const nextStatus = getStatusFromActionLabel(action.label);
      if (nextStatus === "Delivered") {
        const blockedMessage = getEarlyDeliveryBlockMessage(orderDetail);
        if (blockedMessage) {
          await showVendorErrorAlert(blockedMessage, "Delivery not available yet");
          return;
        }
      }

      const result = await confirmOrderStatusAction(action.label, orderDetail.id);
      if (!result.isConfirmed) {
        return;
      }

      await updateOrderStatus(
        nextStatus,
        `${orderDetail.id} updated to ${action.label.toLowerCase()}.`,
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error ? error.message : "Unable to update the order right now.",
      );
    }
  }

  async function handleManualStatusSelect(nextStatus) {
    try {
      if (nextStatus === "Delivered") {
        const blockedMessage = getEarlyDeliveryBlockMessage(orderDetail);
        if (blockedMessage) {
          await showVendorErrorAlert(blockedMessage, "Delivery not available yet");
          return;
        }
      }

      await updateOrderStatus(
        nextStatus,
        `${orderDetail.id} updated to ${nextStatus.toLowerCase()}.`,
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error ? error.message : "Unable to update the order right now.",
      );
    }
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
            {orderDetail.date} | {orderDetail.time}
          </p>
        </div>
      </header>

      {latestAdjustment ? (
        <div className="rounded-[14px] border border-[#f8d9c4] bg-[linear-gradient(180deg,#fff8f3_0%,#fffdfb_100%)] p-4 shadow-[0_6px_18px_rgba(42,27,18,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#cf6e38]">
                Adjustment Pending
              </p>
              <h2 className="m-0 text-[18px] font-extrabold text-[#1c1510]">
                Customer-facing change request has been submitted for this order.
              </h2>
              <p className="m-0 text-[13px] font-semibold text-[#7a6d63]">
                The original order stays visible until the adjustment is accepted and applied.
              </p>
            </div>
            <div className="rounded-full bg-[#fff1e8] px-3 py-1 text-[12px] font-extrabold text-[#cf6e38]">
              {latestAdjustment.status || "PENDING"}
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-[10px] border border-[#efe6de] bg-white p-3">
              <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                Removed Items
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-[1.5] text-[#2b231e]">
                {latestAdjustment.removedItemNames?.length
                  ? latestAdjustment.removedItemNames.join(", ")
                  : "No item removals proposed."}
              </p>
            </div>
            <div className="rounded-[10px] border border-[#efe6de] bg-white p-3">
              <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                Added Items
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-[1.5] text-[#2b231e]">
                {latestAdjustment.addedItemNames?.length
                  ? latestAdjustment.addedItemNames.join(", ")
                  : "No replacement items proposed."}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {latestAdjustment.proposedEventDate ? (
              <div className="rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#2b231e]">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                  Proposed Date
                </span>
                {latestAdjustment.proposedEventDate}
              </div>
            ) : null}
            {latestAdjustment.proposedDeliveryWindowStart ? (
              <div className="rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#2b231e]">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                  Proposed Time
                </span>
                {latestAdjustment.proposedDeliveryWindowStart}
              </div>
            ) : null}
            {latestAdjustment.proposedGuestCount ? (
              <div className="rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#2b231e]">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                  Proposed Guests
                </span>
                {latestAdjustment.proposedGuestCount}
              </div>
            ) : null}
          </div>

          {typeof latestAdjustment.oldTotal === "number" || typeof latestAdjustment.newTotal === "number" ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#2b231e]">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                  Current Total
                </span>
                kr {Number(latestAdjustment.oldTotal || 0).toFixed(2)}
              </div>
              <div className="rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#cf6e38]">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                  Proposed Total
                </span>
                kr {Number(latestAdjustment.newTotal || 0).toFixed(2)}
              </div>
            </div>
          ) : null}

          {latestAdjustment.vendorNote ? (
            <div className="mt-3 rounded-[10px] border border-[#efe6de] bg-white p-3">
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                Vendor Note
              </span>
              <p className="mt-2 whitespace-pre-line text-[13px] font-semibold leading-[1.6] text-[#2b231e]">
                {latestAdjustment.vendorNote}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(260px,0.95fr)] gap-3 max-[1180px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <CustomerInfoPanel customer={orderDetail.customer} orderId={orderDetail.rawId} />
          <OrderItemsPanel
            addOns={orderDetail.addOns}
            note={orderDetail.note}
            order={orderDetail}
            orderId={decodedOrderId}
            orderItem={orderDetail.orderItem}
          />
          <LogisticsPanel logistics={orderDetail.logistics} />
        </div>

        <aside className="flex flex-col gap-3">
          {isAcceptedView ? (
            <ConfirmedLifecyclePanel
              actions={confirmedLifecycleActions}
              currentStatus={orderDetail.status}
              onActionClick={handleConfirmedActionClick}
              onOrderAdjustmentClick={() =>
                navigate(`/orders/${encodeURIComponent(decodedOrderId)}/adjust`)
              }
              onStatusSelect={handleManualStatusSelect}
            />
          ) : (
            <LifecyclePanel
              actions={lifecycleActions}
              onActionClick={handleLifecycleActionClick}
              onOrderAdjustmentClick={() =>
                navigate(`/orders/${encodeURIComponent(decodedOrderId)}/adjust`)
              }
            />
          )}
          <FinancialSummaryPanel summary={orderDetail.financialSummary} />
        </aside>
      </div>
    </section>
  );
}
