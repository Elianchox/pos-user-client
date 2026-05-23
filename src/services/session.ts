import AsyncStorage from '@react-native-async-storage/async-storage'

const TOKEN_KEY = 'mobile_session_token'
const TABLE_ID_KEY = 'mobile_table_id'
const CUSTOMER_NAME_KEY = 'mobile_customer_name'
const DEVICE_ID_KEY = 'mobile_device_id'

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY)
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token)
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY)
}

export async function getTableId(): Promise<string | null> {
  return AsyncStorage.getItem(TABLE_ID_KEY)
}

export async function setTableId(id: string): Promise<void> {
  await AsyncStorage.setItem(TABLE_ID_KEY, id)
}

export async function clearTableId(): Promise<void> {
  await AsyncStorage.removeItem(TABLE_ID_KEY)
}

export async function getCustomerName(): Promise<string | null> {
  return AsyncStorage.getItem(CUSTOMER_NAME_KEY)
}

export async function setCustomerName(name: string): Promise<void> {
  await AsyncStorage.setItem(CUSTOMER_NAME_KEY, name)
}

export async function getDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(DEVICE_ID_KEY)
}

export async function setDeviceId(id: string): Promise<void> {
  await AsyncStorage.setItem(DEVICE_ID_KEY, id)
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, TABLE_ID_KEY, CUSTOMER_NAME_KEY])
}

export async function clearSessionExceptName(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, TABLE_ID_KEY])
}
