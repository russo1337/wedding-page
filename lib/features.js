const disabledValues = new Set(["false", "0", "off", "no"]);

export function isRegistrationEnabled() {
  const flag = process.env.REGISTRATION_ENABLED;

  if (!flag) {
    return true;
  }

  return !disabledValues.has(flag.trim().toLowerCase());
}
