import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Box, createTheme, CssBaseline, ThemeProvider, } from '@mui/material'
import NavBar from './components/NavBar'
import Home from './views/Home'
import Game from './views/Game'
import Team from './views/Team'
import { envConfig } from './init'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const PORT = envConfig['BACKEND_PORT']
const HOST = envConfig['BACKEND_HOST']
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const defaultQueryFn = async ({ queryKey }) => {
  const [endpoint, params] = queryKey
  const { data } = await axios.get(`http://${HOST}:${PORT}/wyscout/${endpoint}`, { params })
  return data
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      refetchOnWindowFocus: false,
    },
  },
})

function App () {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <QueryClientProvider client={queryClient}>
        <Router>
          <NavBar/>
          <Box sx={{ padding: 0, paddingTop: 0 }}>
            <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/:matchId" element={<Home/>}/>
              <Route path="/team/:id" element={<Team/>}/>
              <Route path="/team/:id/player/:playerId" element={<Team/>}/>
              <Route path="/game/:id" element={<Game/>}/>
            </Routes>
          </Box>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
