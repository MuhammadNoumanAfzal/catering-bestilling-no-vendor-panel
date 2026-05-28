import DeliveryActionsBar from "../components/DeliveryActionsBar";
import DeliveryAddSlotModal from "../components/DeliveryAddSlotModal";
import DeliveryLimitsSection from "../components/DeliveryLimitsSection";
import DeliveryModeSection from "../components/DeliveryModeSection";
import DeliveryPostalCodesSection from "../components/DeliveryPostalCodesSection";
import DeliveryPricingSection from "../components/DeliveryPricingSection";
import DeliveryScheduleSection from "../components/DeliveryScheduleSection";
import DeliveryValidationAside from "../components/DeliveryValidationAside";
import { deliveryDays, deliveryModes } from "../data/deliveryData";
import useDeliverySettings from "../hooks/useDeliverySettings";

export default function DeliveryPage() {
  const {
    activeDays,
    baseFee,
    customSlotDraft,
    filteredPostalCodes,
    freeDelivery,
    handleCancelChanges,
    handleCloseAddSlotModal,
    handleOpenAddSlotModal,
    handleRemovePostalCode,
    handleRemoveTimeSlot,
    handleSaveChanges,
    handleSaveCustomSlot,
    handleToggleDay,
    handleToggleMode,
    hasUnsavedChanges,
    isAddSlotModalOpen,
    isPickupOnly,
    maxDistance,
    maxOrders,
    postalCode,
    saveMessage,
    selectedModes,
    setBaseFee,
    setCustomSlotDraft,
    setFreeDelivery,
    setMaxDistance,
    setMaxOrders,
    setPostalCode,
    timeSlots,
  } = useDeliverySettings();

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col max-[720px]:px-4 max-[720px]:py-4">
      <header className="mb-5">
        <h1 className="type-h2 m-0 text-[#15110f]">Delivery Settings</h1>
        <p className="type-para mt-1">
          Configure how your orders are delivered to customers.
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(128px,0.82fr)] gap-4 max-[1120px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <DeliveryModeSection
            modes={deliveryModes}
            onToggleMode={handleToggleMode}
            selectedModes={selectedModes}
          />

          <DeliveryPostalCodesSection
            disabled={isPickupOnly}
            filteredPostalCodes={filteredPostalCodes}
            onPostalCodeChange={(event) => setPostalCode(event.target.value)}
            onRemovePostalCode={handleRemovePostalCode}
            postalCode={postalCode}
          />

          <DeliveryPricingSection
            baseFee={baseFee}
            disabled={isPickupOnly}
            freeDelivery={freeDelivery}
            onBaseFeeChange={(event) => setBaseFee(event.target.value)}
            onFreeDeliveryChange={(event) => setFreeDelivery(event.target.value)}
          />

          <DeliveryScheduleSection
            activeDays={activeDays}
            days={deliveryDays}
            disabled={isPickupOnly}
            onAddCustomSlot={handleOpenAddSlotModal}
            onRemoveTimeSlot={handleRemoveTimeSlot}
            onToggleDay={handleToggleDay}
            timeSlots={timeSlots}
          />

          <DeliveryLimitsSection
            disabled={isPickupOnly}
            maxDistance={maxDistance}
            maxOrders={maxOrders}
            onMaxDistanceChange={(event) => setMaxDistance(event.target.value)}
            onMaxOrdersChange={(event) => setMaxOrders(event.target.value)}
          />
        </div>

        <DeliveryValidationAside pickupOnly={isPickupOnly} />
      </div>

      <DeliveryActionsBar
        hasUnsavedChanges={hasUnsavedChanges}
        onCancel={handleCancelChanges}
        onSave={handleSaveChanges}
        saveMessage={saveMessage}
      />

      {isAddSlotModalOpen ? (
        <DeliveryAddSlotModal
          draftSlot={customSlotDraft}
          onClose={handleCloseAddSlotModal}
          onDraftChange={setCustomSlotDraft}
          onSave={handleSaveCustomSlot}
        />
      ) : null}
    </section>
  );
}
