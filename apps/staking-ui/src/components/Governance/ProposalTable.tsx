import { VALIDATOR_WALLETS } from '@/utils/const'
import { CopyOutlined } from '@ant-design/icons'
import { CHAIN_DECIMAL, EXPECT_CHAIN } from '@utils/chain/src/chain'
import { chainGovernance } from '@utils/chain/src/contract'
import Table, { ColumnProps } from 'antd/lib/table'
import { Event } from 'ethers'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import CopyToClipboard from 'react-copy-to-clipboard'
import defaultImage from '../../assets/images/partners/default.png'

const ProposalTable = observer(({ loading }: { loading: boolean }) => {
  /* --------------------------------- States --------------------------------- */
  const columns: ColumnProps<(typeof chainGovernance.proposals)[0]>[] = [
    {
      title: 'Description',
      render: (v: (typeof chainGovernance.proposals)[0]) => (
        <span style={{ textTransform: 'capitalize' }}>
          {v.values.description}
        </span>
      ),
    },
    {
      title: 'Proposal From',
      render: (v: (typeof chainGovernance.proposals)[0]) => (
        <div className="items-center column-validator">
          <img
            src={VALIDATOR_WALLETS[v.values.proposal]?.image || defaultImage}
            alt={
              VALIDATOR_WALLETS[v.values.proposal]?.name || v.values.proposal
            }
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
              {VALIDATOR_WALLETS[v.values.proposal]?.name || v.values.proposal}
            </span>
            <CopyToClipboard text={v.values.proposal}>
              <CopyOutlined
                className="copy-clipboard"
                style={{ paddingLeft: '5px' }}
              />
            </CopyToClipboard>
          </div>
        </div>
      ),
    },
    {
      title: 'Voting Period',
      render: (v: (typeof chainGovernance.proposals)[0]) => (
        <>
          <a
            href={`https://exp.${
              EXPECT_CHAIN.chainName === 'JFIN' ? '' : 'testnet.'
            }jfinchain.com/block/${v.values.startBlock.toString()}/transactions`}
            target="_blank"
            rel="noreferrer"
          >
            {v.values.startBlock.toString()}
          </a>
          {` --> `}
          <a
            href={`https://exp.${
              EXPECT_CHAIN.chainName === 'JFIN' ? '' : 'testnet.'
            }jfinchain.com/block/${v.values.endBlock.toString()}/transactions`}
            target="_blank"
            rel="noreferrer"
          >
            {v.values.endBlock.toString()}
          </a>
        </>
      ),
    },
    {
      title: 'Hash',
      render: (v: (typeof chainGovernance.proposals)[0]) => (
        <>
          <a
            href={`https://exp.${
              EXPECT_CHAIN.chainName === 'JFIN' ? '' : 'testnet.'
            }jfinchain.com/tx/${v.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {[v.transactionHash.slice(0, 5), v.transactionHash.slice(-5)].join(
              '....',
            )}
          </a>
        </>
      ),
    },
  ]

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <div className="governance-proposal-table">
      <Table
        columns={columns}
        loading={loading}
        dataSource={chainGovernance.proposals}
        pagination={{ size: 'small' }}
        scroll={{ x: true }}
        rowKey={(row) => row.transactionHash}
      />
    </div>
  )
})

export default ProposalTable
