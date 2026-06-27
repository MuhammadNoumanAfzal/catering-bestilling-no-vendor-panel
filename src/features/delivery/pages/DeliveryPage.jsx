import DeliveryActionsBar from "../components/DeliveryActionsBar";
import DeliveryAddSlotModal from "../components/DeliveryAddSlotModal";
import DeliveryLimitsSection from "../components/DeliveryLimitsSection";
import DeliveryModeSection from "../components/DeliveryModeSection";
import DeliveryPickupSection from "../components/DeliveryPickupSection";
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
    fieldErrors,
    freeDelivery,
    handleCancelChanges,
    handleCloseAddSlotModal,
    handleOpenAddSlotModal,
    handleRemoveTimeSlot,
    handleSaveChanges,
    handleSaveCustomSlot,
    handleToggleDay,
    handleToggleMode,
    hasUnsavedChanges,
    isAddSlotModalOpen,
    isDeliveryDisabled,
    isLoading,
    isPickupOnly,
    isSaving,
    isValidating,
    maxDeliveriesPerDay,
    maxOrdersPerTimeSlot,
    pickupAddress,
    pickupInstructions,
    sameFeeAllDistances,
    saveMessage,
    selectedModes,
    setBaseFee,
    setCustomSlotDraft,
    setFreeDelivery,
    setMaxDeliveriesPerDay,
    setMaxOrdersPerTimeSlot,
    setPickupAddress,
    setPickupInstructions,
    setSameFeeAllDistances,
    slotDraftError,
    timeSlots,
    validationState,
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
            errors={fieldErrors}
            modes={deliveryModes}
            onToggleMode={handleToggleMode}
            selectedModes={selectedModes}
          />

          <DeliveryPickupSection
            disabled={!selectedModes.includes("pickup")}
            errors={fieldErrors}
            onPickupAddressChange={(event) => setPickupAddress(event.target.value)}
            onPickupInstructionsChange={(event) => setPickupInstructions(event.target.value)}
            pickupAddress={pickupAddress}
            pickupInstructions={pickupInstructions}
          />

          <DeliveryPricingSection
            baseFee={baseFee}
            disabled={isDeliveryDisabled}
            errors={fieldErrors}
            freeDelivery={freeDelivery}
            onBaseFeeChange={(event) => setBaseFee(event.target.value)}
            onFreeDeliveryChange={(event) => setFreeDelivery(event.target.value)}
            onSameFeeAllDistancesChange={setSameFeeAllDistances}
            sameFeeAllDistances={sameFeeAllDistances}
          />

          <DeliveryScheduleSection
            activeDays={activeDays}
            days={deliveryDays}
            disabled={isDeliveryDisabled}
            errors={fieldErrors}
            onAddCustomSlot={handleOpenAddSlotModal}
            onRemoveTimeSlot={handleRemoveTimeSlot}
            onToggleDay={handleToggleDay}
            timeSlots={timeSlots}
          />

          <DeliveryLimitsSection
            disabled={isDeliveryDisabled}
            errors={fieldErrors}
            maxDeliveriesPerDay={maxDeliveriesPerDay}
            maxOrdersPerTimeSlot={maxOrdersPerTimeSlot}
            onMaxDeliveriesPerDayChange={(event) => setMaxDeliveriesPerDay(event.target.value)}
            onMaxOrdersPerTimeSlotChange={(event) => setMaxOrdersPerTimeSlot(event.target.value)}
          />
        </div>

        <DeliveryValidationAside
          fieldErrors={fieldErrors}
          isValidating={isValidating}
          pickupOnly={isPickupOnly}
          validation={validationState}
        />
      </div>

      <DeliveryActionsBar
        hasUnsavedChanges={hasUnsavedChanges}
        isLoading={isLoading}
        isSaving={isSaving}
        onCancel={handleCancelChanges}
        onSave={handleSaveChanges}
        saveMessage={saveMessage}
      />

      {isAddSlotModalOpen ? (
        <DeliveryAddSlotModal
          draftSlot={customSlotDraft}
          error={slotDraftError}
          onClose={handleCloseAddSlotModal}
          onDraftChange={setCustomSlotDraft}
          onSave={handleSaveCustomSlot}
        />
      ) : null}
    </section>
  );
}
