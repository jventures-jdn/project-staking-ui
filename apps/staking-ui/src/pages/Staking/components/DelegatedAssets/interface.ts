import { Web3Uint256, Web3Address } from "jfin-staking-sdk";

export interface IDelegatedAssetsData {
  amount: Web3Uint256;
  validator: Web3Address;
  staker: Web3Address;
  transactionHash: string;
}