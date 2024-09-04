import { envConfig } from './init'
import { Box, createTheme, CssBaseline, ThemeProvider, } from '@mui/material'

const PORT = envConfig['BACKEND_PORT']
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

function App () {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline/>
      <Box display="flex">
        Ciao
      </Box>
    </ThemeProvider>
  )
}

export default App
