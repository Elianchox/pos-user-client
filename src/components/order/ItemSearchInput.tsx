import { useCallback, useState } from 'react'
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
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: t.mutedForeground,
  },
}))

export function ItemSearchInput({ onChange }: ItemSearchInputProps) {
  const styles = useStyles()
  const [text, setText] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    debounceFn((value: string) => onChange(value), DEBOUNCE_MS),
    [onChange],
  )

  const handleChangeText = (value: string) => {
    setText(value)
    debounce(value)
  }

  const handleClear = () => {
    setText('')
    onChange('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Buscar item..."
        placeholderTextColor={styles.searchIcon.color}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {text.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      )}
    </View>
  )
}

function debounceFn(fn: (value: string) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (value: string) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(value), delay)
  }
}
