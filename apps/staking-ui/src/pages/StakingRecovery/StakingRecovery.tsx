import '../Staking/Staking.css'
import { LockOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import ValidatorInfo from '@/components/Validator/ValidatorInfo/ValidatorInfo'
import Validators from '@/components/Validator/Validators/Validators'

const StakingRecovery = observer(() => {
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
          <ValidatorInfo />

          <div id="view-point1" style={{ paddingTop: '2rem' }}>
            <Validators forceActionButtonsEnabled={true} />
          </div>
        </div>
      </div>
    </div>
  )
})

export default StakingRecovery
