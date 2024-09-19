import React from 'react'
import { Box, Link, Modal, Typography } from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

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
        <Box mb={1}>
          <Typography variant="body2">
            {matchId}
          </Typography>
          <Link
            href={download.results.link}
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            Download
          </Link>
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
