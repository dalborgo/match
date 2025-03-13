import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Box, createTheme, CssBaseline, ThemeProvider, } from '@mui/material'
import NavBar from './components/NavBar'
import Home from './views/Home'
import Game from './views/Game'
import Team from './views/Team'
import Transfer from './views/Transfer'
import Referee from './views/Referee'
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
  const [endpoint, params, options = {}] = queryKey
  const config = { params, ...options } // `options` può includere `responseType`
  const { data } = await axios.get(`http://${HOST}:${PORT}/wyscout/${endpoint}?dtk=${document.getElementById('dtk')?.value}`, config)
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
              <Route path="/transfer" element={<Transfer/>}/>
              <Route path="/:matchId" element={<Home/>}/>
              <Route path="/team/:id" element={<Team/>}/>
              <Route path="/team/:id/player/:playerId" element={<Team/>}/>
              <Route path="/game/:id" element={<Game/>}/>
              <Route path="/referee" element={<Referee/>}/>
              <Route path="/referee/:refId" element={<Referee/>}/>
            </Routes>
          </Box>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
