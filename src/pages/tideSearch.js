import React, { useState } from "react";
import speciesList from "./speciesList";
import "./tideSearch.css"; // Import the CSS file

const TideSearch = ({ onSpeciesSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openSpeciesId, setOpenSpeciesId] = useState(null); // Track which species is open

  // Flatten species list for easier searching
  const allSpecies = speciesList.flatMap(category =>
    category.species.map(species => ({
      ...species,
      category: category.category
    }))
  );

  // Filter species based on search query and limit results to first 2 matches
  const filteredSpecies = allSpecies
    .filter(species => species.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 2); // Show only first two results

  // Handles species selection
  const handleSelectSpecies = (species) => {
    setOpenSpeciesId(species.id); // Only open the selected species
    onSpeciesSelect(species.id, species.category);
  };

  return (
    <div className="tide-search">
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search for a species..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setOpenSpeciesId(null); // Close all sections when typing a new query
        }}
        className="search-input"
      />

      {/* Search Results (Limited to 2) */}
      {searchQuery && (
        <div className="search-results">
          {filteredSpecies.length > 0 ? (
            filteredSpecies.map(species => (
              <div key={species.id} className="search-result">
                {/* Clickable Name */}
                <button
                  onClick={() => handleSelectSpecies(species)}
                  className="species-button"
                >
                  {species.name}
                </button>

                {/* Expandable Section (Only shows if it's the selected species) */}
                {openSpeciesId === species.id && (
                  <div className="expanded-info">
                    {/* You can add more details or links here */}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">No matching species found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TideSearch;
