import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { Validator, chainAccount, chainStaking, stakingContract } from ".";
import { BigNumber as $BigNumber, Event, Signer } from "ethers";
import { Address } from "abitype";
import { CHAIN_DECIMAL, VALIDATOR_STATUS_ENUM } from "../chain";
import { BigNumber } from "bignumber.js";
import { Provider, fetchSigner } from "@wagmi/core";
import { chainConfig } from ".";
import { GAS_PRICE } from "../gas";
import { GAS_LIMIT_CLAIM } from "../gas";
import { Result } from "ethers/lib/utils.js";

export class Staking {
  constructor() {
    makeObservable(this, {
      provider: observable,
      contract: observable,
      validators: observable,
      isFetchingValidators: observable,
      myStakingHistoryEvents: observable,
      stakeEvents: observable,
      unStakeEvents: observable,
      claimEvents: observable,
      myStakingValidators: observable,
      getAllValidatorEvents: action,
      fetchValidators: action,
      updateValidators: action,
      fetchMyStakingHistory: action,
      getMyStakingValidators: action,
      activeValidator: computed,
      jailedValidator: computed,
      pendingValidator: computed,
      totalStake: computed,
      myValidators: computed,
    });
  }
  /* ------------------------------- Properties ------------------------------- */
  public isFetchingValidators: boolean;
  public provider: Provider;
  public contract = stakingContract;
  public validators: Validator[];
  public myStakingHistoryEvents: Event[];
  public myStakingValidators: Awaited<
    ReturnType<typeof this.getMyStakingValidators>
  >;
  public stakeEvents: Event[];
  public unStakeEvents: Event[];
  public claimEvents: Event[];
  private validatorEvents: Event[];

  /* --------------------------------- Methods -------------------------------- */
  private isProviderValid() {
    if (!this.provider)
      throw new Error(
        "No wagmi provider found. Ensure you have set up a provider with `setProvider()`"
      );
  }

  public getValidatorEventArgs(args?: Result) {
    if (!args) return;
    const [validator, staker, amount, epoch] = args as [
      validator: Address,
      staker: Address,
      amount: $BigNumber,
      epoch: $BigNumber
    ];
    return {
      validator,
      staker,
      amount: new BigNumber(amount.toString()),
      epoch: new BigNumber(epoch.toString()),
    };
  }

  public setProvider(provider: Provider) {
    this.provider = provider;
  }

  private async fetchStakeEvents(address?: Address, validator?: Address) {
    this.isProviderValid();
    const staking = this.contract.connect(this.provider);
    const filter = staking.filters.Delegated(
      validator || null,
      address || null,
      null,
      null
    );

    const query = await staking.queryFilter(filter, "earliest", "latest");
    this.stakeEvents = query;

    return query;
  }

  private async fetchUnStakeEvents(address?: Address, validator?: Address) {
    this.isProviderValid();
    const staking = this.contract.connect(this.provider);
    const filter = staking.filters.Undelegated(
      validator || null,
      address || null,
      null,
      null
    );

    const query = await staking.queryFilter(filter, "earliest", "latest");
    this.unStakeEvents = query;

    return query;
  }

  private async fetchClaimEvents(address?: Address, validator?: Address) {
    this.isProviderValid();
    const staking = this.contract.connect(this.provider);
    const filter = staking.filters.Claimed(
      validator || null,
      address || null,
      null,
      null
    );

    const query = await staking.queryFilter(filter, "earliest", "latest");
    this.claimEvents = query;

    return query;
  }

  public async fetchMyStakingHistory() {
    const address = chainAccount.account.address;
    if (!address) return (this.myStakingHistoryEvents = []);

    const [stake, unstake, claim] = await Promise.all([
      this.fetchStakeEvents(address),
      this.fetchUnStakeEvents(address),
      this.fetchClaimEvents(address),
    ]);

    // sort considered events
    const sortedEvents = [...stake, ...unstake, ...claim].sort(
      (prev, curr) => curr.blockNumber - prev.blockNumber
    );

    runInAction(() => {
      this.myStakingHistoryEvents = sortedEvents;
    });

    return sortedEvents;
  }

