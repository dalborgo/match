import React from 'react'
import { Box, Modal, Typography } from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import './wyscout.css'
import { useQuery } from '@tanstack/react-query'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 500,
  height: 270,
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  outline: 'none',
}

const positions = {
  GK: 'Goalkeeper',
  RB: 'Right Back',
  RCB: 'Right Centre Back',
  LCB: 'Left Centre Back',
  LB: 'Left Back',
  RW: 'Right Winger',
  RCMF: 'Right Centre Midfielder',
  LCMF: 'Left Centre Midfielder',
  LW: 'Left Winger',
  SS: 'Second Striker',
  CF: 'Striker',
  AMF: 'Attacking Midfielder',
  RCMF3: 'Right Centre Midfielder',
  DMF: 'Defensive Midfielder',
  LCMF3: 'Left Centre Midfielder',
  RDMF: 'Right Defensive Midfielder',
  LDMF: 'Left Defensive Midfielder',
  RAMF: 'Right Attacking Midfielder',
  LAMF: 'Left Attacking Midfielder',
  RWF: 'Right Wing Forward',
  LWF: 'Left Wing Forward',
  RCB3: 'Right Centre Back (3 at the back)',
  CB: 'Centre Back',
  LCB3: 'Left Centre Back (3 at the back)',
  RWB: 'Right Wingback',
  LWB: 'Left Wingback',
  RB5: 'Right Back (5 at the back)',
  LB5: 'Left Back (5 at the back)'
}

const PlayerStats = ({ teamId }) => {
  const { state: player = {} } = useLocation()
  const { playerId } = useParams()
  const navigate = useNavigate()
  const { isPending, data: position } = useQuery({
    queryKey: [`position/${playerId}`, { dtk: document.getElementById('dtk').value }],
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
        <Box position="relative" sx={{ left: 170 }}>
          <Box mb={1}>
            <Typography color={'secondary'} variant="h6" display={'inline'}>
              {player.shirtNumber ? '#' + player.shirtNumber + ' ' : ''}
            </Typography>
            <Typography color={'primary'} variant="h6" display={'inline'}>
              {player.title}
            </Typography>
          </Box>
          {
            player?.stats?.positions?.map((pos, index) => {
              return <Box key={index}>{positions[pos]}</Box>
            })
          }
        </Box>
      </Box>
    </Modal>
  )
}

export default PlayerStats
