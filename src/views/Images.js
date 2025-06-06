import React, { useMemo, useState } from 'react'
import { Box, Tab, Tabs, TextField, Typography } from '@mui/material'
import imageLinks from '../files/image.json'
import citiesByName from '../files/referee.json'
import shuffle from 'lodash/shuffle'

const normalize = str =>
  str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const getCity = nameFromFile => {
  const normalizedFromFile = normalize(nameFromFile)
  const parts = normalizedFromFile.split(' ')
  if (parts.length < 2) return null
  const reversed = normalize(`${parts[1]} ${parts[0]}`)
  for (const fullName in citiesByName) {
    const normalizedJsonKey = normalize(fullName)
    if (normalizedJsonKey === normalizedFromFile || normalizedJsonKey === reversed) {
      return citiesByName[fullName]
    }
  }
  return null
}

const getFileName = url => url.substring(url.lastIndexOf('/') + 1).split('-')[0].trim()
const getFakeName = (excludeName, allNames) => {
  const pool = allNames.filter(n => normalize(n) !== normalize(excludeName))
  return shuffle(pool)[0]
}
const SearchTab = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const matchedImage = useMemo(() => {
    if (searchTerm.length < 3) return null
    const term = searchTerm.toLowerCase()
    return imageLinks.find(link => link.toLowerCase().includes(term))
  }, [searchTerm])
  
  const fileName = matchedImage ? getFileName(matchedImage) : ''
  const city = matchedImage ? getCity(fileName) : null
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={2}>
      <TextField
        autoFocus
        label=""
        sx={{ width: 400, '& label': { fontSize: '1.3rem' } }}
        InputProps={{ sx: { fontSize: '1.5rem' } }}
        variant="standard"
        onChange={event => setSearchTerm(event.target.value)}
        onFocus={event => event.target.select()}
      />
      {searchTerm.length >= 3 && !matchedImage && (
        <Typography mt={2} color="text.secondary">
          Not Found
        </Typography>
      )}
      {matchedImage && (
        <Box mt={4} textAlign="center">
          <Typography variant="h5" style={{ color: 'white' }}>{fileName.toUpperCase()}</Typography>
          {city && <Typography variant="subtitle1" style={{ color: '#aaa' }}>{city}</Typography>}
          <img
            src={matchedImage}
            alt="Referee"
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', marginTop: 16 }}
          />
        </Box>
      )}
    </Box>
  )
}

const GameTab = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrong, setWrong] = useState(false)
  const [revealed, setRevealed] = useState({})
  const [options] = useState(() => {
    const seen = new Map()
    for (const link of shuffle(imageLinks)) {
      const name = getFileName(link)
      if (!seen.has(name)) {
        seen.set(name, { name, url: link })
      }
    }
    return Array.from(seen.values())
  })
  
  const correct = options[currentIndex]
  const other = useMemo(() => {
    const pool = options.filter((opt, i) => i !== currentIndex && normalize(opt.name) !== normalize(correct.name))
    return shuffle(pool)[0]
  }, [currentIndex, options, correct])
  
  const answers = useMemo(() => shuffle([correct, other]), [correct, other])
  
  const handleAnswer = answer => {
    if (normalize(answer.realName) === normalize(correct.name)) {
      setWrong(false)
      setRevealed({})
      setCurrentIndex(prev => prev + 1)
    } else {
      setWrong(true)
      setRevealed(prev => ({
        ...prev,
        [answer.url]: true
      }))
    }
  }
  
  if (!correct || !other) {return null}
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" padding={5}>
      <Box display="flex" gap={4} mt={3}>
        {answers.map((a, i) => {
          const isCorrectImage = a.name === correct.name
          const wasRevealed = revealed[a.url] === true
          const displayName = isCorrectImage || wasRevealed
            ? a.name
            : getFakeName(correct.name, options.map(o => o.name))
          const city = getCity(displayName)
          return (
            <Box
              key={i}
              textAlign="center"
              onClick={() =>
                handleAnswer({ name: displayName, realName: a.name, url: a.url })
              }
              sx={{ cursor: 'pointer' }}
            >
              <img
                src={a.url}
                alt="referee"
                style={{ height: 300, objectFit: 'cover', borderRadius: 8 }}
              />
              <Typography
                variant="subtitle1"
                mt={1}
                sx={{
                  color: wrong && a.name !== correct.name ? 'red' : 'white',
                  fontWeight: 'bold',
                }}
              >
                {displayName.toUpperCase()}
                {city && (
                  <Typography variant="subtitle1" style={{ color: '#aaa' }}>
                    {city}
                  </Typography>
                )}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

const Images = () => {
  const [tab, setTab] = useState(0)
  
  return (
    <Box sx={{ height: 'calc(100vh - 48px)', marginTop: '48px' }}>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} centered>
        <Tab label="Search"/>
        <Tab label="Game"/>
      </Tabs>
      {tab === 0 && <SearchTab/>}
      {tab === 1 && <GameTab/>}
    </Box>
  )
}

export default Images
