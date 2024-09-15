import React from 'react'
import { Box, Link, Modal, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 2,
  outline: 'none',
}

const Rank = () => {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { isPending, data: download } = useQuery({
    queryKey: [`download/${matchId}`],
    staleTime: 5000,
  })
  if (isPending) {return null}
  return (<Modal
      open={Boolean(true)}
      onClose={() => {
        navigate('/')
      }}
    >
      <Box sx={style}>
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          {matchId}
        </Typography>
        <Link
          href={download.results}
          sx={{
            cursor: 'pointer',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          <Typography sx={{ textAlign: 'center' }}>Download</Typography>
        </Link>
      </Box>
    </Modal>
  )
}

export default Rank
