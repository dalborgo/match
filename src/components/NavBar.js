import React from 'react'
import { useIsFetching } from '@tanstack/react-query'
import { AppBar, Box, Button, LinearProgress, Toolbar } from '@mui/material'
import { Link } from 'react-router-dom'

const NavBar = () => {
  const isFetching = useIsFetching()
  
  return (
    <AppBar position="static" sx={{ position: 'relative' }}>
      <Toolbar variant="dense">
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/prova">Prova</Button>
        </Box>
      </Toolbar>
      {isFetching > 0 && (
        <LinearProgress
          color="primary"
          sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 2 }}
        />
      )}
    </AppBar>
  )
}

export default NavBar
