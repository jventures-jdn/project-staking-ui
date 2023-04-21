import {
  GAS_LIMIT_GENERAL,
  GAS_PRICE,
  IValidator,
} from "jfin-staking-sdk";
import { LoadingOutlined, WarningOutlined } from "@ant-design/icons";
import { observer } from "mobx-react";
import { FormEvent, useEffect, useState } from "react";
import { getCurrentEnv, useBasStore, useModalStore } from "../../../stores";
import { message } from "antd";
import { GWEI } from "../../../utils/const";
import BigNumber from "bignumber.js";
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import JfinCoin from "../../JfinCoin/JfinCoin";

interface IUnStakingContent {
  validator: IValidator;
  amount?: number;
  onSuccess?: () => void;
}

const UnStakingContent = observer((props: IUnStakingContent) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const store = useBasStore();
  const sdk = store.getBasSdk();
  const keyProvider = sdk.getKeyProvider();
  const modalStore = useModalStore();
  const [stakedAmount, setStakedAmount] = useState<number>();
  const [unStakingAmount, setUnStakingAmount] = useState(props.amount || 0);
  const [error, setError] = useState<string>();

  /* -------------------------------------------------------------------------- */
  /*                                    Web3                                    */
  /* -------------------------------------------------------------------------- */
  const tx = usePrepareSendTransaction({
    chainId: store.config.chainId,
    request: {
      to: keyProvider.stakingAddress!,
      data: keyProvider
        .stakingContract!.methods.undelegate(
          props.validator.validator,
          new BigNumber(unStakingAmount).multipliedBy(GWEI).toString(10)
        )
        .encodeABI(),
      gasLimit: GAS_LIMIT_GENERAL,
      gasPrice: GAS_PRICE,
      value: "0x0",
    },
  });

  const { data, sendTransaction, isError } = useSendTransaction(tx.config);
  useWaitForTransaction({
    hash: data?.hash,
    chainId: store.config.chainId,
    onSuccess: async () => {
      if (props.onSuccess) props.onSuccess();
      modalStore.setIsLoading(false);
      modalStore.setVisible(false);
      store.updateWalletBalance();
      message.success("Un-Staking was done!");
    },
    onError: (error) => {
      modalStore.setIsLoading(false);
      message.error(`Something went wrong ${error.message || ""}`);
    },
  });

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    if (!sendTransaction) return;
    if (!unStakingAmount) return;
    if (unStakingAmount < 1) return setError("Un-Stake amount must be more 1");
    if (unStakingAmount > Number(stakedAmount))
      return setError(
        `Un-Stake amount must be lower or equal to ${stakedAmount}`
      );
    sendTransaction();
    modalStore.setIsLoading(true);
  };

  const inital = async () => {
    modalStore.setIsLoading(false);
    setStakedAmount(await store.getMyValidatorStaked(props.validator));
  };

  useEffect(() => {
    inital();
  }, [store.isConnected]);

  // handle transaction reject
  useEffect(() => {
    if (!isError) return;
    modalStore.setIsLoading(false);
  }, [isError]);

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="un-staking-content">
      <form onSubmit={handleSubmit}>
        <div className="items-center">
          <b>Un-Staking</b> <JfinCoin />
        </div>

        <div className="">
          <input
            className="staking-input"
            disabled={modalStore.isLoading}
            onChange={(e) => setUnStakingAmount(+e.target.value)}
            style={{ marginTop: "15px" }}
            type="number"
            value={unStakingAmount}
          />
          <div className="staking-sub-input justify-between ">
            <span className="wallet-warning">{error}</span>
            <span className="col-title">Your staked: {stakedAmount || 0}</span>
          </div>
        </div>

        <div className="warning-message">
          <WarningOutlined />
          After complete the transaction, your staking will be returned in the
          form of a staking reward within 1 Epoch (
          {getCurrentEnv() === "jfin" ? "1hr" : "10min"}).
        </div>

        <button
          className="button lg w-100 m-0 ghost mt-2"
          disabled={modalStore.isLoading}
          type="submit"
        >
          {modalStore.isLoading ? <LoadingOutlined spin /> : "Confirm"}
        </button>
      </form>
    </div>
  );
});

export default UnStakingContent;
