import { Provider, getProvider } from "@wagmi/core";
import { action, makeObservable, observable, runInAction } from "mobx";
import { governanceContract } from ".";
import { Event } from "ethers";
import { Bytes, Result } from "ethers/lib/utils.js";
import { Address } from "abitype";
import { BigNumber as $BigNumber } from "ethers";
import BigNumber from "bignumber.js";
import { EXPECT_CHAIN } from "../chain";

export class Governance {
  constructor() {
    makeObservable(this, {
      proposals: observable,
      getProposals: action,
    });
  }

  /* ------------------------------- Propperties ------------------------------ */
  public provider: Provider;
  public governanceContract: typeof governanceContract = governanceContract;

  public proposals: Awaited<ReturnType<typeof this.getProposals>>;

  /* --------------------------------- Helper --------------------------------- */
  private isProviderValid() {
    if (!this.provider)
      throw new Error(
        "No wagmi provider found. Ensure you have set up a provider with `setProvider()`"
      );
  }

  public setProvider(provider: Provider) {
    this.provider = provider;
  }

  public mappingCastVoteEventArgs(args?: Result) {
    const [address, proposalId, support, weight, reason] = args as [
      address: Address,
      proposalId: $BigNumber,
      support: $BigNumber,
      weight: $BigNumber,
      reason: string
    ];

    return {
      address,
      proposalId: BigNumber(proposalId.toString()),
      support: BigNumber(support.toString()),
      weight: BigNumber(weight.toString()),
      reason,
    };
  }

  public mappingCreatedEventArgs(args?: Result) {
    const [
      proposalId,
      proposal,
      targets,
      values,
      signatures,
      calldatas,
      startBlock,
      endBlock,
      description,
    ] = args as [
      proposalId: $BigNumber,
      proposer: Address,
      targets: Address[],
      values: $BigNumber[],
      signatures: string[],
      calldatas: Bytes[],
      startBlock: $BigNumber,
      endBlock: $BigNumber,
      description: string
    ];

    return {
      proposalId: BigNumber(proposalId.toString()),
      proposal,
      targets,
      values: values.map((v) => BigNumber(v.toString())),
      signatures,
      calldatas,
      startBlock: BigNumber(startBlock.toString()),
      endBlock: BigNumber(endBlock.toString()),
      description,
    };
  }

  /* --------------------------------- Actions -------------------------------- */
  public async addDeployer() {}
  public async removeDeployer() {}
  public async addValidator() {}
  public async removeValidator() {}
  public async activateValidator() {}
  public async disableValidator() {}
  public async upgradeRuntime() {}

  /* --------------------------------- Fetch -------------------------------- */
  private async getProposalState(proposalId: $BigNumber) {
    const provider = getProvider({ chainId: EXPECT_CHAIN.chainId });
    const governanceContract = this.governanceContract.connect(provider);
    return await governanceContract.state(proposalId);
  }

  public async getVotingPowers() {}

  public async getProposalCreatedEvents(): Promise<
    (Event & { values: ReturnType<Governance["mappingCreatedEventArgs"]> })[]
  > {
    const provider = getProvider({ chainId: EXPECT_CHAIN.chainId });
    const governanceContract = this.governanceContract.connect(provider);
    const proposalEvents = await governanceContract.queryFilter(
      "ProposalCreated",
      "earliest",
      "latest"
    );

    const proposals = proposalEvents.map((event) => {
      const args = this.mappingCreatedEventArgs(event.args);
      return { ...event, values: { ...args } };
    });

    return proposals;
  }

  public async getProposalCastVoteEvents(): Promise<
    (Event & { values: ReturnType<Governance["mappingCastVoteEventArgs"]> })[]
  > {
    const provider = getProvider({ chainId: EXPECT_CHAIN.chainId });
    const governanceContract = this.governanceContract.connect(provider);
    const [vote, voteParams] = await Promise.all([
      governanceContract.queryFilter("VoteCast", "earliest", "latest"),
      governanceContract.queryFilter(
        "VoteCastWithParams",
        "earliest",
        "latest"
      ),
    ]);

    // sort data
    const proposalVoteEvents = [...vote, ...voteParams].sort(
      (prev, curr) => curr.blockNumber - prev.blockNumber
    );

    const proposalVotes = proposalVoteEvents.map((event) => {
      const args = this.mappingCastVoteEventArgs(event.args);

      let voteType = "ABSTAIN";
      switch (args?.support.toNumber()) {
        case 0:
          voteType = "AGAINST";
          break;
        case 1:
          voteType = "FOR";
          break;
      }

      return { ...event, values: { ...args, voteType } };
    });

    return proposalVotes;
  }

  /* --------------------------------- Getters -------------------------------- */
  public async getProposals() {
    const [createdEvents, voteEvents] = await Promise.all([
      this.getProposalCreatedEvents(),
      this.getProposalCastVoteEvents(),
    ]);

    runInAction(() => {
      this.proposals = createdEvents;
    });

    return createdEvents;
  }
}
