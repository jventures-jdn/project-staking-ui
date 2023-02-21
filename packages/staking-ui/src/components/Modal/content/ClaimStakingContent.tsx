import { GAS_LIMIT_CLAIM, IValidator } from "@ankr.com/bas-javascript-sdk";
import {
  AlertOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { observer } from "mobx-react";
import { FormEvent, useEffect, useState } from "react";
import JfinCoin from "src/components/JfinCoin/JfinCoin";
import { useBasStore, useModalStore } from "src/stores";

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
  const modalStore = useModalStore();
  const [error, setError] = useState<string>();

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(undefined);
    modalStore.setIsLoading(true);

    try {
      const tx = await store
        .getBasSdk()
        .getStaking()
        .claimDelegatorFee(props.validator?.validator);

      await tx.receipt;

      if (props.onSuccess) props.onSuccess();
      modalStore.setIsLoading(false);
      modalStore.setVisible(false);
      store.updateWalletBalance();
      message.success("Claim reward was done!");
    } catch (err: any) {
      modalStore.setIsLoading(false);
      message.error(`Something went wrong ${err.message || ""}`);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    modalStore.setIsLoading(false);
  }, []);

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
            type="number"
            value={props.amount?.toPrecision(4)}
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
