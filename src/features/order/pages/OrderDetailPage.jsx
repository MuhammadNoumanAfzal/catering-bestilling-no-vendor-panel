import { useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmedLifecyclePanel from "../components/order-details/ConfirmedLifecyclePanel";
import CustomerInfoPanel from "../components/order-details/CustomerInfoPanel";
import FinancialSummaryPanel from "../components/order-details/FinancialSummaryPanel";
import LifecyclePanel from "../components/order-details/LifecyclePanel";
import LogisticsPanel from "../components/order-details/LogisticsPanel";
import OrderItemsPanel from "../components/order-details/OrderItemsPanel";
import { ordersTableRows, orderDetailRecords } from "../data/orderData";
import {
  confirmOrderStatusAction,
  showOrderStatusUpdated,
} from "../../../utils/vendorAlerts";

function getStatusFromActionLabel(label) {
  const norm = label.toLowerCase();
  if (norm.includes("prepare") || norm.includes("preparing")) return "Preparing";
  if (norm.includes("ready")) return "Ready";
  if (norm.includes("delivery") || norm.includes("out for delivery")) return "Out for delivery";
  if (norm.includes("delivered") || norm.includes("mark delivered")) return "Delivered";
  if (norm.includes("cancel") || norm.includes("canceled") || norm.includes("reject")) return "Canceled";
  if (norm.includes("accept")) return "Accepted";
  return label;
}

function getActionsForStatus(status) {
  if (status === "New") {
    return [
      { label: "Accept", tone: "is-primary", navigateToDetail: true },
      { label: "Reject", tone: "is-muted" }
    ];
  }
  if (status === "Accepted") {
    return [{ label: "Start preparing", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Preparing") {
    return [{ label: "Ready", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Ready") {
    return [{ label: "Out for delivery", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Out for delivery") {
    return [{ label: "Delivered", tone: "is-primary", hasDropdown: true }];
  }
  if (status === "Modified") {
    return [{ label: "Start preparing", tone: "is-primary", hasDropdown: true }];
  }
  return [{ label: "View Details", tone: "is-muted", navigateToDetail: true }];
}

function getToneForStatus(status) {
  if (status === "New") return "is-new";
  if (status === "Accepted") return "is-accepted";
  if (status === "Preparing") return "is-preparing";
  if (status === "Ready") return "is-ready";
  if (status === "Out for delivery") return "is-delivery";
  if (status === "Delivered") return "is-delivered";
  if (status === "Canceled") return "is-canceled";
  if (status === "Reject") return "is-reject";
  if (status === "Modified") return "is-modified";
  return "is-new";
}

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [triggerVal, setTriggerVal] = useState(0);

  const orderDetail = useMemo(() => {
    // Reference triggerVal to justify dependency for recalculation
    void triggerVal;
    const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
    const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : orderDetailRecords;
    const cleanId = orderId.replace("#", "");

    if (!savedDetailsRaw) {
      window.localStorage.setItem("vendor-order-details", JSON.stringify(orderDetailRecords));
    }

    let detail = currentDetails[cleanId] ?? orderDetailRecords[cleanId];

    if (!detail) {
      const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
      const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
      const mainOrder = currentOrders.find((o) => o.id.replace("#", "") === cleanId);

      if (mainOrder) {
        detail = {
          id: mainOrder.id,
          date: mainOrder.date,
          time: mainOrder.time,
          customer: {
            name: mainOrder.customer,
            organization: `${mainOrder.customer} Ltd`,
            postalCode: "0278",
            city: "Oslo",
            email: `${mainOrder.customer.toLowerCase().replace(/[^a-z0-9]/g, "")}@catering-bestilling.no`,
            historyText: "Returning customer (2 past orders)",
            historyOrders: [
              {
                id: "ORD-1120",
                title: mainOrder.event || "Lunch buffet",
                date: "10 Jan, 2026",
                amount: `kr ${(mainOrder.guests * 42).toFixed(2)}`,
                guests: `${mainOrder.guests} GUESTS`,
                status: "DELIVERED",
                statusTone: "delivered",
              }
            ],
          },
          orderItem: {
            name: mainOrder.event || "Standard Catering Buffet",
            quantity: `Full catering package for ${mainOrder.guests} guests.`,
            description: "CORE ITEMS",
            includedItems: [
              "Freshly Roasted Seasonal Veggies (x1)",
              "Hot Protein Platters (x2)",
              "Standard Dessert Curation (x1)"
            ],
            modalDetails: {
              title: mainOrder.event || "Standard Catering Buffet",
              price: `kr ${(mainOrder.guests * 42).toFixed(2)}`,
              facts: [
                "Cuisine: Buffet",
                `Serves: ${mainOrder.guests} guests`,
              ],
              items: [
                "Includes: Main courses, sides, salads, and dessert box",
              ],
              extras: ["Delivery and table setup included"],
            },
          },
          addOns: ["Assorted Cold Beverages", "Environment Friendly Cutlery"],
          note: "Please contact event manager on arrival.",
          logistics: {
            deliveryAddress: "1221 Avenue of the Americas, Floor 42, New York, NY 10020",
            eventDate: mainOrder.date,
            deliveryWindow: mainOrder.time,
            fullAddress: "1221 Avenue of the Americas, Floor 42, New York, NY 10020",
            eventType: mainOrder.event || "Catering Event",
            serviceType: "Full Service",
          },
          status: mainOrder.status || "New",
          financialSummary: [
            { label: "Subtotal", value: `kr ${(mainOrder.guests * 42).toFixed(2)}` },
            { label: "Delivery Fee", value: "kr 30.00" },
            { label: "Platform Fee (2%)", value: `-kr ${(mainOrder.guests * 0.84).toFixed(2)}` },
            { label: "Total", value: `kr ${(mainOrder.guests * 42 + 30 - mainOrder.guests * 0.84).toFixed(2)}` },
          ],
        };

        const updatedDetails = {
          ...currentDetails,
          [cleanId]: detail,
        };
        window.localStorage.setItem("vendor-order-details", JSON.stringify(updatedDetails));
      }
    }

    if (!detail) return null;

    const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
    const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
    const mainOrder = currentOrders.find((o) => o.id.replace("#", "") === cleanId);

    const currentStatus = mainOrder ? mainOrder.status : (detail.status || "New");

    let lifecycleActions = [];
    let confirmedLifecycleActions = [];
    let isAccepted = false;
    let statusTitle = "";
    let statusSubtitle = "";

    if (currentStatus === "New") {
      isAccepted = false;
      lifecycleActions = [
        { label: "Accept Order", primary: true, navigateToAccepted: true },
        { label: "Reject Order", primary: false },
      ];
    } else {
      isAccepted = true;
      statusTitle = `Order is ${currentStatus}`;

      if (currentStatus === "Accepted") {
        statusSubtitle = "Update status to notify the customer";
        confirmedLifecycleActions = [
          { label: "Preparing", primary: true },
          { label: "Request Changes", primary: false },
        ];
      } else if (currentStatus === "Modified") {
        statusSubtitle = "Adjustments applied - ready to prepare";
        confirmedLifecycleActions = [
          { label: "Preparing", primary: true },
          { label: "Request Changes", primary: false },
        ];
      } else if (currentStatus === "Preparing") {
        statusSubtitle = "Preparing the fresh ingredients";
        confirmedLifecycleActions = [
          { label: "Ready", primary: true },
        ];
      } else if (currentStatus === "Ready") {
        statusSubtitle = "Waiting to be picked up";
        confirmedLifecycleActions = [
          { label: "Out for delivery", primary: true },
        ];
      } else if (currentStatus === "Out for delivery") {
        statusSubtitle = "On the way to the customer";
        confirmedLifecycleActions = [
          { label: "Delivered", primary: true },
        ];
      } else if (currentStatus === "Delivered") {
        statusSubtitle = "Successfully delivered to customer";
        confirmedLifecycleActions = [];
      } else {
        statusTitle = "Order Canceled";
        statusSubtitle = "This order was canceled or rejected";
        confirmedLifecycleActions = [];
      }
    }

    return {
      ...detail,
      date: mainOrder ? mainOrder.date : detail.date,
      status: currentStatus,
      isAcceptedView: isAccepted,
      lifecycleActions,
      confirmedStatus: {
        title: statusTitle,
        subtitle: statusSubtitle,
      },
      confirmedLifecycleActions,
    };
  }, [orderId, triggerVal]);

  const isAcceptedView = orderDetail?.isAcceptedView;

  function updateOrderStatus(nextStatus) {
    const savedOrdersRaw = window.localStorage.getItem("vendor-orders");
    const currentOrders = savedOrdersRaw ? JSON.parse(savedOrdersRaw) : ordersTableRows;
    const nextOrders = currentOrders.map((order) => {
      if (order.id.replace("#", "") === orderId) {
        return {
          ...order,
          status: nextStatus,
          statusTone: getToneForStatus(nextStatus),
          actions: getActionsForStatus(nextStatus),
        };
      }
      return order;
    });
    window.localStorage.setItem("vendor-orders", JSON.stringify(nextOrders));

    const savedDetailsRaw = window.localStorage.getItem("vendor-order-details");
    const currentDetails = savedDetailsRaw ? JSON.parse(savedDetailsRaw) : {};
    const cleanId = orderId.replace("#", "");
    if (currentDetails[cleanId]) {
      currentDetails[cleanId] = {
        ...currentDetails[cleanId],
        status: nextStatus,
      };
      window.localStorage.setItem("vendor-order-details", JSON.stringify(currentDetails));
    }

    setTriggerVal((prev) => prev + 1);
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

  async function handleLifecycleActionClick(action) {
    if (action.navigateToAccepted) {
      const result = await confirmOrderStatusAction("Accept order", orderDetail.id);

      if (!result.isConfirmed) {
        return;
      }

      updateOrderStatus("Accepted");
      await showOrderStatusUpdated(`Order ${orderDetail.id} accepted.`);
      return;
    }

    if (/reject/i.test(action.label)) {
      const result = await confirmOrderStatusAction("Reject order", orderDetail.id);

      if (!result.isConfirmed) {
        return;
      }

      updateOrderStatus("Canceled");
      await showOrderStatusUpdated(`Order ${orderDetail.id} rejected.`);
      navigate("/orders");
    }
  }

  async function handleConfirmedActionClick(action) {
    const result = await confirmOrderStatusAction(action.label, orderDetail.id);

    if (!result.isConfirmed) {
      return;
    }

    const nextStatus = getStatusFromActionLabel(action.label);
    updateOrderStatus(nextStatus);
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
              onOrderAdjustmentClick={() => navigate(`/orders/${orderId}/adjust`)}
              currentStatus={orderDetail.status}
              onStatusSelect={updateOrderStatus}
            />
          ) : (
            <LifecyclePanel
              actions={orderDetail.lifecycleActions}
              onActionClick={handleLifecycleActionClick}
              onOrderAdjustmentClick={() => navigate(`/orders/${orderId}/adjust`)}
            />
          )}
          <FinancialSummaryPanel summary={orderDetail.financialSummary} />
        </aside>
      </div>
    </section>
  );
}
