import DeliveryActionsBar from "../components/DeliveryActionsBar";
import DeliveryAddSlotModal from "../components/DeliveryAddSlotModal";
import DeliveryAreasSection from "../components/DeliveryAreasSection";
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
    customAreaDraft,
    customAreaErrors,
    customSlotDraft,
    fieldErrors,
    freeDelivery,
    handleAddServiceArea,
    handleCancelChanges,
    handleCloseAddSlotModal,
    handleCreateCustomArea,
    handleCustomAreaDraftChange,
    handleOpenAddSlotModal,
    handleRemoveTimeSlot,
    handleRemoveServiceArea,
    loadError,
    handleSaveChanges,
    handleSaveCustomSlot,
    handleServiceAreaSearchChange,
    handleToggleDay,
    handleToggleMode,
    hasUnsavedChanges,
    isAddSlotModalOpen,
    isCreatingArea,
    isDeliveryDisabled,
    isLoading,
    isPickupOnly,
    isSaving,
    isSearchingAreas,
    isValidating,
    minDeliveryTime,
    maxDeliveriesPerDay,
    maxDeliveryTime,
    maxOrdersPerTimeSlot,
    pickupAddress,
    pickupInstructions,
    resetCustomAreaDraft,
    serviceAreaResults,
    serviceAreaSearch,
    serviceAreas,
    saveMessage,
    selectedModes,
    retryLoad,
    setBaseFee,
    setCustomSlotDraft,
    setFreeDelivery,
    setMinDeliveryTime,
    setMaxDeliveriesPerDay,
    setMaxDeliveryTime,
    setMaxOrdersPerTimeSlot,
    setPickupAddress,
    setPickupInstructions,
    slotDraftError,
    timeSlots,
    validationState,
  } = useDeliverySettings();

  const isPageDisabled = Boolean(loadError);

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
          {loadError ? (
            <div className="rounded-[12px] border border-[#f0c8bf] bg-[#fff4ef] px-4 py-4 text-[#6f3d2d]">
              <h2 className="m-0 text-[15px] font-bold text-[#4a2418]">
                Delivery settings unavailable
              </h2>
              <p className="mt-2 text-[13px] font-medium leading-[1.5]">
                {loadError}
              </p>
              <button
                className="mt-3 rounded-[8px] bg-[#d96e39] px-4 py-2 text-[12px] font-bold text-white"
                onClick={retryLoad}
                type="button"
              >
                Retry loading
              </button>
            </div>
          ) : null}

          <DeliveryModeSection
            disabled={isPageDisabled}
            errors={fieldErrors}
            modes={deliveryModes}
            onToggleMode={handleToggleMode}
            selectedModes={selectedModes}
          />

          <DeliveryAreasSection
            customAreaDraft={customAreaDraft}
            customAreaErrors={customAreaErrors}
            disabled={isPageDisabled || isDeliveryDisabled}
            error={fieldErrors.validAreaIds || fieldErrors.serviceAreas || ""}
            isCreatingArea={isCreatingArea}
            isSearching={isSearchingAreas}
            onAddArea={handleAddServiceArea}
            onCreateCustomArea={handleCreateCustomArea}
            onCustomAreaDraftChange={handleCustomAreaDraftChange}
            onRemoveArea={handleRemoveServiceArea}
            onResetCustomAreaDraft={resetCustomAreaDraft}
            onSearchChange={(event) => handleServiceAreaSearchChange(event.target.value)}
            searchResults={serviceAreaResults}
            searchValue={serviceAreaSearch}
            selectedAreas={serviceAreas}
          />

          <DeliveryPickupSection
            disabled={isPageDisabled || !selectedModes.includes("pickup")}
            errors={fieldErrors}
            onPickupAddressChange={(event) => setPickupAddress(event.target.value)}
            onPickupInstructionsChange={(event) => setPickupInstructions(event.target.value)}
            pickupAddress={pickupAddress}
            pickupInstructions={pickupInstructions}
          />

          <DeliveryPricingSection
            baseFee={baseFee}
            disabled={isPageDisabled || isDeliveryDisabled}
            errors={fieldErrors}
            freeDelivery={freeDelivery}
            onBaseFeeChange={(event) => setBaseFee(event.target.value)}
            onFreeDeliveryChange={(event) => setFreeDelivery(event.target.value)}
          />

          <DeliveryScheduleSection
            activeDays={activeDays}
            days={deliveryDays}
            disabled={isPageDisabled || isDeliveryDisabled}
            errors={fieldErrors}
            onAddCustomSlot={handleOpenAddSlotModal}
            onRemoveTimeSlot={handleRemoveTimeSlot}
            onToggleDay={handleToggleDay}
            timeSlots={timeSlots}
          />

          <DeliveryLimitsSection
            disabled={isPageDisabled || isDeliveryDisabled}
            errors={fieldErrors}
            maxDeliveryTime={maxDeliveryTime}
            maxDeliveriesPerDay={maxDeliveriesPerDay}
            maxOrdersPerTimeSlot={maxOrdersPerTimeSlot}
            minDeliveryTime={minDeliveryTime}
            onMaxDeliveryTimeChange={(event) => setMaxDeliveryTime(event.target.value)}
            onMaxDeliveriesPerDayChange={(event) => setMaxDeliveriesPerDay(event.target.value)}
            onMaxOrdersPerTimeSlotChange={(event) => setMaxOrdersPerTimeSlot(event.target.value)}
            onMinDeliveryTimeChange={(event) => setMinDeliveryTime(event.target.value)}
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
        hasUnsavedChanges={!loadError && hasUnsavedChanges}
        isLoading={isLoading}
        isSaving={isSaving}
        onCancel={handleCancelChanges}
        onSave={handleSaveChanges}
        saveMessage={loadError ? "Fix the loading issue before editing or saving." : saveMessage}
      />

      {isAddSlotModalOpen ? (
        <DeliveryAddSlotModal
          activeDays={activeDays}
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
