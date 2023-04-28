import './Staking.css'
import { LockOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import { useChainStaking } from '@utils/chain/src/contract'
import ValidatorInfo from '@/components/ValidatorInfo/ValidatorInfo'
import Validators from '@/components/Validator/Validators'

const Staking = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const chainStaking = useChainStaking()
  const [totalDelegated, setTotalDelegated] = useState(0)
  const [validators, setValidators] = useState(chainStaking.validators)
  const [activeValidators, setActiveValidators] = useState<
    typeof chainStaking.validators
  >([])

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const initial = async () => {
    setValidators(chainStaking.validators)
    setActiveValidators(chainStaking.activeValidator)
    setTotalDelegated(chainStaking.totalDelegated.toNumber())
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!chainStaking.validators.length) return
    initial()
  }, [chainStaking.validators])

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
