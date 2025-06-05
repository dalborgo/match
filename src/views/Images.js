import React, { useMemo, useState } from 'react'
import { Box, TextField, Typography } from '@mui/material'
import imageLinks from '../files/images.json'

const Images = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const matchedImage = useMemo(() => {
    if (searchTerm.length < 3) return null
    const term = searchTerm.toLowerCase()
    return imageLinks.find(link => link.toLowerCase().includes(term))
  }, [searchTerm])
  
  const getFileName = url => url.substring(url.lastIndexOf('/') + 1)
  
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
        sx={{ width: 300 }}
        variant={'standard'}
        onChange={event => setSearchTerm(event.target.value)}
      />
      
      {searchTerm.length >= 3 && !matchedImage && (
        <Typography mt={2} color="text.secondary">
          Nessuna immagine trovata.
        </Typography>
      )}
      
      {matchedImage && (
        <Box mt={2} textAlign="center">
          <Typography variant="h5" m={1} style={{ color: 'white' }}>
            {getFileName(matchedImage)}
          </Typography>
          <img
            src={matchedImage}
            alt="Arbitro trovato"
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
          />
        </Box>
      )}
    </Box>
  )
}

export default Images
