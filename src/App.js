import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Box, createTheme, CssBaseline, ThemeProvider, } from '@mui/material'
import NavBar from './components/NavBar'
import Home from './views/Home'
import Prova from './views/Prova'
import { envConfig } from './init'
import axios from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
        <Box sx={{ padding: 2, paddingTop: 0 }}>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/prova" element={<Prova/>}/>
          </Routes>
        </Box>
      </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
