import { observer } from 'mobx-react'
import React, { Suspense, useEffect, useMemo } from 'react'
import BlockInfo from './components/Layout/BlockInfo/BlockInfo'
import Conditions from './components/Conditions'
import Navbar from './components/Layout/Navbar/Navbar'
import { Route, Switch } from 'react-router-dom'
import CookieConsent from 'react-cookie-consent'
import {
  chainGovernance,
  useChainAccount,
  useChainConfig,
  useChainStaking,
} from '@utils/chain/src/contract'
import { getProvider } from 'wagmi/actions'
import { useAccount, useNetwork } from 'wagmi'
import Footer from './components/Layout/Footer/Footer'

const Staking = React.lazy(() => import('./pages/Staking/Staking'))
const StakingRecovery = React.lazy(
  () => import('./pages/StakingRecovery/StakingRecovery'),
)
const Governance = React.lazy(() => import('./pages/Governance/Governance'))
const Assets = React.lazy(() => import('./pages/Assets/Assets'))

const App = observer(() => {
  /* --------------------------------- States --------------------------------- */

  const chainConfig = useChainConfig()
  const chainStaking = useChainStaking()
  const chainAccount = useChainAccount()
  const provider = getProvider()
  const { chain } = useNetwork()
  const { address } = useAccount()

  /* --------------------------------- Methods -------------------------------- */
  const initialChainConfig = async () => {
    await chainConfig.fetchChainConfig()
    setInterval(() => {
      chainConfig.updateChainConfig()
    }, 5000)
  }

  const initialChainStaking = async () => {
    chainStaking.setProvider(provider)
    await chainStaking.fetchValidators()
  }

  const initialChainAccount = async () => {
    await chainAccount.getAccount()
    await chainAccount.fetchBalance()
  }

  const initialChainGovernance = async () => {
    chainGovernance.setProvider(provider)
  }

  /* --------------------------------- Watches -------------------------------- */
  useEffect(() => {
    initialChainConfig()
    initialChainStaking()
    initialChainAccount()
    initialChainGovernance()
  }, [])

  // on connected or disconnected update validators & account
  useMemo(() => {
    initialChainAccount()
    if (!chainStaking.validators?.length) return
    chainStaking.setProvider(provider)
    chainStaking.updateValidators()
  }, [address, chain?.id])

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <div className="app-container">
      <Navbar />
      <div className="body">
        <BlockInfo />
        <Switch>
          <Suspense fallback={''}>
            <Route key="staking" path={['/', '/staking']} exact>
              <Staking />
            </Route>
            <Route key="governance" path="/governance">
              <Governance />
            </Route>
            <Route key="assets" path="/assets">
              <Assets />
            </Route>
            <Route
              key="staking-recovery"
              exact
              component={StakingRecovery}
              path="/staking-recovery"
            />
          </Suspense>
        </Switch>
      </div>
      <Footer />

      {process.env.NODE_ENV === 'production' && (
        <CookieConsent
          overlay
          buttonStyle={{
            color: '#fff',
            backgroundColor: '#c60000',
            fontSize: '13px',
            borderRadius: '30px',
            padding: '4px 16px',
            margin: 'auto',
          }}
          buttonText="ยอมรับข้อตกลง"
          contentClasses="condition-page"
          contentStyle={{
            margin: '0',
            display: 'block',
            flex: 'none',
            with: 'auto',
          }}
          cookieName="jfinstk"
          expires={365}
          location="top"
          style={{
            background: '#2e3338',
            display: 'block',
            padding: '32px',
            maxWidth: '600px',
            position: 'relative',
            margin: '20px auto',
            borderRadius: '16px',
          }}
        >
          <Conditions />
        </CookieConsent>
      )}
    </div>
  )
})

export default App
