import React from 'react'
import {
  Box,
  IconButton,
  Link,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DownloadIcon from '@mui/icons-material/Download'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1200,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  outline: 'none',
}

const selectIcon = stat => {
  switch (stat) {
    case 'yellow_card':
      return '🟨'
    case 'red_card':
      return '🟥'
    case 'Corner_conceded':
      return 'Corner subito'
    default:
      return ''
  }
}

const VideoList = ({ videos, teamName, hasResult }) => (
  <Box width="400px">
    <Typography variant="h6">{teamName}</Typography>
    {videos.length > 0 ? (
      videos.map((video, index) => (
        <Box key={index}>
          <Link
            variant="body2"
            href={video.link}
            target="_blank"
            rel="noopener"
            sx={{
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {selectIcon(video.stat)}{video.player ? ` ${video.player}` : ''}{video.time ? ` (${video.time}${!hasResult && video.date ? ` - ${video.date}` : ''})` : ''}
          </Link>
        </Box>
      ))
    ) : (
      <Typography variant="body2">Nessun video disponibile</Typography>
    )}
  </Box>
)

const DownloadVideo = ({ videoA, videoB, teamAName, teamBName }) => {
  const handleDownload = () => {
    const outputA = videoA.map(video => {
      const name = `${video['date'] ? `${video['date']}_` : ''}${teamAName}_${video['stat']}${video['player'] ? `_${video['player']}_${video['time']}` : ''}`
      return `nm=${video['link']}\ndr=20\nft=57\ntt=${name}\nbr!`
    })
    const outputB = videoB.map(video => {
      const name = `${video['date'] ? `${video['date']}_` : ''}${teamBName}_${video['stat']}${video['player'] ? `_${video['player']}_${video['time']}` : ''}`
      return `nm=${video['link']}\ndr=20\nft=57\ntt=${name}\nbr!`
    })
    const toSave = [...outputA, ...outputB].join('\n')
    const blob = new Blob([toSave], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${teamAName}_${teamBName}_videos_list.zpl`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  
  return (
    <IconButton onClick={handleDownload} size="small">
      <DownloadIcon/>
    </IconButton>
  )
}

const Ranking = ({ rank, teamA, teamB }) => {
  return (
    <TableContainer>
      <style>
        {`
          .team-logo img {
            width: 15px; /* Definisce la larghezza */
            height: 15px; /* Definisce l'altezza */
            object-fit: contain; /* Mantiene le proporzioni */
          }
        `}
      </style>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell/>
            <TableCell>Squadra</TableCell>
            <TableCell align="center">G</TableCell>
            <TableCell align="center">V</TableCell>
            <TableCell align="center">P</TableCell>
            <TableCell align="center">S</TableCell>
            <TableCell align="center">GF</TableCell>
            <TableCell align="center">GS</TableCell>
            <TableCell align="center">DR</TableCell>
            <TableCell align="center">P</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rank.items.map((team) => (
            <TableRow
              key={team.teamId}
              sx={{
                backgroundColor: (team.teamName === teamA || team.teamName === teamB) ? '#343434' : 'inherit'
              }}
            >
              <TableCell>{team.rank}</TableCell>
              <TableCell>
                <div className="team-logo" style={{ display: 'flex', alignItems: 'center' }}>
                  <div dangerouslySetInnerHTML={{ __html: team.thumb }} style={{ marginRight: 8 }}/>
                  {team.teamName}
                </div>
              </TableCell>
              <TableCell align="center">{team.matchTotal}</TableCell>
              <TableCell align="center">{team.matchWon}</TableCell>
              <TableCell align="center">{team.matchDraw}</TableCell>
              <TableCell align="center">{team.matchLost}</TableCell>
              <TableCell align="center">{team.goalPro}</TableCell>
              <TableCell align="center">{team.goalAgainst}</TableCell>
              <TableCell
                align="center">{`${team.goalPro - team.goalAgainst > 0 ? '+' : ''}${team.goalPro - team.goalAgainst}`}</TableCell>
              <TableCell align="center"><strong>{team.points}</strong></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const Rank = ({ rank }) => {
  const { matchId } = useParams()
  const { state: match = {} } = useLocation()
  const navigate = useNavigate()
  const hasResult = match?.separator?.length > 1
  const currentRank = rank?.find(rank => rank.roundName.includes(match.group))
  const { isPending, data: download } = useQuery({
    queryKey: [`download/${hasResult ? matchId : 0}`, { teamAId: match.teamAId, teamBId: match.teamBId }],
    staleTime: 5000,
  })
  if (isPending) {return null}
  const { videoA, videoB } = download.results
  return (<Modal
      open={Boolean(true)}
      onClose={() => {
        navigate('/')
      }}
    >
      <Box sx={style}>
        <Box>
          <Box display="flex">
            <Box flexGrow={1}>
              Video: <Link
              href={download.results.link}
              sx={{
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {matchId}
            </Link>
            </Box>
            <DownloadVideo videoA={videoA} videoB={videoB} teamAName={match.teamAName} teamBName={match.teamBName}/>
          </Box>
          <Box display="flex">
            <VideoList videos={videoA} teamName={match.teamAName} hasResult={hasResult}/>
            <VideoList videos={videoB} teamName={match.teamBName} hasResult={hasResult}/>
            <Ranking rank={currentRank} teamA={match.teamAName} teamB={match.teamBName}/>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default Rank
