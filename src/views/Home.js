import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import moment from 'moment'
import { getSection } from '../files'
import Rank from './popup/Rank'
import axios from 'axios'
import { envConfig } from '../init'

const PORT = envConfig['BACKEND_PORT']
const HOST = envConfig['BACKEND_HOST']

function manageDate (date) {
  return moment(date.replace(' CEST', ''), 'DD/MM/YYYY HH:mm').format('dddd DD/MM HH:mm')
}

function getTeamIdCodes (rank) {
  const output = {}, output2 = {}
  for (let table of rank) {
    for (let item of table.items) {
      output[item['teamName']] = item['teamId']
      output2[item['teamName']] = table['roundName']
    }
  }
  return [output, output2]
}

const getColor = group => {
  if (!group) {return}
  if (group.includes('Girone A')) {
    return '#81efdf'
  } else if (group.includes('Girone B')) {
    return '#ffd18a'
  } else {
    return '#ff94ef'
  }
}

export const getVideoListName = (video, teamAName) => {
  const name = `${video['date'] ? `${video['date']}_` : ''}${teamAName}_${video['stat']}${video['player'] ? `_${video['player']}_${video['time']}` : ''}`
  return `nm=${video['link']}\ndr=20\nft=57\ntt=${name}\nbr!`
}

