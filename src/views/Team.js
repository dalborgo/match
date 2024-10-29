import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IntegratedSorting, SortingState, } from '@devexpress/dx-react-grid'
import { Grid, TableFixedColumns, TableHeaderRow, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
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
  { columnName: 'roleAShort', width: 60 },
  { columnName: 'shirtNumber', width: 50 },
  { columnName: 'photoUrl', width: 45 },
  { columnName: 'title', width: 170 },
  { columnName: 'market_value', width: 70, align: 'right' },
  { columnName: 'age', width: 50 },
  { columnName: 'height', width: 50 },
  { columnName: 'minutes_on_field', width: 52 },
  { columnName: 'appearances', width: 56 },
  { columnName: 'goal', width: 56 },
  { columnName: 'assist', width: 50 },
  { columnName: 'yellow_cards', width: 52 },
  { columnName: 'red_cards', width: 52 },
  { columnName: 'corner', width: 50 },
  { columnName: 'free_kick_shot', width: 56 },
  { columnName: 'progressive_run', width: 50 },
  { columnName: 'dribble', width: 50 },
  { columnName: 'shot_from_outside_area', width: 58 },
  { columnName: 'pass_to_final_third_success', width: 56 },
  { columnName: 'foul', width: 52 },
  { columnName: 'dangerous_foul', width: 56 },
  { columnName: 'tackle', width: 50 },
  { columnName: 'pressing_duel', width: 58 },
  { columnName: 'opponent_half_recovery', width: 58 },
  { columnName: 'time_lost_foul', width: 56 },
  { columnName: 'violent_foul', width: 58 },
  { columnName: 'out_of_play_foul', width: 58 },
  { columnName: 'simulation_foul', width: 56 },
  { columnName: 'protest_foul', width: 56 },
  { columnName: 'penalty_foul', width: 56 },
  { columnName: 'aerial_duel', width: 58 },
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
  const [statSelector, setStatSelector] = useState('SUMMARY')
  const queryClient = useQueryClient()
  const location = useLocation()
  const state = location.state || {}
  const [openTooltipImage, setOpenTooltipImage] = useState('')
  
  const handleToggleTooltipImage = event => {
    const name = event.target.parentElement.getAttribute('id')
    setOpenTooltipImage(prev => prev === name ? '' : name)
  }
  const { isPending, data } = useQuery({
    queryKey: [`grid/${id}`],
    staleTime: 300000,
  })
  const columns = useMemo(() => {
    const summary = [
      {
        name: 'roleAShort',
        title: 'R',
        getCellValue: row => !row.roleAShort && !row.shirtNumber ? 'ALL' : row.roleAShort
      },
      { name: 'shirtNumber', title: 'N' },
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
      { name: 'corner', title: 'C', getCellValue: row => row.stats.corner },
      { name: 'free_kick_shot', title: 'FK', getCellValue: row => row.stats.free_kick_shot },
      { name: 'progressive_run', title: 'R', getCellValue: row => row.stats.progressive_run },
      { name: 'dribble', title: 'D', getCellValue: row => row.stats.dribble },
      { name: 'shot_from_outside_area', title: 'SO', getCellValue: row => row.stats.shot_from_outside_area },
      { name: 'pass_to_final_third_success', title: 'PF', getCellValue: row => row.stats.pass_to_final_third_success },
      { name: 'foul', title: 'F', getCellValue: row => row.stats.foul },
      { name: 'dangerous_foul', title: 'DF', getCellValue: row => row.stats.dangerous_foul },
      { name: 'tackle', title: 'T', getCellValue: row => row.stats.tackle },
      { name: 'opponent_half_recovery', title: 'OR', getCellValue: row => row.stats.opponent_half_recovery },
      { name: 'pressing_duel', title: 'PD', getCellValue: row => row.stats.pressing_duel },
      { name: 'aerial_duel', title: 'AD', getCellValue: row => row.stats.aerial_duel },
      { name: 'foul_suffered', title: 'FS', getCellValue: row => row.stats.foul_suffered },
    ]
    const disciplinary = [
      {
        name: 'roleAShort',
        title: 'R',
        getCellValue: row => !row.roleAShort && !row.shirtNumber ? 'ALL' : row.roleAShort
      },
      { name: 'shirtNumber', title: 'N' },
      { name: 'photoUrl', title: ' ' },
      { name: 'title', title: 'Nome' },
      { name: 'age', title: 'Y', getCellValue: row => row.summary.age },
      { name: 'height', title: 'H', getCellValue: row => row.summary.height || '' },
      { name: 'market_value', title: '€', getCellValue: row => row.summary.market_value },
      { name: 'minutes_on_field', title: 'M', getCellValue: row => row.stats.minutes_on_field },
      { name: 'appearances', title: 'P', getCellValue: row => row.stats.appearances },
      { name: 'yellow_cards', title: '█', getCellValue: row => row.stats.yellow_cards },
      { name: 'red_cards', title: '█', getCellValue: row => row.stats.red_cards },
      { name: 'foul', title: 'F', getCellValue: row => row.stats.foul },
      { name: 'dangerous_foul', title: 'DF', getCellValue: row => row.stats.dangerous_foul },
      { name: 'violent_foul', title: 'VF', getCellValue: row => row.stats.violent_foul },
      { name: 'out_of_play_foul', title: 'OF', getCellValue: row => row.stats.out_of_play_foul },
      { name: 'protest_foul', title: 'PF', getCellValue: row => row.stats.protest_foul },
      { name: 'simulation_foul', title: 'SF', getCellValue: row => row.stats.simulation_foul },
      { name: 'time_lost_foul', title: 'TF', getCellValue: row => row.stats.time_lost_foul },
      { name: 'penalty_foul', title: 'PE', getCellValue: row => row.stats.penalty_foul },
      { name: 'tackle', title: 'T', getCellValue: row => row.stats.tackle },
      { name: 'opponent_half_recovery', title: 'OR', getCellValue: row => row.stats.opponent_half_recovery },
      { name: 'pressing_duel', title: 'PD', getCellValue: row => row.stats.pressing_duel },
      { name: 'aerial_duel', title: 'AD', getCellValue: row => row.stats.aerial_duel },
      { name: 'foul_suffered', title: 'FS', getCellValue: row => row.stats.foul_suffered },
    ]
    return statSelector === 'SUMMARY' ? summary : disciplinary
  }, [statSelector])
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
    { columnName: 'corner', compare: compareWithNull },
    { columnName: 'aerial_duel', compare: compareWithNull },
    { columnName: 'time_lost_foul', compare: compareWithNull },
    { columnName: 'simulation_foul', compare: compareWithNull },
    { columnName: 'out_of_play_foul', compare: compareWithNull },
    { columnName: 'violent_foul', compare: compareWithNull },
  ])
  const [sortingStateColumnExtensions] = useState([
    { columnName: 'photoUrl', sortingEnabled: false },
  ])
  const [leftColumns] = useState(['roleAShort', 'shirtNumber', 'title', 'photoUrl'])
  useEffect(() => {
    return () => {
      queryClient.cancelQueries({ queryKey: [`grid/${id}`] })
    }
  }, [id, queryClient])
  const rows = data?.results?.players || []
  const highestStats = data?.results?.highestStats || {}
  const highestSummary = data?.results?.highestSummary || {}
  const minMinutes = data?.results?.minMinutes || {}
  const toCopy = copyTeam(rows)
  const Cell = React.memo(props => {
    const { column, value, row, style, ...otherProps } = props
    const theme = useTheme()
    const { pathname } = useLocation()
    const navigate = useNavigate()
    const cellStyle = {
      padding: theme.spacing(1),
      whiteSpace: 'normal',
      borderRight: 0,
      borderColor: '#2f2f2f',
      height: 42,
    }
    const combinedStyle = { ...style, ...cellStyle }
    if (column.name === 'title') {
      const career = row?.career || {}
      return (
        <VirtualTable.Cell style={combinedStyle} {...otherProps} value={null}>
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
    if (column.name === 'minutes_on_field') {
      const isBest = highestStats?.[column.name]?.['idPlayer'] === row.id
      return (
        <VirtualTable.Cell {...props} value={null} style={{
          ...cellStyle,
          color: isBest ? 'gold' : value > minMinutes ? 'cyan' : undefined,
        }}>
          {value}
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
        return <VirtualTable.Cell style={combinedStyle}
                                  {...otherProps} value={null}/>
      }
      return (
        <VirtualTable.Cell style={combinedStyle}{...otherProps} >
          <Tooltip
            onClose={() => setOpenTooltipImage('')}
            open={openTooltipImage === `Avatar_${row.id}`}
            placement="top"
            title={<img src={value} alt="img" style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '200px',
              maxHeight: '200px'
            }}/>}
          >
            <Avatar
              id={`Avatar_${row.id}`}
              onClick={handleToggleTooltipImage}
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
      <VirtualTable.Cell
        style={{
          ...combinedStyle,
          color: isBest ? 'gold' : undefined,
          fontWeight: isBest ? 'bold' : undefined,
        }}
        {...otherProps}
      >
        {value}
      </VirtualTable.Cell>
    )
  })
  
  const Head = React.memo(withStyles(null, { withTheme: true })(props => {
    const { column, theme, style, ...otherProps } = props
    const cellStyle = {
      padding: theme.spacing(1),
      border: 0,
      backgroundColor: '#191919',
      fontSize: 12,
    }
    const combinedStyle = { ...style, ...cellStyle }
    if (column.name === 'photoUrl') {
      return (
        <VirtualTable.Cell style={combinedStyle}{...otherProps} >
          <CopyToClipboard text={toCopy}>
            <span style={{ fontSize: 'small', cursor: 'pointer', marginTop: -6, marginLeft: 4 }}>📋</span>
          </CopyToClipboard>
        </VirtualTable.Cell>
      )
    }
    if (['yellow_cards', 'red_cards'].includes(column.name)) {
      return (
        <VirtualTable.Cell
          {...props}
          style={{ ...cellStyle, color: column.name === 'yellow_cards' ? 'yellow' : 'red' }}
        >
          {props.children}
        </VirtualTable.Cell>
      )
    }
    if (column.name === 'roleAShort') {
      return (
        <VirtualTable.Cell
          {...props}
          style={cellStyle}
        >
          <Box display="flex">
            <span
              style={{ fontSize: 'small', cursor: 'pointer', marginRight: 2 }}
              onClick={() => {
                setStatSelector(statSelector === 'SUMMARY' ? 'DIS' : 'SUMMARY')
              }}
            >
              📄
            </span>
            <Box>{props.children}</Box>
          </Box>
        </VirtualTable.Cell>
      )
    }
    return (
      <VirtualTable.Cell
        style={combinedStyle}
        {...otherProps}
      >
        {
          ['title', 'roleAShort', 'shirtNumber'].includes(column.name) ?
            props.children
            :
            <Tooltip title={column.name} placement="top-start" arrow>
              {props.children}
            </Tooltip>
        }
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
        <TableFixedColumns
          leftColumns={leftColumns}
        />
      </Grid>
      {playerId && <PlayerStats teamId={id}/>}
    </Box>
  )
}

export default Team
