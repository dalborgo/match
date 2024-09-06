import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Box, createTheme, CssBaseline, ThemeProvider, } from '@mui/material'
import NavBar from './components/NavBar'
import Home from './views/Home'
import Prova from './views/Prova'
//import { envConfig } from './init'

//const PORT = envConfig['BACKEND_PORT']
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

function App () {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <Router>
        <NavBar/>
        <Box sx={{ padding: 2, paddingTop: 0 }}>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/prova" element={<Prova/>}/>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App
