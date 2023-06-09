import './Footer.css'
import packageJson from '../../../../../../package.json'
import { isProd } from '@/index'

const Footer = () => {
  return (
    <div className="footer container">
      <span>
        V{packageJson.version} Commit:{' '}
        {isProd ? (
          <span>
            {' '}
            {`${(
              process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_HASH
            )?.slice(0, 7)}`}{' '}
          </span>
        ) : (
          <>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://github.com/jventures-jdn/project-staking-ui/commit/${process.env.COMMIT_HASH}`}
            >
              {`${(
                process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_HASH
              )?.slice(0, 7)}`}
            </a>{' '}
            {process.env.CF_PAGES_BRANCH}
          </>
        )}
        , Copyright ©2023
        <a href="https://www.jventures.co.th/"> {packageJson.author}</a>
      </span>
    </div>
  )
}

export default Footer
