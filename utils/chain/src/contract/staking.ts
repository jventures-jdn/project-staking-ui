import { action, computed, makeObservable, observable } from "mobx";
import { stakingContract } from ".";
import { BigNumber as $BigNumber, Event, ethers } from "ethers";
import { Address } from "abitype";
import { CHAIN_DECIMAL, VALIDATOR_STATUS_ENUM } from "../chain";
import { BigNumber } from "bignumber.js";
import { Provider, getAccount } from "@wagmi/core";
import { chainConfig } from ".";

export class Staking {
  constructor() {
    makeObservable(this, {
      provider: observable,
      contract: observable,
      validators: observable,
      getValidators: action,
      activeValidator: computed,
      jailedValidator: computed,
      pendingValidator: computed,
      totalDelegated: computed,
    });
  }
  /* ------------------------------- Properties ------------------------------- */
  public provider: Provider;
  public contract = stakingContract;
  public validators: Awaited<ReturnType<typeof this.getValidators>>;

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

    return [...addedValidators, ...removedValidators, ...jailedValidators];
  }

  /**
   * get validator data from giving validator event
   */
  public async getValidator(validatorEvent: ethers.Event, epoch: $BigNumber) {
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
  public async getValidators(validatorEvents: Event[]) {
    this.isProviderValid();
    // get chain config if epoch is not valid
    if (!chainConfig.epoch) {
      await chainConfig.fetch();
    }

    const epoch = $BigNumber.from(chainConfig.epoch);
    const validators = await Promise.all(
      validatorEvents.map((validatorEvent) =>
        this.getValidator(validatorEvent, epoch)
      )
    );

    // sort validator base on blockNumber
    const sortValidators = validators.sort(
      (prev, curr) =>
        prev.validatorEvent.blockNumber - curr.validatorEvent.blockNumber
    );

    this.validators = sortValidators;
    return sortValidators;
  }

  /**
   * get user staking reward from giving validator address
   */
  public async getMyStakingRewards(
    validator: Awaited<ReturnType<typeof this.getValidator>>
  ) {
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
  public async getMyStakingAmount(
    validator: Awaited<ReturnType<typeof this.getValidator>>
  ) {
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

  /**
   * calculate validator apr from giving validator
   * *this calc base on sdk library
   */
  public calcValidatorApr(
    validator: Awaited<ReturnType<typeof this.getValidator>>
  ) {
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
