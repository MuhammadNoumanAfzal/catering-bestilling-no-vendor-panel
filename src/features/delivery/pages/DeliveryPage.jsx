import { useState } from "react";
import DeliveryFooter from "../components/DeliveryFooter";
import DeliveryInfoNote from "../components/DeliveryInfoNote";
import DeliveryModeSelector from "../components/DeliveryModeSelector";
import DeliverySchedulePicker from "../components/DeliverySchedulePicker";
import DeliverySectionCard from "../components/DeliverySectionCard";
import DeliveryTagList from "../components/DeliveryTagList";
import {
  deliveryDays,
  deliveryModes,
  servicePostalCodes,
} from "../data/deliveryData";

function TextInput({ label, placeholder, value, onChange }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="type-para text-[#1a1410]">{label}</span>
      <input
        className="type-para h-[40px] rounded-[7px] border border-[#cec5bd] bg-white px-3 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
        onChange={onChange}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  );
}

export default function DeliveryPage() {
  const [selectedMode, setSelectedMode] = useState("delivery");
  const [postalCode, setPostalCode] = useState("");
  const [baseFee, setBaseFee] = useState("5");
  const [freeDelivery, setFreeDelivery] = useState("$ 3,000");
  const [activeDays, setActiveDays] = useState(["Mo", "Tu", "We", "Th", "Fr"]);
  const [maxDistance, setMaxDistance] = useState("150");
  const [maxOrders, setMaxOrders] = useState("25");

  function handleToggleDay(day) {
    setActiveDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day],
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-124px)] flex-col  max-[720px]:px-4 max-[720px]:py-4">
      <header className="mb-5">
        <h1 className="type-h3 m-0 text-[#15110f]">Delivery Settings</h1>
        <p className="type-para mt-1 text-[#746a62]">
          Configure how your orders are delivered to customers.
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(128px,0.82fr)] gap-4 max-[1120px]:grid-cols-1">
        <div className="flex flex-col gap-3">
          <DeliverySectionCard
            description="Choose whether you offer home delivery or store pickup only."
            title="Delivery Mode"
          >
            <DeliveryModeSelector
              modes={deliveryModes}
              onSelectMode={setSelectedMode}
              selectedMode={selectedMode}
            />
            <DeliveryInfoNote>
              You can enable both delivery and pickup if you want to offer both
              options.
            </DeliveryInfoNote>
          </DeliverySectionCard>

          <DeliverySectionCard
            description="Add postal codes of delivery areas."
            title="Delivery"
          >
            <TextInput
              label="Search Postal code"
              onChange={(event) => setPostalCode(event.target.value)}
              placeholder="Search..."
              value={postalCode}
            />
            <DeliveryTagList items={servicePostalCodes} />
          </DeliverySectionCard>

          <DeliverySectionCard
            description="Set your delivery fee and minimum order value."
            title="Pricing & Minimum Order"
          >
            <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
              <div>
                <TextInput
                  label="Base Delivery Fee"
                  onChange={(event) => setBaseFee(event.target.value)}
                  placeholder="$ 5"
                  value={baseFee}
                />
                <p className="type-subpara mt-1 text-[#a09084]">
                  Applied to standard orders.
                </p>
              </div>
              <div>
                <TextInput
                  label="Free Delivery over (optional)"
                  onChange={(event) => setFreeDelivery(event.target.value)}
                  placeholder="$ 3,000"
                  value={freeDelivery}
                />
                <p className="type-subpara mt-1 text-[#a09084]">
                  Large order only mode
                </p>
              </div>
            </div>
            <DeliveryInfoNote>
              Customer will pay $5 delivery fee on orders under $3,000.
            </DeliveryInfoNote>
          </DeliverySectionCard>

          <DeliverySectionCard
            description="Choose days and time slots when you deliver."
            title="Delivery Schedule"
          >
            <div className="grid grid-cols-[minmax(0,172px)_minmax(0,1fr)] items-start gap-x-6 gap-y-3 max-[760px]:grid-cols-1">
              <div>
                <p className="type-para mb-3 mt-0 text-[#2a221d]">Delivery on</p>
                <DeliverySchedulePicker
                  activeDays={activeDays}
                  days={deliveryDays}
                  onToggleDay={handleToggleDay}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    className="type-subpara rounded-[8px] border border-[#5f5853] bg-white px-4 py-[9px] text-[#2a221d]"
                    type="button"
                  >
                    08:00 AM - 12:00 PM ×
                  </button>
                  <button
                    className="type-subpara rounded-[8px] border border-[#5f5853] bg-white px-4 py-[9px] text-[#2a221d]"
                    type="button"
                  >
                    01:00 PM - 05:00 PM ×
                  </button>
                </div>

                <button
                  className="type-subpara w-fit rounded-[6px] border border-[#ddd6ce] bg-white px-4 py-[8px] text-[#9d9187]"
                  type="button"
                >
                  + Add custom slot
                </button>
              </div>
            </div>

            <DeliveryInfoNote>
              Orders will be accepted only in the time slots you define.
            </DeliveryInfoNote>
          </DeliverySectionCard>

          <DeliverySectionCard
            description="Set limits to manage your daily delivery capacity."
            title="Limits (Optional)"
          >
            <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
              <div>
                <TextInput
                  label="Max Deliveries Per Day"
                  onChange={(event) => setMaxDistance(event.target.value)}
                  placeholder="150"
                  value={maxDistance}
                />
                <p className="type-subpara mt-1 text-[#a09084]">
                  Based on store size and driver count.
                </p>
              </div>
              <div>
                <TextInput
                  label="Max Orders Per Time Slot"
                  onChange={(event) => setMaxOrders(event.target.value)}
                  placeholder="25"
                  value={maxOrders}
                />
                <p className="type-subpara mt-1 text-[#a09084]">
                  Maximum customers in a single time slot.
                </p>
              </div>
            </div>
            <DeliveryInfoNote>
              These limits help avoid overbooking and manage operational
              workloads.
            </DeliveryInfoNote>
          </DeliverySectionCard>
        </div>

        <aside className="h-fit rounded-[12px] bg-[#ffb596] px-4 py-4">
          <h2 className="type-h5 m-0 text-[#2a1811]">Live Validation</h2>
          <p className="type-para mt-2 leading-[1.45] text-[#593326]">
            Customers within your listed postal codes and chosen time ranges
            will be able to order. Ensure all zones are accurate to your current
            fleet.
          </p>
        </aside>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
        <button
          className="h-[38px] min-w-[104px] rounded-[8px] border border-[#4a4038] bg-white px-4 text-[12px] font-bold text-[#15110f]"
          type="button"
        >
          Cancel
        </button>
        <button
          className="h-[38px] min-w-[124px] rounded-[8px] bg-[#d96e39] px-4 text-[12px] font-bold text-white shadow-[0_6px_16px_rgba(217,110,57,0.26)]"
          type="button"
        >
          Save Changes
        </button>
      </div>

      <DeliveryFooter />
    </section>
  );
}
