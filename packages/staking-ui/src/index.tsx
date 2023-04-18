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
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://081561c4434a452fb0fef86b569ec129@o465173.ingest.sentry.io/4505033037053952",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 0.1, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.0 : 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  environment: process.env.NODE_ENV,
  attachStacktrace: true,
});

const App = () => {
  return (
    <React.StrictMode>
      <Provider>
        <BrowserRouter>
          <Main />
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
