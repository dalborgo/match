import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Box, Button, Link, Typography } from '@mui/material'
import moment from 'moment'
import { getSection } from '../files'
import Rank from './popup/Rank'

function manageDate (date) {
  return moment(date.replace(' CEST', ''), 'DD/MM/YYYY HH:mm').format('dddd DD/MM HH:mm')
}

function getTeamIdCodes (rank) {
  const output = {}
  for (let table of rank) {
    for (let item of table.items) {
      output[item['teamName']] = item['teamId']
    }
  }
  return output
}

const Home = () => {
  const [page, setPage] = useState('0')
  const [initPage, setInitPage] = useState('')
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { isPending, data, isSuccess } = useQuery({
    queryKey: [`calendar/${page}`],
    placeholderData: keepPreviousData,
    staleTime: 300000,
  })
  useEffect(() => {
    if (!initPage && isSuccess) {
      const general = data?.results?.callbacks?.general || []
      const [first] = general
      const value = first?.params?.value
      setInitPage(value?.match(/\d+/)[0])
    }
  }, [data, initPage, isSuccess])
  /* useEffect(() => {
     async function fetchData () {
       await queryClient.prefetchQuery({
         queryKey: ['rank'],
       }, { throwOnError: true })
     }
     
     fetchData().then().catch(error => {setState(() => {throw error})})
   }, [queryClient])*/
  if (isPending) {return null}
  const rank = data?.results?.rank || []
  const teamIdCode = getTeamIdCodes(rank)
  const list = data?.results?.list || []
  const general = data?.results?.callbacks?.general || []
  const [first] = general
  const prev_ = general.find(item => item?.params?.params?.transition === 'prev')
  const next_ = general.find(item => item?.params?.params?.transition === 'next')
  const prev = prev_ ? prev_.params.params['period'].split('_')[1] : null
  const next = next_ ? next_.params.params['period'].split('_')[1] : null
  return (
    <>
      <Box
        sx={{
          height: 'calc(100vh - 65px)',
          marginTop: '48px',
          overflowY: 'auto',
        }}
      >
        <Box display="flex" justifyContent="space-between" sx={{ margin: 2, marginBottom: 0 }}>
          <Button size="small" onClick={() => setPage(prev === initPage ? '0' : prev)}
                  disabled={!prev}>Precedente</Button>
          <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 2 }}>
            {first?.params?.value}
          </Typography>
          <Button size="small" onClick={() => setPage(next === initPage ? '0' : next)}
                  disabled={!next}>Successivo</Button>
        </Box>
        <Box>
          {list.map((match, index) => (
            <Box key={index} display="flex" justifyContent="space-between" alignItems="center"
                 sx={{ padding: 0, borderBottom: '1px solid #313131', paddingLeft: 1, paddingRight: 2 }}>
              <Typography
                color="inherit"
                component={RouterLink}
                to={`/team/${teamIdCode[match['teamAName']]}`}
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  },
                  minWidth: '200px',
                  textAlign: 'right'
                }}>
                {match['teamAName']}
              </Typography>
              <Link
                onClick={
                  async () => {
                    /*const queryKey = [`download/${match['objId']}`]
                      if (!queryClient.getQueryData(queryKey)) {
                        await queryClient.prefetchQuery(queryKey, { throwOnError: true })
                      }*/
                    navigate(`/${match['objId']}`, {
                      state: {
                        ...match,
                        teamAId: teamIdCode[match['teamAName']],
                        teamBId: teamIdCode[match['teamBName']],
                      }
                    })
                  }
                }
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                <Typography sx={{ minWidth: '50px', textAlign: 'center' }}>{match.separator}</Typography>
              </Link>
              <Typography
                color="inherit"
                component={RouterLink}
                to={`/team/${teamIdCode[match['teamBName']]}`}
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  },
                  minWidth: '200px',
                  textAlign: 'left'
                }}>
                {match['teamBName']}
              </Typography>
              <Typography sx={{
                minWidth: '350px',
                textAlign: 'left'
              }}>{match['referee']}{match['referee'] ? ` (${getSection(match['referee'])})` : ''}</Typography>
              <Typography sx={{ minWidth: '200px', textAlign: 'right', fontStyle: 'italic', color: '#4caf50' }}>
                {manageDate(match.data)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {matchId && <Rank rank={rank}/>}
    </>
  )
}

export default Home
