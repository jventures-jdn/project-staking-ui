import {
  GAS_LIMIT_GENERAL,
  GAS_PRICE,
  IValidator,
} from "jfin-staking-sdk";
import { LoadingOutlined } from "@ant-design/icons";
import { message } from "antd";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react";
import { FormEvent, useEffect, useState } from "react";
import JfinCoin from "../../../components/JfinCoin/JfinCoin";
import { useBasStore, useModalStore } from "../../../stores";
import { GWEI } from "../../../utils/const";
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction,
import { Validator } from '@utils/chain/src/contract'

interface IAddStakingContent {
  validator: Validator
}
const AddStakingContent = observer((props: IAddStakingContent) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const store = useBasStore();
  const sdk = store.getBasSdk();
  const keyProvider = sdk.getKeyProvider();
  const modalStore = useModalStore();
  const [stakingAmount, setStakingAmount] = useState(props.amount || 0);
  const [error, setError] = useState<string>();

  /* -------------------------------------------------------------------------- */
  /*                                    Web3                                    */
  /* -------------------------------------------------------------------------- */
  const tx = usePrepareSendTransaction({
    request: {
      to: keyProvider.stakingAddress!,
      data: keyProvider
        .stakingContract!.methods.delegate(props.validator.validator)
        .encodeABI(),
      gasPrice: GAS_PRICE,
      gasLimit: GAS_LIMIT_GENERAL,
      value: new BigNumber(stakingAmount).multipliedBy(GWEI).toString(10),
    },
    chainId: store.config.chainId,
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
      message.success("Staking was done!");
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
    if (!stakingAmount) return;

    setError(undefined);
    if (stakingAmount < 1) return setError("Stake amount must be more 1");
    if (stakingAmount > Number(store.walletBalance) / GWEI)
      return setError(`Insufficient Balance`);
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
    <div className="add-staking-content">
      <form onSubmit={handleSubmit}>
        <div className="items-center">
          <b>Staking</b> <JfinCoin />
        </div>

        <div className="">
          <input
            className="staking-input"
            disabled={modalStore.isLoading}
            onChange={(e) => setStakingAmount(+e.target.value)}
            style={{ marginTop: "15px" }}
            type="number"
            value={stakingAmount}
          />
          <div className="staking-sub-input justify-between ">
            <span className="wallet-warning">{error}</span>
            <span className="col-title">
              Your balance: {store.getWalletBalance()}
            </span>
          </div>
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

export default AddStakingContent;
