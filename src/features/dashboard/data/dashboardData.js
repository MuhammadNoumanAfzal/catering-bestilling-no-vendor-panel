export const overviewStats = [
  {
    label: "Total Orders",
    value: "45",
    helper: "2 vs yesterday",
    icon: "calendar",
    helperTone: "is-positive",
  },
  {
    label: "Upcoming (Next 4 hrs)",
    value: "5",
    helper: "Next at 10:30 AM",
    icon: "clipboard",
  },
  {
    label: "Urgent Orders",
    value: "07",
    helper: "Require attention",
    icon: "alert",
  },
  {
    label: "Capacity Utilization",
    value: "85%",
    helper: "High - plan your schedule",
    icon: "gauge",
    variant: "capacity",
    progress: 85,
  },
];

export const urgentOrders = [
  {
    id: "#12549",
    title: "Corporate Lunch",
    amount: "$1,840.00",
    statusLabel: "Delivery in 1h 20m",
    guests: "48 guests",
    timing: "10:30 PM - 11:30 PM",
    address: "1221 Avenue of the Americas, New York, NY 10020",
    tone: "is-danger",
  },
  {
    id: "#12550",
    title: "Office event",
    amount: "$969.00",
    statusLabel: "Delayed by 15 min",
    guests: "48 guests",
    timing: "10:30 PM - 11:30 PM",
    address: "1221 Avenue of the Americas, New York, NY 10020",
    tone: "is-warning",
  },
];

export const quickActions = [
  {
    label: "Add new menu items",
    icon: "plus",
  },
  {
    label: "View Pending Orders",
    icon: "calendar",
  },
  {
    label: "Update Availability",
    icon: "alert",
  },
];

export const kitchenStatus = [
  { value: "3", label: "Preparing", sublabel: "Orders", tone: "is-blue", icon: "chef" },
  { value: "2", label: "Ready", sublabel: "Orders", tone: "is-green", icon: "check" },
  { value: "4", label: "Out for Delivery", sublabel: "Orders", tone: "is-amber", icon: "delivery" },
];

export const chartValues = [
  { month: "Mon", value: 30 },
  { month: "Tue", value: 62 },
  { month: "Wed", value: 50 },
  { month: "Thu", value: 104 },
  { month: "Fri", value: 88 },
  { month: "Sat", value: 84 },
  { month: "Sun", value: 62 },
];

export const reviews = [
  {
    name: "Elena Rodriguez",
    rating: "5.0",
    time: "2 hours ago",
    summary:
      "The corporate lunch was spectacular! The grilled salmon was perfectly seasoned and arrived hot.",
    id: "#ORD-1245",
  },
  {
    name: "Elena Rodriguez",
    rating: "5.0",
    time: "2 hours ago",
    summary:
      "The corporate lunch was spectacular! The grilled salmon was perfectly seasoned and arrived hot.",
    id: "#ORD-1245",
  },
  {
    name: "Elena Rodriguez",
    rating: "5.0",
    time: "2 hours ago",
    summary:
      "The corporate lunch was spectacular! The grilled salmon was perfectly seasoned and arrived hot.",
    id: "#ORD-1245",
  },
];
