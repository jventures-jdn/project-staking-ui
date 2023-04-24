import { IChainConfig, IChainParams } from 'jfin-staking-sdk'
import { Col, Row } from 'antd'
import { useEffect, useState } from 'react'
import { useBasStore } from '../../stores'
import prettyTime from 'pretty-time'
import './BlockInfo.css'
import { observer } from 'mobx-react'
import { LoadingOutlined, WarningOutlined } from '@ant-design/icons'
import { useAccount } from 'wagmi'
import { ChainConfig } from '@utils/chain/src/contract'

const BlockInfo = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { isDisconnected } = useAccount()
  const {
    activeValidatorsLength,
    blockNumber,
    epoch,
    endBlock,
    epochBlockInterval,
    blockTimeSec,
    nextEpochIn,
  } = ChainConfig

  const store = useBasStore()
  const [chainInfo, setChainInfo] = useState<
    (IChainConfig & IChainParams) | undefined
  >()

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const fetchChain = async () => {
    const data = await store.getChainConfig()
    setChainInfo(data)
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!store.isConnected) return
    fetchChain()
    const inital = async () => {
      setInterval(async () => {
        fetchChain()
      }, 5000)
    }
    inital()
  }, [store.isConnected])

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="block-info-container">
      {/* show alert message incase not connect metamask */}
      {isDisconnected && (
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
                  {blockNumber?.toLocaleString() || <LoadingOutlined spin />}
                </span>
              </div>
              <div>
                <b> Current Epoch: </b>
                <span>
                  {epoch?.toLocaleString() || <LoadingOutlined spin />}
                </span>
              </div>
              <div>
                <b> Next Epoch Block: </b>
                {endBlock ? (
                  <span>
                    {endBlock?.toLocaleString()} ({nextEpochIn})
                  </span>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>
              <div>
                <b>Block Time: </b>
                {blockTimeSec || <LoadingOutlined spin />} Sec
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
                  {activeValidatorsLength || <LoadingOutlined spin />}
                </span>
              </div>
              <div>
                <b>Epoch Block Interval: </b>
                {epochBlockInterval || <LoadingOutlined spin />}

                {/* {prettyTime(epochBlockInterval * blockTime * 1e9, 'm')}) */}
                {/* {prettyTime(
                      chainInfo.epochBlockInterval * chainInfo.blockTime * 1e9,
                      'm',
                    )} */}
                {/* {chainInfo?.epochBlockInterval ? (
                  <span>
                    {chainInfo?.epochBlockInterval.toLocaleString()}(
                    {prettyTime(
                      chainInfo.epochBlockInterval * chainInfo.blockTime * 1e9,
                      'm',
                    )}
                    )
                  </span>
                ) : (
                  <LoadingOutlined spin />
                )} */}
              </div>
              <div>
                <b>Penalty Threshold: </b>
                <span>
                  {chainInfo?.felonyThreshold || <LoadingOutlined spin />}
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
                {chainInfo?.validatorJailEpochLength ? (
                  <span>
                    {chainInfo?.validatorJailEpochLength} (
                    {prettyTime(
                      chainInfo.validatorJailEpochLength *
                        chainInfo.epochBlockInterval *
                        chainInfo.blockTime *
                        1e9,
                      'm',
                    )}
                    )
                  </span>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>

              <div>
                <b>Undelegate Period: </b>
                {chainInfo?.undelegatePeriod ? (
                  <span>
                    {chainInfo?.undelegatePeriod}(
                    {prettyTime(
                      chainInfo.undelegatePeriod *
                        chainInfo.epochBlockInterval *
                        chainInfo.blockTime *
                        1e9,
                      'm',
                    )}
                    )
                  </span>
                ) : (
                  <LoadingOutlined spin />
                )}
              </div>
              <div>
                <b>Min Validator Stake Amount: </b>
                <span>
                  {chainInfo?.minValidatorStakeAmount.toString(10) || (
                    <LoadingOutlined spin />
                  )}
                </span>
              </div>
              <div>
                <b>Min Staking Amount: </b>
                <span>
                  {chainInfo?.minStakingAmount.toString(10) || (
                    <LoadingOutlined spin />
                  )}
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
