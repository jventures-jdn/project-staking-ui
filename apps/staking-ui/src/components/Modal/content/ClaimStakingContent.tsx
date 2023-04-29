import { GAS_LIMIT_CLAIM } from 'jfin-staking-sdk'
import {
  AlertOutlined,
  LoadingOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { observer } from 'mobx-react'
import { FormEvent, useEffect, useState } from 'react'
import JfinCoin from '../../../components/JfinCoin/JfinCoin'
import { useModalStore } from '../../../stores'
import { Validator, chainStaking } from '@utils/chain/src/contract'
import BigNumber from 'bignumber.js'
import { message } from 'antd'

interface IClaimStakingContent {
  isStaking?: boolean
  validator: Validator
  amount?: BigNumber
}
const ClaimStakingContent = observer((props: IClaimStakingContent) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const modalStore = useModalStore()
  const [error, setError] = useState<string>()

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(undefined)

    try {
      modalStore.setIsLoading(true)
      await chainStaking.claimValidatorReward(props.validator.ownerAddress)
      modalStore.setVisible(false)
      message.success('Claim reward was done!')
    } catch (e: any) {
      message.error(`Something went wrong ${e.message || ''}`)
    } finally {
      modalStore.setIsLoading(false)
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    modalStore.setIsLoading(false)
  }, [])

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="claim-staking-content">
      <form onSubmit={handleSubmit}>
        <div className="items-center">
          <b>Claim</b> <JfinCoin />
        </div>

        <div className="">
          <input
            className="staking-input"
            disabled
            style={{ marginTop: '15px' }}
            type="text"
            value={props.amount?.toFixed(5)}
          />
          <div className="staking-sub-input justify-between ">
            <span className="wallet-warning">{error}</span>
          </div>
        </div>

        {props?.isStaking ? (
          <div className="alert-message">
            <AlertOutlined />
            Please claim all rewards before staking or un-staking
          </div>
        ) : (
          <div className="warning-message">
            <WarningOutlined />
            If reward you received does not match the reward that the system has
            indicated, This may happen from the gas limit. Please increase the
            gas limit in wallet (up to {GAS_LIMIT_CLAIM}).
          </div>
        )}

        <button
          className="button lg w-100 m-0 ghost mt-2"
          disabled={modalStore.isLoading}
          type="submit"
        >
          {modalStore.isLoading ? <LoadingOutlined spin /> : 'Claim Reward'}
        </button>
      </form>
    </div>
  )
})

export default ClaimStakingContent
