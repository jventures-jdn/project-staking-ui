import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'
import logo from '../../assets/images/logo.svg'
import { useState } from 'react'
import { CloseOutlined, MenuOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react'
import { NavHashLink } from 'react-router-hash-link'
import { Web3Button } from '@web3modal/react'
import { getCurrentEnv, useBasStore } from '../../stores'

const Navbar = observer(() => {
  /* --------------------------------- States --------------------------------- */
  const [isBurgerActive, setIsBurgerActive] = useState(false)
  const location = useLocation()

  /* --------------------------------- Methods -------------------------------- */
  const handleRoute = () => {
    setIsBurgerActive(false)
  }

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <>
      <div className="navbar-container">
        <div className="navbar-wrapper">
          <div className="navbar-brand">
            <a href="https://jfinchain.com">
              <img alt="jfinchain logo" src={logo} />
            </a>
          </div>

          <div className="navbar-menu">
            <Link
              className={`${
                ['/', '/staking'].includes(location?.pathname) && 'active'
              }`}
              to="/staking"
            >
              Staking
            </Link>
            <Link
              className={`${location?.pathname === '/governance' && 'active'}`}
              to="/governance"
            >
              Governance
            </Link>
            <Link
              className={`${location?.pathname === '/assets' && 'active'}`}
              to="/assets"
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
            <Web3Button />
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
      <div className={`navbar-overlay ${isBurgerActive && 'active'}`}>
        <NavHashLink
          className={`${
            ['/', '/staking'].includes(location.pathname) && 'active'
          }`}
          onClick={handleRoute}
          to="/staking#view-point1"
        >
          Staking
        </NavHashLink>
        <NavHashLink
          className={`${location.pathname === '/governance' && 'active'}`}
          onClick={handleRoute}
          to="/governance#view-point2"
        >
          Governance
        </NavHashLink>
        <NavHashLink
          className={`${location.pathname === '/assets' && 'active'}`}
          onClick={handleRoute}
          to="/assets#view-point3"
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
        <div style={{ paddingBottom: '1rem' }}>
          <Web3Button />
        </div>
      </div>
    </>
  )
})

export default Navbar
