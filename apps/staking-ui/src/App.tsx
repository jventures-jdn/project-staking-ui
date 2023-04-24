import { observer } from 'mobx-react'
import React, { Suspense, useEffect } from 'react'
import CookieConsent from 'react-cookie-consent'

import BlockInfo from './components/BlockInfo/BlockInfo'
import Conditions from './components/Conditions'
import {
  useAccount,
  useBlockNumber,
  useClient,
  useConnect,
  useContract,
} from 'wagmi'
import { getConfig, useBasStore } from './stores'
import Navbar from './components/Navbar/Navbar'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { fetchBlockNumber, readContracts } from 'wagmi/actions'

const Staking = React.lazy(() => import('./pages/Staking/Staking'))
const Governance = React.lazy(() => import('./pages/Governance/Governance'))
const Assets = React.lazy(() => import('./pages/Assets/Assets'))
const config = getConfig()

const App = observer(() => {
  /* --------------------------------- States --------------------------------- */
  const store = useBasStore()
  const client = useClient()

  const { address, isConnected } = useAccount()

  // const { data } = useBlockNumber()

  // const { data, isError, isLoading } = useBlockNumber()
  // const contract = useContract({
  //   address: config.chainConfigAddress,
  //   abi: CHAIN_CONFIG_ABI,
  // })

  // const contract2 = useContract({
  //   ...chainConfigObject,
  // })

  // contract2?.getActiveValidatorsLength()

  /* --------------------------------- Watches -------------------------------- */
  // useEffect(() => {
  //   fetch()
  // }, [])

  // const fetch = async () => {
  //   console.log(await fetchBlockNumber())
  // }

  // useEffect(() => {
  //   if (!isConnected) return;
  //   if (!window.ethereum) {
  //     switchNetwork({ chainId: config.chainId });
  //   }
  // }, [isConnected]);

  // const fetch = async () => {
  //   const chainConfigObject2 = {
  //     address: config.chainConfigAddress as Address,
  //     abi: CHAIN_CONFIG_ABI,
  //   }
  //   const [
  //     _activeValidatorsLength,
  //     _epochBlockInterval,
  //     _misdemeanorThreshold,
  //     _felonyThreshold,
  //     _validatorJailEpochLength,
  //     _undelegatePeriod,
  //     _minValidatorStakeAmount,
  //     _minStakingAmount,
  //   ] = await readContracts({
  //     contracts: [
  //       {
  //         ...chainConfigObject2,
  //         functionName: 'getActiveValidatorsLength',
  //       },
  //       { ...chainConfigObject2, functionName: 'getEpochBlockInterval' },
  //       { ...chainConfigObject2, functionName: 'getMisdemeanorThreshold' },
  //       { ...chainConfigObject2, functionName: 'getFelonyThreshold' },
  //       { ...chainConfigObject2, functionName: 'getValidatorJailEpochLength' },
  //       { ...chainConfigObject2, functionName: 'getUndelegatePeriod' },
  //       { ...chainConfigObject2, functionName: 'getMinValidatorStakeAmount' },
  //       { ...chainConfigObject2, functionName: 'getMinStakingAmount' },
  //     ],
  //   })

  //   console.log(_activeValidatorsLength)
  // }

  // useEffect(() => {
  //   ChainConfig.fetch().then((resp) => console.log(resp))
  // }, [])

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <div className="app-container">
      <Navbar />
      <div className="body">
        <BlockInfo />
        <Switch>
          <Suspense fallback={'loading...'}>
            <Route key="staking" path={['/', '/staking']} exact>
              <Staking />
            </Route>
            <Route key="governance" path="/governance">
              <Governance />
            </Route>
            <Route key="assets" path="/assets">
              <Assets />
            </Route>
          </Suspense>
        </Switch>
      </div>

      {/* {process.env.NODE_ENV === 'production' && (
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
      )} */}
    </div>
  )
})

export default App
