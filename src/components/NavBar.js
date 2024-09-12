import { Link, useLocation, useParams } from 'react-router-dom'
import { AppBar, Box, Button, LinearProgress, Toolbar } from '@mui/material'
import { useIsFetching } from '@tanstack/react-query'

const NavBar = () => {
  const location = useLocation()
  const isFetching = useIsFetching()
  const { id } = useParams()
  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <Box sx={{ flexGrow: 1 }}>
          <Button
            color={location.pathname === '/' ? 'secondary' : 'inherit'}
            component={Link}
            to="/"
          >
            Home
          </Button>
          <Button
            color={location.pathname === '/prova' ? 'secondary' : 'inherit'}
            component={Link}
            to="/prova"
          >
            Prova
          </Button>
          {location.pathname.includes('/team') && (
            <Button
              color={location.pathname.includes('/team') ? 'secondary' : 'inherit'}
              component={Link}
              to={`/team/${id || '-5251'}`}
            >
              Team
            </Button>
          )}
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
