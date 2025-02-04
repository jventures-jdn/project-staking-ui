import { Modal } from "antd";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { useModalStore } from "../../stores";

interface IModal {
  onCancel?: () => unknown;
  onSubmit?: () => unknown;
}

const GlobalModal = observer((props: IModal) => {
  /* -------------------------------------------------------------------------- */
  /*                                   States                                   */
  /* -------------------------------------------------------------------------- */
  const modalStore = useModalStore();
  const [isVisible, setIsVisible] = useState(modalStore.isVisible);

  /* -------------------------------------------------------------------------- */
  /*                                   Methods                                  */
  /* -------------------------------------------------------------------------- */
  const handleCancel = () => {
    modalStore.setVisible(false);
  };

  const handleSubmit = () => {
    modalStore.setVisible(false);
  };

  /* -------------------------------------------------------------------------- */
  /*                                   Watches                                  */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    setIsVisible(modalStore.isVisible);
  }, [modalStore.isVisible]);

  return (
    <div className="global-modal-container">
      <Modal
        footer={[]}
        onCancel={props.onCancel || handleCancel}
        onOk={props.onSubmit || handleSubmit}
        title={modalStore.title}
        open={isVisible}
      >
        {modalStore.content}
      </Modal>
    </div>
  );
});

export default GlobalModal;
