import './Staking.css'
import { LockOutlined } from '@ant-design/icons'
import ValidatorInfo from '@/components/ValidatorInfo/ValidatorInfo'
import Validators from '@/components/Validator/Validators'

const Staking = () => {
  /* --------------------------------- States --------------------------------- */

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
            <Validators />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Staking
