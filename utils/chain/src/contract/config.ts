import { fetchBlockNumber, readContracts } from "wagmi/actions";
import { chainConfigObject } from ".";
import { CHAIN_DECIMAL } from "../chain";

/**
 * All config calculate base on javascript sdk
 */
export class Config {
  /* -------------------------------- Property -------------------------------- */
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

  constructor() {
    this.fetch();
  }

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
   * get all chain propperty
   */
  public getConfig() {
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

  /**
   * Read all chain config data via readContracts
   *
   * https://wagmi.sh/core/actions/readContracts
   */
  public async fetch() {
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
    this.blockNumber = _blockNumber;
    this.activeValidatorsLength = _activeValidatorsLength;
    this.epochBlockInterval = _epochBlockInterval;
    this.misdemeanorThreshold = _misdemeanorThreshold;
    this.felonyThreshold = _felonyThreshold;
    this.validatorJailEpochLength = _validatorJailEpochLength;
    this.undelegatePeriod = _undelegatePeriod;
    this.minValidatorStakeAmount = _minValidatorStakeAmount
      .div(CHAIN_DECIMAL)
      .toNumber();
    this.minStakingAmount = _minStakingAmount.div(CHAIN_DECIMAL).toNumber();
    this.startBlock = this.calcStartBlock();
    this.endBlock = this.calcEndBlock();
    this.epoch = this.calcEpoch();
    this.nextEpochIn = this.calcNextEpochIn();
    this.epochBlockIntervalSec = this.calcBlockIntervalSec();
    this.undelegateIntervalSec = this.calcUndelegateIntervalSec();
    this.validatorJailIntervalSec = this.calcValidatorJailIntervalSec();

    // return all chain config
    return this.getConfig();
  }
}
