
import {
  MinusOutlined,
  PlusOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Col, Row } from 'antd'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'react'
import { getCurrentEnv,  useModalStore } from '../../stores'
import JfinCoin from '../JfinCoin/JfinCoin'
import AddStakingContent from '../Modal/content/AddStakingContent'
import ClaimStakingContent from '../Modal/content/ClaimStakingContent'
import UnStakingContent from '../Modal/content/UnStakingContent'
import './ValidatorCollapseContent.css'
import { Validator, chainStaking } from '@utils/chain/src/contract'
import CountUpMemo from '../Countup'
import { useAccount } from 'wagmi'

interface IValidatorCollapseContentProps {
  validator: Validator
}

const ValidatorCollapseContent = observer(
  ({ validator }: IValidatorCollapseContentProps) => {
    /* -------------------------------------------------------------------------- */
    /*                                   States                                   */
    /* -------------------------------------------------------------------------- */
    const { isConnected } = useAccount()
    const modalStore = useModalStore()
    const [loading, setLoading] = useState(true)
    const [apr, setApr] = useState<number>(0)
    const [myStakingReward, setMyStakingReward] = useState<BigNumber>(
      BigNumber(0),
    )
    const [myStakingAmount, setMyStakingAmount] = useState<BigNumber>(
      BigNumber(0),
    )

    /* -------------------------------------------------------------------------- */
    /*                                   Methods                                  */
    /* -------------------------------------------------------------------------- */
    const inital = async () => {
      setLoading(true)
      setMyStakingReward(await chainStaking.getMyStakingRewards(validator))
      setMyStakingAmount(await chainStaking.getMyStakingAmount(validator))
      setApr(chainStaking.calcValidatorApr(validator))
      setLoading(false)
    }

    // const getReward = async (stakingProvider: Staking) => {
    //   if (!stakingProvider || !validator) return Number(0)

    //   const reward = await stakingProvider?.getMyStakingRewards(
    //     validator.validator,
    //   )

    //   return new BigNumber(reward).dividedBy(GWEI).toNumber()
    // }

    // const getMyStaking = async (stakingProvider: Staking) => {
    //   if (!stakingProvider || !validator) return 0

    //   const amount = await stakingProvider.getMyDelegatedAmount(
    //     validator.validator,
    //   )
    //   return new BigNumber(amount).dividedBy(GWEI).toNumber()
    // }

    // const inital = async () => {
    //   const stakingProvider = await store.getBasSdk().getStaking()
    //   await setStakingReward(await getReward(stakingProvider))
    //   await setStakingAmount(await getMyStaking(stakingProvider))
    // }

    const handleClaim = async (isStaking = false) => {
      if (!validator) return

      modalStore.setVisible(true)
      modalStore.setIsLoading(true)
      modalStore.setTitle('Claim Reward')
      modalStore.setContent(
        <ClaimStakingContent
          amount={myStakingReward}
          isStaking={isStaking}
          validator={validator}
        />,
      )
      modalStore.setIsLoading(false)
    }

    const handleAdd = async () => {
      if (!validator) return

      modalStore.setVisible(true)
      modalStore.setIsLoading(true)
      modalStore.setTitle('Add Staking')
      modalStore.setContent(<AddStakingContent validator={validator} />)
      modalStore.setIsLoading(false)
    }

    // const handleUnStaking = async () => {
    //   if (!validator) return

    //   modalStore.setVisible(true)
    //   modalStore.setIsLoading(true)
    //   modalStore.setTitle('Un-Staking')
    //   modalStore.setContent(
    //     <UnStakingContent
    //       onSuccess={() => {
    //         inital().then(() => refresh?.())
    //       }}
    //       validator={validator}
    //     />,
    //   )
    //   modalStore.setIsLoading(false)
    // }

    /* -------------------------------------------------------------------------- */
    /*                                   Watches                                  */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
      inital()
    }, [])

    /* -------------------------------------------------------------------------- */
    /*                                    DOMS                                    */
    /* -------------------------------------------------------------------------- */
    return (
      <div className="validator-collapse-content-container">
        <Row gutter={[24, 12]}>
          <Col className="info" lg={5} sm={24} xs={24}>
            <div className="validator-collapse-content-card borderless">
              <div>
                <div style={{ width: '100%' }}>
                  <div>
                    <span>Slasher: </span>
                    <CountUpMemo
                      end={validator.slashesCount}
                      decimals={2}
                      duration={1}
                    />
                  </div>
                  <div>
                    <span>APR: </span>
                    <CountUpMemo
                      end={apr}
                      decimals={2}
                      duration={1}
                      formattingFn={(v) => `${v.toFixed(2)}%`}
                    />
                  </div>
                  <div>
                    <span>Comission Rate:</span>{' '}
                    <CountUpMemo
                      end={validator.commissionRate}
                      decimals={2}
                      duration={1}
                    />
                  </div>
                  <div>
                    <span>Total Stake: </span>
                    <CountUpMemo
                      end={validator.totalDelegated.toNumber()}
                      decimals={2}
                      duration={1}
                    />
                  </div>
                  <a
                    href={
                      validator
                        ? `https://exp.${
                            getCurrentEnv() === 'jfin' ? '' : 'testnet.'
                          }jfinchain.com/address/${validator.ownerAddress}`
                        : '#'
                    }
                    rel="noreferrer"
                    style={{ width: '100%' }}
                    target="_blank"
                  >
                    Wallet Address
                    <WalletOutlined />
                  </a>
                </div>
              </div>
            </div>
          </Col>
          <Col className="reward" lg={9} sm={24} xs={24}>
            <div className="validator-collapse-content-card">
              <span className="col-title">Staking Reward</span>
              <div>
                <div className="value">
                  <CountUpMemo
                    end={myStakingReward.toNumber()}
                    decimals={5}
                    duration={1}
                  />
                  <JfinCoin />
                </div>
                <button
                  className="button secondary lg"
                  // disabled={!isConnected || !myStakingReward.toNumber()}
                  onClick={() => handleClaim()}
                  type="button"
                >
                  Claim
                </button>
              </div>
            </div>
          </Col>
          <Col className="staking" lg={10} sm={24} xs={24}>
            <div className="validator-collapse-content-card">
              <span className="col-title">Staked</span>
              <div>
                <div className="value">
                  <CountUpMemo
                    end={myStakingAmount.toNumber()}
                    decimals={2}
                    duration={1}
                  />
                  <JfinCoin />
                </div>
                <div>
                  <div style={{ textAlign: 'right' }}>
                    <button
                      className="button secondary lg"
                      disabled={!isConnected || !!myStakingReward.toNumber()}
                      onClick={handleAdd}
                      type="button"
                    >
                      <PlusOutlined />
                    </button>

                    <button
                      className="button secondary lg"
                      disabled={!isConnected || !!myStakingReward.toNumber()}
                      onClick={() => {}}
                      style={{ marginLeft: '10px' }}
                      type="button"
                    >
                      <MinusOutlined />
                    </button>
                  </div>
                  {myStakingReward.toNumber() ? (
                    <div
                      style={{
                        marginTop: '5px',
                        marginLeft: '1rem',
                        fontSize: '0.7rem',
                        textAlign: 'right',
                        opacity: 0.75,
                        lineHeight: 1,
                      }}
                    >
                      <span>
                        Please claim all pending reward before staking.
                      </span>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    )
  },
)

export default ValidatorCollapseContent
