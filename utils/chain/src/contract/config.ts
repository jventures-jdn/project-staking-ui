import { fetchBlockNumber, readContracts } from "wagmi/actions";
import { chainConfigObject } from ".";
import { CHAIN_DECIMAL } from "../chain";
import { BigNumber } from "bignumber.js";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

// All config calculate base on javascript sdk
export class Config {
  /* ------------------------------- Properties ------------------------------- */
  constructor() {
    makeObservable(this, {
      epoch: observable,
      nextEpochIn: observable,
      endBlock: observable,
      startBlock: observable,
      blockNumber: observable,
      activeValidatorsLength: observable,
      epochBlockInterval: observable,
      misdemeanorThreshold: observable,
      felonyThreshold: observable,
      validatorJailEpochLength: observable,
      undelegatePeriod: observable,
      minValidatorStakeAmount: observable,
      minStakingAmount: observable,
      epochBlockIntervalSec: observable,
      undelegateIntervalSec: observable,
      validatorJailIntervalSec: observable,
      getConfig: computed,
      getChainConfig: action,
      updateChainConfig: action,
    });
  }

  public blockSec = 3; // base on sdk
  public epoch: number;
  public nextEpochIn: number;
  public endBlock: number;
  public startBlock: number;
  public blockNumber: number;
  public activeValidatorsLength: number;
  public epochBlockInterval: number;
  public misdemeanorThreshold: number;
  public felonyThreshold: number;
  public validatorJailEpochLength: number;
  public undelegatePeriod: number;
  public minValidatorStakeAmount: number;
  public minStakingAmount: number;
  public epochBlockIntervalSec: number;
  public undelegateIntervalSec: number;
  public validatorJailIntervalSec: number;

  /* --------------------------------- Methods -------------------------------- */
  private calcStartBlock() {
    return (
      ((this.blockNumber / this.epochBlockInterval) | 0) *
      this.epochBlockInterval
    );
  }

  private calcEndBlock() {
    return this.startBlock + Number(this.epochBlockInterval);
  }

  private calcEpoch() {
    return Math.floor(this.blockNumber / this.epochBlockInterval);
  }

  private calcNextEpochIn() {
    const blockRemain = this.endBlock - this.blockNumber;
    return blockRemain * this.blockSec;
  }

  private calcBlockIntervalSec() {
    return this.epochBlockInterval * this.blockSec;
  }

  private calcUndelegateIntervalSec() {
    return this.undelegatePeriod * this.epochBlockInterval * this.blockSec;
  }

  private calcValidatorJailIntervalSec() {
    return (
      this.validatorJailEpochLength * this.epochBlockInterval * this.blockSec
    );
  }

  /**
   * Read all chain config data via readContracts
   *
   * https://wagmi.sh/core/actions/readContracts
   */

  public async getChainConfig() {
    // prepare promises fetch
    const promiseFetchBlockNumber = fetchBlockNumber();
    const promiseReadContracts = readContracts({
      contracts: [
        {
          ...chainConfigObject,
          functionName: "getActiveValidatorsLength",
        },
        { ...chainConfigObject, functionName: "getEpochBlockInterval" },
        { ...chainConfigObject, functionName: "getMisdemeanorThreshold" },
        { ...chainConfigObject, functionName: "getFelonyThreshold" },
        { ...chainConfigObject, functionName: "getValidatorJailEpochLength" },
        { ...chainConfigObject, functionName: "getUndelegatePeriod" },
        { ...chainConfigObject, functionName: "getMinValidatorStakeAmount" },
        { ...chainConfigObject, functionName: "getMinStakingAmount" },
      ],
    });

    // parallel fetch
    const [
      _blockNumber,
      [
        _activeValidatorsLength,
        _epochBlockInterval,
        _misdemeanorThreshold,
        _felonyThreshold,
        _validatorJailEpochLength,
        _undelegatePeriod,
        _minValidatorStakeAmount,
        _minStakingAmount,
      ],
    ] = await Promise.all([promiseFetchBlockNumber, promiseReadContracts]);

    // mapping fetch result to property
    runInAction(() => {
      this.blockNumber = _blockNumber;
      this.activeValidatorsLength = _activeValidatorsLength;
      this.epochBlockInterval = _epochBlockInterval;
      this.misdemeanorThreshold = _misdemeanorThreshold;
      this.felonyThreshold = _felonyThreshold;
      this.validatorJailEpochLength = _validatorJailEpochLength;
      this.undelegatePeriod = _undelegatePeriod;
      this.minValidatorStakeAmount = BigNumber(
        _minValidatorStakeAmount.toString()
      )
        .div(CHAIN_DECIMAL)
        .toNumber();
      this.minStakingAmount = BigNumber(_minStakingAmount.toString())
        .div(CHAIN_DECIMAL)
        .toNumber();
      this.startBlock = this.calcStartBlock();
      this.endBlock = this.calcEndBlock();
      this.epoch = this.calcEpoch();
      this.nextEpochIn = this.calcNextEpochIn();
      this.epochBlockIntervalSec = this.calcBlockIntervalSec();
      this.undelegateIntervalSec = this.calcUndelegateIntervalSec();
      this.validatorJailIntervalSec = this.calcValidatorJailIntervalSec();
    });

    // return all chain config
    return this.getConfig;
  }

  /**
   * Get the latest block number and update the relevant propperty
   */
  public async updateChainConfig() {
    const _blockNumber = await fetchBlockNumber();
    runInAction(() => {
      this.blockNumber = _blockNumber;
      this.startBlock = this.calcStartBlock();
      this.endBlock = this.calcEndBlock();
      this.epoch = this.calcEpoch();
      this.nextEpochIn = this.calcNextEpochIn();
    });
  }

  /* --------------------------------- Getters -------------------------------- */
  /**
   * get all chain propperty
   */
  public get getConfig() {
    return {
      blockSec: this.blockSec,
      epoch: this.epoch,
      endBlock: this.endBlock,
      startBlock: this.startBlock,
      blockNumber: this.blockNumber,
      activeValidatorsLength: this.activeValidatorsLength,
      epochBlockInterval: this.epochBlockInterval,
      misdemeanorThreshold: this.misdemeanorThreshold,
      felonyThreshold: this.felonyThreshold,
      validatorJailEpochLength: this.validatorJailEpochLength,
      undelegatePeriod: this.undelegatePeriod,
      minValidatorStakeAmount: this.minValidatorStakeAmount,
      minStakingAmount: this.minStakingAmount,
      nextEpochIn: this.nextEpochIn,
      epochBlockIntervalSec: this.epochBlockIntervalSec,
      undelegateIntervalSec: this.undelegateIntervalSec,
      validatorJailIntervalSec: this.validatorJailIntervalSec,
    };
  }
}
