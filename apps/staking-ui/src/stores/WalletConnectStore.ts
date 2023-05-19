import { Chain, configureChains, createClient, goerli } from 'wagmi'
import {
  arbitrum,
  avalanche,
  bsc,
  fantom,
  mainnet,
  polygon,
} from 'wagmi/chains'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { makeAutoObservable } from 'mobx'
import {
  CHAIN_DECIMAL_UNIT,
  CHAIN_EXPLORER,
  CHAIN_ID,
  CHAIN_NAME,
  CHAIN_RPC,
} from '@utils/chain/src/chain'

export default class WalletConnectStore {
  public chains
  public wagmiClient
  public webSockerProvider: ReturnType<typeof this.configure.webSocketProvider>
  public configure: ReturnType<typeof configureChains>
  public ethereumClient

  public projectId =
    process.env.REACT_APP_PROJECT_ID || '2dc0abd48b692cc1375af974f7533524'

  constructor() {
    makeAutoObservable(this)

    // 1. Init jfin chain
    this.chains = [
      // JFIN
      {
        id: CHAIN_ID.JFIN,
        name: CHAIN_NAME.JFIN,
        network: CHAIN_NAME.JFIN,
        nativeCurrency: {
          decimals: CHAIN_DECIMAL_UNIT,
          name: CHAIN_NAME.JFIN,
          symbol: CHAIN_NAME.JFIN,
        },
        rpcUrls: {
          public: { http: [CHAIN_RPC.JFIN] },
          default: { http: [CHAIN_RPC.JFIN] },
        },
        blockExplorers: {
          default: {
            name: 'BlockScout',
            url: CHAIN_EXPLORER.JFIN,
          },
        },
      },
      // JFIN Test
      {
        id: CHAIN_ID.JFINT,
        name: CHAIN_NAME.JFINT,
        network: CHAIN_NAME.JFINT,
        nativeCurrency: {
          decimals: CHAIN_DECIMAL_UNIT,
          name: CHAIN_NAME.JFINT,
          symbol: CHAIN_NAME.JFINT,
        },
        rpcUrls: {
          public: { http: [CHAIN_RPC.JFINT] },
          default: { http: [CHAIN_RPC.JFINT] },
        },
        blockExplorers: {
          default: {
            name: 'BlockScout',
            url: CHAIN_EXPLORER.JFINT,
          },
        },
      },
      mainnet,
      bsc,
      polygon,
      arbitrum,
      avalanche,
      fantom,
      goerli,
    ] as Chain[]

    // 2. Get configure from configureChains
    this.configure = configureChains(this.chains, [
      w3mProvider({ projectId: this.projectId }),
    ])

    // 3. Create wagmiClient from web3modal
    this.wagmiClient = createClient({
      autoConnect: true,
      connectors: [
        ...w3mConnectors({
          projectId: this.projectId,
          version: 2,
          chains: this.chains,
        }),
      ],
      provider: this.configure.provider,
      webSocketProvider: this.configure.webSocketProvider,
    })

    this.ethereumClient = new EthereumClient(this.wagmiClient, this.chains)
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Getters                                  */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                   Actions                                  */
  /* -------------------------------------------------------------------------- */
}
