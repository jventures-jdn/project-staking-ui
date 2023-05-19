import { LoadingOutlined } from '@ant-design/icons'
import { Col, Row } from 'antd'
import { observer } from 'mobx-react'
import './ValidatorInfo.css'
import CountUpMemo from '../../Countup'
import { useChainStaking } from '@utils/chain/src/contract'

const ValidatorInfo = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const chainStaking = useChainStaking()
  const loading = chainStaking.isFetchingValidators
  const activeValidators = chainStaking.activeValidator?.length || 0
  const totalDelegated = chainStaking.totalStake.toNumber()
  const totalValidators = chainStaking.activeValidator?.length || 0

  return (
    <div className="validator-info-container">
      <Row className="validator-info-wrapper" gutter={[24, 24]}>
        <Col md={12} xs={24}>
          <div>
            <span>Validators</span>
            {!loading ? (
              <b>
                {activeValidators}/{totalValidators}
              </b>
            ) : (
              <div>
                <LoadingOutlined spin />
              </div>
            )}
          </div>
        </Col>
        <Col md={12} xs={24}>
          <div>
            <span>Bonded Tokens</span>
            {!loading ? (
              <b>{<CountUpMemo end={totalDelegated} duration={1} />}</b>
            ) : (
              <div>
                <LoadingOutlined spin />
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  )
})

export default ValidatorInfo
