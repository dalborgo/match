import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IntegratedSorting, SortingState, } from '@devexpress/dx-react-grid'
import { Grid, TableHeaderRow, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Avatar, Box, Link, Tooltip } from '@mui/material'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTheme, withStyles } from '@mui/styles'
import PlayerStats from './popup/PlayerStats'
import { getArea } from './helpers'

const shouldDisplayAvatar = photoUrl => {
  return photoUrl && !photoUrl.includes('ndplayer')
}

const ROLES = {
  'GKP': 'Portiere',
  'DEF': 'Difensore',
  'MID': 'Centrocampista',
  'FWD': 'Attaccante'
}

const priority = {
  GKP: 1,
  DEF: 2,
  MID: 3,
  FWD: 4
}

const compareWithNull = (a, b) => {
  const valA = !a ? 0 : a
  const valB = !b ? 0 : b
  return valA - valB
}
export const compareByRole = (roleA, roleB) => {
  const priorityA = priority[roleA] || 5
  const priorityB = priority[roleB] || 5
  return priorityA - priorityB
}
const getLastName = (fullName) => {
  const parts = fullName.split(' ')
  return parts.slice(1).join(' ')
}
const compareByName = (a, b) => {
  const lastNameA = getLastName(a)
  const lastNameB = getLastName(b)
  return lastNameA.localeCompare(lastNameB)
}

const tableColumnExtensions = [
  { columnName: 'roleAShort', width: 70 },
  { columnName: 'shirtNumber', width: 55 },
  { columnName: 'photoUrl', width: 55 },
  { columnName: 'title', width: 170 },
  { columnName: 'market_value', width: 70, align: 'right' },
  { columnName: 'age', width: 60 },
  { columnName: 'height', width: 60 },
  { columnName: 'minutes_on_field', width: 60 },
  { columnName: 'appearances', width: 60 },
  { columnName: 'goal', width: 60 },
  { columnName: 'assist', width: 55 },
  { columnName: 'yellow_cards', width: 60 },
  { columnName: 'red_cards', width: 60 },
  { columnName: 'foul', width: 55 },
  { columnName: 'dangerous_foul', width: 60 },
  { columnName: 'protest_foul', width: 60 },
  { columnName: 'penalty_foul', width: 60 },
  { columnName: 'tackle', width: 55 },
  { columnName: 'pressing_duel', width: 60 },
  { columnName: 'opponent_half_recovery', width: 60 },
  { columnName: 'progressive_run', width: 55 },
  { columnName: 'dribble', width: 55 },
  { columnName: 'shot_from_outside_area', width: 60 },
  { columnName: 'foul_suffered', width: 60 },
]

const copyTeam = rows => {
  let toCopy = ''
  for (let row of rows.sort((a, b) => compareByRole(a.roleAShort, b.roleAShort))) {
    if (!row.roleAShort && row.shirtNumber) {continue}
    toCopy += `${row.shirtNumber ? row.shirtNumber + '\n' : ''}${getLastName(row.title)}\n${ROLES[row.roleAShort] || 'Allenatore'}\n\n`
  }
  return toCopy
}

