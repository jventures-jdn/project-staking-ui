import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import logo from '../../../assets/images/logo.svg'
import { useEffect, useMemo, useState } from 'react'
import { CloseOutlined, MenuOutlined, WarningOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { NavHashLink } from 'react-router-hash-link'
import { Web3Button, useWeb3Modal } from '@web3modal/react'
import { getCurrentEnv } from '../../../stores'
import { useAccount, useNetwork } from 'wagmi'
import { Progress } from 'antd'
import { EXPECT_CHAIN } from '@utils/chain/src/chain'
import { switchChain } from '@utils/chain/src/utils/wallet'

const Navbar = observer(() => {
  /* --------------------------------- States --------------------------------- */
  const defaultLoadingDuration = 7000
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const [isBurgerActive, setIsBurgerActive] = useState(false)
  const location = useLocation()
  const isAuto = !!location.search.includes('auto')
  const [loading, setLoading] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [loadingDuration, setLoadingDuration] = useState(defaultLoadingDuration)
  const [loadingText, setLoadingText] = useState('Loading...')
  const { open } = useWeb3Modal()
  const isExpectChain = chain?.id === EXPECT_CHAIN.chainId
  const isMetamask = window.ethereum

  /* --------------------------------- Methods -------------------------------- */
  const handleRoute = () => {
    setIsBurgerActive(false)
  }

  const recursiveClickAuthen = (element: HTMLElement | ShadowRoot) => {
    // handle login
    const androidButton = element
      ?.querySelector('.w3m-slider')
      ?.querySelector('w3m-button-big')

    const iosButton = element
      ?.querySelector('w3m-wallet-button[name="Join"]')
      ?.shadowRoot?.querySelector('button')

    if (androidButton) {
      // androidButton!.style.cursor = 'pointer;'
      return androidButton?.click()
    }
    if (iosButton) {
      // iosButton!.style.cursor = 'pointer;'
      return iosButton?.click()
    }

    // travel to children node
    if (element.hasChildNodes()) {
      const children = [...element.children]
      children.forEach((children) =>
        recursiveClickAuthen(children as HTMLElement),
      )
    }

    // travel to shadow root
    if (element instanceof HTMLElement && element.shadowRoot) {
      recursiveClickAuthen(element.shadowRoot)
    }
  }

  const handleAutoAuthen = async () => {
    setLoading(true)
    await open()

    // modal selector
    const w3mModal = document.querySelector('w3m-modal')

    const w3mModalRouter =
      w3mModal?.shadowRoot?.querySelector('w3m-modal-router')

    // hidden modal
    w3mModal!.style.visibility = 'hidden'

    // wait content load
    await new Promise((resolve) => setTimeout(resolve, 500))

    recursiveClickAuthen(w3mModalRouter as HTMLElement)

    // const testFire = document.querySelector('#test-fire') as HTMLElement
    // if (testFire) {
    //   testFire.style.cursor = 'pointer'
    //   testFire.click()
    //   const event = new Event('touchstart')
    //   testFire.dispatchEvent(event)
    // }

    // // content selector
    // const w3mConnectWalletView = w3mModalRouter?.shadowRoot?.querySelector(
    //   'w3m-connect-wallet-view',
    // )
    // const w3mMobileWalletSelection =
    //   w3mConnectWalletView?.shadowRoot?.querySelector(
    //     'w3m-android-wallet-selection, w3m-mobile-wallet-selection',
    //   )
    // const w3mModalContent =
    //   w3mMobileWalletSelection?.shadowRoot?.querySelector('w3m-modal-content')

    // // handle login
    // const androidButton = w3mModalContent
    //   ?.querySelector('.w3m-slider')
    //   ?.querySelector('w3m-button-big')

    // const iosButton = w3mModalContent
    //   ?.querySelector('w3m-wallet-button')
    //   ?.shadowRoot?.querySelector('button')

    // androidButton?.click()
    // iosButton?.click()
  }

  const resetAutoAuthen = () => {
    // wait for animation
    setTimeout(() => {
      setLoading(false)
      document.querySelector('w3m-modal')!.style.visibility = 'visible'
    }, 300)
  }

  /* --------------------------------- Watches -------------------------------- */
  // watch auto authen
  useEffect(() => {
    if (!isAuto || isConnected) return
    handleAutoAuthen()
    setProgressStep(100)
  }, [isAuto])

  useEffect(() => {
    if (loading && isConnected) {
      setLoadingText('Logged In')
      setLoadingDuration(300)
      setProgressStep(100)
    }
  }, [isConnected])

  useMemo(async () => {
    if (progress >= 100) return resetAutoAuthen()
    if (loadingDuration === defaultLoadingDuration && progress >= 85)
      setLoadingText('Please manually select wallet')
    if (progress >= progressStep) return

    await new Promise((resolve) => setTimeout(resolve, loadingDuration / 100))
    setProgress(progress + 1)
  }, [progressStep, progress])

  /* ---------------------------------- Doms ---------------------------------- */
  const ConnectMetamaskButton = () => {
    return (
      <div>
        <a
          href={`https://metamask.app.link/dapp/${window.location.href}`}
          style={{
            marginBottom: '2rem',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: '10px',
            backgroundColor: '#F6851B',
            padding: '0 15px 1px',
            height: '40px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 'normal',
          }}
        >
          Open Metamask
        </a>
      </div>
    )
  }

  return (
    <>
      {loading && (
        <div
          className="shadow-loading"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background: '#16191dbf',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <Progress
              style={{
                fontSize: '30px',
                display: 'flex',
                justifyContent: 'center',
              }}
              type="circle"
              percent={progress}
              strokeColor={{ '0%': '#c60000', '100%': '#2e3338' }}
            />
            <div style={{ textAlign: 'center', paddingTop: '10px' }}>
              {loadingText}
            </div>
          </div>
        </div>
      )}

      <div className="navbar-container">
        <div className="navbar-wrapper">
          <div className="navbar-brand">
            <a href="https://www.jfincoin.io/">
              <img alt="jfinchain logo" src={logo} />
            </a>
          </div>

          <div className="navbar-menu">
            <Link
              className={`${
                ['/', '/staking'].includes(location?.pathname) && 'active'
              }`}
              to={`/staking${isAuto ? '?auto=1' : ''}`}
            >
              Staking
            </Link>
            <Link
              className={`${location?.pathname === '/governance' && 'active'}`}
              to={`/governance${isAuto ? '?auto=1' : ''}`}
            >
              Governance
            </Link>
            <Link
              className={`${location?.pathname === '/assets' && 'active'}`}
              to={`/assets${isAuto ? '?auto=1' : ''}`}
            >
              Assets
            </Link>
            <span>|</span>
            <a
              href={`https://exp.${
                getCurrentEnv() === 'jfin' ? '' : 'testnet.'
              }jfinchain.com/`}
              rel="noreferrer"
              target="_blank"
            >
              Explorer
            </a>
            {getCurrentEnv() === 'jfintest' && (
              <a
                href={`https://faucet.${
                  getCurrentEnv() === 'jfin' ? '' : 'testnet.'
                }jfinchain.com/`}
                rel="noreferrer"
                target="_blank"
              >
                Faucet
              </a>
            )}
          </div>

          <div className="navbar-wallet">
            <div style={{ marginRight: 'auto' }}>
              <div className="justify-end items-center">
                {!isExpectChain && isConnected && (
                  <div
                    style={{
                      marginRight: '1rem',
                      color: '#fa8c16',
                      fontSize: '13px',
                    }}
                  >
                    <WarningOutlined style={{ paddingRight: '0.5rem' }} />
                    <span>
                      Please switch chain to{' '}
                      <b
                        style={{
                          cursor: 'pointer',
                          textDecoration: 'underline',
                        }}
                        onClick={() => switchChain()}
                      >
                        ({EXPECT_CHAIN.chainName})
                      </b>
                    </span>
                  </div>
                )}
                <div
                  onClick={() => alert('Fire!')}
                  onTouchStart={() => alert('Touch')}
                  id="test-fire"
                >
                  Test Fire
                </div>
                <Web3Button />
              </div>
            </div>
          </div>

          <div className={`navbar-burger ${isBurgerActive && 'active'}`}>
            <button
              className="burger-button"
              onClick={() => setIsBurgerActive(!isBurgerActive)}
              type="button"
            >
              {isBurgerActive ? <CloseOutlined /> : <MenuOutlined />}
            </button>
          </div>
        </div>
      </div>
      <div
        className={`navbar-overlay ${isBurgerActive && 'active'}`}
        style={{
          height: isBurgerActive ? (isAuto ? '220px' : '270px') : '0px',
        }}
      >
        <NavHashLink
          className={`${
            ['/', '/staking'].includes(location.pathname) && 'active'
          }`}
          onClick={handleRoute}
          to={`/staking${isAuto ? '?auto=1' : ''}#view-point1`}
        >
          Staking
        </NavHashLink>
        <NavHashLink
          className={`${location.pathname === '/governance' && 'active'}`}
          onClick={handleRoute}
          to={`/governance${isAuto ? '?auto=1' : ''}#view-point2`}
        >
          Governance
        </NavHashLink>
        <NavHashLink
          className={`${location.pathname === '/assets' && 'active'}`}
          onClick={handleRoute}
          to={`/assets${isAuto ? '?auto=1' : ''}#view-point3`}
        >
          Assets
        </NavHashLink>
        <a
          href={`https://exp.${
            getCurrentEnv() === 'jfin' ? '' : 'testnet.'
          }jfinchain.com/`}
          rel="noreferrer"
          target="_blank"
        >
          Explorer
        </a>

        {getCurrentEnv() === 'jfintest' && (
          <a
            href={`https://faucet.${
              getCurrentEnv() === 'jfin' ? '' : 'testnet.'
            }jfinchain.com/`}
            rel="noreferrer"
            target="_blank"
          >
            Faucet
          </a>
        )}

        <div
          style={{
            paddingBottom: '1rem',
            visibility: isAuto ? 'visible' : 'visible',
          }}
        >
          {!isAuto &&
            (!isMetamask ? <ConnectMetamaskButton /> : <Web3Button />)}
          {/* {!isMetamask ? <ConnectMetamaskButton /> : <Web3Button />} */}
        </div>
      </div>
    </>
  )
})

export default Navbar
