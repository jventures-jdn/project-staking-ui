import { BigNumber } from "ethers";

/**
 * Contract address declearation
 */
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

export type Chain = "JFIN" | "JFINT";
export const CHAIN_DECIMAL_UNIT = 18;
export const CHAIN_DECIMAL = BigNumber.from("10").pow(CHAIN_DECIMAL_UNIT);

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
