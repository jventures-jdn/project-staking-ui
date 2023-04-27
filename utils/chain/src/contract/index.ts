import { Abi, Address } from "abitype";
import STAKING_ABI from "../abi/Staking";
import SLASHING_INDICATOR_ABI from "../abi/SlashingIndicator.json";
import SYSTEM_REWARD_ABI from "../abi/SystemReward.json";
import STAKING_POOL_ABI from "../abi/StakingPool.json";
import GOVERNANCE_ABI from "../abi/Governance.json";
import CHAIN_CONFIG_ABI from "../abi/ChainConfig";
import RUNTIME_UPGRADE_ABI from "../abi/RuntimeUpgrade.json";
import DEPLOYER_PROXY_ABI from "../abi/DeployerProxy.json";
import { getContract } from "wagmi/actions";
import { Config } from "./config";
import { Staking } from "./staking";

import {
  CHAIN_CONFIG_ADDRESS,
  DEPLOYER_PROXY_ADDRESS,
  GOVERNANCE_ADDRESS,
  RUNTIME_UPGRADE_ADDRESS,
  SLASHING_INDICATOR_ADDRESS,
  STAKING_ADDRESS,
  SYSTEM_REWARD_ADDRESS,
} from "../chain";

/**
 * Contract declearation
 *
 * use for declear multiple call, read, write
 */
export const stakingObject = {
  address: STAKING_ADDRESS as Address,
  abi: STAKING_ABI,
};

export const slashingIndicatorObject = {
  address: SLASHING_INDICATOR_ADDRESS as Address,
  abi: SLASHING_INDICATOR_ABI as Abi,
};

export const systemRewardObject = {
  address: SYSTEM_REWARD_ADDRESS as Address,
  abi: SYSTEM_REWARD_ABI as Abi,
};

export const stakingPoolObject = {
  address: STAKING_ADDRESS as Address,
  abi: STAKING_POOL_ABI as Abi,
};

export const governanceObject = {
  address: GOVERNANCE_ADDRESS as Address,
  abi: GOVERNANCE_ABI as Abi,
};

export const chainConfigObject = {
  address: CHAIN_CONFIG_ADDRESS as Address,
  abi: CHAIN_CONFIG_ABI,
};

export const runtimeUpgradeObject = {
  address: RUNTIME_UPGRADE_ADDRESS as Address,
  abi: RUNTIME_UPGRADE_ABI as Abi,
};

export const deployerProxyObject = {
  address: DEPLOYER_PROXY_ADDRESS as Address,
  abi: DEPLOYER_PROXY_ABI as Abi,
};

/**
 * Get contract instance
 *
 * ex. stakingContract.getValidatorStatus(validator).call()
 * ex. takingContract.delegate(validator).encodeABI()
 *
 * https://docs.ethers.org/v5/api/contract/contract/#Contract--metaclass
 */
export const stakingContract = getContract(stakingObject);
export const slashingIndicatorContract = getContract(slashingIndicatorObject);
export const systemRewardContract = getContract(systemRewardObject);
export const stakingPoolContract = getContract(stakingPoolObject);
export const governanceContract = getContract(governanceObject);
export const chainConfigContract = getContract(chainConfigObject);
export const runtimeUpgradeContract = getContract(runtimeUpgradeObject);
export const deployerProxyContract = getContract(deployerProxyObject);

export const chainConfig = new Config();
export const chainStaking = new Staking();

export const useChainConfig = () => chainConfig;
export const useChainStaking = () => chainStaking;

export {
  STAKING_ABI,
  SLASHING_INDICATOR_ABI,
  SYSTEM_REWARD_ABI,
  STAKING_POOL_ABI,
  GOVERNANCE_ABI,
  CHAIN_CONFIG_ABI,
  RUNTIME_UPGRADE_ABI,
  DEPLOYER_PROXY_ABI,
};

export type Validator = Awaited<ReturnType<typeof chainStaking.fetchValidator>>;
