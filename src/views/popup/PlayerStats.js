import React from 'react'
import { Box, Modal } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import './wyscout.css'
import { useQuery } from '@tanstack/react-query'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 400,
  height: 400,
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  outline: 'none',
}

const PlayerStats = ({ teamId }) => {
  const { playerId } = useParams()
  const navigate = useNavigate()
  const { isPending, data: position } = useQuery({
    queryKey: [`position/${playerId}`],
    staleTime: 5000,
  })
  if (isPending) {return null}
  return (<Modal
      open={Boolean(true)}
      onClose={() => {
        navigate(`/team/${teamId}`)
      }}
    >
      <Box sx={style}>
        <Box position="relative">
          <div dangerouslySetInnerHTML={{ __html: position.results }}/>
        </Box>
      </Box>
    </Modal>
  )
}

export default PlayerStats