  /**
   * Get my staking validators from stakeEvents and unStakeEvents
   */
  public async getMyStakingValidators() {
    const address = chainAccount.account.address;
    if (!address) {
      this.myStakingValidators = undefined;
      return;
    }

    // fetch if never stake, un-stake before
    if (!this.stakeEvents && !this.unStakeEvents) {
      await Promise.all([
        this.fetchStakeEvents(address),
        this.fetchUnStakeEvents(address),
      ]);
    }

    const stakeEvents = this.stakeEvents;
    const unStakeEvent = this.unStakeEvents;

    // sort considered events
    const sortedEvents = [...stakeEvents, ...unStakeEvent].sort(
      (prev, curr) => prev.blockNumber - curr.blockNumber
    );

    const result = sortedEvents.reduce((validators, event) => {
      const args = this.getValidatorEventArgs(event.args);
      if (!args) return validators; // skip

      const validatorAddress: Address = args.validator;
      // event never assign to validators before, assigned to validators
      if (!validators[validatorAddress]) {
        const data = {
          ownerAddress: validatorAddress,
          totalStake: new BigNumber(0),
          totalUnStake: new BigNumber(0),
          totalAmount: new BigNumber(0),
          events: [],
        };
        validators[validatorAddress] = data;
      }

      const amount = new BigNumber(args.amount.toString());
      // push current event to validator
      validators[validatorAddress].events.push(event);

      if (event.event === "Delegated") {
        // if event is stake, plus totalStake and totalAmount
        validators[validatorAddress].totalStake =
          validators[validatorAddress].totalStake.plus(amount);
        validators[validatorAddress].totalAmount =
          validators[validatorAddress].totalAmount.plus(amount);
      } else {
        // if event is un-stake, plus totalStake and minus totalAmount
        validators[validatorAddress].totalUnStake =
          validators[validatorAddress].totalUnStake.plus(amount);
        validators[validatorAddress].totalAmount =
          validators[validatorAddress].totalAmount.minus(amount);
      }

      return validators;
    }, {} as Record<Address, { ownerAddress: Address; totalStake: BigNumber; totalUnStake: BigNumber; totalAmount: BigNumber; events: Event[] }>);

    const resultValues = Object.values(result);
    const myValidators = (
      await Promise.all(
        resultValues.map(async (validator) => {
          return {
            ...validator,
            totalReward: await chainStaking.getMyStakingRewards(
              validator.ownerAddress
            ),
          };
        })
      )
    ).filter((v) => !v.totalAmount.isZero() || !v.totalReward.isZero());
    runInAction(() => {
      this.myStakingValidators = myValidators;
    });

    return myValidators;
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
  public async fetchValidator(validatorEvent: Event, epoch: $BigNumber) {
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
    runInAction(() => {
      this.isFetchingValidators = true;
    });
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

    runInAction(() => {
      this.validators = sortValidators;
      this.isFetchingValidators = false;
    });
    return sortValidators;
  }

  public async updateValidators() {
    if (!this.validatorEvents.length) {
      throw new Error(
        "No validatorEvents found. Ensure you have set fetch validator with `fetchValidators()`"
      );
    }
    runInAction(() => {
      this.isFetchingValidators = true;
    });

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

    runInAction(() => {
      this.validators = sortValidators;
      this.isFetchingValidators = false;
    });
    return sortValidators;
  }

  /**
   * get user staking reward from giving validator address
   */
  public async getMyStakingRewards(address: Address) {
    this.isProviderValid();

    const delegator = chainAccount.account.address;
    if (!delegator) return BigNumber(0);
    const staking = this.contract.connect(this.provider);

    const reward = await staking.getDelegatorFee(address, delegator);
    return BigNumber(reward.toString()).div(CHAIN_DECIMAL);
  }

  /**
   * get user staking amount from giving validator address
   */
  public async getMyStakingAmount(address: Address) {
    this.isProviderValid();

    const delegator = chainAccount.account.address;
    if (!delegator) return BigNumber(0);
    const staking = this.contract.connect(this.provider);

    const amount = await staking.getValidatorDelegation(address, delegator);

    return BigNumber(amount.delegatedAmount.toString()).div(CHAIN_DECIMAL);
  }

  public async claimValidatorReward(validatorAddress: Address) {
    this.isProviderValid();
    const signer = await fetchSigner();
    const staking = this.contract.connect(signer as Signer);
    const transaction = await staking.claimDelegatorFee(validatorAddress, {
      gasPrice: $BigNumber.from(GAS_PRICE),
      gasLimit: $BigNumber.from(GAS_LIMIT_CLAIM),
    });
    const receip = await transaction.wait();
    this.updateValidators();
    return receip;
  }

  public async stakeToValidator(validatorAddress: Address, amount: number) {
    this.isProviderValid();
    const signer = await fetchSigner();
    const staking = this.contract.connect(signer as Signer);
    const transaction = await staking.delegate(validatorAddress, {
      gasPrice: $BigNumber.from(GAS_PRICE),
      value: $BigNumber.from(
        new BigNumber(amount).multipliedBy(CHAIN_DECIMAL).toString()
      ),
    });
    const receip = await transaction.wait();
    this.updateValidators();
    return receip;
  }

  public async unstakeFromValidator(
    validatorAddress: Address,
    _amount: number
  ) {
    this.isProviderValid();
    const signer = await fetchSigner();
    const staking = this.contract.connect(signer as Signer);
    const amount = $BigNumber.from(
      BigNumber(_amount).multipliedBy(CHAIN_DECIMAL).toString()
    );

    const transaction = await staking.undelegate(validatorAddress, amount, {
      gasPrice: $BigNumber.from(GAS_PRICE),
    });
    const receip = await transaction.wait();
    this.updateValidators();
    return receip;
  }

  /**
   * calculate validator apr from giving validator
   * *this calc base on sdk library
   */
  public calcValidatorApr(validatorAddress: Address) {
    const validator = this.validators.find(
      (validator) => validator.ownerAddress === validatorAddress
    );
    if (!validator) return 0;

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

  get totalStake() {
    if (!this.validators) return BigNumber(0);
    const total = this.validators.reduce(
      (total, validator) => total.plus(validator.totalDelegated),
      BigNumber(0)
    );
    return total;
  }

  get myTotalStake() {
    if (!this.myStakingValidators) return BigNumber(0);
    return this.myStakingValidators
      .reduce((total, validator) => {
        return total.plus(validator.totalAmount);
      }, new BigNumber(0))
      .div(CHAIN_DECIMAL);
  }

  async getMyTotalReward() {
    if (!this.myStakingValidators?.length) return BigNumber(0);
    const promises = [];

    for (const { ownerAddress } of this.myStakingValidators) {
      promises.push(this.getMyStakingRewards(ownerAddress));
    }

    const total = (await Promise.all(promises)).reduce((total, val) =>
      total.plus(val)
    );

    return total;
  }

  get myValidators() {
    if (!this.myStakingValidators?.length || !this.validators?.length)
      return [];

    const myValidatorAddress = this.myStakingValidators.map(
      (v) => v.ownerAddress
    );

    const myValidators = this.validators.filter((v) =>
      myValidatorAddress.includes(v.ownerAddress)
    );

    return myValidators;
  }
}
