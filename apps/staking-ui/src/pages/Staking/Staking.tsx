import './Staking.css'
import { LockOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useChainStaking } from '@utils/chain/src/contract'
import { getProvider } from 'wagmi/actions'
import ValidatorInfo from '@/components/ValidatorInfo/ValidatorInfo'
import Validators from '@/components/Validator/Validators'
import { useAccount, useNetwork } from 'wagmi'

const Staking = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const provider = getProvider()
  const chainStaking = useChainStaking()
  const [totalDelegated, setTotalDelegated] = useState(0)
  const [validators, setValidators] = useState<typeof chainStaking.validators>(
    [],
  )
  const [activeValidators, setActiveValidators] = useState<
    typeof chainStaking.validators
  >([])

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const initial = async () => {
    chainStaking.setProvider(provider)
    const validators = await chainStaking.fetchValidators()
    setValidators(validators)
    setActiveValidators(chainStaking.activeValidator)
    setTotalDelegated(chainStaking.totalDelegated.toNumber())
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */

  // init validators
  useEffect(() => {
    initial()
  }, [])

  // on connected or disconnected update validators
  useEffect(() => {
    if (!chainStaking.validators?.length) return
    chainStaking.updateValidators()
  }, [isConnected, chain?.id])

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
        <div className="card-body">
          <ValidatorInfo
            activeValidators={activeValidators?.length || 0}
            totalDelegated={totalDelegated}
            isLoading={chainStaking.isFetchingValidators}
            totalValidators={validators?.length || 0}
          />

          <div id="view-point1">
            <Validators
              validators={activeValidators}
              loading={chainStaking.isFetchingValidators}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Staking
