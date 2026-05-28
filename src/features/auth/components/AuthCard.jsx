import { Link } from "react-router-dom";

function Field({ label, type = "text", placeholder, helperText, name, onChange, value }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="type-para text-[#4c4037]">{label}</span>
      <input
        className="type-subpara min-h-[42px] rounded-lg border border-[#ddd4cb] bg-white px-3 text-[#1d1713] outline-none transition duration-150 placeholder:text-[#b0a79e] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.12)]"
        name={name}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        value={value}
      />
      {helperText ? (
        <span className="type-subpara text-[#aaa094]">{helperText}</span>
      ) : null}
    </label>
  );
}

function OtpField({ value }) {
  return (
    <div
      className="type-h5 grid min-h-12 place-items-center rounded-lg border border-[#ddd4cb] bg-white text-[#1d1713]"
      aria-label={`Digit ${value}`}
    >
      {value}
    </div>
  );
}

export default function AuthCard({
  title,
  subtitle,
  fields = [],
  actionLabel,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  auxiliaryLinkLabel,
  auxiliaryLinkTo,
  backLinkLabel,
  backLinkTo,
  otpValues,
  note,
  rememberMeLabel,
  passwordRules,
  actionDisabled = false,
  actionNote,
  onAction,
}) {
  return (
    <div className="w-full rounded-[14px] border border-[#e9dfd6] bg-white/95 shadow-[0_18px_44px_rgba(61,44,30,0.12)] sm:max-w-[362px]">
      <div className="px-[22px] pb-5 pt-6">
        <h1 className="type-h3 m-0 text-center text-[#16110d]">{title}</h1>
        <p className="type-para mb-[18px] mt-2 text-center text-[#6d6259]">{subtitle}</p>

        {otpValues ? (
          <div className="mb-[18px] mt-1 grid grid-cols-4 gap-2.5">
            {otpValues.map((value) => (
              <OtpField key={`${title}-${value}`} value={value} />
            ))}
          </div>
        ) : null}

        {fields.length > 0 ? (
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
              <Field key={field.label} {...field} />
            ))}
          </div>
        ) : null}

        {passwordRules ? (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Password requirements">
            {passwordRules.map((rule) => (
              <span
                key={rule.label}
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-bold",
                  rule.isValid
                    ? "bg-[rgba(92,165,112,0.14)] text-[#337447]"
                    : "bg-[#efe7de] text-[#8b8077]",
                ].join(" ")}
              >
                {rule.label}
              </span>
            ))}
          </div>
        ) : null}

        {rememberMeLabel || auxiliaryLinkLabel ? (
          <div className="mt-2.5 flex items-center justify-between gap-3">
            {rememberMeLabel ? (
              <label className="type-para inline-flex cursor-pointer items-center gap-1.5 text-[#786d64]">
                <input className="accent-[#cf6e38]" type="checkbox" />
                <span>{rememberMeLabel}</span>
              </label>
            ) : (
              <span />
            )}

            {auxiliaryLinkLabel && auxiliaryLinkTo ? (
              <Link
                className="type-para text-[#2f69c8] no-underline hover:underline"
                to={auxiliaryLinkTo}
              >
                {auxiliaryLinkLabel}
              </Link>
            ) : null}
          </div>
        ) : null}

        <button
          className="type-para mt-[14px] min-h-[42px] w-full cursor-pointer rounded-lg bg-[#cf6e38] font-bold text-white transition duration-150 hover:bg-[#bf622f] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
          disabled={actionDisabled}
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>

        {actionNote ? (
          <p className="type-para mt-2 text-center text-[#cf6e38]">{actionNote}</p>
        ) : null}

        {note ? <p className="type-para mt-[14px] block text-center text-[#8b8077]">{note}</p> : null}

        {backLinkLabel && backLinkTo ? (
          <Link
            className="type-para mt-[14px] block text-center text-[#8b8077] no-underline hover:underline"
            to={backLinkTo}
          >
            {backLinkLabel}
          </Link>
        ) : null}

        {footerText ? (
          <p className="type-para mt-[14px] block text-center text-[#8b8077]">
            {footerText}{" "}
            {footerLinkLabel && footerLinkTo ? (
              <Link className="text-[#2f69c8] no-underline hover:underline" to={footerLinkTo}>
                {footerLinkLabel}
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
