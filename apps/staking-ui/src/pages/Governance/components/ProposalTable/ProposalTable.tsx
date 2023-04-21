import { IGovernanceProposal } from "jfin-staking-sdk";
import { Table } from "antd";
import { observer } from "mobx-react";
import * as ProposalExplainer from "../ProposalExplainer";
import { createTableColumns } from "./columns";
import { useLocalGridStore } from "../../../../stores/LocalGridStore";
import { useBasStore } from "../../../../stores";

const ProposalTable = observer(() => {
  const store = useBasStore();

  const grid = useLocalGridStore<IGovernanceProposal>(
    async (): Promise<[IGovernanceProposal[], boolean]> => {
      const proposals = await store
        .getBasSdk()
        .getGovernance()
        .getProposals({ fromBlock: "earliest", toBlock: "latest" });
      return [proposals, false];
    }
  );

  return (
    <Table
      scroll={{ x: true }}
      columns={createTableColumns(store)}
      dataSource={grid.items}
      expandable={{
        expandedRowRender: (event: IGovernanceProposal) => {
          return <ProposalExplainer.ProposalExplainer event={event} />;
        },
      }}
      loading={grid.isLoading}
      pagination={grid.paginationConfig}
      rowKey="id"
    />
  );
});

export default ProposalTable;
