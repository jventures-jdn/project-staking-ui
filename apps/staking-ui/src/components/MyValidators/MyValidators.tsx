/* eslint-disable no-nested-ternary */
import { LoadingOutlined } from '@ant-design/icons'
import { Col, Collapse, Row } from 'antd'
import { observer } from 'mobx-react'
import { Link } from 'react-router-dom'
import ValidatorCollapseContent from '../Validator/ValidatorCollapseContent'
import ValidatorCollapseHeader from '../Validator/ValidatorCollapseHeader'
import '../Validator/Validators.css'
import { useChainStaking } from '@utils/chain/src/contract'

const MyValidators = observer(({ loading }: { loading: boolean }) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { Panel } = Collapse
  const chainStaking = useChainStaking()

  /* ---------------------------------- Doms ---------------------------------- */
  const loadingValidator = (
    <Panel
      key="loading-validator"
      className="validators-item"
      header={
        <Row style={{ width: '100%' }}>
          <Col className="item-brand" xs={24} sm={24} md={24} lg={24} xl={24}>
            <div
              className="items-center justify-center"
              style={{ width: '100%', textAlign: 'center', height: '44px' }}
            >
              <LoadingOutlined spin />
            </div>
          </Col>
        </Row>
      }
    />
  )
  const emptyValidator = (
    <Panel
      key="loading-validator"
      className="validators-item"
      header={
        <Row style={{ width: '100%' }}>
          <Col className="item-brand" xs={24} sm={24} md={24} lg={24} xl={24}>
            <div
              className="items-center justify-center"
              style={{ width: '100%', textAlign: 'center', height: '44px' }}
            >
              <Link to="/staking" className="button lg">
                Start Staking
              </Link>
            </div>
          </Col>
        </Row>
      }
    />
  )
  return (
    <div className="my-validators-container">
      <Collapse ghost bordered={false}>
        {loading || chainStaking.isFetchingValidators
          ? loadingValidator
          : !chainStaking.myValidators || !chainStaking.myValidators.length
          ? emptyValidator
          : Object.entries(chainStaking.myValidators).map(
              ([_, validator], index) => (
                <Panel
                  key={`validator-${index + 1}`}
                  className="validators-item"
                  header={<ValidatorCollapseHeader validator={validator} />}
                >
                  <ValidatorCollapseContent validator={validator} />
                </Panel>
              ),
            )}
      </Collapse>
    </div>
  )
})

export default MyValidators
