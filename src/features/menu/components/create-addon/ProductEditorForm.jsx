import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ImagePlus,
  LoaderCircle,
  Plus,
  Upload,
} from "lucide-react";
import MenuDescriptionEditor from "../../../../components/shared/MenuDescriptionEditor";
import { MultiSelectInput } from "../create-menu/CreateMenuFields";

const control =
  "h-11 w-full rounded-lg border border-[#dcd8d3] bg-white px-3 text-sm text-[#292521] outline-none transition placeholder:text-[#a39b93] focus:border-[#b96942] focus:ring-2 focus:ring-[#c96432]/10 disabled:bg-[#f7f5f2] disabled:text-[#9c938a]";
const card = "rounded-xl border border-[#e4dfd9] bg-white";
function Field({ id, label, optional, error, children }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[13px] font-semibold text-[#37312b]"
        >
          {label}
        </label>
        {optional && (
          <span className="text-[11px] text-[#94877b]">{optional}</span>
        )}
      </div>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
function Section({ title, description, children }) {
  return (
    <section className={card + " p-5 sm:p-6"}>
      <header className="mb-5">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#302923]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[12px] leading-5 text-[#8b7d70]">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}
function Choices({ options, selected, disabled, onToggle, empty }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {options.length ? (
        options.map((option) => {
          const value = option.value || option,
            label = option.label || option,
            checked = selected.includes(value);
          return (
            <label
              key={value}
              className={
                "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-xs transition " +
                (checked
                  ? "border-[#d6a88d] bg-[#fcf5ef] text-[#79462c]"
                  : "border-[#e7e2dc] bg-white text-[#706457] hover:border-[#cfc3b7]") +
                (disabled ? " cursor-not-allowed opacity-60" : "")
              }
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onToggle(value)}
                className="h-3.5 w-3.5 shrink-0 accent-[#bd6439]"
              />
              <span className="min-w-0 break-words">{label}</span>
            </label>
          );
        })
      ) : (
        <p className="text-xs text-[#94877b]">{empty}</p>
      )}
    </div>
  );
}
function ProductPhoto({ image, disabled, onUpload, text }) {
  const fileInput = useRef(null);
  const [dragging, setDragging] = useState(false);
  function select(file) {
    if (file && !disabled) onUpload(file);
  }
  return (
    <div>
      <input
        ref={fileInput}
        aria-label={text("Upload product image", "Last opp produktbilde")}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          select(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          select(e.dataTransfer.files[0]);
        }}
        className={
          "group relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bd6439] " +
          (dragging
            ? "border-[#bd6439] bg-[#fcf1e8]"
            : "border-[#d7cec4] bg-[#f9f7f4] hover:border-[#b7a390]") +
          " disabled:cursor-wait disabled:opacity-60"
        }
      >
        {image ? (
          <>
            <img
              src={image}
              alt={text("Product image", "Produktbilde")}
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/60 py-2.5 text-xs font-medium text-white">
              <Upload size={13} />
              {text("Change image", "Bytt bilde")}
            </span>
          </>
        ) : (
          <>
            <ImagePlus
              size={28}
              strokeWidth={1.3}
              className="mb-3 text-[#ad9c8c]"
            />
            <span className="text-[13px] font-semibold text-[#665344]">
              {text("Upload an image", "Last opp et bilde")}
            </span>
            <span className="mt-1 text-xs text-[#9e8f80]">
              {text("or drag and drop here", "eller dra og slipp her")}
            </span>
          </>
        )}
      </button>
      <p className="mt-3 text-[11px] leading-5 text-[#9a8b7e]">
        JPG, PNG, WebP / {text("up to 5 MB", "opptil 5 MB")}
      </p>
    </div>
  );
}
export default function ProductEditorForm({ editor }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const no = /^(no|nb|nn)/.test(i18n.resolvedLanguage || i18n.language);
  const text = (en, nb) => (no ? nb : en);
  const {
    formState: form,
    fieldErrors,
    imageUrl,
    isEditMode,
    isDuplicateMode,
    isSaving,
    dietaryOptions,
    allergenOptions,
    mealTypeOptions,
    occasionOptions,
    actions,
  } = editor;
  const [uploading, setUploading] = useState(false);
  const uploadingRef = useRef(false);
  const standalone = form.addOnType === "INDEPENDENT",
    disabled = isSaving || uploading;
  const title = standalone
    ? text(
        isEditMode
          ? "Edit product"
          : isDuplicateMode
            ? "Duplicate product"
            : "Create product",
        isEditMode
          ? "Rediger produkt"
          : isDuplicateMode
            ? "Dupliser produkt"
            : "Opprett produkt",
      )
    : text(
        isEditMode ? "Edit add-on" : "Create add-on",
        isEditMode ? "Rediger tillegg" : "Opprett tillegg",
      );
  function update(key) {
    return (e) => actions.setField(key, e.target.value);
  }
  async function upload(file) {
    if (uploadingRef.current || isSaving) return;
    uploadingRef.current = true;
    setUploading(true);
    try {
      await actions.handleImageUpload(file);
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  }
  function toggleAllergen(value) {
    actions.setField(
      "allergens",
      form.allergens.includes(value)
        ? form.allergens.filter((id) => id !== value)
        : [...form.allergens, value],
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!disabled) actions.handleSave();
      }}
      className="mx-auto max-w-[1220px] pb-3 text-[#302923]"
    >
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/menu")}
            disabled={disabled}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-[#8c7c6e] transition hover:text-[#b26138]"
          >
            <ArrowLeft size={13} />
            {text("Menu management", "Menyadministrasjon")}
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.04em] sm:text-[32px]">
              {title}
            </h1>
            <span className="rounded-md border border-[#e3d8cc] bg-[#f4eee7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#91745b]">
              {standalone
                ? text("Single product", "Enkeltprodukt")
                : text("Menu add-on", "Menytillegg")}
            </span>
          </div>
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#8c7b6b]">
            {standalone
              ? text(
                  "Add product details, pricing and categories.",
                  "Legg til produktinformasjon, pris og kategorier.",
                )
              : text(
                  "Add an optional extra for customers ordering your menus.",
                  "Legg til et valgfritt tillegg for kunder som bestiller menyene dine.",
                )}
          </p>
        </div>
        <span className="mb-1 text-xs text-[#9c8c7d]">
          {text(
            "Changes are saved when you select Save.",
            "Endringer lagres når du velger Lagre.",
          )}
        </span>
      </header>
      <div className="grid items-start gap-5 min-[1180px]:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0 space-y-5">
          <Section
            title={text("Product information", "Produktinformasjon")}
            description={text(
              "This is what customers see when they browse your products.",
              "Dette ser kundene når de blar gjennom produktene dine.",
            )}
          >
            <div className="space-y-5">
              <Field
                id="product-name"
                label={text("Product name", "Produktnavn")}
                error={fieldErrors.addOnName}
              >
                <input
                  id="product-name"
                  required
                  disabled={disabled}
                  className={control}
                  value={form.addOnName}
                  onChange={update("addOnName")}
                  placeholder={text(
                    "e.g. Three-course wedding menu",
                    "F.eks. treretters bryllupsmeny",
                  )}
                />
              </Field>
              <Field label={text("Description", "Beskrivelse")}>
                <MenuDescriptionEditor
                  disabled={disabled}
                  value={form.description}
                  onChange={update("description")}
                  placeholder={text(
                    "Describe the dish, or list everything included in your menu...",
                    "Beskriv retten, eller list opp alt som er inkludert i menyen...",
                  )}
                />
                <p className="mt-2 text-[11px] leading-5 text-[#9a8b7e]">
                  {text(
                    "Include dishes, portions and anything your customers should know. Drag the bottom corner to resize.",
                    "Ta med retter, porsjoner og det kundene bør vite. Dra i nederste hjørne for å endre størrelsen.",
                  )}
                </p>
              </Field>
            </div>
          </Section>
          <Section title={text("Price & portions", "Pris og porsjoner")}>
            <div
              className={"grid gap-5 " + (standalone ? "sm:grid-cols-2" : "")}
            >
              <Field
                id="product-price"
                label={
                  standalone
                    ? text("Price per guest", "Pris per gjest")
                    : text("Price", "Pris")
                }
                error={fieldErrors.price}
              >
                <div className="relative">
                  <input
                    id="product-price"
                    required
                    disabled={disabled}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={update("price")}
                    placeholder="0.00"
                    className={control + " pr-14"}
                  />
                  <span className="pointer-events-none absolute right-3 top-3 text-xs text-[#a18e7b]">
                    NOK
                  </span>
                </div>
              </Field>
              {standalone && (
                <Field
                  id="product-guests"
                  label={text("Minimum guests", "Minimum antall gjester")}
                  error={fieldErrors.minimumGuests}
                >
                  <input
                    id="product-guests"
                    required
                    disabled={disabled}
                    type="number"
                    min="1"
                    step="1"
                    value={form.minimumGuests}
                    onChange={update("minimumGuests")}
                    className={control}
                  />
                </Field>
              )}
            </div>
          </Section>
          <Section
            title={
              standalone
                ? text("Categories & occasions", "Kategorier og anledninger")
                : text("Categories", "Kategorier")
            }
            description={text(
              "Help customers find this product in the right searches.",
              "Hjelp kundene med å finne produktet i riktige søk.",
            )}
          >
            <div
              className={"grid gap-5 " + (standalone ? "sm:grid-cols-2" : "")}
            >
              <Field
                label={text("Food types", "Mattyper")}
                optional={text("Select multiple", "Velg flere")}
                error={fieldErrors.mealTypes}
              >
                <MultiSelectInput
                  disabled={disabled}
                  options={mealTypeOptions}
                  value={form.mealTypes}
                  onChange={(value) => actions.setField("mealTypes", value)}
                  placeholder={text("Select food types", "Velg mattyper")}
                />
              </Field>
              {standalone && (
                <Field
                  label={text("Occasions", "Anledninger")}
                  optional={text("Select multiple", "Velg flere")}
                  error={fieldErrors.selectedOccasions}
                >
                  <MultiSelectInput
                    disabled={disabled}
                    options={occasionOptions}
                    value={form.selectedOccasions}
                    onChange={(value) =>
                      actions.setField("selectedOccasions", value)
                    }
                    placeholder={text("Select occasions", "Velg anledninger")}
                  />
                </Field>
              )}
            </div>
            {standalone && (
              <p className="mt-4 text-xs leading-5 text-[#8e7d6e]">
                {text(
                  "Select Wedding, for example, to appear alongside other wedding menus.",
                  "Velg for eksempel Bryllup for å vises sammen med andre bryllupsmenyer.",
                )}
              </p>
            )}
          </Section>
          {standalone && (
            <Section
              title={text("Allergens", "Allergener")}
              description={text(
                "Select all allergens present in this product or menu.",
                "Velg alle allergener som finnes i produktet eller menyen.",
              )}
            >
              <Choices
                options={allergenOptions}
                selected={form.allergens}
                onToggle={toggleAllergen}
                disabled={disabled}
                empty={text(
                  "No allergens are configured.",
                  "Ingen allergener er konfigurert.",
                )}
              />
            </Section>
          )}
          <Section title={text("Dietary preferences", "Kostholdspreferanser")}>
            <Choices
              options={dietaryOptions}
              selected={form.selectedDietary}
              onToggle={actions.toggleDietaryTag}
              disabled={disabled}
              empty={text(
                "No dietary options are configured.",
                "Ingen kostholdsalternativer er konfigurert.",
              )}
            />
          </Section>
        </div>
        <aside className="min-w-0 space-y-5 min-[1180px]:sticky min-[1180px]:top-5">
          <Section title={text("Product image", "Produktbilde")}>
            <ProductPhoto
              image={imageUrl}
              disabled={disabled}
              onUpload={upload}
              text={text}
            />
            {uploading && (
              <p
                role="status"
                className="mt-3 flex items-center gap-2 text-xs text-[#9a6444]"
              >
                <LoaderCircle size={14} className="animate-spin" />
                {text("Uploading image...", "Laster opp bilde...")}
              </p>
            )}
          </Section>
          <Section title={text("Availability", "Tilgjengelighet")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-medium">
                  {text(
                    "Available for ordering",
                    "Tilgjengelig for bestilling",
                  )}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#9a8b7e]">
                  {text(
                    "Turn off to keep this product paused.",
                    "Slå av for å sette produktet på pause.",
                  )}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={form.availableImmediately}
                aria-label={text(
                  "Available for ordering",
                  "Tilgjengelig for bestilling",
                )}
                disabled={disabled}
                type="button"
                onClick={() =>
                  actions.setField(
                    "availableImmediately",
                    !form.availableImmediately,
                  )
                }
                className={
                  "relative mt-0.5 h-[22px] w-10 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#bd6439] " +
                  (form.availableImmediately
                    ? "bg-[#ba653d]"
                    : "bg-[#d8d1ca]") +
                  " disabled:opacity-50"
                }
              >
                <span
                  className={
                    "absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition " +
                    (form.availableImmediately ? "left-[21px]" : "left-[3px]")
                  }
                />
              </button>
            </div>
          </Section>
          <div className="px-1">
            <p className="text-xs font-medium text-[#786655]">
              {text("About single products", "Om enkeltprodukter")}
            </p>
            <p className="mt-2 text-xs leading-6 text-[#9a8b7e]">
              {standalone
                ? text(
                    "Use the description for a complete menu with all its dishes, or for a single item. Both are browsed alongside menus.",
                    "Bruk beskrivelsen til en komplett meny med alle rettene, eller til en enkelt rett. Begge vises sammen med menyer.",
                  )
                : text(
                    "This extra is offered with your menus.",
                    "Dette tillegget tilbys sammen med menyene dine.",
                  )}
            </p>
            <a
              href="mailto:support@gocatering.no"
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#a76b46]"
            >
              {text("Need help?", "Trenger du hjelp?")}
              <ArrowUpRight size={12} />
            </a>
          </div>
        </aside>
      </div>
      <footer className="sticky bottom-[82px] z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ded6cd] bg-[#fffdfb]/95 px-4 py-3 shadow-[0_-3px_14px_rgba(51,35,19,0.03)] backdrop-blur-sm min-[961px]:bottom-3 sm:px-5">
        <span className="hidden items-center gap-2 text-xs text-[#9b8876] sm:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c4b09b]" />
          {text(
            "Review your details before saving",
            "Se gjennom detaljene før du lagrer",
          )}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            disabled={disabled}
            type="button"
            onClick={actions.handleCancel}
            className="rounded-lg px-2 py-2.5 text-xs sm:px-3 font-medium text-[#8a7765] hover:bg-[#f6f1eb] disabled:opacity-50"
          >
            {text("Cancel", "Avbryt")}
          </button>
          {!isEditMode && (
            <button
              disabled={disabled}
              type="button"
              onClick={(event) => {
                if (event.currentTarget.form.reportValidity())
                  actions.handleAddAnother();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded3c7] bg-white px-3 py-2.5 text-xs font-semibold text-[#7d5b43] hover:bg-[#faf6f1] disabled:opacity-50"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">
                {text("Save & add another", "Lagre og legg til ny")}
              </span>
              <span className="sm:hidden">
                {text("Save + new", "Lagre + ny")}
              </span>
            </button>
          )}
          <button
            disabled={disabled}
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#bf6236] px-3 py-2.5 sm:px-5 text-xs font-semibold text-white transition hover:bg-[#a6532c] disabled:cursor-wait disabled:opacity-50"
          >
            {disabled ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Check size={14} />
            )}
            {isSaving
              ? text("Saving...", "Lagrer...")
              : text("Save product", "Lagre produkt")}
          </button>
        </div>
      </footer>
    </form>
  );
}
