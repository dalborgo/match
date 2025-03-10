import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IntegratedFiltering, SearchState, } from '@devexpress/dx-react-grid'
import { Grid, SearchPanel, TableHeaderRow, Toolbar, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Box, Link } from '@mui/material'
import { useTheme, withStyles } from '@mui/styles'
import axios from 'axios'
import { getVideoListName } from './Home'
import { envConfig } from '../init'

const PORT = envConfig['BACKEND_PORT']
const HOST = envConfig['BACKEND_HOST']

const tableColumnExtensions = [
  { columnName: 'refereedMatches', align: 'center' },
  { columnName: 'fouls', align: 'center' },
  { columnName: 'ycard1', align: 'center' },
  { columnName: 'rcard', align: 'center' },
  { columnName: 'ycard2', align: 'center' },
  { columnName: 'totFouls', align: 'center' },
  { columnName: 'totYcard1', align: 'center' },
  { columnName: 'totRcard', align: 'center' },
  { columnName: 'totYcard2', align: 'center' },
]

const renderName = (row, prop) => {
  return `${row[prop]} (${row['years']})`
}
const renderPres = (row, prop) => {
  return `${row[prop]} (${row['totRefereedMatches']})`
}
const renderCurrent = (row, prop) => {
  if (row[prop] === '-') { return '0'}
  return `${(row[prop] / row['refereedMatches']).toFixed(2)} (${row[prop]})`
}
const renderTotal = (row, prop) => {
  if (row[prop] === '-') { return '0'}
  return `${(row[prop] / row['totRefereedMatches']).toFixed(2)} (${row[prop]})`
}

const columns = [
  { name: 'name', title: 'name', getCellValue: renderName },
  { name: 'refereedMatches', title: 'P', getCellValue: renderPres },
  { name: 'fouls', title: 'F', getCellValue: renderCurrent },
  { name: 'ycard1', title: '█', getCellValue: renderCurrent },
  { name: 'rcard', title: '█', getCellValue: renderCurrent },
  { name: 'ycard2', title: '2°', getCellValue: renderCurrent },
  { name: 'totFouls', title: 'Tot F.', getCellValue: renderTotal },
  { name: 'totYcard1', title: 'Tot █', getCellValue: renderTotal },
  { name: 'totRcard', title: 'Tot █', getCellValue: renderTotal },
  { name: 'totYcard2', title: 'Tot 2°', getCellValue: renderTotal },
]

function DownloadPdfButton ({ refId, refName, stat, children, style = {} }) {
  const queryClient = useQueryClient()
  const downloadPdf = async () => {
    const [dataA] = await queryClient.fetchQuery({
      queryKey: [`video_ref/-249700`, { stat }],
      queryFn: async () => {
        const dtk = document.getElementById('dtk')?.value
        const responseA = await axios.get(`http://${HOST}:${PORT}/wyscout/video_ref/${refId}?stat=${stat}&dtk=${dtk}`)
        return [responseA.data]
      },
      meta: { isManualFetching: true }
    })
    const outputA = dataA.results.map(video => {
      return getVideoListName(video, refName)
    })
    const toSave = [...outputA].join('\n')
    const blob = new Blob([toSave], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `prova_${stat}_videos_list.zpl`
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
    if (column.name === 'refereedMatches') {
      return (
        <VirtualTable.Cell
          style={{
            ...combinedStyle,
          }}
          {...otherProps}
        >
          <DownloadPdfButton
            refId={row.refereeId}
            refName={row.name}
            stat={101}
          >
            {value}
          </DownloadPdfButton>
        </VirtualTable.Cell>
      )
    }
    if (column.name === 'totYcard1') {
      return (
        <VirtualTable.Cell
          style={{
            ...combinedStyle,
          }}
          {...otherProps}
        >
          <DownloadPdfButton
            refId={row.refereeId}
            refName={row.name}
            stat="YELLOW_CARDS"
            style={{ color: 'yellow' }}
          >
            {value}
          </DownloadPdfButton>
        </VirtualTable.Cell>
      )
    }
    if (column.name === 'totRcard') {
      return (
        <VirtualTable.Cell
          style={{
            ...combinedStyle,
          }}
          {...otherProps}
        >
          <DownloadPdfButton
            refId={row.refereeId}
            refName={row.name}
            stat="RED_CARDS"
            style={{ color: 'red' }}
          >
            {value}
          </DownloadPdfButton>
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
