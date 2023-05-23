import ProposalTable from '@/components/Governance/ProposalTable'
import { BankOutlined } from '@ant-design/icons'
import { chainGovernance } from '@utils/chain/src/contract'
import { useEffect, useState } from 'react'

const Governance = () => {
  /* --------------------------------- States --------------------------------- */
  const [loading, setLoading] = useState(false)

  /* --------------------------------- Methods -------------------------------- */
  const initial = async () => {
    setLoading(true)
    await chainGovernance.getProposals()
    setLoading(false)
  }
  useEffect(() => {
    initial()
    return () => setLoading(false)
  }, [])

  /* ---------------------------------- Doms ---------------------------------- */
  return (
    <div className="governance-container mt-2" id="view-point2">
      <div className="content-card">
        <div className="card-title">
          <b>
            <BankOutlined /> <span>Governance</span>
          </b>
        </div>
        <div className="card-body">
          <div id="view-point1">
            <ProposalTable loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Governance
