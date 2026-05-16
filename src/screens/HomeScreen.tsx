import { Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-foreground">POS User Client</Text>
      <Text className="mt-2 text-base text-muted-foreground">Point of Sale System</Text>
    </View>
  )
}
