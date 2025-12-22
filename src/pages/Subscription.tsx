import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Subscription = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to profile page with subscription tab
    navigate('/profile?tab=subscription', { replace: true })
  }, [navigate])

  return null
}

export default Subscription