import React, { useMemo, useState } from 'react'
import { Box, TextField, Typography } from '@mui/material'
import imageLinks from '../files/image.json'
import citiesByName from '../files/referee.json'

const normalize = str =>
  str.normalize('NFD') // rimuove eventuali accenti
    .replace(/[\u0300-\u036f]/g, '') // elimina segni diacritici
    .toLowerCase()
    .trim()

const getCity = nameFromFile => {
  const normalizedFromFile = normalize(nameFromFile)
  const parts = normalizedFromFile.split(' ')
  if (parts.length < 2) return null
  
  const reversed = normalize(`${parts[1]} ${parts[0]}`) // cognome nome → nome cognome
  
  for (const fullName in citiesByName) {
    const normalizedJsonKey = normalize(fullName)
    if (
      normalizedJsonKey === normalizedFromFile ||
      normalizedJsonKey === reversed
    ) {
      return citiesByName[fullName]
    }
  }
  
  return null
}
const getFileName = url => url.substring(url.lastIndexOf('/') + 1).split('-')[0].trim()
const Images = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const matchedImage = useMemo(() => {
    if (searchTerm.length < 3) return null
    const term = searchTerm.toLowerCase()
    return imageLinks.find(link => link.toLowerCase().includes(term))
  }, [searchTerm])
  
  const fileName = matchedImage ? getFileName(matchedImage) : ''
  const city = matchedImage ? getCity(fileName) : null
  
  return (
    <Box
      sx={{
        height: 'calc(100vh - 48px)',
        marginTop: '48px',
        padding: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <TextField
        autoFocus
        label="Cerca arbitro"
        sx={{
          width: 400,
          '& label': {
            fontSize: '1.3rem', // dimensione del label
          },
        }}
        InputProps={{
          sx: {
            fontSize: '1.5rem', // dimensione del testo inserito
          },
        }}
        variant="standard"
        onChange={event => setSearchTerm(event.target.value)}
        onFocus={event => event.target.select()}
      />
      {searchTerm.length >= 3 && !matchedImage && (
        <Typography mt={2} color="text.secondary">
          Nessuna immagine trovata.
        </Typography>
      )}
      
      {matchedImage && (
        <Box mt={4} textAlign="center">
          <Typography variant="h5" m={0} style={{ color: 'white' }}>
            {fileName.toUpperCase()}
          </Typography>
          {city && (
            <Typography variant="subtitle1" style={{ color: '#aaa' }}>
              {city}
            </Typography>
          )}
          <img
            src={matchedImage}
            alt="Arbitro trovato"
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', marginTop: 16 }}
          />
        </Box>
      )}
    </Box>
  )
}

export default Images
