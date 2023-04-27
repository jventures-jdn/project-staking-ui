import { Provider } from 'mobx-react'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import reportWebVitals from './reportWebVitals'
import { Web3Modal } from '@web3modal/react'
import {
  Chain,
  WagmiConfig,
  configureChains,
  createClient,
  useConnect,
  useContract,
  useClient,
} from 'wagmi'
import { getConfig, useWallectConnect } from './stores'
import GlobalModal from './components/Modal/GlobalModal'
import * as Sentry from '@sentry/react'
import './index.css'
import './assets/css/button.css'
import './assets/css/healper.css'
import './assets/css/input.css'
import './assets/css/pagination.css'
import './assets/css/modal.css'
import { BrowserRouter } from 'react-router-dom'

Sentry.init({
  dsn:
    process.env.NODE_ENV === 'production'
      ? 'https://6fdd78509c3e443f85dffd333976349e@o4505033136537600.ingest.sentry.io/4505033142108160'
      : '',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.0 : 0.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  environment: `${process.env.REACT_APP_ENVIRONMENT}_${process.env.NODE_ENV}`,
  attachStacktrace: true,
})

const Main = () => {
  /* --------------------------------- States --------------------------------- */
  const { projectId, ethereumClient, chains, wagmiClient } = useWallectConnect()

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Provider>
          <WagmiConfig client={wagmiClient}>
            <GlobalModal />
            <App />
          </WagmiConfig>
          <Web3Modal
            projectId={projectId}
            ethereumClient={ethereumClient}
            themeVariables={{
              '--w3m-accent-color': '#ed0000',
              '--w3m-accent-fill-color': '#fff',
              '--w3m-background-color': ' #0b0d0f',
            }}
            chainImages={{ 3501: '/jfin-light.png' }}
            tokenImages={{ JFIN: '/jfin-light.png' }}
            defaultChain={chains[0]}
          />
        </Provider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
ReactDOM.render(<Main />, document.getElementById('root'))

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
