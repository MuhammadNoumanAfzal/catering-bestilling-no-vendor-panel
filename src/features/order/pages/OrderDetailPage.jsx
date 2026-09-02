import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import Swal from "sweetalert2";
import ConfirmedLifecyclePanel from "../components/order-details/ConfirmedLifecyclePanel";
import CustomerInfoPanel from "../components/order-details/CustomerInfoPanel";
import FinancialSummaryPanel from "../components/order-details/FinancialSummaryPanel";
import LifecyclePanel from "../components/order-details/LifecyclePanel";
import LogisticsPanel from "../components/order-details/LogisticsPanel";
import OrderItemsPanel from "../components/order-details/OrderItemsPanel";
import { printVendorOrder } from "../utils/printOrder";
import {
  approveOrderModificationRequest,
  getVendorOrderDetail,
  getVendorOrderModificationRequests,
  rejectOrderModificationRequest,
  updateVendorOrderStatus,
} from "../api/orderApi";
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
  showVendorSuccessToast,
} from "../../../utils/vendorAlerts";

function formatRequestValue(value) {
  const normalized = `${value ?? ""}`.trim();
  return normalized || "No change";
}

function buildRequestFieldComparisons(request) {
  if (!request) {
    return [];
  }

  const currentSnapshot = request.currentSnapshot || {};
  const requestedChanges = request.requestedChanges || {};

  const fields = [
    {
      id: "eventDate",
      label: "Date",
      current: currentSnapshot.eventDate,
      requested: requestedChanges.eventDate,
    },
    {
      id: "eventTime",
      label: "Time",
      current: currentSnapshot.eventTime,
      requested: requestedChanges.eventTime,
    },
    {
      id: "personCount",
      label: "Guests",
      current: currentSnapshot.personCount,
      requested: requestedChanges.personCount,
    },
    {
      id: "deliveryAddress",
      label: "Address",
      current: currentSnapshot.deliveryAddress,
      requested: requestedChanges.deliveryAddress,
    },
    {
      id: "deliverySuite",
      label: "Suite / Floor",
      current: currentSnapshot.deliverySuite,
      requested: requestedChanges.deliverySuite,
    },
    {
      id: "deliveryCity",
      label: "City",
      current: currentSnapshot.deliveryCity,
      requested: requestedChanges.deliveryCity,
    },
    {
      id: "deliveryPostalCode",
      label: "Postal Code",
      current: currentSnapshot.deliveryPostalCode,
      requested: requestedChanges.deliveryPostalCode,
    },
    {
      id: "orderNotes",
      label: "Notes",
      current: currentSnapshot.orderNotes,
      requested: requestedChanges.orderNotes,
    },
  ];

  return fields.filter(
    (field) => `${field.current ?? ""}`.trim() !== `${field.requested ?? ""}`.trim(),
  );
}

function getStatusFromActionLabel(label) {
  return normalizeBackendStatus(label);
}

function canAdjustOrder(status) {
  const normalizedStatus = normalizeBackendStatus(status);
  return normalizedStatus !== "Delivered" && normalizedStatus !== "Canceled";
}

