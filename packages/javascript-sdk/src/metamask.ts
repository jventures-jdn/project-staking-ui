import Web3 from "web3";
import { numberToHex } from "web3-utils";
import { IConfig } from "./config";
import { IPendingTx } from "./types";

export const waitForExpectedNetworkOrThrow = async (
  web3: Web3,
  config: IConfig
): Promise<void> => {
  if (!web3.givenProvider.request) {
    throw new Error(
      `Wallet doesn't support switching to the ${config.chainName} network, please switch it manually`
    );
  }
  try {
    await web3.givenProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: numberToHex(config.chainId) }],
    });
  } catch (error) {
    console.error(error);
    if (await tryAddMetaMaskNetwork(web3, config)) {
      return;
    }
    throw new Error(
      `Network for ${config.chainName} is not configured in your MetaMask`
    );
  }
};

export const tryAddMetaMaskNetwork = async (
  web3: Web3,
  config: IConfig
): Promise<boolean> => {
  try {
    console.log(`Trying to switch MetaMask network to: ${config.chainId}`);
    await web3.givenProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: numberToHex(config.chainId) }],
    });
    return true;
  } catch (switchError) {
    console.error(switchError);
  }
  try {
    console.log(`Trying to add MetaMask network to: ${config.chainId}`);
    await web3.givenProvider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: numberToHex(config.chainId),
          chainName: config.chainName,
          rpcUrls: [config.rpcUrl],
        },
      ],
    });
    return true;
  } catch (addError) {
    console.error(addError);
  }
  return false;
};

export const sendTransactionAsync = async (
  web3: Web3,
  sendOptions: {
    from: string;
    to: string;
    data?: string;
    gasLimit?: string;
    gasPrice?: string;
    value?: string;
    nonce?: number;
  }
): Promise<IPendingTx> => {
  const price = sendOptions.gasPrice || (await web3.eth.getGasPrice());
  console.log("Gas Price: " + price);
  let nonce = sendOptions.nonce;
  if (!nonce) {
    nonce = await web3.eth.getTransactionCount(sendOptions.from);
  }
  console.log("Nonce: " + nonce);
  const chainId = await web3.eth.getChainId();


  // declear gasLimit from parameter or estimate
  const gasLimit = sendOptions.gasLimit
    ? numberToHex(sendOptions.gasLimit)
    : numberToHex(
        await web3.eth.estimateGas(sendOptions)
      ); // return units

  // declear transaction payload
  let tx = {
    from: sendOptions.from,
    to: sendOptions.to,
    value: numberToHex(sendOptions.value || "0"),
    gas: gasLimit, // gas unit (limit)
    gasPrice: price, // The price of gas for this transaction in wei, defaults to web3.eth.gasPrice.
    data: sendOptions.data,
    nonce: nonce,
    chainId: chainId,
  };

  console.log("Sending transaction via Web3: ", tx);
  return new Promise((resolve, reject) => {
    const promise = web3.eth.sendTransaction(tx);
    promise
      .once("transactionHash", async (transactionHash: string) => {
        console.log(`Just signed transaction has is: ${transactionHash}`);
        const rawTx = await web3.eth.getTransaction(transactionHash);
        console.log(
          `Found transaction in node: `,
          JSON.stringify(rawTx, null, 2)
        );
        resolve({ transactionHash: transactionHash, receipt: promise });
      })
      .catch(reject);
  });
};
