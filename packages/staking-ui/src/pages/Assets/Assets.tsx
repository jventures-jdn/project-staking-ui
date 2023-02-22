import {
  ClockCircleOutlined,
  LoadingOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import "./Assets.css";
import MyValidators from "src/components/MyValidators/MyValidators";
import StakingHistory from "src/components/StakingHistory/StakingHistory";
import { useBasStore } from "src/stores";
import { useEffect, useMemo, useState } from "react";
import { IValidator } from "@ankr.com/bas-javascript-sdk";
import { observer } from "mobx-react";
import JfinCoin from "src/components/JfinCoin/JfinCoin";

export interface IMyValidators {
  amount: number;
  event?: unknown;
  validatorProvider: IValidator;
  validator: string;
  reward: number;
  staker: string;
  epoch: number;
}
const Assets = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const store = useBasStore();
  const [myValidators, setMyValidators] = useState<IMyValidators[]>();
  const [stakingHistory, setStakingHistory] =
    useState<IMyTransactionHistory[]>();
  const [totalReward, setTotalReward] = useState<number>(0);
  const [totalStaked, setTotalStaked] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const inital = async () => {
    setLoading(true);
    setMyValidators(await store.getMyValidator());
    setStakingHistory(await store.getMyTransactionHistory());
    setLoading(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    inital();
    setLoading(false);
  };
  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!store.walletAccount) return;
    inital();
  }, [store.walletAccount]);

  // timeout --> show empty msg or data
  useEffect(() => {
    setTimeout(() => {
      if (loading) setLoading(false);
    }, 7000);
  }, [loading]);

  useMemo(() => {
    if (!myValidators || !myValidators.length) return;
    setTotalReward(myValidators.reduce((p, c) => p + c.reward, 0));
    setTotalStaked(myValidators.reduce((p, c) => p + c.amount, 0));
  }, [myValidators]);

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="assets-container">
      <div
        className=""
        style={{
          display: "grid",
          columnGap: "20px",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div className="content-card">
          <div className="card-title">
            <b>
              <span>Your total staking</span>
            </b>
          </div>
          <div className="card-body">
            <div
              style={{
                background: "#16191d",
                padding: "1rem",
                borderRadius: "10px",
                textAlign: "center",
                fontSize: "1.5rem",
                fontWeight: "bold",
                height: "70px",
              }}
            >
              {loading ? (
                <LoadingOutlined spin />
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {totalStaked.toLocaleString(undefined, {
                    minimumFractionDigits: 5,
                    maximumFractionDigits: 5,
                  })}
                  <JfinCoin />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="content-card">
          <div className="card-title">
            <b>
              <span>Your total reward</span>
            </b>
          </div>
          <div className="card-body">
            <div
              style={{
                background: "#16191d",
                padding: "1rem",
                borderRadius: "10px",
                fontSize: "1.5rem",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "70px",
              }}
            >
              {loading ? (
                <LoadingOutlined spin />
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {totalReward.toLocaleString(undefined, {
                    minimumFractionDigits: 5,
                    maximumFractionDigits: 5,
                  })}
                  <JfinCoin />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="content-card mt-2">
        <div className="card-title">
          <b>
            <WalletOutlined /> <span>Your Staking</span>
          </b>
        </div>
        <div className="card-body">
          <MyValidators
            loading={loading}
            refresh={handleRefresh}
            validators={myValidators}
          />
        </div>
      </div>

      <div className="content-card mt-2">
        <div className="card-title">
          <b>
            <ClockCircleOutlined /> <span>History</span>
          </b>
        </div>
        <div className="card-body" id="view-point3">
          <StakingHistory data={stakingHistory} loading={loading} />
        </div>
      </div>
    </div>
  );
});

export default Assets;
