import { SuiObjectResponse } from "@mysten/sui/client";

/**
 * Converts a SuiObjectResponse to a specified type T
 * @param response The SUI object response to convert
 * @returns The converted type T or null if conversion fails
 */
export function convertSuiObject<T>(response: SuiObjectResponse): T | null {
    try {
        // Check if response and data exist
        if (!response?.data?.content?.dataType) {
            return null;
        }
  
        const content = response.data.content;
        
        // Ensure it's a moveObject with fields
        if (content.dataType === 'moveObject' && 'fields' in content) {
            // Cast fields to the generic type
            return content.fields as unknown as T;
        }
  
        return null;
    } catch (error) {
        console.error('Error converting SUI object:', error);
        return null;
    }
  }
  
  /**
  * Converts an array of SuiObjectResponse to an array of specified type T
  * @param responses Array of SUI object responses to convert
  * @returns Array of converted type T (excluding null values)
  */
  export function convertSuiObjects<T>(responses: SuiObjectResponse[]): T[] {
    return responses
        .map(response => convertSuiObject<T>(response))
        .filter((item): item is T => item !== null);
  }