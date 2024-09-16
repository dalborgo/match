import { Link, useLocation } from 'react-router-dom'
import { AppBar, Box, Button, LinearProgress, Toolbar } from '@mui/material'
import { useIsFetching } from '@tanstack/react-query'

const NavBar = () => {
  const location = useLocation()
  const isFetching = useIsFetching()
  const { pathname } = location
  const id = pathname.split('/')[2]
  return (
    <AppBar position="fixed">
      <Toolbar variant="dense" disableGutters style={{ paddingLeft: 8, paddingRight: 8 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Button
            color={location.pathname === '/' ? 'secondary' : 'inherit'}
            component={Link}
            to="/"
          >
            Home
          </Button>
          {
            (location.pathname.includes('/team') || location.pathname.includes('/game')) &&
            (
              <Button
                color={location.pathname.includes('/team') ? 'secondary' : 'inherit'}
                component={Link}
                to={`/team/${id}`}
              >
                Team
              </Button>
            )
          }
          {
            (location.pathname.includes('/team') || location.pathname.includes('/game')) &&
            (
              <Button
                color={location.pathname.includes('/game') ? 'secondary' : 'inherit'}
                component={Link}
                to={`/game/${id}`}
              >
                Game
              </Button>
            )
          }
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
