export const GAS_LIMIT_CLAIM =
  process.env.NETWORK === "jfintest" ? "7000000" : "25000000";
export const GAS_LIMIT_GOVERNANCE =
  process.env.NETWORK === "jfintest" ? "7000000" : "15000000";
export const GAS_LIMIT_GENERAL =
  process.env.NETWORK === "jfintest" ? "1000000" : "1000000"; // use in case some sned transaction cannot estimate gas
export const GAS_PRICE = "23000000000";
