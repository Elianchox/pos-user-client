import { useMemo } from "react"
import { StyleSheet } from "react-native"
import type { ImageStyle, TextStyle, ViewStyle } from "react-native"
import { useAppTheme } from "./useAppTheme"
import type { AppTheme } from "./types"

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle }

type StyleFactory<T extends NamedStyles<T>> = (t: AppTheme) => T

export function makeStyles<T extends NamedStyles<T>>(
  factory: StyleFactory<T>,
): () => T {
  return function useStyles(): T {
    const { theme } = useAppTheme()
    return useMemo(() => StyleSheet.create(factory(theme)), [theme])
  }
}
