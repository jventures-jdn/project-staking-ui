import './Staking.css'
import { LockOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { useChainStaking } from '@utils/chain/src/contract'
import ValidatorInfo from '@/components/ValidatorInfo/ValidatorInfo'
import Validators from '@/components/Validator/Validators'

const Staking = observer(() => {
  /* --------------------------------- States --------------------------------- */
  const chainStaking = useChainStaking()

  /* ---------------------------------- Doms ---------------------------------- */
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
            activeValidators={chainStaking.activeValidator?.length || 0}
            totalDelegated={chainStaking.totalStake.toNumber()}
            isLoading={chainStaking.isFetchingValidators}
            totalValidators={chainStaking.validators?.length || 0}
          />

          <div id="view-point1">
            <Validators
              validators={chainStaking.activeValidator}
              loading={chainStaking.isFetchingValidators}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

export default Staking
