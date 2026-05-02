import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../context/UserProfileContext"
import { getCatedraticos } from "../../ts/HeadquartersCoordinator/GetProfessor"
import { getCatedraticoPorCarnet } from "../../ts/HeadquartersCoordinator/GetProfessorCard"
import { Search, Loader2 } from "lucide-react" // Import Lucide icons

/**
 * Props for the SearchProfessor component.
 */
interface SearchProfessorProps {
  onSearchResults: (catedraticos: any[]) => void
}

/**
 * SearchProfessor component allows searching for professors by their ID (carnet) or by name.
 *
 * This component performs an asynchronous search operation to fetch professor data from an API based on the input provided.
 * It utilizes a debounced search to minimize the number of requests when typing.
 *
 * <SearchProfessor onSearchResults={handleSearchResults} />
 */
const SearchProfessor: React.FC<SearchProfessorProps> = ({ onSearchResults }) => {
  const { profile } = useProfile()
  const [searchCarnet, setSearchCarnet] = useState<string>("") // State for search input value
  const [isSearching, setIsSearching] = useState<boolean>(false) // State to track if a search is in progress

  // Execute search when input changes
  useEffect(() => {
    // Create a timer to avoid multiple searches during rapid typing
    const timer = setTimeout(() => {
      if (searchCarnet.length >= 12 || searchCarnet.length === 11) {
        handleSearch() // If the input length is 11 or 12, trigger search
      } else if (searchCarnet.length === 0) {
        // If input is empty, show all professors
        handleSearch()
      }
    }, 300) // Small delay to improve performance

    return () => clearTimeout(timer) // Cleanup the timer on component unmount
  }, [searchCarnet])

  /**
   * Function to perform the search operation.
   * This function checks if the input is empty or has less than 12 characters.
   * If true, it fetches all professors from the current profile's sede (location).
   * If the input length is greater than or equal to 12, it searches for a specific professor by carnet.
   */
  const handleSearch = async () => {
    if (isSearching) return // Prevent multiple searches simultaneously

    try {
      setIsSearching(true)

      if (!searchCarnet || searchCarnet.length < 12) {
        // If the input is empty or has fewer than 12 characters, show all professors
        const perfil = profile // Get the current profile data from context
        if (perfil?.sede) {
          const catedraticosRecuperados = await getCatedraticos(perfil.sede) // Fetch professors from the current sede
          onSearchResults(Array.isArray(catedraticosRecuperados) ? catedraticosRecuperados : []) // Return the result
        }
      } else {
        // If the input length is 12 or more, search for a specific professor by carnet
        const catedraticoEncontrado = await getCatedraticoPorCarnet(searchCarnet) // Fetch professor by carnet
        onSearchResults(catedraticoEncontrado ? [catedraticoEncontrado] : []) // Return the found professor or an empty array
      }
    } catch (error) {
      
      onSearchResults([]) // Return an empty array in case of error
    } finally {
      setIsSearching(false) // Set the searching state to false after the operation is completed
    }
  }

  return (
    <div className="relative flex items-center">
      <input
        id="search-input"
        type="text"
        placeholder="Buscar por Carnet de Estudiante 🔍" // Input placeholder with emoji
        value={searchCarnet} // Bind the input value to the searchCarnet state
        onChange={(e) => setSearchCarnet(e.target.value)} // Update the searchCarnet state on input change
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 shadow-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-600 sm:w-80"
      />
      <Search className="absolute left-3 h-5 w-5 text-gray-400 dark:text-gray-300" />
      {isSearching && (
        <div className="absolute right-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span className="sr-only">Buscando...</span>
        </div>
      )}
    </div>
  )
}

export default SearchProfessor
