import { CopyOutlined } from '@ant-design/icons'
import { Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { observer } from 'mobx-react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { getCurrentEnv } from '../../stores'
import {
  chainAccount,
  chainConfig,
  chainStaking,
} from '@utils/chain/src/contract'
import { Event } from 'ethers'
import { CHAIN_DECIMAL } from '@utils/chain/src/chain'
import CountUpMemo from '../Countup'
import BigNumber from 'bignumber.js'
import prettyTime from 'pretty-time'
import { VALIDATOR_WALLETS } from '@/utils/const'
import { useEffect, useState } from 'react'
import defaultImage from '../../assets/images/partners/default.png'
import { useNetwork } from 'wagmi'

const StakingHistory = observer(() => {
  /* --------------------------------- States --------------------------------- */
  const [loading, setLoading] = useState(false)
  const { chain } = useNetwork()
  const [stakingHistory, setStakingHistory] =
    useState<typeof chainStaking.myStakingHistoryEvents>()
  const columns: ColumnProps<Event>[] = [
    {
      title: 'Type',
      key: 'type',
      render: (v: Event) => {
        if (v.event === 'Undelegated') {
          const undelegatedBlock =
            v.blockNumber + chainConfig.epochBlockInterval

          if (undelegatedBlock < chainConfig.blockNumber)
            return (
              <>
                {v.event} <span style={{ color: 'green' }}>(Done)</span>
              </>
            )

          const undelegatedBlockRemain =
            chainConfig.endBlock -
            v.blockNumber +
            chainConfig.epochBlockInterval

          const undelegatedBlockRemainNs =
            undelegatedBlockRemain * chainConfig.blockSec * 10e8

          return (
            <>
              {v.event}{' '}
              <span style={{ color: 'orange' }}>
                (Ready in {prettyTime(undelegatedBlockRemainNs || 0, 's')})
              </span>
            </>
          )
        }

        return <>{v.event}</>
      },
    },
    {
      title: 'Amount',
      key: 'amount',
      render: (validator: Event) => {
        const args = chainStaking.getValidatorEventArgs(validator.args)
        if (!args) return 0
        const amount = new BigNumber(args.amount.toString()).div(CHAIN_DECIMAL)
        return (
          <CountUpMemo
            end={amount.toNumber()}
            duration={1}
            decimals={5}
            enableScrollSpy
            scrollSpyOnce
          />
        )
      },
    },
    {
      key: 'validator',
      title: 'Validator',
      render: (validator: Event) => {
        const args = chainStaking.getValidatorEventArgs(validator.args)
        if (!args) return
        return (
          <div className="items-center column-validator">
            <img
              src={VALIDATOR_WALLETS[args?.validator]?.image || defaultImage}
              alt={VALIDATOR_WALLETS[args?.validator]?.name || args?.validator}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '1px solid red',
                marginRight: '0.5rem',
              }}
            />
            <div>
              <span>
                {VALIDATOR_WALLETS[args?.validator]?.name || args?.validator}
              </span>
              <CopyToClipboard text={args?.validator}>
                <CopyOutlined
                  className="copy-clipboard"
                  style={{ paddingLeft: '5px' }}
                />
              </CopyToClipboard>
            </div>
          </div>
        )
      },
    },
    {
      key: 'block',
      title: 'Block',
      render: (valdiator: Event) => {
        return (
          <a
            href={`https://exp.${
              getCurrentEnv() === 'jfin' ? '' : 'testnet.'
            }jfinchain.com/block/${valdiator.blockNumber}/transactions`}
            target="_blank"
            rel="noreferrer"
          >
            {valdiator.blockNumber}
          </a>
        )
      },
    },
    {
      key: 'hash',
      title: 'Hash',
      render: (validator: Event) => {
        return (
          <a
            href={`https://exp.${
              getCurrentEnv() === 'jfin' ? '' : 'testnet.'
            }jfinchain.com/tx/${validator.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {[
              validator.transactionHash.slice(0, 5),
              validator.transactionHash.slice(-5),
            ].join('....')}
          </a>
        )
      },
    },
  ]

  /* --------------------------------- Methods -------------------------------- */
  const initial = async () => {
    setLoading(true)
    await chainStaking.fetchMyStakingHistory()
    setLoading(false)
  }

  /* --------------------------------- Watches -------------------------------- */
  useEffect(() => {
    if (!chainAccount.isReady) return
    initial()
  }, [chainAccount.account.address, chain?.id])

  useEffect(() => {
    setStakingHistory(chainStaking.myStakingHistoryEvents)
  }, [chainStaking.myStakingHistoryEvents])

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <div className="staking-history-container">
      <Table
        columns={columns}
        loading={loading}
        dataSource={stakingHistory}
        pagination={{ size: 'small' }}
        scroll={{ x: true }}
        rowKey={(row) => row.transactionHash}
      />
    </div>
  )
})

export default StakingHistory
