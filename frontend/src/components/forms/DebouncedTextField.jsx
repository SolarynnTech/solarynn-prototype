import React, { useState, useEffect, useRef, memo } from 'react'
import { TextField } from '@mui/material'

const DebouncedTextField = memo(({
                                   questionId,
                                   initialValue,
                                   readOnly,
                                   onDebouncedChange
                                 }) => {
  const [local, setLocal] = useState(initialValue || '')
  const deb = useRef(null)

  useEffect(() => {
    setLocal(initialValue || '')
  }, [initialValue])

  const handleChange = (e) => {
    const v = e.target.value
    setLocal(v)
    clearTimeout(deb.current)
    deb.current = setTimeout(() => {
      onDebouncedChange(questionId, v)
    }, 300)
  }

  return (
    <TextField
      fullWidth multiline rows={4} variant="outlined"
      disabled={readOnly}
      value={local}
      onChange={handleChange}
    />
  )
})

export default DebouncedTextField
