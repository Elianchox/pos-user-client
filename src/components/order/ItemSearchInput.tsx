import React, { useCallback, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface ItemSearchInputProps {
  onChange: (query: string) => void
}

const DEBOUNCE_MS = 300

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radii.lg,
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[2],
    marginBottom: t.spacing[3],
    gap: t.spacing[2],
  },
  searchIcon: {
    fontSize: 16,
    color: t.mutedForeground,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: t.foreground,
    padding: 0,
  },
  placeholderText: {
    color: t.mutedForeground,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: t.mutedForeground,
  },
}))

function ItemSearchInputInner({ onChange }: ItemSearchInputProps) {
  const styles = useStyles()
  const [text, setText] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onChange(value)
      }, DEBOUNCE_MS)
    },
    [onChange],
  )

  const handleClear = useCallback(() => {
    setText('')
    onChange('')
  }, [onChange])

  return (
    <View style={styles.container}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Buscar item..."
        placeholderTextColor={styles.placeholderText.color}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Buscar item"
      />
      {text.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton} accessibilityLabel="Limpiar búsqueda">
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      )}
    </View>
  )
}

export const ItemSearchInput = React.memo(ItemSearchInputInner)
