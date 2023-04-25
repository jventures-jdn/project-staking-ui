import { Col, Row } from 'antd'
import { useEffect } from 'react'
import './BlockInfo.css'
import { observer } from 'mobx-react'
import { LoadingOutlined, WarningOutlined } from '@ant-design/icons'
import { useAccount } from 'wagmi'
import prettyTime from 'pretty-time'
import { useChainConfig } from '@utils/chain/src/contract'

const BlockInfo = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { isConnected } = useAccount()
  const config = useChainConfig()

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    config.fetch()
  }, [])

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="block-info-container">
      {/* show alert message incase not connect metamask */}
      {!isConnected && (
        <div className="wallet-warning" style={{ textAlign: 'right' }}>
          <span> Please connect wallet for staking </span>
          <WarningOutlined />
        </div>
      )}

      <Row gutter={[24, 12]}>
        <Col className="block-info-item" lg={8} sm={24} xs={24}>
          <div className="block-info-item-wrapper">
            <div className="block-info-item-content">
              <div>
                <b>Block Number: </b>
                <span>
                  {config.blockNumber?.toLocaleString() || (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b> Current Epoch: </b>
                <span>
                  {config.epoch?.toLocaleString() || <LoadingOutlined spin />}
                </span>
              </div>
              <div>
                <b> Next Epoch Block: </b>
                {config.endBlock ? (
                  <span>
                    {config.endBlock?.toLocaleString()} (
                    {config.nextEpochIn &&
                      prettyTime(config.nextEpochIn * 10e8, 's')}
                    )
                  </span>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>
              <div>
                <b>Block Time: </b>
                {config.blockSec || <LoadingOutlined spin />}s
              </div>
            </div>
          </div>
        </Col>
        <Col className="block-info-item" lg={8} sm={24} xs={24}>
          <div className="block-info-item-wrapper">
            <div className="block-info-item-content">
              <div>
                <b>Active Validators Length: </b>
                <span>
                  {config.activeValidatorsLength || <LoadingOutlined spin />}
                </span>
              </div>
              <div>
                <b>Epoch Block Interval: </b>
                {config.epochBlockInterval ? (
                  <>
                    <span>{config.epochBlockInterval}</span>
                    <span>
                      (
                      {config.epochBlockIntervalSec &&
                        prettyTime(config.epochBlockIntervalSec * 10e8, 'h')}
                      )
                    </span>
                  </>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>
              <div>
                <b>Penalty Threshold: </b>
                <span>
                  {config.felonyThreshold || <LoadingOutlined spin />}
                </span>
              </div>
            </div>
          </div>
        </Col>
        <Col className="block-info-item" lg={8} sm={24} xs={24}>
          <div className="block-info-item-wrapper">
            <div className="block-info-item-content">
              <div>
                <b>Validator Jail Epoch Length: </b>
                {config.validatorJailEpochLength ? (
                  <>
                    <span>{config.validatorJailEpochLength}</span>
                    <span>
                      (
                      {config.validatorJailIntervalSec &&
                        prettyTime(config.validatorJailIntervalSec * 10e8, 'h')}
                      )
                    </span>
                  </>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>

              <div>
                <b>Undelegate Period: </b>
                {config.undelegatePeriod ? (
                  <>
                    <span>{config.undelegatePeriod}</span>
                    <span>
                      (
                      {config.undelegateIntervalSec &&
                        prettyTime(config.undelegateIntervalSec * 10e8, 'h')}
                      )
                    </span>
                  </>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>
              <div>
                <b>Min Validator Stake Amount: </b>
                <span>
                  {config.minValidatorStakeAmount || <LoadingOutlined spin />}
                </span>
              </div>
              <div>
                <b>Min Staking Amount: </b>
                <span>
                  {config.minStakingAmount || <LoadingOutlined spin />}
                </span>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
})

export default BlockInfo
