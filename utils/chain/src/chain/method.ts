import {
  CHAIN_EXPLORER,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC,
  CHAIN_SYMBOL,
  Chain,
  VALIDATOR_STATUS_ENUM,
  VALIDATOR_STATUS_MAPPING,
} from "./const";

/**
 * Get chain explorer object via giving chain
 */
export const getChainExplorer = (chain: Chain) => {
  const selectExplorer = CHAIN_EXPLORER[chain];
  return {
    homePage: `${selectExplorer}`,
    txUrl: `${selectExplorer}tx/{tx}`,
    addressUrl: `${selectExplorer}address/{address}`,
    blockUrl: `${selectExplorer}block/{block}`,
  };
};

/**
 * Get chain object via giving chain
 */
export const getChain = (chain: Chain) => {
  return {
    chainId: CHAIN_ID[chain],
    chainName: CHAIN_NAME[chain] as Chain,
    chainRpc: CHAIN_RPC[chain],
    chainExplorer: getChainExplorer(chain),
    chainSymbol: CHAIN_SYMBOL[chain],
  };
};

/**
 * Get status property from giving validator status
 */
export const getValidatorStatus = (status: VALIDATOR_STATUS_ENUM) => {
  switch (status) {
    case VALIDATOR_STATUS_ENUM.NOT_FOUND:
      return { status: VALIDATOR_STATUS_MAPPING[status], color: "#2e3338" };
    case VALIDATOR_STATUS_ENUM.ACTIVE:
      return { status: VALIDATOR_STATUS_MAPPING[status], color: "green" };
    case VALIDATOR_STATUS_ENUM.PENDING:
      return { status: VALIDATOR_STATUS_MAPPING[status], color: "orange" };
    case VALIDATOR_STATUS_ENUM.JAILED:
      return { status: VALIDATOR_STATUS_MAPPING[status], color: "red" };
    default:
      return { status: "NOT_FOUND", color: "#2e3338" };
  }
};
