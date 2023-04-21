import {Divider} from "antd";
import {observer} from "mobx-react";
import {ReactElement} from "react";
import {AccountData} from "./components/AccountData";
import ClaimableAssets from "./components/ClaimableAssets/ClaimableAssets";
import DelegatedAssets from "./components/DelegatedAssets/DelegatedAssets";
import StakingHistory from "./components/StakingHistory/StakingHistory";
import '../index.css';

export const StakingNav = observer((): ReactElement => {
  return (
    <div>
      <AccountData/>
      <Divider/>
      <DelegatedAssets/>
      <Divider/>
      <ClaimableAssets/>
      <Divider/>
      <StakingHistory/>
    </div>
  );
})