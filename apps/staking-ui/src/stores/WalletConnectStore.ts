import { Chain, configureChains, createClient } from 'wagmi'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { makeAutoObservable } from 'mobx'
import { IConfig } from 'jfin-staking-sdk'
import { CHAIN_DECIMAL_UNIT } from '@utils/chain/src/chain'

export default class WalletConnectStore {
  private readonly config
  public chains
  public wagmiClient: any
  public configure: ReturnType<typeof configureChains>
  public jsonRpcProvider: ReturnType<typeof this.configure.provider>
  public ethereumClient

  public projectId =
    process.env.REACT_APP_PROJECT_ID || '2dc0abd48b692cc1375af974f7533524'

  constructor(_config: IConfig) {
    makeAutoObservable(this)
    this.config = _config

    // 1. Init jfin chain
    this.chains = [
      {
        id: _config.chainId,
        name: _config.chainName,
        network: _config.chainName,
        nativeCurrency: {
          decimals: CHAIN_DECIMAL_UNIT,
          name: _config.chainName,
          symbol: _config.chainName,
        },
        rpcUrls: {
          public: { http: [_config.rpcUrl] },
          default: { http: [_config.rpcUrl] },
        },
        blockExplorers: {
          etherscan: {
            name: 'BlockScout',
            url: _config.explorerConfig?.homePage || '',
          },
          default: {
            name: 'BlockScout',
            url: _config.explorerConfig?.homePage || '',
          },
        },
      },
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
    this.jsonRpcProvider = this.configure.provider({
      chainId: this.config.chainId,
    })
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Getters                                  */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                   Actions                                  */
  /* -------------------------------------------------------------------------- */
}
