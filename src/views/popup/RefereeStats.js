import React from 'react'
import { Box, IconButton, Modal, Typography } from '@mui/material'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import CloseIcon from '@mui/icons-material/Close'
import './wyscout.css'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: 1000,
  height: 600,
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  pt: 1,
  outline: 'none',
}

const RefereeStats = () => {
  const location = useLocation()
  const { state: referee = {} } = location
  const { refId } = useParams()
  const navigate = useNavigate()
  const { isPending, data } = useQuery({
    queryKey: [`match_ref/${refId}`],
    staleTime: 5000,
  })
  const matches = data?.results || []
  if (isPending) {return null}
  return (<Modal
      open={Boolean(true)}
      onClose={() => {
        navigate('/referee')
      }}
    >
      <Box sx={style}>
        <Box mb={1} display="flex" alignItems="center">
          <Typography color="primary" variant="h6" display="inline">
            {referee['name']}
          </Typography>
          <Box flexGrow={1}/>
          <IconButton
            size="small"
            onClick={() => {
              navigate('/referee')
            }}
          >
            <CloseIcon/>
          </IconButton>
        </Box>
        {
          matches.map((match, index) => {
            const [title, result] = match['title'].split(', ')
            return (
              <Box key={index} display="flex">
                <Box mr={2}>{match['date']}</Box>
                <Box width={250}>{match['group']}</Box>
                <Box width={360}>{title}</Box>
                <Box width={100}>{result}</Box>
                <Box width={100}>{match['foulTotal']}</Box>
                <Box width={100}>{match['penaltyTotal']}</Box>
                <Box width={100}>{match['yellowTotal']}</Box>
                <Box>{match['redTotal']}</Box>
              </Box>
            )
          })
        }
      </Box>
    </Modal>
  )
}

export default RefereeStats
