import React from 'react'
import { Box, IconButton, Modal, TableCell, TableRow, Tooltip, Typography } from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import CloseIcon from '@mui/icons-material/Close'
import './wyscout.css'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 600,
  height: 400,
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
const allowedCompetitions = ['Serie A', 'Serie B', 'Serie C', 'Serie D']
const PlayerStats = ({ teamId }) => {
  const { state: player = {} } = useLocation()
  const { playerId } = useParams()
  const navigate = useNavigate()
  const { isPending, data: position } = useQuery({
    queryKey: [`position/${playerId}`],
    staleTime: 5000,
  })
  if (isPending) {return null}
  const filteredData = Object.entries(player?.career || {})
    .filter(([key]) => allowedCompetitions.includes(key))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  const positions = [...new Set([...player?.summary?.positions || [], ...player?.stats?.positions || []])]
  return (<Modal
      open={Boolean(true)}
      onClose={() => {
        navigate(`/team/${teamId}`, { state: { teamName: player['teamName'] } })
      }}
    >
      <Box sx={style}>
        <Box position="relative" sx={{ top: 40 }}>
          <div dangerouslySetInnerHTML={{ __html: position.results.html }}/>
        </Box>
        <IconButton
          size="small"
          onClick={() => {
            navigate(`/team/${teamId}`, { state: { teamName: player['teamName'] } })
          }}
          style={{ marginTop: -10 }}
        >
          <CloseIcon/>
        </IconButton>
        <Box position="relative" sx={{ left: 170 }} mt={-4}>
          <Box mb={1}>
            <Typography color="secondary" variant="h6" display="inline">
              {player.shirtNumber ? `#${player.shirtNumber} ` : ''}
            </Typography>
            <Typography color="primary" variant="h6" display="inline">
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
        <br/>
        <Box position="relative" sx={{ left: 170 }}>
          {
            filteredData.length > 0 ? (
              filteredData.map(([league, stats], index) => (
                <Box key={index} display="flex" width={315}>
                  <Box flex={1} sx={{ cursor: 'help' }}>
                    <Tooltip title={stats.teamName?.join(', ')}>
                      {league}
                    </Tooltip>
                  </Box>
                  <Box flex={1} textAlign="right">{stats.appearances}</Box>
                  <Box flex={1} textAlign="right">{stats.goal}</Box>
                </Box>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nessun dato disponibile
                </TableCell>
              </TableRow>
            )
          }
        </Box>
        <Box position="relative" sx={{ left: 170 }} mt={2}>
          {
            position.results.lastMatches.length > 0 ? (
              position.results.lastMatches.map(({ realdate, role, min, teamsNames }, index) => (
                <Box key={index} display="flex" width={315}>
                  <Box flex={1} sx={{ cursor: 'help' }}>
                    <Tooltip title={teamsNames}>
                      {realdate}
                    </Tooltip>
                  </Box>
                  <Box flex={1} textAlign="right">{role}</Box>
                  <Box flex={1} textAlign="right">{min}</Box>
                </Box>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nessun dato disponibile
                </TableCell>
              </TableRow>
            )
          }
        </Box>
      </Box>
    </Modal>
  )
}

export default PlayerStats
