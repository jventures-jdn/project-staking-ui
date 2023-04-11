import { Provider } from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import "./assets/css/button.css";
import "./assets/css/healper.css";
import "./assets/css/input.css";
import "./assets/css/pagination.css";
import Main from "./App";
import reportWebVitals from "./reportWebVitals";
import { Web3Modal } from "@web3modal/react";
import { WagmiConfig } from "wagmi";
import { useWallectConnect } from "./stores";

const App = () => {
  /* --------------------------------- States --------------------------------- */
  const { wagmiClient, projectId, ethereumClient, chains } =
    useWallectConnect();

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <React.StrictMode>
      <Provider>
        <BrowserRouter>
          <WagmiConfig client={wagmiClient}>
            <Main />
          </WagmiConfig>
          <Web3Modal
            projectId={projectId}
            ethereumClient={ethereumClient}
            themeVariables={{
              "--w3m-accent-color": "#ed0000",
              "--w3m-accent-fill-color": "#fff",
              "--w3m-background-color": " #0b0d0f",
            }}
            chainImages={{ 3501: "/jfin-light.png" }}
            tokenImages={{ JFIN: "/jfin-light.png" }}
            defaultChain={chains[0]}
          />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
