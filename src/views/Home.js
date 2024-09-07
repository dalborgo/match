import React, { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Box, Button, Typography } from '@mui/material'

const Home = () => {
  const [page, setPage] = useState('0')
  const { isPending, data } = useQuery({
    queryKey: [`calendar/${page}`],
    placeholderData: keepPreviousData,
  })
  if (isPending) {return null}
  const list = data?.results?.list || []
  const general = data?.results?.callbacks?.general || []
  const [first] = general
  const prev_ = general.find(item => item?.params?.params?.transition === 'prev')
  const next_ = general.find(item => item?.params?.params?.transition === 'next')
  const prev = prev_ ? prev_.params.params['period'].split('_')[1] : null
  const next = next_ ? next_.params.params['period'].split('_')[1] : null
  return (
    <Box sx={{ padding: 0 }}>
      <Box display="flex" justifyContent="space-between" sx={{ marginTop: 2 }}>
        <Button size="small" onClick={() => setPage(prev)} disabled={!prev}>Precedente</Button>
        <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2 }}>
          {first?.params?.value}
        </Typography>
        <Button size="small" onClick={() => setPage(next)} disabled={!next}>Successivo</Button>
      </Box>
      <Box>
        {list.map((match, index) => (
          <Box key={index} display="flex" justifyContent="space-between" alignItems="center"
               sx={{ padding: 1, borderBottom: '1px solid #888888' }}>
            <Typography sx={{ minWidth: '250px', textAlign: 'right' }}>{match['teamAName']}</Typography>
            <Typography>{match.separator}</Typography>
            <Typography sx={{ minWidth: '250px', textAlign: 'left' }}>{match['teamBName']}</Typography>
            <Typography sx={{ minWidth: '200px', textAlign: 'right', fontStyle: 'italic', color: '#4caf50' }}>
              {match.data.replace(' CEST', '')}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default Home
