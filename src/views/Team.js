import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IntegratedSorting, SortingState, } from '@devexpress/dx-react-grid'
import { Grid, TableHeaderRow, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Avatar, Box, Tooltip } from '@mui/material'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { withStyles } from '@mui/styles'

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
const compareByRole = (a = {}, b = {}) => {
  const roleA = a.roleAShort || ''
  const roleB = b.roleAShort || ''
  const priorityA = priority[roleA] || 5
  const priorityB = priority[roleB] || 5
  return priorityA - priorityB
}
const getLastName = (fullName) => {
  const parts = fullName.split(' ')
  return parts[parts.length - 1]
}
const compareByName = (a, b) => {
  const lastNameA = getLastName(a)
  const lastNameB = getLastName(b)
  return lastNameA.localeCompare(lastNameB)
}

const tableColumnExtensions = [
  { columnName: 'roleAShort', width: 80 },
  { columnName: 'shirtNumber', width: 60 },
  { columnName: 'photoUrl', width: 60 },
  { columnName: 'title', width: 150 },
  { columnName: 'minutes_on_field', width: 60 },
]

const CellBase = props => {
  const { column, value, row } = props
  const { theme } = props
  const cellStyle = {
    padding: theme.spacing(1),
    whiteSpace: 'normal',
    borderColor: '#2f2f2f',
  }
  if (column.name === 'title') {
    return (
      <VirtualTable.Cell {...props} value={null} style={cellStyle}>
        {value} <span style={{ color: '#b3b3b3' }}>{row.subtitle}</span>
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
  return <VirtualTable.Cell {...props} style={cellStyle}/>
}
const Cell = withStyles(null, { withTheme: true })(CellBase)

const copyTeam = rows => {
  let toCopy = ''
  for (let row of rows) {
    if (!row.roleAShort && row.shirtNumber) {continue}
    toCopy += `${row.shirtNumber ? row.shirtNumber + '\n' : ''}${getLastName(row.title)}\n${ROLES[row.roleAShort] || 'Allenatore'}\n\n`
  }
  return toCopy
}

const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const Team = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { isPending, data } = useQuery({
    queryKey: [`grid/${id}`],
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
    { name: 'minutes_on_field', title: 'M.', getCellValue: row => row.stats.minutes_on_field },
    { name: 'goal', title: 'G.', getCellValue: row => row.stats.goal },
  ])
  const [integratedSortingColumnExtensions] = useState([
    { columnName: 'roleAShort', compare: compareByRole },
    { columnName: 'title', compare: compareByName },
    { columnName: 'minutes_on_field', compare: compareWithNull },
    { columnName: 'goal', compare: compareWithNull },
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
  const toCopy = copyTeam(rows)
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
    
    return <VirtualTable.Cell {...props} style={cellStyle}/>
  }))
  if (isPending) { return null}
  console.log('rows:', rows)
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
    </Box>
  
  )
}

export default Team
