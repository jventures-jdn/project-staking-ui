import './Footer.css'
import packageJson from '../../../../../../package.json'

const Footer = () => {
  return (
    <div className="footer">
      <span>
        V{packageJson.version} Build 03, Copyright ©2023
        <a href="https://www.jventures.co.th/"> {packageJson.author}</a>
      </span>
    </div>
  )
}

export default Footer
