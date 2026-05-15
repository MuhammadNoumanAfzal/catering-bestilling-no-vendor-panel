import { Link } from "react-router-dom";

function Field({ label, type = "text", placeholder, helperText }) {
  return (
    <label className="auth-field">
      <span className="auth-field-label type-para">{label}</span>
      <input
        className="auth-input type-subpara"
        type={type}
        placeholder={placeholder}
      />
      {helperText ? (
        <span className="auth-field-helper type-subpara">{helperText}</span>
      ) : null}
    </label>
  );
}

function OtpField({ value }) {
  return (
    <div className="auth-otp-box type-h5" aria-label={`Digit ${value}`}>
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
}) {
  return (
    <div className="auth-card">
      <div className="auth-card-body">
        <h1 className="auth-card-title type-h3">{title}</h1>
        <p className="auth-card-subtitle type-para">{subtitle}</p>

        {otpValues ? (
          <div className="auth-otp-row">
            {otpValues.map((value) => (
              <OtpField key={`${title}-${value}`} value={value} />
            ))}
          </div>
        ) : null}

        {fields.length > 0 ? (
          <div className="auth-fields">
            {fields.map((field) => (
              <Field key={field.label} {...field} />
            ))}
          </div>
        ) : null}

        {passwordRules ? (
          <div
            className="auth-password-rules"
            aria-label="Password requirements"
          >
            {passwordRules.map((rule) => (
              <span
                key={rule.label}
                className={`auth-password-rule ${rule.isValid ? "is-valid" : ""}`}
              >
                {rule.label}
              </span>
            ))}
          </div>
        ) : null}

        {rememberMeLabel || auxiliaryLinkLabel ? (
          <div className="auth-meta-row">
            {rememberMeLabel ? (
              <label className="auth-checkbox type-para">
                <input type="checkbox" />
                <span>{rememberMeLabel}</span>
              </label>
            ) : (
              <span />
            )}

            {auxiliaryLinkLabel && auxiliaryLinkTo ? (
              <Link className="auth-link type-para" to={auxiliaryLinkTo}>
                {auxiliaryLinkLabel}
              </Link>
            ) : null}
          </div>
        ) : null}

        <button className="auth-primary-button type-para" type="button">
          {actionLabel}
        </button>

        {note ? <p className="auth-note type-para">{note}</p> : null}

        {backLinkLabel && backLinkTo ? (
          <Link className="auth-back-link type-para" to={backLinkTo}>
            {backLinkLabel}
          </Link>
        ) : null}

        {footerText ? (
          <p className="auth-card-footer type-para">
            {footerText}{" "}
            {footerLinkLabel && footerLinkTo ? (
              <Link className="auth-link" to={footerLinkTo}>
                {footerLinkLabel}
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}
