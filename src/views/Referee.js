import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IntegratedFiltering, SearchState, } from '@devexpress/dx-react-grid'
import { Grid, SearchPanel, TableHeaderRow, Toolbar, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Box } from '@mui/material'
import { useTheme, withStyles } from '@mui/styles'

const tableColumnExtensions = [
  { columnName: 'refereedMatches', align: 'center' },
  { columnName: 'totRefereedMatches', align: 'center' },
  { columnName: 'fouls', align: 'center' },
  { columnName: 'ycard1', align: 'center' },
  { columnName: 'rcard', align: 'center' },
  { columnName: 'ycard2', align: 'center' },
  { columnName: 'totFouls', align: 'center' },
  { columnName: 'totYcard1', align: 'center' },
  { columnName: 'totRcard', align: 'center' },
  { columnName: 'totYcard2', align: 'center' },
]

const renderCurrent = (row, prop) => {
  if (row[prop] === '-') { return '0'}
  return `${(row[prop] / row['refereedMatches']).toFixed(2)} (${row[prop]})`
}
const renderTotal = (row, prop) => {
  if (row[prop] === '-') { return '0'}
  return `${(row[prop] / row['totRefereedMatches']).toFixed(2)} (${row[prop]})`
}

const columns = [
  { name: 'name', title: 'name' },
  { name: 'refereedMatches', title: 'P.' },
  { name: 'totRefereedMatches', title: 'Tot P.' },
  { name: 'fouls', title: 'F.', getCellValue: renderCurrent },
  { name: 'ycard1', title: '█', getCellValue: renderCurrent },
  { name: 'rcard', title: '█', getCellValue: renderCurrent },
  { name: 'ycard2', title: '2', getCellValue: renderCurrent },
  { name: 'totFouls', title: 'Tot F.', getCellValue: renderTotal },
  { name: 'totYcard1', title: 'Tot █', getCellValue: renderTotal },
  { name: 'totRcard', title: 'Tot █', getCellValue: renderTotal },
  { name: 'totYcard2', title: 'Tot 2', getCellValue: renderTotal },
]

const Head = React.memo(withStyles(null, { withTheme: true })(props => {
  const { column, theme, style, ...otherProps } = props
  const cellStyle = {
    padding: theme.spacing(1),
    border: 0,
    backgroundColor: '#191919',
    fontSize: 12,
  }
  const combinedStyle = { ...style, ...cellStyle }
  if (['totYcard1', 'totRcard', 'ycard1', 'rcard'].includes(column.name)) {
    return (
      <VirtualTable.Cell
        {...props}
        style={{ ...cellStyle, color: column.name.includes('card1') ? 'yellow' : 'red' }}
      >
        {props.children}
      </VirtualTable.Cell>
    )
  }
  return (
    <VirtualTable.Cell
      style={combinedStyle}
      {...otherProps}
    >
      {
        props.children
      }
    </VirtualTable.Cell>
  )
}))
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const Referee = () => {
  const queryClient = useQueryClient()
  
  const { isPending, data } = useQuery({
    queryKey: ['referee/list'],
    staleTime: 300000,
  })
  useEffect(() => {
    return () => {
      queryClient.cancelQueries({ queryKey: ['referee/list'] })
    }
  }, [queryClient])
  const rows = data?.results || []
  const Cell = React.memo(props => {
    const { column, value, row, style, ...otherProps } = props
    const theme = useTheme()
    const cellStyle = {
      padding: theme.spacing(1),
      whiteSpace: 'normal',
      borderRight: 0,
      borderColor: '#2f2f2f',
      height: 42,
    }
    const combinedStyle = { ...style, ...cellStyle }
    return (
      <VirtualTable.Cell
        style={{
          ...combinedStyle,
        }}
        {...otherProps}
      >
        {value}
      </VirtualTable.Cell>
    )
  })
  
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
        <SearchState/>
        <IntegratedFiltering/>
        <VirtualTable
          cellComponent={Cell}
          columnExtensions={tableColumnExtensions}
          height="auto"
        />
        <TableHeaderRow
          cellComponent={Head}
        />
        <Toolbar/>
        <SearchPanel/>
      </Grid>
    </Box>
  )
}

export default Referee
