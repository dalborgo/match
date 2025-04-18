import React from 'react'
import {
  Box,
  IconButton,
  LinearProgress,
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
import { Link as RouterLink, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useIsFetching, useQuery, useQueryClient } from '@tanstack/react-query'
import DownloadIcon from '@mui/icons-material/Download'
import CloseIcon from '@mui/icons-material/Close'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import axios from 'axios'
import { envConfig } from '../../init'
import { getVideoListName } from '../Home'

const PORT = envConfig['BACKEND_PORT']
const HOST = envConfig['BACKEND_HOST']
const style = {
  height: '100%',
  bgcolor: 'background.paper',
  overflow: 'auto',
  outline: 'none',
  padding: 2,
}

const selectIcon = (stat, stat2) => {
  switch (stat) {
    case 'fouls': {
      if (stat2 === 'dangerous_fouls') {
        return (<span style={{ color: 'orange' }}>D</span>)
      } else if (stat2 === 'out_of_play_fouls') {
        return (<span style={{ color: 'orange' }}>O</span>)
      } else {
        return (<span style={{ color: 'cyan' }}>P</span>)
      }
    }
    case 'yellow_card':
      return (<span style={{ color: 'yellow' }}>█</span>)
    case 'red_card':
      return (<span style={{ color: 'red' }}>█</span>)
    case 'Corner_conceded':
      return 'Corner subito'
    case 'Corner_Kick':
      return 'Corner eseguito'
    default:
      return ''
  }
}

const TeamLogo = ({ team }) => {
  const handleDownloadInBackground = () => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = team.thumb
    
    const imgElement = tempDiv.querySelector('img')
    
    if (imgElement) {
      const imgURL = imgElement.src
      
      const newWindow = window.open(imgURL, '_blank', 'noopener,noreferrer')
      
      if (newWindow) {
        newWindow.blur()
        window.focus()
      }
    } else {
      console.error('Nessuna immagine trovata nel contenuto HTML.')
    }
  }
  
  return (
    <div className="team-logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
         onClick={handleDownloadInBackground}>
      <div dangerouslySetInnerHTML={{ __html: team.thumb }} style={{ marginRight: 8 }}/>
      {team.teamName}
    </div>
  )
}

const VideoList = ({ videos, teamName, hasResult, schemas, teamId }) => (
  <Box width="400px">
    <Typography
      color="inherit"
      variant="h6"
      component={RouterLink}
      to={`/team/${teamId}?teamName=${teamName}`}
      state={{ teamName: teamName }}
      sx={{
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline'
        },
      }}
    >
      {teamName}
    </Typography>
    {
      schemas.length > 0 && (
        schemas.slice(0, 4).map((scheme, index) => (
          <Box key={index}>
            <Typography variant="body2" display="inline">{scheme['module']}</Typography>&nbsp;&nbsp;
            <Typography color="primary" display="inline" variant="body2">{scheme['percentage']}%</Typography>
          </Box>
        ))
      )
    }
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
            {selectIcon(video.stat, video.stat2)}{video.player ? ` ${video.player}` : ''}{video.time ? ` (${video.time}${!hasResult && video.date ? ` - ${video.date}` : ''})` : ''}
          </Link>
        </Box>
      ))
    ) : (
      <Typography variant="body2">Nessun video disponibile</Typography>
    )}
  </Box>
)

function DownloadPdfButton ({ matchId }) {
  const queryClient = useQueryClient()
  
  const openPdfInNewTab = async () => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: [`print/${matchId}`],
        queryFn: async () => {
          const response = await axios.get(`http://${HOST}:${PORT}/wyscout/print/${matchId}`, {
            responseType: 'blob'
          })
          return response.data
        },
        meta: { isManualFetching: true }
      })
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result
        const pdfWindow = window.open(dataUrl, '_blank') // Apre il PDF in una nuova scheda
        
        if (!pdfWindow) {
          console.error('Impossibile aprire la nuova scheda per il PDF')
        } else {
          pdfWindow.focus()
        }
      }
      reader.onerror = () => console.error('Errore nella conversione del blob in data URL')
      reader.readAsDataURL(data)
      
    } catch (error) {
      console.error('Download failed:', error)
    }
  }
  return (
    <Box>
      <IconButton onClick={openPdfInNewTab}><PictureAsPdfIcon/></IconButton>
    </Box>
  )
}

const DownloadVideo = ({ videoA, videoB, teamAName, teamBName }) => {
  const handleDownload = () => {
    const outputA = videoA.map(video => {
      return getVideoListName(video, teamAName)
    })
    const outputB = videoB.map(video => {
      return getVideoListName(video, teamBName)
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
    <IconButton onClick={handleDownload}>
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
          {rank?.items.map((team) => (
            <TableRow
              key={team.teamId}
              sx={{
                backgroundColor: (team.teamName === teamA || team.teamName === teamB) ? '#343434' : 'inherit'
              }}
            >
              <TableCell>{team.rank}</TableCell>
              <TableCell>
                <TeamLogo team={team}/>
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
  const isFetching = useIsFetching()
  const { state: match_ = {} } = useLocation()
  const match = match_ || {}
  const navigate = useNavigate()
  const hasResult = match?.separator?.length > 1
  const { isPending, data: download } = useQuery({
    enabled: Boolean(match_),
    queryKey: [`download/${hasResult ? matchId : 0}`, { teamAId: match.teamAId, teamBId: match.teamBId }],
    staleTime: 5000,
  })
  if (isPending) {return null}
  const currentRank = rank?.find(rank => rank.roundName.includes(match.group))
  const { videoA, videoB, schemaA, schemaB } = download.results
  return (
    <Modal
      open={Boolean(true)}
      onClose={() => navigate('/calendar')}
    >
      <Box sx={style}>
        {isFetching > 0 && (
          <LinearProgress
            color="primary"
            sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2 }}
          />
        )}
        <Box>
          <Box display="flex">
            <Box flexGrow={1}>
              {
                hasResult &&
                <>
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
                </>
              }
            </Box>
            {
              hasResult &&
              <DownloadPdfButton matchId={matchId}/>
            }
            <DownloadVideo videoA={videoA} videoB={videoB} teamAName={match.teamAName} teamBName={match.teamBName}/>
            <IconButton onClick={() => navigate('/calendar')}><CloseIcon/></IconButton>
          </Box>
          <Box display="flex">
            <VideoList
              videos={videoA}
              teamName={match.teamAName}
              hasResult={hasResult}
              schemas={schemaA}
              teamId={match.teamAId}
            />
            <VideoList
              videos={videoB}
              teamName={match.teamBName}
              hasResult={hasResult}
              schemas={schemaB}
              teamId={match.teamBId}
            />
            <Ranking rank={currentRank} teamA={match.teamAName} teamB={match.teamBName}/>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default Rank
