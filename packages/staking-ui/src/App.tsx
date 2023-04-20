import { observer } from "mobx-react";
import React, { Suspense, useEffect } from "react";
import CookieConsent from "react-cookie-consent";
import { Route, Switch } from "react-router-dom";
import Navbar from "src/components/Navbar/Navbar";
import BlockInfo from "./components/BlockInfo/BlockInfo";
import Conditions from "./components/Conditions";
import GlobalModal from "./components/Modal/GlobalModal";
import { useAccount } from "wagmi";
import { switchNetwork } from "@wagmi/core";
import { getConfig, useBasStore, useWallectConnect } from "./stores";

const Staking = React.lazy(() => import("./pages/Staking/Staking"));
const Governance = React.lazy(() => import("./pages/Governance"));
const Assets = React.lazy(() => import("./pages/Assets/Assets"));
const config = getConfig();

const Main = observer(() => {
  /* --------------------------------- States --------------------------------- */
  const store = useBasStore();
  const { address, isConnected } = useAccount();

  /* --------------------------------- Watches -------------------------------- */
  useEffect(() => {
    store.connectProvider(address);
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    if (!window.ethereum) {
      switchNetwork({ chainId: config.chainId });
    }
  }, [isConnected]);

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <div className="app-container">
      <Navbar />
      <GlobalModal />

      <div className="body">
        <BlockInfo />

        {/* Routes */}
        <Suspense fallback={<div>Loading... </div>}>
          <Switch>
            <Route
              key="staking"
              exact
              component={Staking}
              path={["/", "/staking"]}
            />
            <Route key="governance" component={Governance} path="/governance" />
            <Route key="assets" component={Assets} path="/assets" />
          </Switch>
        </Suspense>
      </div>

      <CookieConsent
        overlay
        buttonStyle={{
          color: "#fff",
          backgroundColor: "#c60000",
          fontSize: "13px",
          borderRadius: "30px",
          padding: "4px 16px",
          margin: "auto",
        }}
        buttonText="ยอมรับข้อตกลง"
        contentClasses="condition-page"
        contentStyle={{
          margin: "0",
          display: "block",
          flex: "none",
          with: "auto",
        }}
        cookieName="jfinstk"
        expires={365}
        location="top"
        style={{
          background: "#2e3338",
          display: "block",
          padding: "32px",
          maxWidth: "600px",
          position: "relative",
          margin: "20px auto",
          borderRadius: "16px",
        }}
      >
        <Conditions />
      </CookieConsent>
    </div>
  );
});

export default Main;
