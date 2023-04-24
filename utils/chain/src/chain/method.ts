import {
  CHAIN_EXPLORER,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC,
  Chain,
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
    chainName: CHAIN_NAME[chain],
    chainRpc: CHAIN_RPC[chain],
    chainExplorer: getChainExplorer(chain),
  };
};
