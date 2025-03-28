import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IntegratedFiltering, SearchState, } from '@devexpress/dx-react-grid'
import { Grid, SearchPanel, TableHeaderRow, Toolbar, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Box, Link } from '@mui/material'
import { useTheme, withStyles } from '@mui/styles'

const extractDate = (str, raw) => {
  const datePatterns = [
    /(\d{4})-(\d{2})-(\d{2})/,
    /(\d{4})(\d{2})(\d{2})/
  ]
  for (const pattern of datePatterns) {
    const match = str.match(pattern)
    if (match) {
      const [, year, month, day] = match
      return raw ? `${year}${month}${day}` : `${day}/${month}/${year}`
    }
  }
  return ''
}

const sortByExtractedDateDesc = arr => {
  return arr?.sort((a, b) => {
    const dateA = extractDate(a.title, true)
    const dateB = extractDate(b.title, true)
    return dateB.localeCompare(dateA)
  })
}

const tableColumnExtensions = [
  { columnName: 'GIOR', width: 120 },
  { columnName: 'title', width: 110 },
  { columnName: 'GARA', width: 300 },
  { columnName: 'TORN', align: 'center', width: 80 },
  { columnName: 'AE', align: 'center' },
  { columnName: 'AA1', align: 'center' },
  { columnName: 'AA2', align: 'center' },
  { columnName: 'QU', align: 'center' },
  { columnName: 'OA', align: 'center' },
  { columnName: 'OT', align: 'center' },
  { columnName: 'TOT_VAL', align: 'center' },
  { columnName: 'TOT', align: 'center' },
]

const columns = [
  { name: 'GIOR', title: 'Giornata' },
  { name: 'title', title: 'Data', getCellValue: row => extractDate(row.title) },
  { name: 'GARA', title: 'Gara' },
  { name: 'TORN', title: 'Torneo' },
  { name: 'AE', title: 'AE' },
  { name: 'AA1', title: 'AA1' },
  { name: 'AA2', title: 'AA2' },
  { name: 'QU', title: 'QU' },
  { name: 'OA', title: 'OA' },
  { name: 'OT', title: 'OT' },
  { name: 'TOT_VAL', title: 'Pos', getCellValue: row => row['TOT_VAL'] > 0 ? (row['POS'] / row['TOT_VAL']) * 100 : 0 },
  { name: 'TOT', title: 'A', getCellValue: ({ TOT }) => TOT > 0 ? TOT : '' },
]

const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const Referee = () => {
  const queryClient = useQueryClient()
  const { isPending, data, refetch } = useQuery({
    queryKey: ['hudl-grid'],
    staleTime: 300000,
  })
  useEffect(() => {
    return () => {
      queryClient.cancelQueries({ queryKey: ['hudl-grid'] })
    }
  }, [queryClient])
  const rows = sortByExtractedDateDesc(data?.results) || []
  const Head = React.memo(withStyles(null, { withTheme: true })(props => {
    const { column, theme, style, ...otherProps } = props
    const cellStyle = {
      padding: theme.spacing(1),
      border: 0,
      backgroundColor: '#191919',
      fontSize: 12,
    }
    const combinedStyle = { ...style, ...cellStyle }
    if (['TOT'].includes(column.name)) {
      return (
        <VirtualTable.Cell
          style={combinedStyle}
          {...otherProps}
        >
          <Link
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
            onClick={() => refetch()}>
            <Box fontSize={17}>↻</Box>
          </Link>
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
    if (['GARA'].includes(column.name)) {
      return (
        <VirtualTable.Cell
          {...props}
          style={{ ...cellStyle }}
        >
          <Link
            href={row['downloadUri']}
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {value}
          </Link>
        </VirtualTable.Cell>
      )
    }
    if (['TORN'].includes(column.name)) {
      return (
        <VirtualTable.Cell
          {...props}
          style={{ ...cellStyle }}
        >
          <span
            style={{ color: value === 'SERIE A' ? 'cyan ' : value === 'SERIE B' ? 'lightgreen' : 'lightgrey' }}>{value}</span>
        </VirtualTable.Cell>
      )
    }
    if (['TOT_VAL'].includes(column.name) && value > 0) {
      return (
        <VirtualTable.Cell
          {...props}
          style={{ ...cellStyle }}
        >
          <span style={{ color: value > 50 ? 'lightgreen ' : 'red' }}>{value.toFixed(2)}</span>
        </VirtualTable.Cell>
      )
    }
    if (['TOT'].includes(column.name)) {
      const color = row['CRUCIAL_MISTAKE'] ? 'red ' : row['MAYBE_MISTAKE'] ? 'orange' : ''
      return (
        <VirtualTable.Cell
          {...props}
          style={{ ...cellStyle }}
        >
          <Link
            href={`http://localhost:3005?hudl=${row['id']}`}
            target="_blank"
            sx={{
              color,
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            <span style={{ color }}>
              {value}
            </span>
          </Link>
        </VirtualTable.Cell>
      )
    }
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
