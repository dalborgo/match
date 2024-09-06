import { AppBar, Box, Button, Toolbar } from '@mui/material'
import { Link } from 'react-router-dom'

function NavBar () {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/prova">Prova</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default NavBar
