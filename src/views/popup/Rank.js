import React from 'react'
import { Box, IconButton, Link, Modal, Typography } from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DownloadIcon from '@mui/icons-material/Download'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
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
  <Box flex={1}>
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
      const name = `${video['date'] ? `${video['date']}_` : ''}${teamAName}_${video['stat']}${video['player'] ? `${video['player']}_${video['time']}` : ''}`
      return `nm=${video['link']}\ndr=20\nft=57\ntt=${name}\nbr!`
    })
    const toSave = outputA.join('\n')
    
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

const Rank = () => {
  const { matchId } = useParams()
  const { state: match = {} } = useLocation()
  const navigate = useNavigate()
  const hasResult = match.separator.length > 1
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
        <Box mb={1} display="flex">
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
        <Box display="flex" justifyContent="space-between">
          <VideoList videos={videoA} teamName={match.teamAName} hasResult={hasResult}/>
          <VideoList videos={videoB} teamName={match.teamBName} hasResult={hasResult}/>
        </Box>
      </Box>
    </Modal>
  )
}

export default Rank
