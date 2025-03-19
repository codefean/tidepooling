import React, { useState, useEffect } from "react";
import speciesList from "./speciesList"; // Importing the species list
import "./TidepoolingApp.css";

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
        fetchWikipediaImage(species.scientific);
      });
    });
    fetchTideLevel(); // Fetch the tide level when the component mounts
  }, []);

  const fetchWikipediaImage = async (scientificName) => {
    try {
      const formattedName = encodeURIComponent(scientificName.replace(/ /g, "_"));
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${formattedName}`
      );
      const data = await response.json();
      if (data.thumbnail) {
        setSpeciesImages((prev) => ({
          ...prev,
          [scientificName]: data.thumbnail.source,
        }));
      }
    } catch (error) {
      console.error("Error fetching Wikipedia image:", error);
    }
  };

  const fetchTideLevel = async () => {
    try {
      const currentDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      const formattedTomorrow = tomorrowDate.toISOString().split("T")[0].replace(/-/g, "");
  
      // NOAA API for real-time tide levels
      const currentTideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=9452210&datum=MLLW&product=water_level&units=metric&time_zone=gmt&format=json&begin_date=${currentDate}&end_date=${currentDate}&hours=2`;
  
      // NOAA API for predicted tide data (to find next low tide)
      const predictedTideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=9452210&datum=MLLW&product=predictions&units=metric&time_zone=gmt&format=json&begin_date=${currentDate}&end_date=${formattedTomorrow}&interval=hilo`;
  
      // Fetch real-time tide level
      const [currentTideResponse, predictedTideResponse] = await Promise.all([
        fetch(currentTideUrl),
        fetch(predictedTideUrl)
      ]);
  
      const currentTideData = await currentTideResponse.json();
      const predictedTideData = await predictedTideResponse.json();
  
      let tideLevelText = "Tide data unavailable";
      let nextLowTideText = "Next low tide data unavailable";
  
      // Process current tide level
      if (currentTideData.data && currentTideData.data.length > 1) {
        const latestTide = parseFloat(currentTideData.data[currentTideData.data.length - 1].v);
        const previousTide = parseFloat(currentTideData.data[currentTideData.data.length - 2].v);
  
        const tideTrend = latestTide > previousTide ? "Rising Tide" : "Falling Tide";
  
        let tideDescription = "";
        if (latestTide < 1.5) {
          tideDescription = "Low Tide";
        } else if (latestTide >= 1.5 && latestTide < 3.5) {
          tideDescription = "Moderate Tide";
        } else {
          tideDescription = "High Tide";
        }
  
        tideLevelText = `${tideDescription} (${tideTrend})`;
      }
  
      // Process next low tide time
      if (predictedTideData.predictions) {
        const lowTides = predictedTideData.predictions.filter(prediction => prediction.type === "L");
  
        if (lowTides.length > 0) {
          const nextLowTide = new Date(lowTides[0].t + "Z"); // Convert to local time
          const options = { hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'America/Juneau' };
          const formattedLowTideTime = nextLowTide.toLocaleString("en-US", options);
  
          nextLowTideText = `Next Low Tide at ${formattedLowTideTime}`;
        }
      }
  
      setTideLevel(`${tideLevelText} | ${nextLowTideText}`);
  
    } catch (error) {
      console.error("Error fetching tide level:", error);
      setTideLevel("Tide data unavailable");
    }
  };
  
  
  

  const toggleCheck = (scientificName) => {
    setCheckedSpecies((prev) => ({
      ...prev,
      [scientificName]: !prev[scientificName],
    }));
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
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

  return (
    <div className="container">
      <h1 className="title">ANNA GOES TIDEPOOLING</h1>

      <div className="tide-container">
  <p className="tide-title">Current Tide Level in Juneau</p>
  <p className="tide-data">{tideLevel || "Loading..."}</p>
</div>
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
