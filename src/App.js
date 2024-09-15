import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Box, createTheme, CssBaseline, ThemeProvider, } from '@mui/material'
import NavBar from './components/NavBar'
import Home from './views/Home'
import Prova from './views/Prova'
import { envConfig } from './init'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Team from './views/Team'

const PORT = envConfig['BACKEND_PORT']
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const defaultQueryFn = async ({ queryKey }) => {
  const [endpoint, params] = queryKey
  const { data } = await axios.get(`http://localhost:${PORT}/wyscout/${endpoint}`, { params })
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
            <Route path="/prova" element={<Prova/>}/>
          </Routes>
        </Box>
      </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
