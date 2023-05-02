import { Provider, fetchBalance, getAccount } from "@wagmi/core";
import BigNumber from "bignumber.js";
import { action, makeObservable, observable, runInAction } from "mobx";
import { CHAIN_DECIMAL } from "../chain";
import { chainStaking } from ".";

export class Account {
  constructor() {
    makeObservable(this, {
      isFetchingAccount: observable,
      isReady: observable,
      provider: observable,
      account: observable,
      balance: observable,
      getAccount: action,
      fetchBalance: action,
    });
  }
  /* ------------------------------- Properties ------------------------------- */
  public isFetchingAccount: boolean;
  public isReady: boolean;
  public provider: Provider;
  public account: Awaited<ReturnType<typeof getAccount>>;
  public balance: BigNumber;

  /* --------------------------------- Methods -------------------------------- */
  /**
   * get web3 wallet account
   */
  public async getAccount() {
    this.isReady = false;
    const account = await getAccount();
    if (!account.address) {
      chainStaking.myStakingHistoryEvents = [];
      chainStaking.myStakingValidators = [];
      chainStaking.myTotalReward = BigNumber(0);
    }
    runInAction(() => {
      this.account = account;
    });
    this.isReady = true;
    return this.account;
  }

  /**
   * fetch balance from user wallet
   */
  public async fetchBalance() {
    if (!this.account.address) {
      this.balance = new BigNumber(0);
      return this.balance;
    }

    const balance = await fetchBalance({
      address: this.account.address,
    });
    this.balance = new BigNumber(balance.value.toString()).div(CHAIN_DECIMAL);
    return this.balance;
  }
}
