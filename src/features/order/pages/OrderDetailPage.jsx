import i18n from "../../../i18n";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Printer } from "lucide-react";
import Swal from "sweetalert2";
import VendorPageLoadingState from "../../../components/shared/VendorPageLoadingState";
import ConfirmedLifecyclePanel from "../components/order-details/ConfirmedLifecyclePanel";
import CustomerInfoPanel from "../components/order-details/CustomerInfoPanel";
import FinancialSummaryPanel from "../components/order-details/FinancialSummaryPanel";
import LifecyclePanel from "../components/order-details/LifecyclePanel";
import LogisticsPanel from "../components/order-details/LogisticsPanel";
import OrderItemsPanel from "../components/order-details/OrderItemsPanel";
import { printVendorOrder } from "../utils/printOrder";
import { getVendorAddOns } from "../../menu/api/menuApi";
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

function formatRequestValue(value, t) {
  const normalized = `${value ?? ""}`.trim();
  return normalized || t("orders.detail.noChange", { defaultValue: "No change" });
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
      label: i18n.t("orders.adjustment.date"),
      current: currentSnapshot.eventDate,
      requested: requestedChanges.eventDate,
    },
    {
      id: "eventTime",
      label: i18n.t("orders.adjustment.time"),
      current: currentSnapshot.eventTime,
      requested: requestedChanges.eventTime,
    },
    {
      id: "personCount",
      label: i18n.t("orders.guests"),
      current: currentSnapshot.personCount,
      requested: requestedChanges.personCount,
    },
    {
      id: "deliveryAddress",
      label: i18n.t("orders.deliveryAddress"),
      current: currentSnapshot.deliveryAddress,
      requested: requestedChanges.deliveryAddress,
    },
    {
      id: "deliverySuite",
      label: i18n.t("orders.adjustment.apartmentFloor"),
      current: currentSnapshot.deliverySuite,
      requested: requestedChanges.deliverySuite,
    },
    {
      id: "deliveryCity",
      label: i18n.t("orders.detail.city"),
      current: currentSnapshot.deliveryCity,
      requested: requestedChanges.deliveryCity,
    },
    {
      id: "deliveryPostalCode",
      label: i18n.t("orders.detail.postalCode"),
      current: currentSnapshot.deliveryPostalCode,
      requested: requestedChanges.deliveryPostalCode,
    },
    {
      id: "orderNotes",
      label: i18n.t("orders.detail.customerNote"),
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

function splitVendorAdjustmentNote(value) {
  const lines = `${value || ""}`.split("\n").filter(Boolean);
  const requestedDishChanges = [];
  const includedDishReplacements = [];
  const remainingLines = [];

  lines.forEach((line) => {
    const prefix = "Requested included-dish changes: ";
    if (line.startsWith(prefix)) {
      requestedDishChanges.push(...line.slice(prefix.length).split(", ").filter(Boolean));
      return;
    }

    const replacementPrefix = "Included dish replacements: ";
    if (line.startsWith(replacementPrefix)) {
      line
        .slice(replacementPrefix.length)
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => {
          const [previousDish, replacementDish] = item.split(" to ").map((part) => part.trim());
          includedDishReplacements.push({
            previousDish: previousDish || item,
            replacementDish: replacementDish || "Replacement dish",
          });
        });
      return;
    }
    remainingLines.push(line);
  });

  return { requestedDishChanges, includedDishReplacements, vendorNote: remainingLines.join("\n") };
}

function getAddonCatalogNodes(result) {
  const edges = result?.vendorAddOns?.edges;
  return Array.isArray(edges) ? edges.map((edge) => edge?.node).filter(Boolean) : [];
}

