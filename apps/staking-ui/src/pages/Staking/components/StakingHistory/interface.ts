import {Web3Uint256, Web3Address, IEventData} from "jfin-staking-sdk";

export interface IHistoryData {
  type: string;
  amount: Web3Uint256;
  validator: Web3Address;
  staker: Web3Address;
  transactionHash: string;
  event?: IEventData;
}