function hasOpenVendorAdjustment(adjustment) {
  const normalizedStatus = `${adjustment?.status ?? ""}`.trim().toUpperCase();
  if (!normalizedStatus) {
    return false;
  }

  return !["APPROVED", "REJECTED", "DECLINED", "CANCELED", "CANCELLED", "DELIVERED"].includes(
    normalizedStatus,
  );
}

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const decodedOrderId = useMemo(() => decodeURIComponent(orderId || ""), [orderId]);
  const [orderDetail, setOrderDetail] = useState(null);
  const [modificationRequests, setModificationRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolvingRequest, setIsResolvingRequest] = useState(false);

  async function refreshOrderDetail(options = {}) {
    const { silent = false } = options;

    if (!silent) {
      setIsLoading(true);
    }

    try {
      const [detailResult, requestResults] = await Promise.all([
        getVendorOrderDetail(decodedOrderId),
        getVendorOrderModificationRequests(decodedOrderId),
      ]);

      setOrderDetail(mapVendorOrderDetail(detailResult, decodedOrderId));
      setModificationRequests(Array.isArray(requestResults) ? requestResults : []);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadOrderDetail() {
      setIsLoading(true);

      try {
        const [detailResult, requestResults] = await Promise.all([
          getVendorOrderDetail(decodedOrderId),
          getVendorOrderModificationRequests(decodedOrderId),
        ]);
        if (isCancelled) {
          return;
        }

        setOrderDetail(mapVendorOrderDetail(detailResult, decodedOrderId));
        setModificationRequests(Array.isArray(requestResults) ? requestResults : []);
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error instanceof Error ? error.message : "Unable to load the order details.",
          );
          setOrderDetail(null);
          setModificationRequests([]);
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

  useEffect(() => {
    if (!decodedOrderId) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible" || isResolvingRequest) {
        return;
      }

      refreshOrderDetail({ silent: true }).catch(() => {});
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [decodedOrderId, isResolvingRequest]);

  async function updateOrderStatus(nextStatus, message) {
    const payload = await updateVendorOrderStatus({
      id: decodedOrderId,
      status: getStatusMutationValue(nextStatus),
      note: "",
    });

    const updatedBackendStatus =
      payload?.instance?.status || payload?.order?.status || nextStatus;
    const normalizedUpdatedStatus = normalizeBackendStatus(updatedBackendStatus);

    if (normalizedUpdatedStatus === "Delivered" || normalizedUpdatedStatus === "Canceled") {
      clearPendingAdjustment(decodedOrderId);
    }

    setOrderDetail((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        status: normalizedUpdatedStatus,
        statusTone: current.statusTone,
        actions: current.availableActions?.length
          ? current.actions
          : [],
      };
    });

    await refreshOrderDetail({ silent: true });
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
  const canOpenAdjustment = canAdjustOrder(orderDetail.status);
  const lifecycleActions = isAcceptedView ? [] : orderDetail.actions;
  const confirmedLifecycleActions = isAcceptedView
    ? orderDetail.actions.filter((action) => action.label !== "View Details")
    : [];
  const pendingCustomerRequest =
    modificationRequests.find(
      (request) => `${request?.status ?? ""}`.trim().toUpperCase() === "PENDING",
    ) || null;
  const requestComparisons = buildRequestFieldComparisons(pendingCustomerRequest);
  const latestAdjustment = Array.isArray(orderDetail.adjustments) ? orderDetail.adjustments[0] : null;
  const hasPendingVendorAdjustment = hasOpenVendorAdjustment(latestAdjustment);
  const shouldShowVendorAdjustmentBanner =
    Boolean(latestAdjustment) && !pendingCustomerRequest;
  const adjustmentChangesPrice = Boolean(
    latestAdjustment &&
      (
        (Array.isArray(latestAdjustment.removedItemNames) && latestAdjustment.removedItemNames.length > 0) ||
        (Array.isArray(latestAdjustment.addedItemNames) && latestAdjustment.addedItemNames.length > 0) ||
        (latestAdjustment.proposedGuestCount &&
          Number(latestAdjustment.proposedGuestCount) !== Number(orderDetail?.guests || 0))
      ),
  );

  async function handleOpenAdjustmentPage() {
    if (pendingCustomerRequest) {
      await showVendorErrorAlert(
        "A customer modification request is already pending for this order. Please approve or reject it before requesting vendor-side changes.",
        "Adjustment unavailable",
      );
      return;
    }

    if (hasPendingVendorAdjustment) {
      await showVendorErrorAlert(
        "A vendor adjustment is already pending for this order. Please wait for the customer to respond before creating another one.",
        "Adjustment already pending",
      );
      return;
    }

    navigate(`/orders/${encodeURIComponent(decodedOrderId)}/adjust`);
  }

  async function handleApproveModificationRequest() {
    if (!pendingCustomerRequest?.id) {
      return;
    }

    const confirmation = await confirmOrderStatusAction(
      "Approve modification request",
      orderDetail.displayId || orderDetail.id,
    );
    if (!confirmation.isConfirmed) {
      return;
    }

    setIsResolvingRequest(true);

    try {
      const payload = await approveOrderModificationRequest({
        requestId: pendingCustomerRequest.id,
        note: "Vendor approved the customer modification request.",
      });
      await refreshOrderDetail();
      await showVendorSuccessToast(
        payload.message || "Customer modification request approved.",
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error
          ? error.message
          : "Unable to approve the modification request.",
      );
    } finally {
      setIsResolvingRequest(false);
    }
  }

  async function handleRejectModificationRequest() {
    if (!pendingCustomerRequest?.id) {
      return;
    }

    const response = await Swal.fire({
      title: "Reject modification request?",
      text: "Tell the customer why you cannot accept these changes.",
      input: "textarea",
      inputPlaceholder: "Enter rejection reason",
      inputAttributes: {
        "aria-label": "Rejection reason",
      },
      showCancelButton: true,
      confirmButtonText: "Reject request",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#cf6e38",
      cancelButtonColor: "#d7cec6",
      background: "#fffaf6",
      color: "#201b17",
      inputValidator: (value) => {
        if (!`${value ?? ""}`.trim()) {
          return "A rejection reason is required.";
        }

        return undefined;
      },
    });

    if (!response.isConfirmed) {
      return;
    }

    setIsResolvingRequest(true);

    try {
      const payload = await rejectOrderModificationRequest({
        requestId: pendingCustomerRequest.id,
        reason: `${response.value ?? ""}`.trim(),
      });
      await refreshOrderDetail();
      await showVendorSuccessToast(
        payload.message || "Customer modification request rejected.",
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error
          ? error.message
          : "Unable to reject the modification request.",
      );
    } finally {
      setIsResolvingRequest(false);
    }
  }

  async function handleLifecycleActionClick(action) {
    try {
      if (/accept/i.test(action.label)) {
        const result = await confirmOrderStatusAction("Accept order", orderDetail.displayId || orderDetail.id);
        if (!result.isConfirmed) {
          return;
        }

        await updateOrderStatus("Accepted", `Order ${orderDetail.displayId || orderDetail.id} accepted.`);
        return;
      }

      if (/reject/i.test(action.label)) {
        const result = await confirmOrderStatusAction("Reject order", orderDetail.displayId || orderDetail.id);
        if (!result.isConfirmed) {
          return;
        }

        await updateOrderStatus("Canceled", `Order ${orderDetail.displayId || orderDetail.id} rejected.`);
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
        await handleOpenAdjustmentPage();
        return;
      }

      const nextStatus = getStatusFromActionLabel(action.label);
      const result = await confirmOrderStatusAction(action.label, orderDetail.displayId || orderDetail.id);
      if (!result.isConfirmed) {
        return;
      }

      await updateOrderStatus(
        nextStatus,
        `${orderDetail.displayId || orderDetail.id} updated to ${action.label.toLowerCase()}.`,
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
        `${orderDetail.displayId || orderDetail.id} updated to ${nextStatus.toLowerCase()}.`,
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
            Order<span className="ml-0.5">{orderDetail.displayId || orderDetail.id}</span>
          </h1>
          <p className="m-0 text-[12px] font-semibold text-[#8a7a6d]">
            {orderDetail.date} | {orderDetail.time}
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#d8c9be] bg-white px-3 py-2 text-[12px] font-extrabold text-[#2b231e] transition hover:border-[#cf6e38] hover:text-[#cf6e38]"
            onClick={() => printVendorOrder(orderDetail)}
            type="button"
          >
            <Printer size={15} /> Print Order
          </button>
        </div>
      </header>

      {shouldShowVendorAdjustmentBanner ? (
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

          {adjustmentChangesPrice &&
          (typeof latestAdjustment.oldTotal === "number" || typeof latestAdjustment.newTotal === "number") ? (
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

      {pendingCustomerRequest ? (
        <div className="rounded-[14px] border border-[#f8d9c4] bg-[linear-gradient(180deg,#fff8f3_0%,#fffdfb_100%)] p-4 shadow-[0_6px_18px_rgba(42,27,18,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#cf6e38]">
                Customer Modification Request
              </p>
              <h2 className="m-0 text-[18px] font-extrabold text-[#1c1510]">
                The customer requested changes to this order.
              </h2>
              <p className="m-0 text-[13px] font-semibold text-[#7a6d63]">
                Review the requested changes below, then approve or reject them.
              </p>
            </div>
            <div className="rounded-full bg-[#fff1e8] px-3 py-1 text-[12px] font-extrabold text-[#cf6e38]">
              {pendingCustomerRequest.status || "PENDING"}
            </div>
          </div>

          {requestComparisons.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {requestComparisons.map((field) => (
                <div
                  key={field.id}
                  className="rounded-[10px] border border-[#efe6de] bg-white p-3"
                >
                  <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                    {field.label}
                  </p>
                  <p className="mt-2 text-[12px] font-semibold text-[#8a7a6d]">
                    Current
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[#2b231e]">
                    {formatRequestValue(field.current)}
                  </p>
                  <p className="mt-3 text-[12px] font-semibold text-[#cf6e38]">
                    Requested
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[#2b231e]">
                    {formatRequestValue(field.requested)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#2b231e]">
              The customer request is pending, but no changed fields were returned by the API.
            </div>
          )}

          {`${pendingCustomerRequest?.customerNote ?? ""}`.trim() ? (
            <div className="mt-3 rounded-[10px] border border-[#efe6de] bg-white p-3">
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                Customer Note
              </span>
              <p className="mt-2 whitespace-pre-line text-[13px] font-semibold leading-[1.6] text-[#2b231e]">
                {pendingCustomerRequest.customerNote}
              </p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={isResolvingRequest}
              onClick={handleApproveModificationRequest}
              className={`rounded-[10px] px-4 py-2.5 text-[13px] font-extrabold text-white transition ${
                isResolvingRequest
                  ? "cursor-not-allowed bg-[#d7c5b9]"
                  : "cursor-pointer bg-[#cf6e38] hover:bg-[#bb602d]"
              }`}
            >
              {isResolvingRequest ? "Updating..." : "Approve Request"}
            </button>
            <button
              type="button"
              disabled={isResolvingRequest}
              onClick={handleRejectModificationRequest}
              className={`rounded-[10px] border px-4 py-2.5 text-[13px] font-extrabold transition ${
                isResolvingRequest
                  ? "cursor-not-allowed border-[#eadfd5] bg-[#f7f2ed] text-[#9b8f84]"
                  : "cursor-pointer border-[#e7c9bb] bg-white text-[#c4551d] hover:bg-[#fff6f2]"
              }`}
            >
              Reject Request
            </button>
          </div>
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
              onOrderAdjustmentClick={
                canOpenAdjustment
                  ? handleOpenAdjustmentPage
                  : undefined
              }
              onStatusSelect={handleManualStatusSelect}
            />
          ) : (
            <LifecyclePanel
              actions={lifecycleActions}
              onActionClick={handleLifecycleActionClick}
              onOrderAdjustmentClick={
                canOpenAdjustment
                  ? handleOpenAdjustmentPage
                  : undefined
              }
            />
          )}
          <FinancialSummaryPanel summary={orderDetail.financialSummary} />
        </aside>
      </div>
    </section>
  );
}
