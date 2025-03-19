import React, { useState, useEffect } from "react";
import speciesList from "./speciesList";
import { fetchTideLevel } from "./fetchTide";
import TideSearch from "./tideSearch";
import "./TidepoolingApp.css";

//cd /Users/seanfagan/Desktop/tidepooling-app2

const TidepoolingApp = () => {
  const [checkedSpecies, setCheckedSpecies] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [speciesImages, setSpeciesImages] = useState({});
  const [tideLevel, setTideLevel] = useState(null);

  useEffect(() => {
    const savedChecked = JSON.parse(localStorage.getItem("checkedSpecies")) || {};
    setCheckedSpecies(savedChecked);
  }, []);

  useEffect(() => {
    localStorage.setItem("checkedSpecies", JSON.stringify(checkedSpecies));
  }, [checkedSpecies]);

  useEffect(() => {
    speciesList.forEach((group) => {
      group.species.forEach((species) => {
        fetchINaturalistImage(species.scientific);
      });
    });

    fetchTideLevel(setTideLevel); // Call the function to fetch tide level
  }, []);

  const fetchINaturalistImage = async (scientificName) => {
    try {
      const response = await fetch(
        `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}`
      );
      const data = await response.json();
  
      if (data.results.length > 0 && data.results[0].default_photo) {
        setSpeciesImages((prev) => ({
          ...prev,
          [scientificName]: data.results[0].default_photo.medium_url, // iNaturalist image URL
        }));
      } else {
        setSpeciesImages((prev) => ({
          ...prev,
          [scientificName]: "/images/placeholder.jpg", // Fallback image
        }));
      }
    } catch (error) {
      console.error("Error fetching iNaturalist image:", error);
      setSpeciesImages((prev) => ({
        ...prev,
        [scientificName]: "/images/placeholder.jpg", // Fallback image if fetch fails
      }));
    }
  };
  
  

  const toggleCheck = (scientificName) => {
    setCheckedSpecies((prev) => ({
      ...prev,
      [scientificName]: !prev[scientificName],
    }));
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const isExpanded = !prev[category];
  
      if (isExpanded) {
        // Fetch images only when expanding the category
        const speciesToFetch = speciesList.find(group => group.category === category).species;
        speciesToFetch.forEach(species => {
          if (!speciesImages[species.scientific]) {
            fetchINaturalistImage(species.scientific);
          }
        });
      }
  
      return { ...prev, [category]: isExpanded };
    });
  };
  

  const copyCheckedSpecies = () => {
    const selectedScientificNames = Object.keys(checkedSpecies).filter(
      (key) => checkedSpecies[key]
    );

    if (selectedScientificNames.length === 0) {
      alert("You haven't checked any species yet!");
      return;
    }

    const selectedCommonNames = selectedScientificNames.map((scientificName) => {
      let commonName = "";
      speciesList.forEach((group) => {
        const speciesMatch = group.species.find(
          (species) => species.scientific === scientificName
        );
        if (speciesMatch) {
          commonName = speciesMatch.name;
        }
      });
      return commonName;
    });

    const speciesText = selectedCommonNames.join(", ");
    navigator.clipboard.writeText(`I saw these tidepool species: ${speciesText}`).then(() => {
      alert("Copied to clipboard! Paste it into a message to share.");
    });
  };

    // Function to scroll to species when selected in TideSearch
    const handleSpeciesClick = (speciesId, category) => {
      // Ensure the category is expanded before scrolling
      setExpandedCategories((prev) => ({
        ...prev,
        [category]: true,
      }));
  
      setTimeout(() => {
        const speciesElement = document.getElementById(speciesId);
        if (speciesElement) {
          speciesElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100); // Delay allows React state update to take effect
    };

  return (
    <div className="container">
      <h1 className="title">TIDEPOOLING</h1>

      <div className="tide-container">
  <p className="tide-title">Tides in Juneau</p>
  {tideLevel ? (
    tideLevel.split("\n").map((line, index) => (
      <p key={index} className="tide-data">{line}</p>
    ))
  ) : (
    <p className="tide-data">Loading...</p>
  )}
</div>

<TideSearch onSpeciesSelect={handleSpeciesClick} />
      {speciesList.map((group) => (
        <div key={group.category} className="category-container">
          <div className="category-header" onClick={() => toggleCategory(group.category)}>
            <h2 className="category-title">{group.category}</h2>
            <span>{expandedCategories[group.category] ? "▼" : "►"}</span>
          </div>
          {expandedCategories[group.category] && (
            <div className="species-list">
              {group.species.map((species) => (
                <div key={species.scientific} className="species-card">
                  <div className="species-info">
                    <img
                      src={speciesImages[species.scientific] || "placeholder.jpg"}
                      alt={species.name}
                      className="species-image"
                    />
                    <div>
                      <span className="species-name">{species.name} ({species.scientific})</span>
                      <p className="species-description">{species.description}</p>
                    </div>
                  </div>
                  
                  <input
                    type="checkbox"
                    className="species-checkbox"
                    checked={!!checkedSpecies[species.scientific]}
                    onChange={() => toggleCheck(species.scientific)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Copy to Clipboard Button */}
      <button className="copy-button" onClick={copyCheckedSpecies}>
        Copy My Species List to Share 📋
      </button>

      {/* Footer */}
      <footer className="footer">made by sean</footer>
    </div>
  );
};

export default TidepoolingApp;
