import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateToken } from '../api/LoginRegisterApi'


const ProtectedPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await validateToken()
          navigate('/admin', { replace: true })
        console.log("Validation response:", result)
        setLoading(false)
      } catch (err) {
        console.error("Validation failed:", err)
        navigate('/login', { replace: true })
      }
    }

    checkAuth()
  }, [navigate])

  return (
    <div>
      <p>Checking authentication...</p>
    </div>
  )
}

export default ProtectedPage
