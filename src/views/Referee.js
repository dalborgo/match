import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { IntegratedFiltering, SearchState, } from '@devexpress/dx-react-grid'
import { Grid, SearchPanel, TableHeaderRow, Toolbar, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Box } from '@mui/material'
import { useTheme, withStyles } from '@mui/styles'

const tableColumnExtensions = [
  { columnName: 'id', width: 60 },
]

const columns = [
  { name: 'name', title: 'name' },
]
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
  
  const Head = React.memo(withStyles(null, { withTheme: true })(props => {
    const { column, theme, style, ...otherProps } = props
    const cellStyle = {
      padding: theme.spacing(1),
      border: 0,
      backgroundColor: '#191919',
      fontSize: 12,
    }
    const combinedStyle = { ...style, ...cellStyle }
    return (
      <VirtualTable.Cell
        style={combinedStyle}
        {...otherProps}
      >
        {props.children}
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
