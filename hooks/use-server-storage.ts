import { useState, useEffect } from "react"

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>

interface UseServerStorageOptions {
  onError?: (error: unknown) => void
}

export function useServerStorage<T>(
  endpoint: string,
  initialValue: T,
  options?: UseServerStorageOptions
): [T, SetValue<T>, boolean, Error | null] {
  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { onError } = options || {}

  // Fetch data from the API on mount
  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/${endpoint}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (isMounted) {
          setValue(data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)
          if (onError) onError(error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    
    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [endpoint, onError])

  // Function to update the state and persist to the API
  const updateValue: SetValue<T> = async (newValueOrFunction) => {
    try {
      // Calculate the new value
      const newValue = 
        newValueOrFunction instanceof Function 
          ? newValueOrFunction(value) 
          : newValueOrFunction
      
      // Update local state immediately for responsiveness
      setValue(newValue)
      
      // Send to server
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newValue),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to save data: ${response.statusText}`)
      }
      
      setError(null)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      if (onError) onError(error)
      console.error(`Error saving to server:`, error)
    }
  }

  return [value, updateValue, isLoading, error]
} 