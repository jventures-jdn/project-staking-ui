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
      myTotalReward: observable,
      getAllValidatorEvents: action,
      fetchValidators: action,
      updateValidators: action,
      fetchMyStakingHistory: action,
      fetchMyStakingValidators: action,
      calcMyTotalReward: action,
      myValidators: computed,
      activeValidator: computed,
      jailedValidator: computed,
      pendingValidator: computed,
      totalStake: computed,
    });
  }
  /* ------------------------------- Properties ------------------------------- */
  public isFetchingValidators: boolean;
  public provider: Provider;
  public contract = stakingContract;
  public validators: Validator[];
  public myTotalReward: BigNumber;
  public myStakingHistoryEvents: Event[];
  public myStakingValidators: Awaited<
    ReturnType<typeof this.fetchMyStakingValidators>
  >;
  public stakeEvents: Event[];
  public unStakeEvents: Event[];
  public claimEvents: Event[];
  private validatorEvents: Event[];

  /* --------------------------------- Methods -------------------------------- */
  /* -------------------------------------------------------------------------- */
  /*                                   Helper                                   */
  /* -------------------------------------------------------------------------- */
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

  private isProviderValid() {
    if (!this.provider)
      throw new Error(
        "No wagmi provider found. Ensure you have set up a provider with `setProvider()`"
      );
  }

  public setProvider(provider: Provider) {
    this.provider = provider;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Fetcher                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * Use for fetch "stake" events from giving wallet or validator address then update result to `stakeEvents`
   * - When giving wallet address will return events of specific wallet address in all validators.
   * - When giving validator address will return events of specific validator in all wallet.
   * - When giving both wallet and validator address will return events from specific wallet and validator address
   * @param {address} wallet - The wallet address
   * @param {address} validator - The validator address
   * @returns Stake events of giving wallet or validator
   */
  private async fetchStakeEvents(wallet?: Address, validator?: Address) {
    this.isProviderValid();

    const staking = this.contract.connect(this.provider);
    const filter = staking.filters.Delegated(
      validator || null,
      wallet || null,
      null,
      null
    );

    // query event
    const query = await staking.queryFilter(filter, "earliest", "latest");
    this.stakeEvents = query;
    return query;
  }

  /**
   * Use for fetch "un-stake" events from giving wallet or validator address then update result to `unStakeEvents`
   * - When giving wallet address will return events of specific wallet address in all validators.
   * - When giving validator address will return events of specific validator in all wallet.
   * - When giving both wallet and validator address will return events from specific wallet and validator address
   * @param {address} wallet - The wallet address
   * @param {address} validator - The validator address
   * @returns Un-stake events of giving wallet or validator
   */
  private async fetchUnStakeEvents(wallet?: Address, validator?: Address) {
    this.isProviderValid();

    const staking = this.contract.connect(this.provider);
    const filter = staking.filters.Undelegated(
      validator || null,
      wallet || null,
      null,
      null
    );

    // query event
    const query = await staking.queryFilter(filter, "earliest", "latest");
    this.unStakeEvents = query;
    return query;
  }

  /**
   * Use for fetch "claim" events from giving wallet or validator address then update result to `claimEvents`
   * - When giving wallet address will return events of specific wallet address in all validators.
   * - When giving validator address will return events of specific validator in all wallet.
   * - When giving both wallet and validator address will return events from specific wallet and validator address
   * @param {address} wallet - The wallet address
   * @param {address} validator - The validator address
   * @returns Claim events of giving wallet or validator
   */
  private async fetchClaimEvents(wallet?: Address, validator?: Address) {
    this.isProviderValid();

    const staking = this.contract.connect(this.provider);
    const filter = staking.filters.Claimed(
      validator || null,
      wallet || null,
      null,
      null
    );

    // query event
    const query = await staking.queryFilter(filter, "earliest", "latest");
    this.claimEvents = query;
    return query;
  }

  /**
   * Use for fetch `stake` `un-stake` `claim` events from user wallet address then update result to `myStakingHistoryEvents`
   * - If `myStakingHistoryEvents` is already exist this function will skip fetch procress
   * - If `myStakingHistoryEvents` is empty this function will fetch `fetchStakeEvents()` `fetchUnStakeEvents()` `fetchClaimEvents()`
   * @returns Events from `stake` `unstake` `claim` included sort event with blocknumber
   */
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
   * Use for fetch user staking validators from stakeEvents and unStakeEvents
   * - If not found user wallet return `undefined`
   * - If `stakeEvents` and `myStakeEvents` not found, this function will fetch `fetchStakeEvents()` and `fetchUnStakeEvents()` otherwise skip.
   * @returns Sorted (blocknumber) validator event of user wallet with
   */
  public async fetchMyStakingValidators(
    options: { force: boolean } = { force: false }
  ) {
    const address = chainAccount.account.address;
    if (!address) {
      this.myStakingValidators = undefined;
      return;
    }

    // fetch if never stake, un-stake before
    if ((!this.stakeEvents && !this.unStakeEvents) || options.force) {
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
   * Use for fetch validator information from giving validator address and epoch
   * @returns Validator information
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
   * Use for fetch all validators included validator information from system then update result to `validators`
   * - This function include state `isFetchingValidators`
   * @returns All validator information
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

  /* -------------------------------------------------------------------------- */
  /*                                   Action                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * Use for `claim` reward from giving validator address
   * - user must be signed in
   * - update validators from call `updateValidators()` after transaction finished
   * - update myValidators from call `fetchMyStakingValidators()`  after transaction finished
   * - update myTotalReward from call `calcMyTotalReward()` after transaction finished
   * @param validatorAddress validator address
   * @returns contract receipt
   */
  public async claimValidatorReward(validatorAddress: Address) {
    this.isProviderValid();
    const signer = await fetchSigner();
    const staking = this.contract.connect(signer as Signer);
    const transaction = await staking.claimDelegatorFee(validatorAddress, {
      gasPrice: $BigNumber.from(GAS_PRICE),
      gasLimit: $BigNumber.from(GAS_LIMIT_CLAIM),
    });
    const receip = await transaction.wait();

    await Promise.all([
      this.updateValidators(), // update validators
      this.fetchMyStakingValidators({ force: true }).then(() =>
        this.calcMyTotalReward()
      ), // update total stake (my validators),then update total reward
    ]);

    return receip;
  }

  /**
   * Use for `stake` amount of token to giving validator
   * - user must be signed in
   * - update validators from call `updateValidators()` after transaction finished
   * - update myValidators from call `fetchMyStakingValidators()`  after transaction finished
   * - update myTotalReward from call `calcMyTotalReward()` after transaction finished
   * @param validatorAddress validator address
   * @param amount amount of token to stake
   * @returns contract receipt
   */
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

    await Promise.all([
      this.updateValidators(), // update validators
      this.fetchMyStakingValidators({force: true}).then(() => this.calcMyTotalReward()), // update total stake (my validators),then update total reward
    ]);

    return receip;
  }

  /**
   * Use for `un-stake` amount of token to giving validator
   * - user must be signed in
   * - update validators from call `updateValidators()` after transaction finished
   * - update myValidators from call `fetchMyStakingValidators()`  after transaction finished
   * - update myTotalReward from call `calcMyTotalReward()` after transaction finished
   * @param validatorAddress validator address
   * @param amount amount of token to un-stake
   * @returns contract receipt
   */
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

    await Promise.all([
      this.updateValidators(), // update validators
      this.fetchMyStakingValidators({force: true}).then(() => this.calcMyTotalReward()), // update total stake (my validators),then update total reward
    ]);

    return receip;
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

  /* -------------------------------------------------------------------------- */
  /*                                 Calculator                                 */
  /* -------------------------------------------------------------------------- */
  /**
   * Calculate total reward of user then update result to `myTotalReward`
   * - if `myStakingValidators` this function will return `Bignumber(0)`
   * - if `myStakingValidators` is empty you may forgot to call `fetchMyStakingValidators()`
   * @returns Bignumber of user total reward
   */
  async calcMyTotalReward() {
    if (!this.myStakingValidators?.length) return BigNumber(0);
    const promises = [];

    for (const { ownerAddress } of this.myStakingValidators) {
      promises.push(this.getMyStakingRewards(ownerAddress));
    }

    const total = (await Promise.all(promises)).reduce((total, val) =>
      total.plus(val)
    );

    runInAction(() => {
      this.myTotalReward = total;
    });

    return total;
  }

  /**
   * Calculate validator apr from giving validator
   * @remark this function base on old sdk library
   * @param validatorAddress validator address
   * @returns  apr percentage
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
   * Calculate validator block reward from giving validator length
   * @remark this function base on old sdk library
   * @param validatorAddress length of validator
   * @returns number of blockreward
   */
  public calcValidatorBlockReward(validatorAmount: number) {
    return new BigNumber((28800 * 0.6 * 0.603) / validatorAmount).multipliedBy(
      CHAIN_DECIMAL
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Getters                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * Get `added` events of validators
   * @returns  `added` events of validators
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
   * Get `removed` events of validators
   * @returns  `removed` events of validators
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
   * Get `jailed` events of validators
   * @returns  `jailed` events of validators
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
   * Get `added` `removed` `jailed` events of validators then update result to `validatorEvents`
   * @returns  `added` `removed` `jailed` events of validators
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
   * Get user staking reward from giving validator address
   * @param address user wallet address
   * @returns reward of user staking
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
   * Get user staking amount from giving validator address
   * @param address user wallet address
   * @returns amount of user staking
   */
  public async getMyStakingAmount(address: Address) {
    this.isProviderValid();

    const delegator = chainAccount.account.address;
    if (!delegator) return BigNumber(0);
    const staking = this.contract.connect(this.provider);

    const amount = await staking.getValidatorDelegation(address, delegator);

    return BigNumber(amount.delegatedAmount.toString()).div(CHAIN_DECIMAL);
  }

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
