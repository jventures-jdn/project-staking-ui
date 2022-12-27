import { CopyOutlined } from "@ant-design/icons";
import { Table } from "antd";
import { ColumnProps } from "antd/lib/table";
import { observer } from "mobx-react";
import moment from "moment";
import CopyToClipboard from "react-copy-to-clipboard";
import { getCurrentEnv, useBasStore } from "src/stores";

interface IStakingHistory {
  data: IMyTransactionHistory[] | undefined;
  loading: boolean;
}

interface IStakingHistoryColumn {
  type: string;
  amount: number;
}

const StakingHistory = observer(({ data, loading }: IStakingHistory) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const store = useBasStore();
  const columns: ColumnProps<IStakingHistoryColumn>[] = [
    {
      title: "Type",
      render: (v: IMyTransactionHistory) => {
        if (v.type === "undelegation") {
          const epochBlockInterval = +(
            store.chainInfo?.epochBlockInterval || 0
          );
          const transactionBlock = +(v.event?.blockNumber || 0);
          const nextBlock = store.chainInfo?.nextEpochBlock || 0;
          const currentBlock = +(store.chainInfo?.blockNumber || 0);
          const blockTime = store.chainInfo?.blockTime || 0;

          const targetUndelegateBlock =
            nextBlock - transactionBlock <= epochBlockInterval
              ? nextBlock - currentBlock + epochBlockInterval
              : nextBlock - currentBlock;

          const remain = targetUndelegateBlock * blockTime;
          const timeRemain = moment
            .utc(remain * 1000)
            .format(remain < 3600 ? "mm[m] ss[s]" : "h[h] mm[m] ss[s]");

          return (
            <>
              {v.type.toUpperCase()}{" "}
              {(nextBlock - transactionBlock) / epochBlockInterval < 2 && (
                <span style={{ color: "orange" }}>(Ready in {timeRemain})</span>
              )}
            </>
          );
        }

        return <>{v.type.toUpperCase()}</>;
      },
    },
    {
      key: "amount",
      dataIndex: "amount",
      title: "Amount",
      render: (v: number) => (
        <>
          {v.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </>
      ),
    },
    {
      key: "validatorMask",
      title: "Validator",
      // responsive: ["sm"],
      render: (v) => (
        <div className="items-center column-validator">
          <img
            src={v.validatorMask.image}
            alt={v.validatorMask.name}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              border: "1px solid red",
              marginRight: "0.5rem",
            }}
          />
          <div>
            <span>{v.validatorMask.name}</span>
            <CopyToClipboard text={v.validator}>
              <CopyOutlined
                className="copy-clipboard"
                style={{ paddingLeft: "5px" }}
              />
            </CopyToClipboard>
          </div>
        </div>
      ),
    },
    {
      key: "event",
      dataIndex: "event",
      title: "Block",
      render: (v) => {
        return (
          <a
            href={`https://exp.${
              getCurrentEnv() === "jfin" ? "" : "testnet."
            }jfinchain.com/block/${v.blockNumber}/transactions`}
            target="_blank"
            rel="noreferrer"
          >
            {v.blockNumber}
          </a>
        );
      },
    },
    {
      key: "event",
      dataIndex: "event",
      title: "Hash",
      render: (v) => {
        return (
          <a
            href={`https://exp.${
              getCurrentEnv() === "jfin" ? "" : "testnet."
            }jfinchain.com/tx/${v.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {[v.transactionHash.slice(0, 5), v.transactionHash.slice(-5)].join(
              "...."
            )}
          </a>
        );
      },
    },
  ];
  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  // const fetchChain = async () => {
  //   const chain = await store.getChainConfig();
  //   setChainInfo(chain);
  // };
  // const inital = useCallback(() => {
  //   if (!store.isConnected) return;
  //   const chain = await store.getChainConfig();
  //   setChainInfo(chain);

  //   setInterval(async () => {
  //     const chain = await store.getChainConfig();
  //     setChainInfo(chain);
  //   }, 5000);
  // }, [store.isConnected]);

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                    DOMS                                    */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="staking-history-container">
      <Table
        columns={columns}
        loading={loading}
        dataSource={data}
        pagination={{ size: "small" }}
        scroll={{ x: true }}
      />
    </div>
  );
});

export default StakingHistory;
