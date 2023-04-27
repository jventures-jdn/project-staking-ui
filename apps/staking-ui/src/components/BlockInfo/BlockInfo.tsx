import { Col, Row } from 'antd'
import { useEffect, useMemo } from 'react'
import './BlockInfo.css'
import { observer } from 'mobx-react'
import { LoadingOutlined, WarningOutlined } from '@ant-design/icons'
import { useAccount } from 'wagmi'
import prettyTime from 'pretty-time'
import { useChainConfig } from '@utils/chain/src/contract'
import CountUpMemo from '../Countup'

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
    await chainConfig.fetchChainConfig()

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

  useMemo(() => {}, [chainConfig.blockNumber])

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
                  {chainConfig.blockNumber ? (
                    <CountUpMemo duration={1} end={chainConfig.blockNumber} />
                  ) : (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b> Current Epoch: </b>
                <span>
                  {chainConfig.epoch ? (
                    <CountUpMemo duration={1} end={chainConfig.epoch} />
                  ) : (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b> Next Epoch Block: </b>
                {chainConfig.endBlock ? (
                  <span>
                    {<CountUpMemo duration={1} end={chainConfig.endBlock} />}(
                    {
                      <CountUpMemo
                        duration={1}
                        end={chainConfig.nextEpochIn * 10e8}
                        formattingFn={(v) => prettyTime(v, 's')}
                      />
                    }
                    )
                  </span>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>
              <div>
                <b>Block Time: </b>
                {chainConfig.blockSec ? (
                  <CountUpMemo duration={1} end={chainConfig.blockSec} />
                ) : (
                  <LoadingOutlined spin />
                )}
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
                  {chainConfig.activeValidatorsLength ? (
                    <CountUpMemo
                      duration={1}
                      end={chainConfig.activeValidatorsLength}
                    />
                  ) : (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b>Epoch Block Interval: </b>
                {chainConfig.epochBlockInterval ? (
                  <>
                    <span>
                      <CountUpMemo
                        duration={1}
                        end={chainConfig.epochBlockInterval}
                      />
                    </span>
                    <span>
                      (
                      <CountUpMemo
                        duration={1}
                        end={chainConfig.epochBlockIntervalSec * 10e8}
                        formattingFn={(v) => prettyTime(v, 'm')}
                      />
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
                  {chainConfig.felonyThreshold ? (
                    <CountUpMemo
                      duration={1}
                      end={chainConfig.felonyThreshold}
                    />
                  ) : (
                    <LoadingOutlined spin />
                  )}
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
                    <span>
                      <CountUpMemo
                        duration={1}
                        end={chainConfig.validatorJailEpochLength}
                        useEasing
                      />
                    </span>
                    <span>
                      (
                      <CountUpMemo
                        duration={1}
                        end={chainConfig.validatorJailIntervalSec * 10e8}
                        useEasing
                        formattingFn={(v) => prettyTime(v, 'm')}
                      />
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
                    <span>
                      <CountUpMemo
                        duration={1}
                        end={chainConfig.undelegatePeriod}
                        useEasing
                      />
                    </span>
                    <span>
                      (
                      <CountUpMemo
                        duration={1}
                        end={chainConfig.undelegateIntervalSec * 10e8}
                        formattingFn={(v) => prettyTime(v, 'm')}
                      />
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
