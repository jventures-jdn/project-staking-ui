import {
  ClockCircleOutlined,
  LoadingOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import './Assets.css'
import { useEffect, useState } from 'react'
import { IValidator } from 'jfin-staking-sdk'
import { observer } from 'mobx-react'
import JfinCoin from '../../components/JfinCoin/JfinCoin'
import MyValidators from '../../components/MyValidators/MyValidators'
import StakingHistory from '../../components/StakingHistory/StakingHistory'
import { useChainStaking } from '@utils/chain/src/contract'
import CountUpMemo from '@/components/Countup'
import BigNumber from 'bignumber.js'
import { useAccount, useNetwork } from 'wagmi'

export interface IMyValidators {
  amount: number
  event?: unknown
  validatorProvider: IValidator
  validator: string
  reward: number
  staker: string
  epoch: number
}
const Assets = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const chainStaking = useChainStaking()
  const [totalReward, setTotalReward] = useState<BigNumber>(new BigNumber(0))
  const [loading, setLoading] = useState(false)

  /* --------------------------------- Methods -------------------------------- */
  const initial = async () => {
    setLoading(true)
    await chainStaking.getMyStakingValidators()
    setTotalReward(await chainStaking.getMyTotalReward())
    setLoading(false)
  }

  /* --------------------------------- Watches -------------------------------- */
  // on connected or disconnected update myStakingValidators, myStakingHistory
  useEffect(() => {
    initial()
  }, [isConnected, chain?.id])

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <div className="assets-container">
      <div
        className=""
        style={{
          display: 'grid',
          columnGap: '20px',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <div className="content-card">
          <div className="card-title">
            <b>
              <span>Your total staking</span>
            </b>
          </div>
          <div className="card-body">
            <div
              style={{
                background: '#16191d',
                padding: '1rem',
                borderRadius: '10px',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                height: '70px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {loading ? (
                  <LoadingOutlined spin />
                ) : (
                  <>
                    <CountUpMemo
                      end={chainStaking.myTotalStake.toNumber()}
                      decimals={2}
                      duration={1}
                    />
                    <JfinCoin />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="content-card">
          <div className="card-title">
            <b>
              <span>Your total reward</span>
            </b>
          </div>
          <div className="card-body">
            <div
              style={{
                background: '#16191d',
                padding: '1rem',
                borderRadius: '10px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '70px',
              }}
            >
              {loading ? (
                <LoadingOutlined spin />
              ) : (
                <>
                  <CountUpMemo
                    end={totalReward.toNumber()}
                    decimals={5}
                    duration={1}
                  />
                  <JfinCoin />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="content-card mt-2">
        <div className="card-title">
          <b>
            <WalletOutlined /> <span>Your Staking</span>
          </b>
        </div>
        <div className="card-body">
          <MyValidators loading={loading} />
        </div>
      </div>

      <div className="content-card mt-2">
        <div className="card-title">
          <b>
            <ClockCircleOutlined /> <span>History</span>
          </b>
        </div>
        <div className="card-body" id="view-point3">
          <StakingHistory />
        </div>
      </div>
    </div>
  )
})

export default Assets
