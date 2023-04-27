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
  const chainConfig = useChainConfig()

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const initial = async () => {
    await chainConfig.getChainConfig()

    setInterval(() => {
      chainConfig.updateChainConfig()
    }, 5000)
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    initial()
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
                  {chainConfig.blockNumber?.toLocaleString() || (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b> Current Epoch: </b>
                <span>
                  {chainConfig.epoch?.toLocaleString() || (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b> Next Epoch Block: </b>
                {chainConfig.endBlock ? (
                  <span>
                    {chainConfig.endBlock?.toLocaleString()} (
                    {chainConfig.nextEpochIn &&
                      prettyTime(chainConfig.nextEpochIn * 10e8, 's')}
                    )
                  </span>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>
              <div>
                <b>Block Time: </b>
                {chainConfig.blockSec || <LoadingOutlined spin />}s
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
                  {chainConfig.activeValidatorsLength || (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b>Epoch Block Interval: </b>
                {chainConfig.epochBlockInterval ? (
                  <>
                    <span>{chainConfig.epochBlockInterval}</span>
                    <span>
                      (
                      {chainConfig.epochBlockIntervalSec &&
                        prettyTime(
                          chainConfig.epochBlockIntervalSec * 10e8,
                          'h',
                        )}
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
                  {chainConfig.felonyThreshold || <LoadingOutlined spin />}
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
                {chainConfig.validatorJailEpochLength ? (
                  <>
                    <span>{chainConfig.validatorJailEpochLength}</span>
                    <span>
                      (
                      {chainConfig.validatorJailIntervalSec &&
                        prettyTime(
                          chainConfig.validatorJailIntervalSec * 10e8,
                          'h',
                        )}
                      )
                    </span>
                  </>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>

              <div>
                <b>Undelegate Period: </b>
                {chainConfig.undelegatePeriod ? (
                  <>
                    <span>{chainConfig.undelegatePeriod}</span>
                    <span>
                      (
                      {chainConfig.undelegateIntervalSec &&
                        prettyTime(
                          chainConfig.undelegateIntervalSec * 10e8,
                          'h',
                        )}
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
                  {chainConfig.minValidatorStakeAmount || (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b>Min Staking Amount: </b>
                <span>
                  {chainConfig.minStakingAmount || <LoadingOutlined spin />}
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
