import { useMemo, useState } from "react";
import { financeOrders } from "../data/financeData";

const PAGE_SIZE = 10;

function parseFinanceDate(dateText) {
  return new Date(dateText);
}

function formatDateLabel(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export default function useFinancePageState() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedDateOption, setSelectedDateOption] = useState("latest");
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedCustomRange, setAppliedCustomRange] = useState(null);

  const filteredOrders = useMemo(() => {
    const latestOrderDate = financeOrders.reduce((latest, order) => {
      const orderDate = parseFinanceDate(order[3]);
      return orderDate > latest ? orderDate : latest;
    }, parseFinanceDate(financeOrders[0][3]));

    return financeOrders.filter((order) => {
      const orderStatus = order[7];
      const orderDate = parseFinanceDate(order[3]);

      const matchesStatus =
        activeStatus === "All" || orderStatus === activeStatus;

      let matchesDate = true;

      if (selectedDateOption === "lastMonth") {
        const threshold = new Date(latestOrderDate);
        threshold.setMonth(threshold.getMonth() - 1);
        matchesDate = orderDate >= threshold;
      } else if (selectedDateOption === "last3Months") {
        const threshold = new Date(latestOrderDate);
        threshold.setMonth(threshold.getMonth() - 3);
        matchesDate = orderDate >= threshold;
      } else if (selectedDateOption === "last6Months") {
        const threshold = new Date(latestOrderDate);
        threshold.setMonth(threshold.getMonth() - 6);
        matchesDate = orderDate >= threshold;
      } else if (selectedDateOption === "thisYear") {
        matchesDate = orderDate.getFullYear() === latestOrderDate.getFullYear();
      } else if (
        selectedDateOption === "custom" &&
        appliedCustomRange?.from &&
        appliedCustomRange?.to
      ) {
        const fromDate = new Date(appliedCustomRange.from);
        const toDate = new Date(appliedCustomRange.to);
        toDate.setHours(23, 59, 59, 999);
        matchesDate = orderDate >= fromDate && orderDate <= toDate;
      }

      return matchesStatus && matchesDate;
    });
  }, [activeStatus, appliedCustomRange, selectedDateOption]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredOrders]);

  const dateButtonLabel =
    selectedDateOption === "custom" &&
    appliedCustomRange?.from &&
    appliedCustomRange?.to
      ? `From: ${formatDateLabel(appliedCustomRange.from)} To: ${formatDateLabel(appliedCustomRange.to)}`
      : selectedDateOption === "lastMonth"
        ? "Last Month"
        : selectedDateOption === "last3Months"
          ? "Last 3 Months"
          : selectedDateOption === "last6Months"
            ? "Last 6 Months"
            : selectedDateOption === "thisYear"
              ? "This Year"
              : selectedDateOption === "custom"
                ? "Custom Date"
                : "Latest";

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setCurrentPage(nextPage);
  }

  function handleStatusChange(nextStatus) {
    setActiveStatus(nextStatus);
    setCurrentPage(1);
  }

  function handleToggleDateMenu() {
    setIsDateMenuOpen((current) => !current);
  }

  function handleSelectDateOption(optionId) {
    setSelectedDateOption(optionId);
    setCurrentPage(1);

    if (optionId === "custom") {
      setIsCustomDateOpen(true);
      setIsDateMenuOpen(true);
      return;
    }

    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);
    setAppliedCustomRange(null);
  }

  function handleApplyCustomDate() {
    if (!customFrom || !customTo) {
      return;
    }

    setAppliedCustomRange({
      from: customFrom,
      to: customTo,
    });
    setSelectedDateOption("custom");
    setIsDateMenuOpen(false);
    setIsCustomDateOpen(false);
    setCurrentPage(1);
  }

  return {
    activeStatus,
    customFrom,
    customTo,
    dateButtonLabel,
    filteredOrders,
    handleApplyCustomDate,
    handlePageChange,
    handleSelectDateOption,
    handleStatusChange,
    handleToggleDateMenu,
    isCustomDateOpen,
    isDateMenuOpen,
    onCustomFromChange: setCustomFrom,
    onCustomToChange: setCustomTo,
    paginatedOrders,
    pageSize: PAGE_SIZE,
    totalPages,
    currentPage,
  };
}
