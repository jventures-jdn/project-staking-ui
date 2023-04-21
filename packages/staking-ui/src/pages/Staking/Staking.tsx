import "./Staking.css";
import { LockOutlined } from "@ant-design/icons";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";

const Staking = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  // const store = useBasStore();
  // const [activeValidators, setActiveValidators] = useState(0);
  // const [validators, setValidators] = useState<IValidator[]>();
  // const [totalValidators, setTotalValidators] = useState(0);
  // const [bondedTokens, setBondedTokens] = useState("N/A");
  // const [isLoading, setIsLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  // const inital = async () => {
  //   const currentValidators = await store
  //     .getBasSdk()
  //     .getStaking()
  //     .getAllValidators();
  //   const filterValidators = currentValidators.filter((v) =>
  //     [ statusToStatusId('ACTIVE'), statusToStatusId('JAILED')].includes(
  //       v.status
  //     )
  //   );

  //   const active = await filterValidators.filter((v) => v.status === statusToStatusId('ACTIVE'));
  //   const totalDelegatedTokens = await store
  //     .getBasSdk()
  //     .getStaking()
  //     .getTotalDelegatedAmount();

  //   setValidators(filterValidators);
  //   setBondedTokens(totalDelegatedTokens.toFixed());
  //   setTotalValidators(filterValidators.length);
  //   setActiveValidators(active.length);
  //   setIsLoading(false);
  // };

  // const handleRefresh = async () => {
  //   setIsLoading(true);
  //   inital();
  //   setIsLoading(false);
  // };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  // useEffect(() => {
  //   if (store.isConnected) {
  //     inital();
  //   }

  //   // on unmounted
  //   return () => {
  //     setIsLoading(true);
  //   };
  // }, [store.isConnected]);

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="staking-container">
      <div className="content-card">
        <div className="card-title">
          <b>
            <LockOutlined /> <span>Validators</span>
          </b>
        </div>
        {/* <div className="card-body">
          <ValidatorInfo
            activeValidators={activeValidators}
            bondedTokens={bondedTokens}
            isLoading={isLoading}
            totalValidators={totalValidators}
          />

          <div id="view-point1">
            <Validators
              validators={validators}
              refresh={handleRefresh}
              loading={isLoading}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
});

export default Staking;
