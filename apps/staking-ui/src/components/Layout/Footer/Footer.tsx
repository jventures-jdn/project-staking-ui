import './Footer.css'
import packageJson from '../../../../../../package.json'

const Footer = () => {
  return (
    <div className="footer">
      <span>
        V{packageJson.version} Commit:{' '}
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://github.com/jventures-jdn/project-staking-ui/commit/${process.env.REACT_APP_COMMIT}`}
        >
          {`${process.env.REACT_APP_COMMIT?.slice(
            0,
            4,
          )}...${process.env.REACT_APP_COMMIT?.slice(-4)}`}
        </a>
        , Copyright ©2023
        <a href="https://www.jventures.co.th/"> {packageJson.author}</a>
      </span>
    </div>
  )
}

export default Footer
