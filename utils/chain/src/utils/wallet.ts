import { getNetwork } from "@wagmi/core";
import { CHAIN_DECIMAL_UNIT, EXPECT_CHAIN, getChain } from "../chain";
import Web3 from "web3";

const { chainRpc } = getChain(EXPECT_CHAIN.chainName);
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
  const chainIdHex = web3.utils.numberToHex(EXPECT_CHAIN?.chainId || 1);
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
    // metamask mobile format or metamask extension format
    if (e.data?.originalError?.code === 4902 || e.code === 4902) {
      return await addChain()
        .then(() => true)
        .catch((e) => e);
    }
    return e;
  }
};

export const addChain = async () => {
  const chainIdHex = web3.utils.numberToHex(EXPECT_CHAIN?.chainId || 1);
  await web3.givenProvider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: chainIdHex,
        rpcUrls: [EXPECT_CHAIN.chainRpc],
        chainName: EXPECT_CHAIN.chainName,
        nativeCurrency: {
          decimals: CHAIN_DECIMAL_UNIT,
          name: EXPECT_CHAIN.chainName,
          symbol: EXPECT_CHAIN.chainSymbol,
        },
        blockExplorerUrls: [EXPECT_CHAIN.chainExplorer.homePage],
        iconUrls: ["https://staking.jfinchain.com/favicon-96x96.png"],
      },
    ],
  });
};