function DownloadPdfButton ({ matchId, teamAId, teamBId, teamAName, teamBName, stat, children, style = {} }) {
  const queryClient = useQueryClient()
  const downloadPdf = async () => {
    const [dataA, dataB] = await queryClient.fetchQuery({
      queryKey: [`video/${teamAId}${teamBId}/match/${matchId}`, { stat }],
      queryFn: async () => {
        const dtk = document.getElementById('dtk')?.value
        console.log('dtk:', dtk)
        const responseA = await axios.get(`http://${HOST}:${PORT}/wyscout/video/${teamAId}/match/${matchId}?stat=${stat}&dtk=${dtk}`)
        const responseB = await axios.get(`http://${HOST}:${PORT}/wyscout/video/${teamBId}/match/${matchId}?stat=${stat}&dtk=${dtk}`)
        return [responseA.data, responseB.data]
      },
      meta: { isManualFetching: true }
    })
    const outputA = dataA.results.map(video => {
      return getVideoListName(video, teamAName)
    })
    const outputB = dataB.results.map(video => {
      return getVideoListName(video, teamBName)
    })
    const toSave = [...outputA, ...outputB].join('\n')
    const blob = new Blob([toSave], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${matchId}_${stat}_videos_list.zpl`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  
  return (
    <Link
      onClick={downloadPdf}
      sx={{
        ...style,
        cursor: 'pointer',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline'
        }
      }}>
      {children}
    </Link>
  )
}

function DownloadPdfButtonList ({ list, stat, children, style = {} }) {
  const queryClient = useQueryClient()
  
  const downloadPdf = async () => {
    let allVideosList = []
    
    for (const match of list) {
      const { teamAId, teamBId, matchId, teamAName, teamBName } = match
      
      try {
        const [dataA, dataB] = await queryClient.fetchQuery({
          queryKey: [`video/${teamAId}${teamBId}/match/${matchId}`, { stat }],
          queryFn: async () => {
            const dtk = document.getElementById('dtk')?.value
            const responseA = await axios.get(`http://${HOST}:${PORT}/wyscout/video/${teamAId}/match/${matchId}?stat=${stat}&dtk=${dtk}`)
            const responseB = await axios.get(`http://${HOST}:${PORT}/wyscout/video/${teamBId}/match/${matchId}?stat=${stat}&dtk=${dtk}`)
            return [responseA.data, responseB.data]
          },
          meta: { isManualFetching: true }
        })
        
        const outputA = dataA.results.map(video => getVideoListName(video, teamAName))
        const outputB = dataB.results.map(video => getVideoListName(video, teamBName))
        
        allVideosList = [...allVideosList, ...outputA, ...outputB]
      } catch (error) {
        console.error(`Errore durante il fetch dei dati per la partita ${matchId}:`, error)
      }
    }
    
    const toSave = allVideosList.join('\n')
    const blob = new Blob([toSave], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${stat}_videos_list.zpl`
    link.click()
    URL.revokeObjectURL(link.href)
  }
  
  return (
    <Link
      onClick={downloadPdf}
      sx={{
        ...style,
        cursor: 'pointer',
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'underline'
        }
      }}>
      {children}
    </Link>
  )
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
  if (isPending) {return null}
  const rank = data?.results?.rank || []
  const [teamIdCode, roundNameCode] = getTeamIdCodes(rank)
  const list = data?.results?.list || []
  const general = data?.results?.callbacks?.general || []
  const [first] = general
  const prev_ = general.find(item => item?.params?.params?.transition === 'prev')
  const next_ = general.find(item => item?.params?.params?.transition === 'next')
  const prev = prev_ ? prev_.params.params['period'].split('_')[1] : null
  const next = next_ ? next_.params.params['period'].split('_')[1] : null
  const totalRedCards = []
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
          {
            list.map((match, index) => {
              if (match['matchStats']?.redTotal) {
                totalRedCards.push({
                  teamAName: match['teamAName'],
                  teamBName: match['teamBName'],
                  teamAId: teamIdCode[match['teamAName']],
                  teamBId: teamIdCode[match['teamBName']],
                  matchId: match['objId'],
                })
              }
              return (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    padding: 0,
                    borderBottom: '1px solid #313131',
                    paddingLeft: 1,
                    paddingRight: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Typography
                    color="inherit"
                    component={RouterLink}
                    to={`/team/${teamIdCode[match['teamAName']]}`}
                    state={{ teamName: match['teamAName'] }}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      },
                      flexBasis: '150px',
                      flexGrow: 1,
                      textAlign: 'right',
                      maxWidth: '200px',
                    }}
                  >
                    {match['teamAName']}
                  </Typography>
                  <Link
                    onClick={async () => {
                      navigate(`/${match['objId']}`, {
                        state: {
                          ...match,
                          group: roundNameCode[match['teamAName']],
                          teamAId: teamIdCode[match['teamAName']],
                          teamBId: teamIdCode[match['teamBName']],
                        }
                      })
                    }}
                    sx={{
                      cursor: 'pointer',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      },
                      flexGrow: 0,
                      minWidth: '50px',
                      textAlign: 'center',
                      fontSize: 15,
                    }}
                  >
                    {match['matchStats']?.xgAway ? (
                        <Tooltip
                          placement="top"
                          title={
                            <div>
                              <span
                                style={{ color: 'orange' }}>{`${match['matchStats']?.possessionHome?.toFixed(2)}%`}</span>
                              &nbsp;&nbsp;
                              <span style={{ color: 'cyan' }}>{`${match['matchStats']?.xgHome}`}</span> /&nbsp;
                              <span style={{ color: 'cyan' }}>{`${match['matchStats']?.xgAway}`}</span>
                              &nbsp;&nbsp;
                              <span
                                style={{ color: 'orange' }}>{`${match['matchStats']?.possessionAway?.toFixed(2)}%`}</span>
                            </div>
                          }
                          enterDelay={1000}
                        >
                          {match?.separator.replace('<span>(Rinviata)</span>', 'rinv.')}
                        </Tooltip>
                      )
                      :
                      match?.separator.replace('<span>(Rinviata)</span>', 'rinv.')
                    }
                  </Link>
                  <Typography
                    color="inherit"
                    component={RouterLink}
                    to={`/team/${teamIdCode[match['teamBName']]}`}
                    state={{ teamName: match['teamBName'] }}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      },
                      flexBasis: '150px',
                      flexGrow: 1,
                      textAlign: 'left',
                      maxWidth: '200px',
                    }}
                  >
                    {match['teamBName']}
                  </Typography>
                  <Typography sx={{ flexBasis: '200px', flexGrow: 1, textAlign: 'left', maxWidth: '350px' }}>
                    {match['referee']}{match['referee'] ? getSection(match['referee']) ? ` (${getSection(match['referee'])})` : '' : ''}
                  </Typography>
                  <Typography sx={{ flexBasis: '60px', textAlign: 'center', maxWidth: '80px' }}>
                    <Tooltip placement="left"
                             title={`${match['matchStats']?.foulHome} / ${match['matchStats']?.foulAway}`}>
                      <span style={{ color: 'silver', cursor: 'help' }}>{match['matchStats']?.foulTotal || ''}</span>
                    </Tooltip>
                  </Typography>
                  <Typography sx={{ flexBasis: '60px', textAlign: 'center', maxWidth: '80px' }}>
                    <DownloadPdfButton
                      style={{ color: 'yellow' }}
                      matchId={match['objId']}
                      teamAName={match['teamAName']}
                      teamBName={match['teamBName']}
                      teamAId={teamIdCode[match['teamAName']]}
                      teamBId={teamIdCode[match['teamBName']]}
                      stat="yellow_cards"
                    >
                      <Tooltip placement="left"
                               title={`${match['matchStats']?.yellowHome} / ${match['matchStats']?.yellowAway}`}>
                        <span
                          style={{ color: 'yellow', cursor: 'help' }}>{match['matchStats']?.yellowTotal || ''}</span>
                      </Tooltip>
                    </DownloadPdfButton>
                  </Typography>
                  <Typography sx={{ flexBasis: '60px', textAlign: 'center', maxWidth: '80px' }}>
                    <DownloadPdfButton
                      style={{ color: 'red' }}
                      matchId={match['objId']}
                      teamAName={match['teamAName']}
                      teamBName={match['teamBName']}
                      teamAId={teamIdCode[match['teamAName']]}
                      teamBId={teamIdCode[match['teamBName']]}
                      stat="red_cards"
                    >
                      <Tooltip placement="left"
                               title={`${match['matchStats']?.redHome} / ${match['matchStats']?.redAway}`}>
                        <span style={{ color: 'red', cursor: 'help' }}>{match['matchStats']?.redTotal || ''}</span>
                      </Tooltip>
                    </DownloadPdfButton>
                  </Typography>
                  <Typography sx={{ flexBasis: '60px', textAlign: 'center', maxWidth: '80px' }}>
                    <Tooltip placement="left"
                             title={`${match['matchStats']?.penaltyHome} / ${match['matchStats']?.penaltyAway}`}>
                      <span style={{ color: 'cyan', cursor: 'help' }}>{match['matchStats']?.penaltyTotal || ''}</span>
                    </Tooltip>
                  </Typography>
                  <Typography sx={{ flexBasis: '250px', textAlign: 'right', fontStyle: 'italic', color: '#4caf50' }}>
                    {manageDate(match.data)}{' '}
                    <span style={{ color: getColor(roundNameCode[match['teamAName']]) }}>
                      {roundNameCode[match['teamAName']]?.split(' - ')?.[1]}
                    </span>
                  </Typography>
                </Box>
              )
            })}
        </Box>
        <Box pr={2} textAlign="right" pt={0.5}>
          <DownloadPdfButtonList list={totalRedCards} stat="red_cards"><span
            style={{ color: 'red', fontSize: 'small' }}>█</span></DownloadPdfButtonList>
        </Box>
      </Box>
      {matchId && <Rank rank={rank}/>}
    </>
  )
}

export default Home
