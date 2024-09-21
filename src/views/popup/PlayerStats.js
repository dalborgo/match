import React from 'react'
import { Box, Modal, Typography } from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import './wyscout.css'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 600,
  height: 270,
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  outline: 'none',
}

const positionsTitle = {
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
  RCMF3: 'Right Centre Midfielder 3',
  DMF: 'Defensive Midfielder',
  LCMF3: 'Left Centre Midfielder 3',
  RDMF: 'Right Defensive Midfielder',
  LDMF: 'Left Defensive Midfielder',
  RAMF: 'Right Attacking Midfielder',
  LAMF: 'Left Attacking Midfielder',
  RWF: 'Right Wing Forward',
  LWF: 'Left Wing Forward',
  RCB3: 'Right Centre Back 3',
  CB: 'Centre Back',
  LCB3: 'Left Centre Back 3',
  RWB: 'Right Wingback',
  LWB: 'Left Wingback',
  RB5: 'Right Back 5',
  LB5: 'Left Back 5'
}
const percentValues = [
  'primary_position_percent',
  'secondary_position_percent',
  'third_position_percent'
]
const PlayerStats = ({ teamId }) => {
  const { state: player = {} } = useLocation()
  console.log('player.summary:', player.summary)
  const { playerId } = useParams()
  const navigate = useNavigate()
  const dtk = document.getElementById('dtk')?.value
  const { isPending, data: position } = useQuery({
    queryKey: [`position/${playerId}`, { dtk }],
    enabled: Boolean(dtk),
    staleTime: 5000,
  })
  if (isPending && dtk) {return null}
  const positions = [...new Set([...player?.summary?.positions || [], ...player?.stats?.positions || []])]
  return (<Modal
      open={Boolean(true)}
      onClose={() => {
        navigate(`/team/${teamId}`)
      }}
    >
      <Box sx={style}>
        {
          dtk ?
            <Box position="relative">
              <div dangerouslySetInnerHTML={{ __html: position.results }}/>
            </Box>
            :
            <Box position="relative">
              <div className="gears-rel pitch-position"/>
            </Box>
        }
        <Box position="relative" sx={{ left: 170 }}>
          <Box mb={1}>
            <Typography color={'secondary'} variant="h6" display={'inline'}>
              {player.shirtNumber ? `#${player.shirtNumber} ` : ''}
            </Typography>
            <Typography color={'primary'} variant="h6" display={'inline'}>
              {player.title}
            </Typography>
          </Box>
          {
            positions.map((pos, index) => {
              const percent = player?.summary?.[percentValues[index]]
              return (
                <Box key={index} display="flex">
                  <Box flex={1}>{positionsTitle[pos]}</Box>
                  <Box flex={1}>{percent ? `${percent} %` : ''}</Box>
                </Box>
              )
            })
          }
        </Box>
      </Box>
    </Modal>
  )
}

export default PlayerStats
