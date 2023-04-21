import {
  GAS_LIMIT_CLAIM,
  GAS_PRICE,
  IValidator,
} from "jfin-staking-sdk";
import {
  AlertOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { observer } from "mobx-react";
import { FormEvent, useEffect, useState } from "react";
import JfinCoin from "../../../components/JfinCoin/JfinCoin";
import { useBasStore, useModalStore } from "../../../stores";
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";

interface IClaimStakingContent {
  isStaking?: boolean;
  validator: IValidator;
  amount?: number;
  onSuccess?: () => void;
}
const ClaimStakingContent = observer((props: IClaimStakingContent) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const store = useBasStore();
  const sdk = store.getBasSdk();
  const keyProvider = sdk.getKeyProvider();
  const modalStore = useModalStore();
  const [error, setError] = useState<string>();

  /* -------------------------------------------------------------------------- */
  /*                                    Web3                                    */
  /* -------------------------------------------------------------------------- */
  const tx = usePrepareSendTransaction({
    request: {
      to: keyProvider.stakingAddress!,
      data: keyProvider
        .stakingContract!.methods.claimDelegatorFee(props.validator?.validator)
        .encodeABI(),
      gasLimit: GAS_LIMIT_CLAIM,
      gasPrice: GAS_PRICE,
    },
    chainId: store.config.chainId,
  });

  const { data, sendTransaction, isError } = useSendTransaction(tx.config);
  useWaitForTransaction({
    hash: data?.hash,
    chainId: store.config.chainId,
    onSuccess: async () => {
      if (props.onSuccess) await props.onSuccess(); // callback function
      modalStore.setIsLoading(false);
      modalStore.setVisible(false);
      store.updateWalletBalance();
      message.success("Claim reward was done!");
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
    if (!sendTransaction) return;
    setError(undefined);
    modalStore.setIsLoading(true);
    sendTransaction();
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    modalStore.setIsLoading(false);
  }, []);

  
  // handle transaction reject
  useEffect(() => {
    if (!isError) return;
    modalStore.setIsLoading(false);
  }, [isError]);

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="claim-staking-content">
      <form onSubmit={handleSubmit}>
        <div className="items-center">
          <b>Claim</b> <JfinCoin />
        </div>

        <div className="">
          <input
            className="staking-input"
            disabled
            style={{ marginTop: "15px" }}
            type="text"
            value={props.amount?.toLocaleString(undefined, {
              minimumFractionDigits: 5,
              maximumFractionDigits: 5,
            })}
          />
          <div className="staking-sub-input justify-between ">
            <span className="wallet-warning">{error}</span>
          </div>
        </div>

        {props?.isStaking ? (
          <div className="alert-message">
            <AlertOutlined />
            Please claim all rewards before staking or un-staking
          </div>
        ) : (
          <div className="warning-message">
            <WarningOutlined />
            If reward you received does not match the reward that the system has
            indicated, This may happen from the gas limit. Please increase the
            gas limit in wallet (up to {GAS_LIMIT_CLAIM}).
          </div>
        )}

        <button
          className="button lg w-100 m-0 ghost mt-2"
          disabled={modalStore.isLoading}
          type="submit"
        >
          {modalStore.isLoading ? <LoadingOutlined spin /> : "Claim Reward"}
        </button>
      </form>
    </div>
  );
});

export default ClaimStakingContent;
