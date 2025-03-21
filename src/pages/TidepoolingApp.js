import React, { useState, useEffect } from "react";
import speciesList from "./speciesList";
import { TideDisplay } from "./fetchTide";
import TideSearch from "./tideSearch";
import "./TidepoolingApp.css";

//cd /Users/seanfagan/Desktop/tidepooling-app3

const TidepoolingApp = () => {
  const [checkedSpecies, setCheckedSpecies] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [speciesImages, setSpeciesImages] = useState({});

  useEffect(() => {
    const savedChecked = JSON.parse(localStorage.getItem("checkedSpecies")) || {};
    setCheckedSpecies(savedChecked);
  }, []);

  useEffect(() => {
    if (Object.keys(checkedSpecies).length > 0) {
      localStorage.setItem("checkedSpecies", JSON.stringify(checkedSpecies));
    }
  }, [checkedSpecies]);

  const fetchINaturalistImage = async (scientificName) => {
    try {
      const response = await fetch(
        `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}`
      );
      const data = await response.json();
  
      if (data.results.length > 0 && data.results[0].default_photo) {
        setSpeciesImages((prev) => ({
          ...prev,
          [scientificName]: data.results[0].default_photo.medium_url,
        }));
      } else {
        setSpeciesImages((prev) => ({
          ...prev,
          [scientificName]: "/images/placeholder.jpg",
        }));
      }
    } catch (error) {
      console.error("Error fetching iNaturalist image:", error);
      setSpeciesImages((prev) => ({
        ...prev,
        [scientificName]: "/images/placeholder.jpg",
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

  const handleSpeciesClick = (speciesId, category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: true,
    }));

    setTimeout(() => {
      const speciesElement = document.getElementById(speciesId);
      if (speciesElement) {
        speciesElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  return (
    <div className="container">
      <h1 className="title">TIDEPOOLING</h1>

      <TideDisplay />


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
                      src={speciesImages[species.scientific] || "/images/placeholder.jpg"}
                      alt={`${species.name} - ${species.scientific}`}
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

      <button className="copy-button" onClick={copyCheckedSpecies}>
        Copy My Species List to Share 📋
      </button>

      <footer className="footer">made by sean</footer>
    </div>
  );
};

export default TidepoolingApp;