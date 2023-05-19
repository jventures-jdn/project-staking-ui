import { getNetwork } from "@wagmi/core";
import { CHAIN_DECIMAL_UNIT, EXPECT_CHAIN, getChain } from "../chain";
import Web3 from "web3";

const { chainRpc, chainId, chainName, chainExplorer } = getChain(
  EXPECT_CHAIN.chainName
);
const httpProvider = new Web3.providers.HttpProvider(chainRpc || "");
const web3 = new Web3(httpProvider);

export const switchChainWhenIncorrectChain = async () => {
  const { chain } = getNetwork();
  if (EXPECT_CHAIN.chainId !== chain?.id) {
    const result = await switchChain();
    if (result !== true) throw result;
  }
};

export const switchChain = async () => {
  const chainIdHex = web3.utils.numberToHex(chainId || 1);

  try {
    await web3.givenProvider.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: chainIdHex,
        },
      ],
    });
  } catch (e: any) {
    // 4902 = Unrecognized chain ID "xxx". Try adding the chain using wallet_addEthereumChain first.
    if (e.code === 4902) {
      return await addChain()
        .then(() => true)
        .catch((e) => e);
    }
    return e;
  }
};

export const addChain = async () => {
  const chainIdHex = web3.utils.numberToHex(chainId || 1);
  await web3.givenProvider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chainIdHex,
        rpcUrls: [chainRpc],
        chainName,
        nativeCurrency: {
          decimals: CHAIN_DECIMAL_UNIT,
          name: chainName,
          symbol: chainName,
        },
        blockExplorerUrls: [chainExplorer.homePage],
        iconUrls: ["https://staking.jfinchain.com/favicon-96x96.png"],
      },
    ],
  });
};
