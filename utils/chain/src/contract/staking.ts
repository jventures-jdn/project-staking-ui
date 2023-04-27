import { action, computed, makeObservable, observable } from "mobx";
import { Validator, stakingContract } from ".";
import { BigNumber as $BigNumber, Event, Signer, ethers } from "ethers";
import { Address } from "abitype";
import {
  CHAIN_DECIMAL,
  VALIDATOR_STATUS_ENUM,
} from "../chain";
import { BigNumber } from "bignumber.js";
import {
  Provider,
  fetchSigner,
  getAccount,
} from "@wagmi/core";
import { chainConfig } from ".";
import { GAS_PRICE } from "../gas";
import { GAS_LIMIT_CLAIM } from "../gas";

export class Staking {
  constructor() {
    makeObservable(this, {
      provider: observable,
      contract: observable,
      validators: observable,
      isFetchingValidators: observable,
      getAllValidatorEvents: action,
      fetchValidators: action,
      updateValidators: action,
      activeValidator: computed,
      jailedValidator: computed,
      pendingValidator: computed,
      totalDelegated: computed,
    });
  }
  /* ------------------------------- Properties ------------------------------- */
  public isFetchingValidators: boolean;
  public provider: Provider;
  public contract = stakingContract;
  public validators: Validator[];
  private validatorEvents: Event[];

  /* --------------------------------- Methods -------------------------------- */
  private isProviderValid() {
    if (!this.provider)
      throw new Error(
        "No wagmi provider found. Ensure you have set up a provider with `setProvider()`"
      );
  }

  public setProvider(provider: Provider) {
    this.provider = provider;
  }

  /**
   * get added validator events
   */
  private async getAddedValidatorEvents() {
    this.isProviderValid();
    const staking = this.contract.connect(this.provider);
    // @ts-ignore
    const filter = staking.filters.ValidatorAdded();
    const query = await staking.queryFilter(filter, "earliest", "latest");
    return query;
  }

  /**
   * get removed validator events
   */
  private async getRemovedValidatorEvents() {
    this.isProviderValid();
    const staking = this.contract.connect(this.provider);
    // @ts-ignore
    const filter = staking.filters.ValidatorRemoved();
    const query = await staking.queryFilter(filter, "earliest", "latest");
    return query;
  }

  /**
   * get jailed validator events
   */
  private async getJailedValidatorEvents() {
    this.isProviderValid();
    const staking = this.contract.connect(this.provider);
    // @ts-ignore
    const filter = staking.filters.ValidatorJailed();
    const query = await staking.queryFilter(filter, "earliest", "latest");
    return query;
  }

  /**
   * get all validator events
   */
  public async getAllValidatorEvents() {
    this.isProviderValid();
    const [addedValidators, removedValidators, jailedValidators] =
      await Promise.all([
        this.getAddedValidatorEvents(),
        this.getRemovedValidatorEvents(),
        this.getJailedValidatorEvents(),
      ]);

    const validatorEvents = [
      ...addedValidators,
      ...removedValidators,
      ...jailedValidators,
    ];

    this.validatorEvents = validatorEvents;
    return validatorEvents;
  }

  /**
   * get validator data from giving validator event
   */
  public async fetchValidator(validatorEvent: ethers.Event, epoch: $BigNumber) {
    this.isProviderValid();
    const staking = this.contract.connect(this.provider);
    const validator = await staking.getValidatorStatusAtEpoch(
      validatorEvent?.args?.[0] as Address,
      epoch
    );

    return {
      ...validator,
      validatorEvent: validatorEvent,
      totalDelegated: BigNumber(validator.totalDelegated.toString()).div(
        CHAIN_DECIMAL
      ),
    };
  }

  /**
   * get all validators data from giving validator events
   */
  public async fetchValidators() {
    this.isProviderValid();
    this.isFetchingValidators = true;
    // get chain config if epoch is not valid
    if (!chainConfig.epoch) {
      await chainConfig.fetchChainConfig();
    }

    const epoch = $BigNumber.from(chainConfig.epoch);
    const validatorEvents = await this.getAllValidatorEvents();
    const validators = await Promise.all(
      validatorEvents.map((validatorEvent) =>
        this.fetchValidator(validatorEvent, epoch)
      )
    );

    // sort validator base on blockNumber
    const sortValidators = validators.sort(
      (prev, curr) =>
        prev.validatorEvent.blockNumber - curr.validatorEvent.blockNumber
    );

    this.validators = sortValidators;
    this.isFetchingValidators = false;
    return sortValidators;
  }

