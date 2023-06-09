import ModalStore from './ModalStore'
import WalletConnectStore from './WalletConnectStore'

const currentEnvironment = process.env.NETWORK
const modalStore = new ModalStore()
const walletConnectStore = new WalletConnectStore()

export const getCurrentEnv = () => {
  return currentEnvironment
}
export const useModalStore = () => modalStore
export const useWallectConnect = () => walletConnectStore
