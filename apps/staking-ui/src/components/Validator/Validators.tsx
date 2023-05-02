import { Col, Collapse, Row } from 'antd'
import { observer } from 'mobx-react'
import './Validators.css'
import { LoadingOutlined } from '@ant-design/icons'
import ValidatorCollapseHeader from './ValidatorCollapseHeader'
import { getCurrentEnv } from '../../stores'
import { chainStaking } from '@utils/chain/src/contract'
import ValidatorCollapseContent from './ValidatorCollapseContent'

interface IValidatorsProps {
  validators: typeof chainStaking.validators
  loading: boolean
  forceActionButtonsEnabled?: boolean
}

const Validators = observer(
  ({ validators, loading, forceActionButtonsEnabled }: IValidatorsProps) => {
    /* -------------------------------------------------------------------------- */
    /*                                   States                                   */
    /* -------------------------------------------------------------------------- */
    const { Panel } = Collapse
    const loadingValidator = Array.from(
      Array(getCurrentEnv() === 'jfin' ? 7 : 3).keys(),
    ).map((v, i) => (
      <Panel
        key={`loading-validator-${i + 1}`}
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
    ))

    return (
      <div className="validators-container">
        <div className="validators-wrapper">
          <Collapse ghost bordered={false}>
            {validators && !loading
              ? validators.map((validator, index) => {
                  return (
                    <Panel
                      key={`validator-${index + 1}`}
                      className="validators-item"
                      header={<ValidatorCollapseHeader validator={validator} />}
                    >
                      <ValidatorCollapseContent
                        validator={validator}
                        forceActionButtonsEnabled={forceActionButtonsEnabled}
                      />
                    </Panel>
                  )
                })
              : loadingValidator}
          </Collapse>
        </div>
      </div>
    )
  },
)

export default Validators
