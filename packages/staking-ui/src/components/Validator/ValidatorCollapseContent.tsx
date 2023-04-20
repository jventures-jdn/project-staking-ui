import { IValidator, Staking } from "@ankr.com/bas-javascript-sdk";
import {
  LoadingOutlined,
  MinusOutlined,
  PlusOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Col, Row, message } from "antd";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { getCurrentEnv, useBasStore, useModalStore } from "src/stores";
import { GWEI } from "src/utils/const";
import JfinCoin from "../JfinCoin/JfinCoin";
import AddStakingContent from "../Modal/content/AddStakingContent";
import ClaimStakingContent from "../Modal/content/ClaimStakingContent";
import UnStakingContent from "../Modal/content/UnStakingContent";
import "./ValidatorCollapseContent.css";

interface IValidatorCollapseContentProps {
  validator?: IValidator;
  refresh?: () => unknown;
  forceActionButtonsEnabled?: boolean;
}

const ValidatorCollapseContent = observer(
  ({
    validator,
    refresh,
    forceActionButtonsEnabled,
  }: IValidatorCollapseContentProps) => {
    /* -------------------------------------------------------------------------- */
    /*                                   States                                   */
    /* -------------------------------------------------------------------------- */
    const store = useBasStore();
    const modalStore = useModalStore();
    const [stakingReward, setStakingReward] = useState(0);
    const [stakingAmount, setStakingAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    /* -------------------------------------------------------------------------- */
    /*                                   Methods                                  */
    /* -------------------------------------------------------------------------- */

    const getReward = async (stakingProvider: Staking) => {
      if (!stakingProvider || !validator) return Number(0);

      const reward = await stakingProvider?.getMyStakingRewards(
        validator.validator
      );

      return new BigNumber(reward).dividedBy(GWEI).toNumber();
    };

    const getMyStaking = async (stakingProvider: Staking) => {
      if (!stakingProvider || !validator) return 0;

      const amount = await stakingProvider.getMyDelegatedAmount(
        validator.validator
      );
      return new BigNumber(amount).dividedBy(GWEI).toNumber();
    };

    const inital = async () => {
      const stakingProvider = await store.getBasSdk().getStaking();

      await setStakingReward(await getReward(stakingProvider));
      await setStakingAmount(await getMyStaking(stakingProvider));
    };

    const handleClaimRecovery = async () => {
      if (!validator) return;

      try {
        setIsLoading(true);
        const tx = await store
          .getBasSdk()
          .getStaking()
          .claimDelegatorFee(validator?.validator);
        await tx.receipt;
        store.updateWalletBalance();
        message.success("Claim reward was done!");
      } catch (err: any) {
        message.error(`Something went wrong ${err.message || ""}`);
      } finally {
        setIsLoading(false);
      }
    };
    const handleClaim = async (isStaking = false) => {
      if (!validator) return;

      modalStore.setVisible(true);
      modalStore.setIsLoading(true);
      modalStore.setTitle("Claim Reward");
      modalStore.setContent(
        <ClaimStakingContent
          amount={+stakingReward}
          isStaking={isStaking}
          onSuccess={refresh || inital}
          validator={validator}
        />
      );
      modalStore.setIsLoading(false);
    };

    const handleAdd = async () => {
      if (!validator) return;

      modalStore.setVisible(true);
      modalStore.setIsLoading(true);
      modalStore.setTitle("Add Staking");
      modalStore.setContent(
        <AddStakingContent
          onSuccess={refresh || inital}
          validator={validator}
        />
      );
      modalStore.setIsLoading(false);
    };

    const handleUnStaking = async () => {
      if (!validator) return;

      modalStore.setVisible(true);
      modalStore.setIsLoading(true);
      modalStore.setTitle("Un-Staking");
      modalStore.setContent(
        <UnStakingContent onSuccess={refresh || inital} validator={validator} />
      );
      modalStore.setIsLoading(false);
    };

    /* -------------------------------------------------------------------------- */
    /*                                   Watches                                  */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
      inital();
    }, [store.isConnected]);

    /* -------------------------------------------------------------------------- */
    /*                                    DOMS                                    */
    /* -------------------------------------------------------------------------- */
    return (
      <div className="validator-collapse-content-container">
        <Row gutter={[24, 12]}>
          <Col className="info" lg={5} sm={24} xs={24}>
            <div className="validator-collapse-content-card borderless">
              <div>
                <div style={{ width: "100%" }}>
                  <div>
                    <span>Slasher: </span> {store.getSlasher(validator)}
                  </div>
                  <div>
                    <span>APR: </span>{" "}
                    {Number(
                      Number(store.getValidatorsApr(validator)).toFixed(2)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    %
                  </div>
                  <div>
                    <span>Comission Rate:</span>{" "}
                    {store.getCommisionrate(validator)}
                  </div>
                  <div>
                    <span>Total Stake: </span>
                    {store
                      .getValidatorTotalStake(validator)
                      .toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                  </div>
                  <a
                    href={
                      validator
                        ? `https://exp.${
                            getCurrentEnv() === "jfin" ? "" : "testnet."
                          }jfinchain.com/address/${validator.validator}`
                        : "#"
                    }
                    rel="noreferrer"
                    style={{ width: "100%" }}
                    target="_blank"
                  >
                    Wallet Address
                    <WalletOutlined />
                  </a>
                </div>
              </div>
            </div>
          </Col>
          <Col className="reward" lg={9} sm={24} xs={24}>
            <div className="validator-collapse-content-card">
              <span className="col-title">Staking Reward</span>
              <div>
                {!forceActionButtonsEnabled ? (
                  <div className="value">
                    {Number(stakingReward).toLocaleString(undefined, {
                      minimumFractionDigits: 5,
                      maximumFractionDigits: 5,
                    })}{" "}
                    <JfinCoin />
                  </div>
                ) : (
                  <div>RECOVERY REWARD</div>
                )}
                <button
                  className="button secondary lg"
                  disabled={
                    (!store.walletAccount || !stakingReward) &&
                    !forceActionButtonsEnabled
                  }
                  onClick={() =>
                    forceActionButtonsEnabled
                      ? handleClaimRecovery()
                      : handleClaim()
                  }
                  type="button"
                >
                  {isLoading ? <LoadingOutlined spin /> : "Claim"}
                </button>
              </div>
            </div>
          </Col>
          <Col className="staking" lg={10} sm={24} xs={24}>
            {!forceActionButtonsEnabled && (
              <div className="validator-collapse-content-card">
                <span className="col-title">Staked</span>
                <div>
                  <div className="value">
                    {Number(stakingAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <JfinCoin />
                  </div>
                  <div>
                    <div style={{ textAlign: "right" }}>
                      {store.getValidatorStatus(validator!.status).status ===
                        "Active" && (
                        <button
                          className="button secondary lg"
                          disabled={!store.walletAccount || !!stakingReward}
                          onClick={handleAdd}
                          type="button"
                        >
                          <PlusOutlined />
                        </button>
                      )}

                      <button
                        className="button secondary lg"
                        disabled={!store.walletAccount || !!stakingReward}
                        onClick={handleUnStaking}
                        style={{ marginLeft: "10px" }}
                        type="button"
                      >
                        <MinusOutlined />
                      </button>
                    </div>
                    {stakingReward ? (
                      <div
                        style={{
                          marginTop: "5px",
                          marginLeft: "1rem",
                          fontSize: "0.7rem",
                          textAlign: "right",
                          opacity: 0.75,
                          lineHeight: 1,
                        }}
                      >
                        <span>
                          Please claim all pending reward before staking.
                        </span>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  }
);

export default ValidatorCollapseContent;