function enrichOrderAddOns(orderDetail, addOnCatalogResult) {
  if (!orderDetail?.addOns?.length) {
    return orderDetail;
  }

  const catalogByName = new Map(
    getAddonCatalogNodes(addOnCatalogResult).map((item) => [
      `${item?.name ?? ""}`.trim().toLowerCase(),
      item,
    ]),
  );

  return {
    ...orderDetail,
    addOns: orderDetail.addOns.map((addOn) => {
      const catalogItem = catalogByName.get(`${addOn.name ?? ""}`.trim().toLowerCase());
      const quantity = Number(addOn.quantity) || 1;
      const catalogUnitPrice = Number(catalogItem?.priceWithTax) || 0;

      return {
        ...addOn,
        description: addOn.description || catalogItem?.description || "",
        image: addOn.image || catalogItem?.coverImage?.fileUrl || "",
        totalPrice: Number(addOn.totalPrice) > 0
          ? addOn.totalPrice
          : catalogUnitPrice * quantity,
        unitPrice: Number(addOn.unitPrice) > 0 ? addOn.unitPrice : catalogUnitPrice,
      };
    }),
  };
}

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      const [detailResult, requestResults, addOnCatalogResult] = await Promise.all([
        getVendorOrderDetail(decodedOrderId),
        getVendorOrderModificationRequests(decodedOrderId),
        getVendorAddOns().catch(() => null),
      ]);

      setOrderDetail(enrichOrderAddOns(mapVendorOrderDetail(detailResult, decodedOrderId), addOnCatalogResult));
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
        const [detailResult, requestResults, addOnCatalogResult] = await Promise.all([
          getVendorOrderDetail(decodedOrderId),
          getVendorOrderModificationRequests(decodedOrderId),
          getVendorAddOns().catch(() => null),
        ]);
        if (isCancelled) {
          return;
        }

        setOrderDetail(enrichOrderAddOns(mapVendorOrderDetail(detailResult, decodedOrderId), addOnCatalogResult));
        setModificationRequests(Array.isArray(requestResults) ? requestResults : []);
      } catch (error) {
        if (!isCancelled) {
          await showVendorErrorAlert(
            error instanceof Error ? error.message : t("orders.detail.unableLoadDetails", { defaultValue: "Unable to load the order details." }),
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
    // The detail query can briefly return the pre-update value after a status mutation.
    setOrderDetail((current) => current ? { ...current, status: normalizedUpdatedStatus } : current);
    await showOrderStatusUpdated(message);
  }

  if (isLoading) {
    return <VendorPageLoadingState variant="detail" />;
  }

  if (!orderDetail) {
    return (
      <section className="flex flex-col gap-3">
        <Link className="inline-flex items-center gap-1 text-[13px] font-bold text-[#cf6e38] no-underline transition hover:underline" to="/orders">
          <ChevronLeft size={16} />
          {t("orders.backToOrders", { defaultValue: "Back to Orders" })}
        </Link>
        <div className="rounded-xl border border-[#dfd8cf] bg-white px-2 pb-2.5 pt-2 shadow-[0_2px_8px_rgba(42,27,18,0.06)]">
          <h1 className="type-h3">{t("orders.detail.orderNotFound", { defaultValue: "Order not found" })}</h1>
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
  const adjustmentNote = splitVendorAdjustmentNote(latestAdjustment?.vendorNote);
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
        t("orders.detail.customerRequestPendingBlock", { defaultValue: "A customer modification request is already pending for this order. Please approve or reject it before requesting vendor-side changes." }),
        t("orders.detail.adjustmentUnavailable", { defaultValue: "Adjustment unavailable" }),
      );
      return;
    }

    if (hasPendingVendorAdjustment) {
      await showVendorErrorAlert(
        t("orders.detail.vendorAdjustmentPendingBlock", { defaultValue: "A vendor adjustment is already pending for this order. Please wait for the customer to respond before creating another one." }),
        t("orders.detail.adjustmentAlreadyPending", { defaultValue: "Adjustment already pending" }),
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
      t("orders.detail.approveModificationRequest", { defaultValue: "Approve modification request" }),
      orderDetail.displayId || orderDetail.id,
    );
    if (!confirmation.isConfirmed) {
      return;
    }

    setIsResolvingRequest(true);

    try {
      const payload = await approveOrderModificationRequest({
        requestId: pendingCustomerRequest.id,
        note: t("orders.detail.vendorApprovedNote", { defaultValue: "Vendor approved the customer modification request." }),
      });
      await refreshOrderDetail();
      await showVendorSuccessToast(
        payload.message || t("orders.detail.customerRequestApproved", { defaultValue: "Customer modification request approved." }),
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error
          ? error.message
          : t("orders.detail.unableApproveModification", { defaultValue: "Unable to approve the modification request." }),
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
      title: t("orders.detail.rejectModificationTitle", { defaultValue: "Reject modification request?" }),
      text: t("orders.detail.rejectModificationText", { defaultValue: "Tell the customer why you cannot accept these changes." }),
      input: "textarea",
      inputPlaceholder: t("orders.detail.rejectionReasonPlaceholder", { defaultValue: "Enter rejection reason" }),
      inputAttributes: {
        "aria-label": t("orders.detail.rejectionReason", { defaultValue: "Rejection reason" }),
      },
      showCancelButton: true,
      confirmButtonText: t("orders.detail.rejectRequest", { defaultValue: "Reject request" }),
      cancelButtonText: t("orders.cancel", { defaultValue: "Cancel" }),
      confirmButtonColor: "#cf6e38",
      cancelButtonColor: "#d7cec6",
      background: "#fffaf6",
      color: "#201b17",
      inputValidator: (value) => {
        if (!`${value ?? ""}`.trim()) {
          return t("orders.detail.rejectionReasonRequired", { defaultValue: "A rejection reason is required." });
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
        payload.message || t("orders.detail.customerRequestRejected", { defaultValue: "Customer modification request rejected." }),
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error
          ? error.message
          : t("orders.detail.unableRejectModification", { defaultValue: "Unable to reject the modification request." }),
      );
    } finally {
      setIsResolvingRequest(false);
    }
  }

  async function handleLifecycleActionClick(action) {
    try {
      if (/accept/i.test(action.label)) {
        const result = await confirmOrderStatusAction(t("orders.accept", { defaultValue: "Accept order" }), orderDetail.displayId || orderDetail.id);
        if (!result.isConfirmed) {
          return;
        }

        await updateOrderStatus("Accepted", t("orders.orderAccepted", { id: orderDetail.displayId || orderDetail.id, defaultValue: `Order ${orderDetail.displayId || orderDetail.id} accepted.` }));
        return;
      }

      if (/reject/i.test(action.label)) {
        const result = await confirmOrderStatusAction(t("orders.reject", { defaultValue: "Reject order" }), orderDetail.displayId || orderDetail.id);
        if (!result.isConfirmed) {
          return;
        }

        await updateOrderStatus("Canceled", t("orders.orderRejected", { id: orderDetail.displayId || orderDetail.id, defaultValue: `Order ${orderDetail.displayId || orderDetail.id} rejected.` }));
        navigate("/orders");
      }
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error ? error.message : t("orders.unableUpdate", { defaultValue: t("orders.unableUpdate", { defaultValue: "Unable to update the order right now." }) }),
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
        t("orders.statusUpdatedToAction", { id: orderDetail.displayId || orderDetail.id, action: action.label.toLowerCase(), defaultValue: `${orderDetail.displayId || orderDetail.id} updated to ${action.label.toLowerCase()}.` }),
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error ? error.message : t("orders.unableUpdate", { defaultValue: "Unable to update the order right now." }),
      );
    }
  }

  async function handleManualStatusSelect(nextStatus) {
    try {
      await updateOrderStatus(
        nextStatus,
        t("orders.statusUpdatedToAction", { id: orderDetail.displayId || orderDetail.id, action: nextStatus.toLowerCase(), defaultValue: `${orderDetail.displayId || orderDetail.id} updated to ${nextStatus.toLowerCase()}.` }),
      );
    } catch (error) {
      await showVendorErrorAlert(
        error instanceof Error ? error.message : i18n.t("vendorMessages.updateOrderFailed"),
      );
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <header className="flex flex-col gap-1">
        <Link className="inline-flex items-center gap-1 text-[13px] font-bold text-[#cf6e38] no-underline transition hover:underline" to="/orders">
          <ChevronLeft size={16} />
          {t("orders.backToOrders", { defaultValue: "Back to Orders" })}
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="m-0 text-[34px] font-bold leading-tight tracking-[-0.04em] text-[#19130f]">
            {t("orders.detail.orderPrefix", { defaultValue: "Order" })}<span className="ml-0.5">{orderDetail.displayId || orderDetail.id}</span>
          </h1>
          <p className="m-0 text-[12px] font-semibold text-[#8a7a6d]">
            {orderDetail.date} | {orderDetail.time}
          </p>
          <button
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#d8c9be] bg-white px-3 py-2 text-[12px] font-extrabold text-[#2b231e] transition hover:border-[#cf6e38] hover:text-[#cf6e38]"
            onClick={() => printVendorOrder(orderDetail)}
            type="button"
          >
            <Printer size={15} /> {t("orders.detail.printOrder", { defaultValue: "Print Order" })}
          </button>
        </div>
      </header>

      {shouldShowVendorAdjustmentBanner ? (
        <div className="rounded-[14px] border border-[#f8d9c4] bg-[linear-gradient(180deg,#fff8f3_0%,#fffdfb_100%)] p-4 shadow-[0_6px_18px_rgba(42,27,18,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#cf6e38]">
                {t("orders.detail.adjustmentPending", { defaultValue: "Adjustment Pending" })}
              </p>
              <h2 className="m-0 text-[18px] font-extrabold text-[#1c1510]">
                {t("orders.detail.adjustmentSubmittedTitle", { defaultValue: "Customer-facing change request has been submitted for this order." })}
              </h2>
              <p className="m-0 text-[13px] font-semibold text-[#7a6d63]">
                {t("orders.detail.adjustmentSubmittedDescription", { defaultValue: "The original order stays visible until the adjustment is accepted and applied." })}
              </p>
            </div>
            <div className="rounded-full bg-[#fff1e8] px-3 py-1 text-[12px] font-extrabold text-[#cf6e38]">
              {latestAdjustment.status || "PENDING"}
            </div>
          </div>

          {adjustmentNote.includedDishReplacements.length ? (
            <div className="mt-3 rounded-[12px] border border-[#f1c7af] bg-[linear-gradient(135deg,#fff8f3_0%,#fffdfb_100%)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#c25b2c]">{t("orders.detail.includedDishReplacements", { defaultValue: "Included dish replacements" })}</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#745d50]">{t("orders.detail.includedDishReplacementsHelp", { defaultValue: "These dishes will be changed within the existing menu price." })}</p>
                </div>
                <span className="rounded-full bg-[#fff0e7] px-2.5 py-1 text-[11px] font-extrabold text-[#c25b2c]">{t("orders.detail.replacementsCount", { count: adjustmentNote.includedDishReplacements.length, defaultValue: `${adjustmentNote.includedDishReplacements.length} replacements` })}</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {adjustmentNote.includedDishReplacements.map((item, index) => (
                  <article key={`${item.previousDish}-${index}`} className="rounded-[10px] border border-[#f0dacb] bg-white p-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#a18979]">{t("orders.detail.wasIncluded", { defaultValue: "Was included" })}</p>
                    <p className="mt-1 text-[13px] font-bold leading-5 text-[#7d5542] line-through">{item.previousDish}</p>
                    <div className="my-2 h-px bg-[#f1e4da]" />
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#5d8b68]">{t("orders.detail.replaceWith", { defaultValue: "Replace with" })}</p>
                    <p className="mt-1 text-[13px] font-extrabold leading-5 text-[#243a2b]">{item.replacementDish}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : adjustmentNote.requestedDishChanges.length ? (
            <div className="mt-3 rounded-[12px] border border-[#f1c7af] bg-[linear-gradient(135deg,#fff8f3_0%,#fffdfb_100%)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#c25b2c]">{t("orders.detail.requestedDishChanges", { defaultValue: "Requested dish changes" })}</p>
                  <p className="mt-1 text-[13px] leading-5 text-[#745d50]">{t("orders.detail.requestedDishChangesHelp", { defaultValue: "The vendor has requested changes to these included dishes. No full menu item is being removed." })}</p>
                </div>
                <span className="rounded-full bg-[#fff0e7] px-2.5 py-1 text-[11px] font-extrabold text-[#c25b2c]">{t("orders.detail.selectedCount", { count: adjustmentNote.requestedDishChanges.length, defaultValue: `${adjustmentNote.requestedDishChanges.length} selected` })}</span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {adjustmentNote.requestedDishChanges.map((item) => (
                  <div key={item} className="rounded-[8px] border border-[#f0dacb] bg-white px-3 py-2 text-[13px] font-semibold text-[#3f3028]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {adjustmentChangesPrice &&
          (typeof latestAdjustment.oldTotal === "number" || typeof latestAdjustment.newTotal === "number") ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#2b231e]">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                  {t("orders.detail.currentTotal", { defaultValue: "Current Total" })}
                </span>
                kr {Number(latestAdjustment.oldTotal || 0).toFixed(2)}
              </div>
              <div className="rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#cf6e38]">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                  {t("orders.detail.proposedTotal", { defaultValue: "Proposed Total" })}
                </span>
                kr {Number(latestAdjustment.newTotal || 0).toFixed(2)}
              </div>
            </div>
          ) : null}

          {adjustmentNote.vendorNote ? (
            <div className="mt-3 rounded-[10px] border border-[#efe6de] bg-white p-3">
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                {t("orders.detail.vendorNote", { defaultValue: "Vendor Note" })}
              </span>
              <p className="mt-2 whitespace-pre-line text-[13px] font-semibold leading-[1.6] text-[#2b231e]">
                {adjustmentNote.vendorNote}
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
                {t("orders.detail.customerModificationRequest", { defaultValue: "Customer Modification Request" })}
              </p>
              <h2 className="m-0 text-[18px] font-extrabold text-[#1c1510]">
                {t("orders.detail.customerRequestedChanges", { defaultValue: "The customer requested changes to this order." })}
              </h2>
              <p className="m-0 text-[13px] font-semibold text-[#7a6d63]">
                {t("orders.detail.reviewRequestedChanges", { defaultValue: "Review the requested changes below, then approve or reject them." })}
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
                    {t("orders.detail.current", { defaultValue: "Current" })}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[#2b231e]">
                    {formatRequestValue(field.current, t)}
                  </p>
                  <p className="mt-3 text-[12px] font-semibold text-[#cf6e38]">
                    {t("orders.detail.requested", { defaultValue: "Requested" })}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[#2b231e]">
                    {formatRequestValue(field.requested, t)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[10px] border border-[#efe6de] bg-white p-3 text-[13px] font-semibold text-[#2b231e]">
              {t("orders.detail.noCustomerChanges", { defaultValue: "This customer request does not include any changes to review yet." })}
            </div>
          )}

          {`${pendingCustomerRequest?.customerNote ?? ""}`.trim() ? (
            <div className="mt-3 rounded-[10px] border border-[#efe6de] bg-white p-3">
              <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8a7a6d]">
                {t("orders.detail.customerNote", { defaultValue: "Customer Note" })}
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
              {isResolvingRequest ? t("orders.updating", { defaultValue: "Updating..." }) : t("orders.detail.approveRequest", { defaultValue: "Approve Request" })}
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
              {t("orders.detail.rejectRequest", { defaultValue: "Reject Request" })}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(260px,0.95fr)] gap-3 max-[1180px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <CustomerInfoPanel customer={orderDetail.customer} orderId={orderDetail.rawId} />
          <LogisticsPanel logistics={orderDetail.logistics} />
          <OrderItemsPanel
            addOns={orderDetail.addOns}
            note={orderDetail.note}
            order={orderDetail}
            orderId={decodedOrderId}
            orderItem={orderDetail.orderItem}
          />
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




