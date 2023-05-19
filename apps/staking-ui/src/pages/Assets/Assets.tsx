import {
  ClockCircleOutlined,
  LoadingOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import './Assets.css'
import { useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import JfinCoin from '../../components/JfinCoin/JfinCoin'
import StakingHistory from '../../components/Staking/StakingHistory/StakingHistory'
import { chainAccount, useChainStaking } from '@utils/chain/src/contract'
import CountUpMemo from '@/components/Countup'
import { useAccount, useNetwork } from 'wagmi'
import Validators from '@/components/Validator/Validators/Validators'
import { CHAIN_DECIMAL } from '@utils/chain/src/chain'
import { Link } from 'react-router-dom'
import BigNumber from 'bignumber.js'

const Assets = observer(() => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [loading, setLoading] = useState(true)
  const chainStaking = useChainStaking()
  const isLoading = loading || chainStaking.isFetchingValidators

  /* --------------------------------- Methods -------------------------------- */
  const initialChainAccount = async () => {
    await chainAccount.getAccount()
    await chainAccount.fetchBalance()
  }

  const initial = async () => {
    setLoading(true)
    await initialChainAccount()
    chainStaking.fetchMyStakingHistory()
    setLoading(false)
  }

  /* --------------------------------- Watches -------------------------------- */

  useEffect(() => {
    initial()
  }, [address, chain?.id])

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
                {isLoading ? (
                  <LoadingOutlined spin />
                ) : (
                  <>
                    <CountUpMemo
                      end={chainStaking.myTotalStake
                        .reduce(
                          (prev, curr) => prev.plus(curr.amount),
                          BigNumber(0),
                        )
                        ?.div(CHAIN_DECIMAL)
                        ?.toNumber()}
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
              {isLoading ? (
                <LoadingOutlined spin />
              ) : (
                <>
                  <CountUpMemo
                    end={chainStaking.myTotalReward
                      .reduce(
                        (prev, curr) => prev.plus(curr.amount),
                        BigNumber(0),
                      )
                      ?.div(CHAIN_DECIMAL)
                      ?.toNumber()}
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
          <div id="view-point1">
            {!chainStaking.myValidators.length && (
              <div style={{ display: 'none' }}>
                <Validators validators={chainStaking.activeValidator} />
              </div>
            )}

            {!chainStaking.myValidators.length && !isLoading && (
              <div
                className="items-center justify-center"
                style={{ width: '100%', textAlign: 'center', height: '44px' }}
              >
                <Link to="/staking" className="button lg">
                  Start Staking
                </Link>
              </div>
            )}

            <Validators validators={chainStaking.myValidators} />
          </div>
        </div>
      </div>

      <div className="content-card mt-2">
        <div className="card-title">
          <b>
            <ClockCircleOutlined /> <span>History</span>
          </b>
        </div>
        <div className="card-body" id="view-point3">
          <StakingHistory loading={isLoading} />
        </div>
      </div>
    </div>
  )
})

export default Assets
