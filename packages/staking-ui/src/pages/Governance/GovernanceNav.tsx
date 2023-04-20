import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Drawer } from "antd";
import { observer } from "mobx-react";
import { ReactElement, useEffect, useState } from "react";
import { useBasStore } from "src/stores";

import "../index.css";

import CreateProposalForm from "./components/CreateProposalForm/CreateProposalForm";
import ProposalTable from "./components/ProposalTable/ProposalTable";

export const GovernanceNav = observer((): ReactElement => {
  const store = useBasStore();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    if (store.chainInfo) setIsLoading(false);

    return () => setIsLoading(true);
  }, [store.chainInfo]);

  return (
    <div>
      <Drawer
        bodyStyle={{ paddingBottom: 80 }}
        title="Create proposal"
        visible={drawerVisible}
        width={500}
        onClose={() => {
          setDrawerVisible(false);
        }}
      >
        <CreateProposalForm />
      </Drawer>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            background: "#16191d",
            padding: "32px",
            borderRadius: "10px",
          }}
        >
          <LoadingOutlined spin />
        </div>
      ) : (
        <div>
          <ProposalTable />
          <Button
            icon={<PlusOutlined translate="yes" />}
            size="large"
            style={{ margin: 10 }}
            type="primary"
            onClick={() => {
              setDrawerVisible(true);
            }}
          >
            Create Proposal
          </Button>
        </div>
      )}
    </div>
  );
});
