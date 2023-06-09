import { Provider } from 'mobx-react'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { Web3Modal } from '@web3modal/react'
import { WagmiConfig } from 'wagmi'
import { useWallectConnect } from './stores'
import GlobalModal from './components/Modal/GlobalModal'
import * as Sentry from '@sentry/react'
import './assets/css/index.css'
import './assets/css/button.css'
import './assets/css/helper.css'
import './assets/css/input.css'
import './assets/css/pagination.css'
import './assets/css/modal.css'
import { BrowserRouter } from 'react-router-dom'

export const isProd =
  process.env.PROD_MODE === '1' || process.env.PROD_MODE === 'true' || false

Sentry.init({
  dsn:
    process.env.NODE_ENV === 'production'
      ? 'https://6fdd78509c3e443f85dffd333976349e@o4505033136537600.ingest.sentry.io/4505033142108160'
      : '',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: isProd ? 1.0 : 0.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: isProd ? 0.0 : 0.0, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: isProd ? 1.0 : 0.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  environment: `${process.env.NETWORK}_${
    isProd ? 'production' : 'development'
  }`,
  attachStacktrace: true,
})

const Main = () => {
  /* --------------------------------- States --------------------------------- */
  const { projectId, ethereumClient, wagmiClient } = useWallectConnect()

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
            chainImages={{ 3501: '/jfin-light.png', 3502: 'jfin-light.png' }}
            tokenImages={{
              JFIN: '/jfin-light.png',
              'JFIN Testnet': 'jfin-light.png',
            }}
            walletImages={{ join: '/jfin-light.png' }}
            mobileWallets={[
              {
                id: 'join',
                name: 'Join',
                links: {
                  native: '',
                  universal: isProd
                    ? 'https://jfinwallet.page.link'
                    : 'https://joinwalletdev.page.link',
                },
              },
            ]}
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
