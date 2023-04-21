import { Button } from "antd";
import { ColumnProps } from "antd/lib/table";

import { IDelegatedAssetsData } from "./interface";
import { BasStore } from "../../../../stores/BasStore";
import { delegate, undelegate } from "../../../../utils/helpers";

export const createTableColumns = (store: BasStore): ColumnProps<any>[]  => {
  
  const handleCancelDelegateClick = async (record: IDelegatedAssetsData) => {
    await undelegate(store, record.validator);
  }

  const handleRepeatDelegateClick = async (record: IDelegatedAssetsData) => {
    await delegate(store, record.validator);
  }
  
  return [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Validator',
      dataIndex: 'validator',
      key: 'validator',
    },
    {
      title: 'Action',
      render: (record: IDelegatedAssetsData) => {
        return (
          <div className="flexSpaceAround">
            <Button
              style={{ width: '40%' }}
              type="primary" 
              onClick={async () => handleCancelDelegateClick(record)}
            >
              Cancel
            </Button>
            <Button
              style={{ width: '40%' }}
              type="primary" 
              onClick={async () => handleRepeatDelegateClick(record)}
            >
              Repeat
            </Button>
          </div>
        )
      }
    }
  ];
}