  public async updateValidators() {
    if (!this.validatorEvents.length) {
      throw new Error(
        "No validatorEvents found. Ensure you have set fetch validator with `fetchValidators()`"
      );
    }
    this.isFetchingValidators = true;

    // get chain config if epoch is not valid
    if (!chainConfig.epoch) {
      await chainConfig.fetchChainConfig();
    }
    const epoch = $BigNumber.from(chainConfig.epoch);

    const validators = await Promise.all(
      this.validatorEvents.map((validatorEvent) =>
        this.fetchValidator(validatorEvent, epoch)
      )
    );

    // sort validator base on blockNumber
    const sortValidators = validators.sort(
      (prev, curr) =>
        prev.validatorEvent.blockNumber - curr.validatorEvent.blockNumber
    );

    this.validators = sortValidators;
    this.isFetchingValidators = false;
    return sortValidators;
  }

  /**
   * get user staking reward from giving validator address
   */
  public async getMyStakingRewards(validator: Validator) {
    this.isProviderValid();

    const delegator = getAccount().address;
    if (!delegator) return BigNumber(0);
    const staking = this.contract.connect(this.provider);

    const reward = await staking.getDelegatorFee(
      validator.ownerAddress,
      delegator
    );
    return BigNumber(reward.toString()).div(CHAIN_DECIMAL);
  }

  /**
   * get user staking amount from giving validator address
   */
  public async getMyStakingAmount(validator: Validator) {
    this.isProviderValid();

    const delegator = getAccount().address;
    if (!delegator) return BigNumber(0);
    const staking = this.contract.connect(this.provider);

    const amount = await staking.getValidatorDelegation(
      validator.ownerAddress,
      delegator
    );

    return BigNumber(amount.delegatedAmount.toString()).div(CHAIN_DECIMAL);
  }

  public async claimMyValidatorReward(validator: Validator) {
    this.isProviderValid();
    const signer = await fetchSigner();
    const staking = this.contract.connect(signer as Signer);
    const transaction = await staking.claimDelegatorFee(
      validator.ownerAddress,
      {
        gasPrice: $BigNumber.from(GAS_PRICE),
        gasLimit: $BigNumber.from(GAS_LIMIT_CLAIM),
      }
    );
    const receip = await transaction.wait();
    this.fetchValidators();
    return receip;
  }

  /**
   * calculate validator apr from giving validator
   * *this calc base on sdk library
   */
  public calcValidatorApr(validator: Validator) {
    const blockReward = this.calcValidatorBlockReward(
      this.activeValidator.length
    );
    const validatorTotalReward = BigNumber(
      validator.totalRewards.toString()
    ).plus(blockReward);
    const validatorTotalStake = BigNumber(validator.totalDelegated.toString());

    const apr =
      365 *
      (100 *
        validatorTotalReward
          .dividedBy(validatorTotalStake)
          .div(CHAIN_DECIMAL)
          .toNumber());

    return apr;
  }

  /**
   * calculate validator block reward base on validator amount
   * *this calc base on sdk library
   */
  public calcValidatorBlockReward(validatorAmount: number) {
    return new BigNumber((28800 * 0.6 * 0.603) / validatorAmount).multipliedBy(
      CHAIN_DECIMAL
    );
  }

  /* --------------------------------- Getters -------------------------------- */
  get activeValidator() {
    if (!this.validators) return [];

    return this.validators.filter((validator) => {
      // console.log(toJS(validator))
      return validator.status === VALIDATOR_STATUS_ENUM.ACTIVE;
    });
  }

  get pendingValidator() {
    if (!this.validators) return [];
    return this.validators.filter(
      (validator) => validator.status === VALIDATOR_STATUS_ENUM.PENDING
    );
  }

  get jailedValidator() {
    if (!this.validators) return [];
    return this.validators.filter(
      (validator) => validator.status === VALIDATOR_STATUS_ENUM.JAILED
    );
  }

  get totalDelegated() {
    if (!this.validators) return BigNumber(0);
    const total = this.validators.reduce(
      (total, validator) => total.plus(validator.totalDelegated),
      BigNumber(0)
    );
    return total;
  }
}
