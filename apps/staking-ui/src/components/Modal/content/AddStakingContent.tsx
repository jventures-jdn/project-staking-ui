import { LoadingOutlined } from '@ant-design/icons'
import { message } from 'antd'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react'
import { FormEvent, useEffect, useState } from 'react'
import JfinCoin from '../../../components/JfinCoin/JfinCoin'
import { useModalStore } from '../../../stores'
import { Address } from 'wagmi'
import { Validator, chainStaking } from '@utils/chain/src/contract'
import { fetchBalance, getAccount } from 'wagmi/actions'
import { CHAIN_DECIMAL } from '@utils/chain/src/chain'

interface IAddStakingContent {
  validator: Validator
  amount?: number
}
const AddStakingContent = observer((props: IAddStakingContent) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const modalStore = useModalStore()
  const [stakingAmount, setStakingAmount] = useState(props.amount || 0)
  const [balance, setBalance] = useState('0')
  const [error, setError] = useState<string>()

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(undefined)

    if (stakingAmount < 1) return setError('Stake amount must be more 1')
    if (stakingAmount > Number(balance)) return setError(`Insufficient Balance`)

    try {
      modalStore.setIsLoading(true)
      await chainStaking.stakeToValidator(props.validator, stakingAmount)
      modalStore.setVisible(false)
      message.success(`Staked was done!`)
    } catch (e: any) {
      message.error(`Something went wrong ${e.message || ''}`)
    } finally {
      modalStore.setIsLoading(false)
    }
  }

  const initial = async () => {
    modalStore.setIsLoading(true)
    const account = await getAccount()
    const { value } = await fetchBalance({
      address: account.address as Address,
    })
    setBalance(new BigNumber(value.toString()).div(CHAIN_DECIMAL).toFixed(5))
    modalStore.setIsLoading(false)
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
    <div className="add-staking-content">
      <form onSubmit={handleSubmit}>
        <div className="items-center">
          <b>Staking</b> <JfinCoin />
        </div>

        <div className="">
          <input
            className="staking-input"
            disabled={modalStore.isLoading}
            onChange={(e) => setStakingAmount(+e.target.value)}
            style={{ marginTop: '15px' }}
            type="number"
            value={stakingAmount}
          />
          <div className="staking-sub-input justify-between ">
            <span className="wallet-warning">{error}</span>
            <span className="col-title">
              Your balance: <span>{balance}</span>
            </span>
          </div>
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

export default AddStakingContent
