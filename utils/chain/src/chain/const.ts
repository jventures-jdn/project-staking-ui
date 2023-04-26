import { BigNumber } from "bignumber.js";

/* ---------------------- Contract address declearation --------------------- */
export const STAKING_ADDRESS = "0x0000000000000000000000000000000000001000";
export const SLASHING_INDICATOR_ADDRESS =
  "0x0000000000000000000000000000000000001001";
export const SYSTEM_REWARD_ADDRESS =
  "0x0000000000000000000000000000000000001002";
export const STAKING_POOL_ADDRESS =
  "0x0000000000000000000000000000000000007001";
export const GOVERNANCE_ADDRESS = "0x0000000000000000000000000000000000007002";
export const CHAIN_CONFIG_ADDRESS =
  "0x0000000000000000000000000000000000007003";
export const RUNTIME_UPGRADE_ADDRESS =
  "0x0000000000000000000000000000000000007004";
export const DEPLOYER_PROXY_ADDRESS =
  "0x0000000000000000000000000000000000007005";

/* ----------------------- Chain property declearation ---------------------- */
export const CHAIN_EXPLORER: { [key in Chain]?: string } = {
  JFIN: "https://exp.jfinchain.com/",
  JFINT: "https://exp.testnet.jfinchain.com",
};

export const CHAIN_RPC: { [key in Chain]?: string } = {
  JFIN: "https://rpc.jfinchain.com",
  JFINT: "https://rpc.testnet.jfinchain.com",
};

export const CHAIN_ID: { [key in Chain]?: number } = {
  JFIN: 3501,
  JFINT: 3502,
};

export const CHAIN_NAME: { [key in Chain]?: string } = {
  JFIN: "JFIN Mainnet",
  JFINT: "JFIN Testnet",
};

/* ------------------------- Chain type declearation ------------------------ */
export type Chain = "JFIN" | "JFINT";
export const CHAIN_DECIMAL_UNIT = 18;
export const CHAIN_DECIMAL = BigNumber("10").pow(CHAIN_DECIMAL_UNIT);

/* -------------------------- Validator decleartion ------------------------- */
export const VALIDATOR_STATUS_MAPPING = {
  0: "NOT_FOUND",
  1: "ACTIVE",
  2: "PENDING",
  3: "JAILED",
};

export enum VALIDATOR_STATUS_ENUM {
  "NOT_FOUND" = 0,
  "ACTIVE" = 1,
  "PENDING" = 2,
  "JAILED" = 3,
}
