import { CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";

import SettingsSectionCard from "./SettingsSectionCard";

function AccountField({ label, value }) {
  return (
    <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-3 max-[640px]:grid-cols-1 max-[640px]:gap-1.5">
      <span className="text-[11px] font-bold text-[#1f1814]">{label}</span>
      <div className="flex h-[30px] items-center rounded-[7px] bg-[#f2f2f2] px-3 text-[11px] text-[#4d433d]">
        {value}
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  onChange,
  onToggleVisibility,
  placeholder,
  value,
  visible,
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-[#1f1814]">{label}</span>
      <div className="relative">
        <input
          className="type-subpara h-[38px] w-full rounded-[8px] border border-[#d5cbc3] bg-white px-3 pr-10 text-[#201712] outline-none transition placeholder:text-[#b0a59b] focus:border-[#cf6e38] focus:shadow-[0_0_0_3px_rgba(207,110,56,0.1)]"
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#84776c]"
          onClick={onToggleVisibility}
          type="button"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

export default function SettingsAccountSecurityPanel({
  account,
  businessName,
  handlePasswordChange,
  handleTogglePasswordVisibility,
  passwordForm,
  passwordStrength,
  passwordsMatch,
  passwordVisibility,
}) {
  const strengthToneClasses = {
    neutral: "text-[#8c7d70]",
    weak: "text-[#ce5d37]",
    medium: "text-[#b67b1d]",
    strong: "text-[#179a74]",
  };

  return (
    <div className="grid grid-cols-2 gap-4 max-[1120px]:grid-cols-1">
      <SettingsSectionCard
        description="View and update your account details."
        title="Account Information"
      >
        <div className="mb-4 flex items-center gap-3 rounded-[10px] bg-[#fffaf4] p-3">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[10px] border border-[#f0d5b7] bg-[#fff1d8]">
            <img alt={businessName} className="max-h-[42px] w-auto" src="/logo.png" />
          </div>
          <div className="min-w-0">
            <button
              className="mb-1 rounded-[6px] border border-[#d9cec7] bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#6d625a]"
              type="button"
            >
              Change Profile
            </button>
            <p className="text-[12px] font-bold text-[#211915]">{businessName}</p>
            <p className="text-[10px] text-[#8c8075]">PNG, JPG up to 5 MB</p>
          </div>
        </div>

        <div className="space-y-3">
          <AccountField label="Full Name" value={account.fullName} />
          <AccountField label="Email Address" value={account.emailAddress} />
          <AccountField label="Phone Number" value={account.phoneNumber} />
          <AccountField label="Role" value={account.role} />
          <AccountField label="Username" value={account.username} />
          <AccountField label="Account ID" value={account.accountId} />
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        description="Update your password regularly to keep your account secure."
        title="Change Password"
      >
        <div className="space-y-3">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            onChange={handlePasswordChange("currentPassword")}
            onToggleVisibility={() => handleTogglePasswordVisibility("currentPassword")}
            placeholder="Enter your current password"
            value={passwordForm.currentPassword}
            visible={passwordVisibility.currentPassword}
          />
          <PasswordField
            label="New Password"
            name="newPassword"
            onChange={handlePasswordChange("newPassword")}
            onToggleVisibility={() => handleTogglePasswordVisibility("newPassword")}
            placeholder="Enter your new password"
            value={passwordForm.newPassword}
            visible={passwordVisibility.newPassword}
          />

          <div>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7f746b]">
                Security Strength
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.08em] ${strengthToneClasses[passwordStrength.tone]}`}
              >
                {passwordStrength.label}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((index) => {
                const isFilled = index < passwordStrength.filledBars;
                const colorClass =
                  passwordStrength.tone === "strong"
                    ? "bg-[#179a74]"
                    : passwordStrength.tone === "medium"
                      ? "bg-[#d59d39]"
                      : passwordStrength.tone === "weak"
                        ? "bg-[#d96e39]"
                        : "bg-[#e2dbd5]";

                return (
                  <span
                    key={index}
                    className={`h-[4px] flex-1 rounded-full ${isFilled ? colorClass : "bg-[#e2dbd5]"}`}
                  />
                );
              })}
            </div>
          </div>

          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            onChange={handlePasswordChange("confirmPassword")}
            onToggleVisibility={() => handleTogglePasswordVisibility("confirmPassword")}
            placeholder="Confirm your new password"
            value={passwordForm.confirmPassword}
            visible={passwordVisibility.confirmPassword}
          />

          <div className="rounded-[10px] bg-[#f7fbf9] px-3 py-2">
            {passwordsMatch ? (
              <div className="flex items-start gap-2 text-[#179a74]">
                <CheckCircle2 className="mt-[1px] shrink-0" size={14} />
                <p className="text-[10px] font-medium">
                  Passwords match. Use at least 8 characters with a mix of letters,
                  numbers, and symbols.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-[#7b7169]">
                <ShieldCheck className="mt-[1px] shrink-0" size={14} />
                <p className="text-[10px] font-medium">
                  Use at least 8 characters with uppercase, lowercase, numbers, and
                  symbols.
                </p>
              </div>
            )}
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
