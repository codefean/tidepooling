import React, { useState, useEffect } from "react";
import "./TidepoolingApp.css";

//cd /Users/seanfagan/Desktop/tidepooling-app2

const speciesList = [
    {
      category: "Mollusks",
      species: [
        { name: "Black Katy Chiton", scientific: "Katharina tunicata", description: "A large, dark-colored chiton commonly found on rocky shores." },
        { name: "Gumboot Chiton", scientific: "Cryptochiton stelleri", description: "The largest chiton species, also known as the 'wandering meatloaf'." },
        { name: "Pacific Blue Mussel", scientific: "Mytilus trossulus", description: "A common bivalve that forms dense clusters on rocks." },
        { name: "Pacific Razor Clam", scientific: "Siliqua patula", description: "A fast-burrowing clam found in sandy beaches." },
        { name: "Littorine Periwinkles", scientific: "Littorina", description: "Small marine snails that cling to rocks in the intertidal zone." },
        { name: "Oregon Triton", scientific: "Fusitriton oregonensis", description: "A large predatory snail that feeds on other mollusks." },
        { name: "Checkered Periwinkle", scientific: "Littorina scutulata", description: "A small, checkered-patterned snail found in the upper intertidal zone." },
        { name: "Leafy Hornmouth Snail", scientific: "Ceratostoma foliatum", description: "A spiny marine snail with distinctive leafy projections on its shell." },
        { name: "Wrinkled Whelk", scientific: "Nucella lamellosa", description: "A carnivorous snail that preys on barnacles and mussels." },
      ],
    },
    {
      category: "Cephalopods",
      species: [
        { name: "Giant Pacific Octopus", scientific: "Enteroctopus dofleini", description: "The largest species of octopus, known for its intelligence and camouflage abilities." },
        { name: "Red Octopus", scientific: "Octopus rubescens", description: "A small, reddish-brown octopus that inhabits tide pools and rocky shores." },
      ],
    },
    {
      category: "Crustaceans",
      species: [
        { name: "Acorn Barnacles", scientific: "Balanus glandula", description: "Small, volcano-shaped barnacles that attach to rocks and other hard surfaces." },
        { name: "Thatched Barnacle", scientific: "Semibalanus cariosus", description: "A large barnacle with a rough, conical shell." },
        { name: "Dungeness Crab", scientific: "Metacarcinus magister", description: "A prized seafood species known for its sweet, tender meat." },
        { name: "Helmet Crab", scientific: "Telmessus cheiragonus", description: "A small, spiny crab often found in eelgrass beds." },
        { name: "Kelp Crab", scientific: "Pugettia producta", description: "A crab with long legs that blends in with seaweed and kelp." },
        { name: "Porcelain Crab", scientific: "Petrolisthes", description: "A delicate crab that filters plankton from the water." },
        { name: "Shore Crab", scientific: "Hemigrapsus nudus", description: "A small crab with purple or green coloration that scurries along tide pools." },
        { name: "Red Rock Crab", scientific: "Cancer productus", description: "A robust, red-colored crab often found on rocky shorelines." },
        { name: "Sand Fleas/Beach Hoppers", scientific: "Megalorchestia", description: "Small crustaceans that jump and burrow in sandy beaches." },
      ],
    },
    {
      category: "Echinoderms",
      species: [
        { name: "Ochre Sea Star", scientific: "Pisaster ochraceus", description: "A keystone predator known for its striking orange, purple, or brown color." },
        { name: "Mottled Star", scientific: "Evasterias troschelii", description: "A large sea star with a mottled color pattern." },
        { name: "Leather Star", scientific: "Dermasterias imbricata", description: "A soft-bodied sea star with a leathery texture." },
        { name: "Sunflower Sea Star", scientific: "Pycnopodia helianthoides", description: "A fast-moving sea star with up to 24 arms." },
        { name: "Green Sea Urchin", scientific: "Strongylocentrotus droebachiensis", description: "A spiky, green-colored sea urchin that grazes on algae." },
        { name: "Red Sea Urchin", scientific: "Mesocentrotus franciscanus", description: "A large, long-spined urchin harvested for its roe." },
        { name: "California Sea Cucumber", scientific: "Apostichopus californicus", description: "A soft-bodied echinoderm that filters detritus from the ocean floor." },
      ],
    },
    {
      category: "Fish",
      species: [
        { name: "Tidepool Sculpin", scientific: "Oligocottus maculosus", description: "A small, well-camouflaged fish that darts between rocks in tide pools." },
        { name: "Fluffy Sculpin", scientific: "Oligocottus snyderi", description: "A tiny, fuzzy-looking fish that blends into its environment." },
        { name: "High Cockscomb", scientific: "Anoplarchus purpurescens", description: "A long, eel-like fish with a prominent dorsal ridge." },
        { name: "Gunnel", scientific: "Pholis", description: "A slippery, elongated fish that hides under seaweed and rocks." },
      ],
    },
    {
      category: "Algae & Marine Plants",
      species: [
        { name: "Rockweed", scientific: "Fucus distichus", description: "A brown seaweed that grows in dense mats along the shore." },
        { name: "Bull Kelp", scientific: "Nereocystis luetkeana", description: "A fast-growing kelp that forms underwater forests." },
        { name: "Sea Lettuce", scientific: "Ulva lactuca", description: "A bright green algae often found in tide pools." },
        { name: "Turkish Washcloth", scientific: "Mastocarpus papillatus", description: "A red algae with a rough, sandpapery texture." },
        { name: "Sugar Kelp", scientific: "Saccharina latissima", description: "A large, edible kelp known for its sweet flavor." },
      ],
    },
  ];
  

const TidepoolingApp = () => {
  const [checkedSpecies, setCheckedSpecies] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [speciesImages, setSpeciesImages] = useState({});

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
    const selectedSpecies = Object.keys(checkedSpecies).filter(
      (key) => checkedSpecies[key]
    );

    if (selectedSpecies.length === 0) {
      alert("You haven't checked any species yet!");
      return;
    }

    const speciesText = selectedSpecies.join(", ");
    navigator.clipboard.writeText(`I saw these tidepool species: ${speciesText}`).then(() => {
      alert("Copied to clipboard! Paste it into a message to share.");
    });
    };


return (
    <div className="container">
      <h1 className="title">ANNA GOES TIDEPOOLING IN JUNEAU</h1>

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
      {/* Copy to Clipboard Button */}
<button className="copy-button" onClick={copyCheckedSpecies}>
  Copy My Species List to Share 📋
</button>

    </div>
  );
};

export default TidepoolingApp;
