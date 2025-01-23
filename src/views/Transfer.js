import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Grid, TableHeaderRow, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Box } from '@mui/material'
import { useTheme, withStyles } from '@mui/styles'

const tableColumnExtensions = [
  { columnName: 'name', width: 200 },
]

const renderSpecials = rows => {
  const output = rows['specials']?.map(row => `${row['name']} (${row['status']})`) ?? []
  return output.join(', ')
}
const columns = [
  { name: 'name', title: 'Squadra' },
  {
    name: 'specials',
    title: ' ',
    getCellValue: renderSpecials
  }
]
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const Transfer = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  
  const { isPending, data } = useQuery({
    queryKey: ['clubs/serie-c'],
    staleTime: 300000,
  })
  useEffect(() => {
    return () => {
      queryClient.cancelQueries({ queryKey: ['clubs/serie-c'] })
    }
  }, [id, queryClient])
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
        <VirtualTable
          cellComponent={Cell}
          columnExtensions={tableColumnExtensions}
          height="auto"
        />
        <TableHeaderRow
          cellComponent={Head}
        />
      </Grid>
    </Box>
  )
}

export default Transfer
