import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { IntegratedSorting, SortingState, } from '@devexpress/dx-react-grid'
import { Grid, TableHeaderRow, VirtualTable, } from '@devexpress/dx-react-grid-material-ui'
import { Box } from '@mui/material'

const priority = {
  GKP: 1,
  DEF: 2,
  MID: 3,
  FWD: 4
}
const compareByRole = (a, b) => {
  const roleA = a.roleAShort || ''
  const roleB = b.roleAShort || ''
  const priorityA = priority[roleA] || 5
  const priorityB = priority[roleB] || 5
  return priorityA - priorityB
}

const compareByName = (a, b) => {
  const getLastName = (fullName) => {
    const parts = fullName.split(' ')
    return parts[parts.length - 1]
  }
  const lastNameA = getLastName(a)
  const lastNameB = getLastName(b)
  return lastNameA.localeCompare(lastNameB)
}

const tableColumnExtensions = [
  { columnName: 'roleAShort', width: 80 },
  { columnName: 'shirtNumber', width: 60 },
  { columnName: 'title', width: 120 },
  { columnName: 'minutes_on_field', },
]
const Root = props => <Grid.Root {...props} style={{ height: '100%' }}/>
const Team = () => {
  const { id } = useParams()
  const { isPending, data } = useQuery({
    queryKey: [`grid/${id}`],
  })
  console.log('data:', data)
  const [columns] = useState([
    { name: 'roleAShort', title: 'R.', getCellValue: row => row.roleAShort || 'ALL' },
    { name: 'shirtNumber', title: 'N.' },
    { name: 'title', title: 'Nome' },
    { name: 'minutes_on_field', title: 'Min.', getCellValue: row => row.stats.minutes_on_field },
  ])
  const [integratedSortingColumnExtensions] = useState([
    { columnName: 'roleAShort', compare: compareByRole },
    { columnName: 'title', compare: compareByName },
  ])
  const rows = data?.results?.players || []
  if (isPending) { return null}
  console.log('rows:', rows)
  return (
    <Box
      sx={{
        height: 'calc(100vh - 65px)',
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
        />
        <IntegratedSorting
          columnExtensions={integratedSortingColumnExtensions}
        />
        <VirtualTable
          columnExtensions={tableColumnExtensions}
          height={'auto'}/>
        <TableHeaderRow
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
