import { Provider, fetchBalance, getAccount } from "@wagmi/core";
import { Address } from "abitype";
import BigNumber from "bignumber.js";
import { action, makeObservable, observable } from "mobx";
import { CHAIN_DECIMAL } from "../chain";

export class Account {
  constructor() {
    makeObservable(this, {
      isFetchingAccount: observable,
      provider: observable,
      account: observable,
      balance: observable,
      getAccount: action,
      fetchBalance: action,
    });
  }
  /* ------------------------------- Properties ------------------------------- */
  public isFetchingAccount: boolean;
  public provider: Provider;
  public account: Awaited<ReturnType<typeof getAccount>>;
  public balance: BigNumber;

  /* --------------------------------- Methods -------------------------------- */
  /**
   * get web3 wallet account
   */
  public async getAccount() {
    this.account = await getAccount();
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

  /* --------------------------------- Getters -------------------------------- */
}