const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const Team = () => {
  const { id, playerId } = useParams()
  const queryClient = useQueryClient()
  const location = useLocation()
  const state = location.state || {}
  const { isPending, data } = useQuery({
    queryKey: [`grid/${id}`],
    staleTime: 300000,
  })
  const [columns] = useState([
    {
      name: 'roleAShort',
      title: 'R.',
      getCellValue: row => !row.roleAShort && !row.shirtNumber ? 'ALL' : row.roleAShort
    },
    { name: 'shirtNumber', title: 'N.' },
    { name: 'photoUrl', title: ' ' },
    { name: 'title', title: 'Nome' },
    { name: 'age', title: 'Y', getCellValue: row => row.summary.age },
    { name: 'height', title: 'H', getCellValue: row => row.summary.height || '' },
    { name: 'market_value', title: '€', getCellValue: row => row.summary.market_value },
    { name: 'minutes_on_field', title: 'M', getCellValue: row => row.stats.minutes_on_field },
    { name: 'appearances', title: 'P', getCellValue: row => row.stats.appearances },
    { name: 'goal', title: '⚽', getCellValue: row => row.stats.goal },
    { name: 'assist', title: 'A', getCellValue: row => row.stats.assist },
    { name: 'yellow_cards', title: '█', getCellValue: row => row.stats.yellow_cards },
    { name: 'red_cards', title: '█', getCellValue: row => row.stats.red_cards },
    { name: 'foul', title: 'F', getCellValue: row => row.stats.foul },
    { name: 'dangerous_foul', title: 'DF', getCellValue: row => row.stats.dangerous_foul },
    { name: 'protest_foul', title: 'PF', getCellValue: row => row.stats.protest_foul },
    { name: 'penalty_foul', title: 'PE', getCellValue: row => row.stats.penalty_foul },
    { name: 'tackle', title: 'T', getCellValue: row => row.stats.tackle },
    { name: 'pressing_duel', title: 'PD', getCellValue: row => row.stats.pressing_duel },
    { name: 'opponent_half_recovery', title: 'OR', getCellValue: row => row.stats.opponent_half_recovery },
    { name: 'progressive_run', title: 'R', getCellValue: row => row.stats.progressive_run },
    { name: 'dribble', title: 'D', getCellValue: row => row.stats.dribble },
    { name: 'shot_from_outside_area', title: 'SO', getCellValue: row => row.stats.shot_from_outside_area },
    { name: 'foul_suffered', title: 'FS', getCellValue: row => row.stats.foul_suffered },
    { name: 'pass_to_final_third_success', title: 'PF', getCellValue: row => row.stats.pass_to_final_third_success },
  ])
  const [integratedSortingColumnExtensions] = useState([
    { columnName: 'roleAShort', compare: compareByRole },
    { columnName: 'title', compare: compareByName },
    { columnName: 'height', compare: compareWithNull },
    { columnName: 'minutes_on_field', compare: compareWithNull },
    { columnName: 'appearances', compare: compareWithNull },
    { columnName: 'goal', compare: compareWithNull },
    { columnName: 'assist', compare: compareWithNull },
    { columnName: 'yellow_cards', compare: compareWithNull },
    { columnName: 'red_cards', compare: compareWithNull },
    { columnName: 'foul', compare: compareWithNull },
    { columnName: 'protest_foul', compare: compareWithNull },
    { columnName: 'dangerous_foul', compare: compareWithNull },
    { columnName: 'penalty_foul', compare: compareWithNull },
    { columnName: 'tackle', compare: compareWithNull },
    { columnName: 'pressing_duel', compare: compareWithNull },
    { columnName: 'opponent_half_recovery', compare: compareWithNull },
    { columnName: 'progressive_run', compare: compareWithNull },
    { columnName: 'dribble', compare: compareWithNull },
    { columnName: 'shot_from_outside_area', compare: compareWithNull },
    { columnName: 'foul_suffered', compare: compareWithNull },
    { columnName: 'pass_to_final_third_success', compare: compareWithNull },
  ])
  const [sortingStateColumnExtensions] = useState([
    { columnName: 'photoUrl', sortingEnabled: false },
  ])
  useEffect(() => {
    return () => {
      queryClient.cancelQueries({ queryKey: [`grid/${id}`] })
    }
  }, [id, queryClient])
  const rows = data?.results?.players || []
  const highestStats = data?.results?.highestStats || {}
  const highestSummary = data?.results?.highestSummary || {}
  const toCopy = copyTeam(rows)
  const Cell = React.memo(props => {
    const { column, value, row } = props
    const theme = useTheme()
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const cellStyle = {
      padding: theme.spacing(1),
      whiteSpace: 'normal',
      borderColor: '#2f2f2f',
      height: 42,
    }
    if (column.name === 'title') {
      const career = row?.career || {}
      return (
        <VirtualTable.Cell {...props} value={null} style={cellStyle}>
          <img
            src={`https://cdn5.wyscout.com/photos/area/public/${row['flag']}_180x120.jpg`}
            style={{ width: 15, cursor: 'help' }}
            alt="flag"
            title={getArea(row['flag'])}
          />&nbsp;
          <Link
            onClick={
              () => {
                navigate(`${pathname}/player/${row.id}`, { state: { ...row, teamName: state.teamName } })
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
            <span style={{ color: career?.['Serie A']?.['appearances'] ? 'gold' : undefined }}>{value}</span>
          </Link>&nbsp;
          <span style={{ color: '#b3b3b3' }}>{row.subtitle}</span>
        </VirtualTable.Cell>
      )
    }
    if (column.name === 'market_value') {
      const isBest = highestSummary?.[column.name]?.['idPlayer'] === row.id
      return (
        <VirtualTable.Cell {...props} value={null} style={{
          ...cellStyle,
          color: isBest ? 'gold' : undefined,
          fontWeight: isBest ? 'bold' : undefined,
        }}>
          {value ? value.toLocaleString('it-IT') : ''}
        </VirtualTable.Cell>
      )
    }
    if (column.name === 'photoUrl') {
      if (!shouldDisplayAvatar(value)) {
        return <VirtualTable.Cell {...props} value={null} style={cellStyle}/>
      }
      return (
        <VirtualTable.Cell  {...props} style={cellStyle}>
          <Tooltip
            title={<img src={value} alt="img" style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '200px',
              maxHeight: '200px'
            }}/>}
            placement="top"
          >
            <Avatar
              src={value}
              style={{
                width: 24,
                height: 24,
                cursor: 'help',
                padding: 0,
              }}/>
          </Tooltip>
        </VirtualTable.Cell>
      )
    }
    const isBest = highestStats?.[column.name]?.['idPlayer'] === row.id || highestSummary?.[column.name]?.['idPlayer'] === row.id
    return (
      <VirtualTable.Cell {...props} style={{
        ...cellStyle,
        color: isBest ? 'gold' : undefined,
        fontWeight: isBest ? 'bold' : undefined,
      }}>
        {value}
      </VirtualTable.Cell>
    )
  })
  
  const Head = React.memo(withStyles(null, { withTheme: true })(props => {
    const { column, theme } = props
    const cellStyle = {
      padding: theme.spacing(1),
      borderBottom: 0,
      backgroundColor: '#191919'
    }
    if (column.name === 'photoUrl') {
      return (
        <VirtualTable.Cell {...props} style={cellStyle}>
          <CopyToClipboard text={toCopy}>
            <span style={{ fontSize: 'small', cursor: 'pointer', marginTop: -6, marginLeft: 4 }}>📋</span>
          </CopyToClipboard>
        </VirtualTable.Cell>
      )
    }
    if (['yellow_cards', 'red_cards'].includes(column.name)) {
      return (
        <VirtualTable.Cell {...props}
                           style={{ ...cellStyle, color: column.name === 'yellow_cards' ? 'yellow' : 'red' }}>
          {props.children}
        </VirtualTable.Cell>
      )
    }
    return (
      <VirtualTable.Cell
        {...props}
        style={cellStyle}>
        <Tooltip title={column.name} placement="top-start" arrow>
          {props.children}
        </Tooltip>
      </VirtualTable.Cell>
    )
  }))
  if (isPending) { return null}
  return (
    <Box
      sx={{
        height: 'calc(100vh - 48px)',
        marginTop: '48px',
      }}
    >
      <Grid
        rootComponent={Root}
        rows={rows}
        columns={columns}
      >
        <SortingState
          defaultSorting={[{ columnName: 'roleAShort', direction: 'asc' }]}
          columnExtensions={sortingStateColumnExtensions}
        />
        <IntegratedSorting
          columnExtensions={integratedSortingColumnExtensions}
        />
        <VirtualTable
          cellComponent={Cell}
          columnExtensions={tableColumnExtensions}
          height="auto"
        />
        <TableHeaderRow
          cellComponent={Head}
          showSortingControls
          messages={{
            'sortingHint': undefined,
          }}
        />
      </Grid>
      {playerId && <PlayerStats teamId={id}/>}
    </Box>
  )
}

export default Team
