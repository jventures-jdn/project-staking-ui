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

  public proposals: Event[];

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

  public mappingCreatedEventArgs(args?: Result) {
    if (!args?.length) return;
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

  public async getProposalCreatedEvents() {
    const provider = getProvider({ chainId: EXPECT_CHAIN.chainId });
    const governanceContract = this.governanceContract.connect(provider);
    const proposalEvents = await governanceContract.queryFilter(
      "ProposalCreated",
      "earliest",
      "latest"
    );
    return proposalEvents;
  }

  public async getProposalCastVoteEvents() {
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

    return proposalVoteEvents;
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

    console.log(this.proposals);
    return createdEvents;
  }
}
