import { CHAIN_DECIMAL } from '@utils/chain/src/chain'
import { chainGovernance } from '@utils/chain/src/contract'
import Table, { ColumnProps } from 'antd/lib/table'
import { Event } from 'ethers'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

const ProposalTable = observer(({ loading }: { loading: boolean }) => {
  /* --------------------------------- States --------------------------------- */
  const columns: ColumnProps<Event>[] = [
    {
      title: 'ID',
      render: (v: Event) => {
        return (
          <>
            {chainGovernance
              .mappingCreatedEventArgs(v.args)
              ?.proposalId.multipliedBy(100000000000000)
              .toString()
              .replace('.', '')
              .substring(0, 20)}
            ...
          </>
        )
      },
    },
    {
      title: 'Voting Period',
      render: (v: Event) => {
        const args = chainGovernance.mappingCreatedEventArgs(v.args)
        return (
          <>{`${args?.startBlock.toString()} -> ${args?.endBlock.toString()}`}</>
        )
      },
    },
    {
      title: 'Description',
      render: (v: Event) => {
        return (
          <>{chainGovernance.mappingCreatedEventArgs(v.args)?.description}</>
        )
      },
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
