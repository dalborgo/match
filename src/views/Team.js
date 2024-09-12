import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

const Team = () => {
  const { id } = useParams()
  const { isPending, data } = useQuery({
    queryKey: [`grid/${id}`],
  })
  if (isPending) { return null}
  console.log('data:', data)
  return (
    <div>
      <h5>Team ID: {id}</h5>
    </div>
  )
}

export default Team
