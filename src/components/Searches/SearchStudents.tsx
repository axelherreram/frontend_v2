import type React from "react"
import { useState, useEffect } from "react"
import { useProfile } from "../../context/UserProfileContext"
import { getEstudiantePorCarnet } from "../../ts/Administrator/GetStudentCard"
import { getStudents } from "../../ts/General/GetStudents"
import { Search, Loader2 } from "lucide-react" // Import Lucide icons

/**
 * `SearchStudents` is a component that allows searching for students by their student card number or by filtering
 * students based on selected year and course.
 */
interface SearchStudentsProps {
  selectedAño: string // Selected year for student filtering
  selectedCurso: string // Selected course for student filtering
  onSearchResults: (estudiantes: any[]) => void // Callback to return search results
}

/**
 * `SearchStudents` is a functional React component that allows searching for students either by their student card number
 * or by filtering based on the selected year and course.
 */
const SearchStudents: React.FC<SearchStudentsProps> = ({ selectedAño, selectedCurso, onSearchResults }) => {
  const { profile } = useProfile()
  const [searchCarnet, setSearchCarnet] = useState<string>("") // State to hold the value of the student card input
  const [isSearching, setIsSearching] = useState<boolean>(false) // State to track if a search is in progress

  // Execute search when the input changes
  useEffect(() => {
    // Create a timer to avoid multiple searches during rapid typing
    const timer = setTimeout(() => {
      if (searchCarnet.length >= 11 || searchCarnet.length === 0) {
        // Changed from 12 to 11 as per common student ID lengths, and added 0 for empty search
        handleSearch() // Perform the search if the input is 11 or more characters long, or empty
      }
    }, 300) // Small delay to improve performance
    // Cleanup timer on component unmount or when searchCarnet changes
    return () => clearTimeout(timer)
  }, [searchCarnet, selectedAño, selectedCurso]) // Dependency array to trigger the effect when input or filters change

  /**
   * Handles the search logic based on the input value. If the carnet is valid (11 or 12 characters), it searches for a specific student.
   * If the carnet is empty or has fewer than 11 characters, it fetches all students based on the selected year and course.
   */
  const handleSearch = async () => {
    if (isSearching) return // Prevent simultaneous searches

    try {
      setIsSearching(true) // Set the search state to true to indicate a search is in progress
      const perfil = profile // Get profile data from context
      if (!perfil) return

      if (!searchCarnet || searchCarnet.length < 11) {
        // If the input is empty or has less than 11 characters, show all students
        if (perfil.sede && selectedCurso && selectedAño) {
          // Fetch students based on the selected course, year, and the profile's campus
          const estudiantes = await getStudents(
            perfil.sede,
            Number.parseInt(selectedCurso), // Convert selectedCurso to a number
            Number.parseInt(selectedAño), // Convert selectedAño to a number
          )
          onSearchResults(Array.isArray(estudiantes) ? estudiantes : []) // Return the list of students to the parent component
        } else {
          onSearchResults([]) // No sede, curso, or año selected, return empty
        }
      } else {
        // If the carnet is valid (11 or more characters), search for a specific student
        const estudianteEncontrado = await getEstudiantePorCarnet(
          perfil.sede,
          Number.parseInt(selectedAño),
          searchCarnet,
        )
        onSearchResults(estudianteEncontrado ? [estudianteEncontrado] : []) // Return the found student or an empty array
      }
    } catch (error) {
      
      onSearchResults([]) // Return an empty list in case of an error
    } finally {
      setIsSearching(false) // Set the search state to false once the search is complete
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

export default SearchStudents
