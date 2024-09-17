import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Box, FormControlLabel, Radio, RadioGroup, Tab, Tabs, TextField, Typography } from '@mui/material'

const formatPlayerName = (player) => {
  const [number, ...surnameParts] = player.title.split(' ')
  const surname = surnameParts.join(' ')
  return `${surname} ${number}`
}

function Game () {
  const { id } = useParams()
  const { isPending, data } = useQuery({
    queryKey: [`grid/${id}`],
  })
  
  const players = useMemo(() => (data?.results?.players || []).filter(player => player.shirtNumber), [data?.results?.players])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [result, setResult] = useState(false)
  const [, setCorrectShirtNumber] = useState(null)
  const [tabIndex, setTabIndex] = useState(0)
  const [nameFeedback, setNameFeedback] = useState('')
  const [selectedName, setSelectedName] = useState('')
  
  const getRandomPlayer = () => {
    const randomIndex = Math.floor(Math.random() * players.length)
    return players[randomIndex]
  }
  
  useEffect(() => {
    if (players.length > 0) {
      setCurrentPlayer(getRandomPlayer())
    }
    // eslint-disable-next-line
  }, [players])
  
  useEffect(() => {
    if (currentPlayer && userInput.length === String(currentPlayer.shirtNumber).length) {
      handleSubmit()
    }
    // eslint-disable-next-line
  }, [userInput])
  
  const handleInputChange = (e) => {
    setUserInput(e.target.value)
  }
  
  const handleSubmit = () => {
    if (!currentPlayer) return
    
    const correctAnswer = currentPlayer.shirtNumber
    const userAnswer = parseInt(userInput)
    
    if (userAnswer === correctAnswer) {
      setResult(true)
    } else {
      setResult(false)
    }
    setFeedback(`${currentPlayer.title}: ${correctAnswer || ''}`)
    setCorrectShirtNumber(correctAnswer)
    setCurrentPlayer(getRandomPlayer())
    setUserInput('')
  }
  
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSubmit()
    }
  }
  
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue)
    resetGame()
  }
  
  const handleRadioChange = selectedName => {
    setSelectedName(selectedName)
    if (currentPlayer && selectedName === formatPlayerName(currentPlayer)) {
      setNameFeedback(`OK ${formatPlayerName(currentPlayer)} ${currentPlayer.shirtNumber || ''}`)
    } else {
      setNameFeedback(`${formatPlayerName(currentPlayer)} ${currentPlayer.shirtNumber || ''}`)
    }
    setCurrentPlayer(getRandomPlayer())
  }
  
  const resetGame = () => {
    setFeedback('')
    setResult(false)
    setUserInput('')
    setNameFeedback('')
    setSelectedName('')
    if (players.length > 0) {
      setCurrentPlayer(getRandomPlayer())
    }
  }
  
  if (isPending || !currentPlayer) {
    return null
  }
  const sortedPlayers = players.slice().sort((a, b) => {
    const surnameA = a.title.split(' ').slice(1).join(' ') // Estrai il cognome
    const surnameB = b.title.split(' ').slice(1).join(' ')
    return surnameA.localeCompare(surnameB)
  })
  const dividePlayersIntoColumns = (players, itemsPerColumn) => {
    const columns = []
    for (let i = 0; i < players.length; i += itemsPerColumn) {
      columns.push(players.slice(i, i + itemsPerColumn))
    }
    return columns
  }
  
  const itemsPerColumn = 10
  const columns = dividePlayersIntoColumns(sortedPlayers, itemsPerColumn)
  return (
    <Box
      sx={{
        height: 'calc(100vh - 48px)',
        marginTop: '48px',
        p: 2,
        textAlign: 'center',
      }}
    >
      <Box mb={3}>
        <Tabs value={tabIndex} onChange={handleTabChange} centered>
          <Tab label="Gioco per Nome"/>
          <Tab label="Gioco per Numero"/>
        </Tabs>
      </Box>
      
      
      {tabIndex === 0 && (
        <Box>
          {/* Gioco per Nome */}
          <Box>
            <img src={currentPlayer.photoUrl} alt="Player"/>
          </Box>
          <Box>
            <Typography variant="h5">{currentPlayer.title}</Typography>
            <Typography variant="subtitle1">{currentPlayer.subtitle}</Typography>
          </Box>
          <TextField
            autoFocus
            variant="outlined"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            inputProps={{
              style: {
                textAlign: 'center',
                fontSize: '24px',
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
            style={{ width: 80 }}
          />
          {feedback && (
            <Box mt={2}>
              <Typography variant="h5" style={{ color: result ? 'green' : 'red' }}>{feedback}</Typography>
            </Box>
          )}
        </Box>
      )}
      
      {tabIndex === 1 && (
        <Box>
          {/* Gioco per Numero */}
          <Typography variant="h4">{currentPlayer.shirtNumber}</Typography><br/>
          <RadioGroup value={selectedName}>
            <Box display="flex" gap={3} justifyContent={'center'}>
              {columns.map((column, columnIndex) => (
                <Box key={columnIndex}> {/* Ogni colonna */}
                  {column.map((player) => (
                    <Box textAlign={'left'}>
                      <FormControlLabel
                        key={player.title}
                        value={formatPlayerName(player)} // Usa il nome formattato "Cognome N."
                        control={<Radio
                          onClick={() => handleRadioChange(formatPlayerName(player))}/>}
                        label={formatPlayerName(player)}
                      /><br/>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </RadioGroup>
          <br/>
          {nameFeedback && (
            <Typography variant="h4"
                        style={{ color: nameFeedback.includes('OK') ? 'green' : 'red' }}>{nameFeedback.replace('OK', '')}</Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Game
