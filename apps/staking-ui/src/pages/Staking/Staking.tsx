import './Staking.css'
import { LockOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { useMemo, useState } from 'react'
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
  const [loading, setLoading] = useState(false)
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
    setLoading(true)
    const validatorEvents = await chainStaking.getAllValidatorEvents()
    const validators = await chainStaking.getValidators(validatorEvents)
    setValidators(validators)
    setActiveValidators(chainStaking.activeValidator)
    setTotalDelegated(chainStaking.totalDelegated.toNumber())
    setLoading(false)
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */

  // on connected or disconnected re-initial
  useMemo(() => {
    initial()
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
            isLoading={loading}
            totalValidators={validators?.length || 0}
          />

          <div id="view-point1">
            <Validators validators={activeValidators} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Staking
