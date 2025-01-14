import { Link, useLocation } from 'react-router-dom'
import { AppBar, Box, Button, LinearProgress, Toolbar } from '@mui/material'
import { useIsFetching } from '@tanstack/react-query'

const NavBar = () => {
  const location = useLocation()
  const isFetching = useIsFetching()
  const { pathname } = location
  const id = pathname.split('/')[2]
  const state = location.state || {}
  const searchParams = new URLSearchParams(location.search)
  const teamName = searchParams.get('teamName') || state.teamName || ''
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
                state={{ ...state, teamName }}
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
                state={{ ...state, teamName }}
              >
                Game
              </Button>
            )
          }
        </Box>
        <Box sx={{ flexGrow: 0 }} mr={1}>
          <input
            id="dtk"
            style={{
              backgroundColor: '#191919',
              color: 'white',
              width: '300px',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              outline: 'none',
            }}
            onFocus={event => {event.target.select()}}
          />
        </Box>
        {
          teamName &&
          <Box mr={1} ml={1}>
            {teamName}
          </Box>
        }
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
