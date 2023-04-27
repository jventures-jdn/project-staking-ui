import { LoadingOutlined, WarningOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { FormEvent, useEffect, useState } from 'react'
import { getCurrentEnv, useModalStore } from '../../../stores'
import { message } from 'antd'
import JfinCoin from '../../JfinCoin/JfinCoin'
import { Validator, chainStaking } from '@utils/chain/src/contract'

interface IUnStakingContent {
  validator: Validator
  amount?: number
}

const UnStakingContent = observer((props: IUnStakingContent) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const modalStore = useModalStore()
  const [stakedAmount, setStakedAmount] = useState<number>()
  const [unStakingAmount, setUnStakingAmount] = useState(props.amount || 0)
  const [error, setError] = useState<string>()

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(undefined)

    if (unStakingAmount < 1) return setError('Un-Stake amount must be more 1')
    if (unStakingAmount > Number(stakedAmount))
      return setError(
        `Un-Stake amount must be lower or equal to ${stakedAmount}`,
      )
    try {
      modalStore.setIsLoading(true)
      await chainStaking.unstakeFromValidator(props.validator, unStakingAmount)
      modalStore.setVisible(false)
      message.success(`Un-Stake was done!`)
    } catch (e: any) {
      message.error(`Something went wrong ${e.message || ''}`)
    } finally {
      modalStore.setIsLoading(false)
    }
  }

  const initial = async () => {
    modalStore.setIsLoading(true)
    setStakedAmount(
      (await chainStaking.getMyStakingAmount(props.validator)).toNumber(),
    )
    modalStore.setIsLoading(false)
  }

  /* --------------------------------- Watches -------------------------------- */
  useEffect(() => {
    initial()
  }, [])

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="un-staking-content">
      <form onSubmit={handleSubmit}>
        <div className="items-center">
          <b>Un-Staking</b> <JfinCoin />
        </div>

        <div className="">
          <input
            className="staking-input"
            disabled={modalStore.isLoading}
            onChange={(e) => setUnStakingAmount(+e.target.value)}
            style={{ marginTop: '15px' }}
            type="number"
            value={unStakingAmount}
          />
          <div className="staking-sub-input justify-between ">
            <span className="wallet-warning">{error}</span>
            <span className="col-title">Your staked: {stakedAmount || 0}</span>
          </div>
        </div>

        <div className="warning-message">
          <WarningOutlined />
          After complete the transaction, your staking will be returned in the
          form of a staking reward within 1 Epoch (
          {getCurrentEnv() === 'jfin' ? '1hr' : '10min'}).
        </div>

        <button
          className="button lg w-100 m-0 ghost mt-2"
          disabled={modalStore.isLoading}
          type="submit"
        >
          {modalStore.isLoading ? <LoadingOutlined spin /> : 'Confirm'}
        </button>
      </form>
    </div>
  )
})

export default UnStakingContent
