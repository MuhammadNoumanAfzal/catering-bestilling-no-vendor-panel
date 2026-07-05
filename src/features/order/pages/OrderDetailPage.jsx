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
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
  showVendorErrorAlert,
} from "../../../utils/vendorAlerts";

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

      const result = await confirmOrderStatusAction(action.label, orderDetail.id);
      if (!result.isConfirmed) {
        return;
      }

      const nextStatus = getStatusFromActionLabel(action.label);
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
