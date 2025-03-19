import "./fetchTide.css";

export const fetchTideLevel = async (setTideLevel) => {
  try {
    const stationID = "9452210"; // Juneau, AK tide station
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedTomorrow = tomorrow.toISOString().split("T")[0].replace(/-/g, "");

    // NOAA API URLs
    const predictedTideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationID}&datum=MLLW&product=predictions&units=english&time_zone=lst_ldt&format=json&begin_date=${today}&end_date=${formattedTomorrow}&interval=hilo`;
    const currentTideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationID}&datum=MLLW&product=water_level&units=english&time_zone=lst_ldt&format=json&begin_date=${today}&end_date=${today}&hours=2`;

    // Fetch predicted and real-time tide data in parallel
    const [predictedTideResponse, currentTideResponse] = await Promise.all([
      fetch(predictedTideUrl),
      fetch(currentTideUrl),
    ]);

    if (!predictedTideResponse.ok || !currentTideResponse.ok) {
      throw new Error("Failed to fetch tide data from NOAA.");
    }

    const predictedTideData = await predictedTideResponse.json();
    const currentTideData = await currentTideResponse.json();

    let tideLevelText = "Tide data unavailable";
    let nextLowTideText = "Next Low Tide: Unavailable";
    let secondLowTideText = "Later Low Tide: Unavailable";
    let timeUntilLowTide = "";

    // 🔹 Process Real-Time Tide Data
    if (currentTideData.data && currentTideData.data.length > 1) {
      const latestTideFeet = parseFloat(currentTideData.data[currentTideData.data.length - 1].v).toFixed(2);
      const previousTideFeet = parseFloat(currentTideData.data[currentTideData.data.length - 2].v).toFixed(2);

      const tideTrend = latestTideFeet > previousTideFeet ? "Rising" : "Falling";

      let tideDescription;
      if (latestTideFeet < 1.5) {
        tideDescription = "Low Tide";
      } else if (latestTideFeet >= 1.5 && latestTideFeet < 3.5) {
        tideDescription = "Moderate Tide";
      } else {
        tideDescription = "High Tide";
      }

      tideLevelText = `Current: ${tideDescription} (${tideTrend}), ${latestTideFeet} ft`;
    }

    // 🔹 Process Upcoming Low Tide Predictions
    if (predictedTideData.predictions) {
      const lowTides = predictedTideData.predictions.filter((prediction) => prediction.type === "L");

      const now = new Date();
      const validTides = lowTides.filter((tide) => new Date(tide.t) > now); // Only show future tides

      if (validTides.length > 0) {
        // Process the next valid low tide
        const nextLowTide = new Date(validTides[0].t);
        const nextLowTideFeet = parseFloat(validTides[0].v).toFixed(2);
        nextLowTideText = `Next Low Tide: ${nextLowTide.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: "America/Juneau",
        })}, ${nextLowTideFeet} ft`;

        // Calculate time until next low tide
        const timeDifference = nextLowTide - now;
        if (timeDifference > 0) {
          const hours = Math.floor(timeDifference / (1000 * 60 * 60));
          const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
          timeUntilLowTide = ` (${hours}h ${minutes}m away)`;
        }
      }

      if (validTides.length > 1) {
        // Process the second valid low tide
        const secondLowTide = new Date(validTides[1].t);
        const secondLowTideFeet = parseFloat(validTides[1].v).toFixed(2);
        secondLowTideText = `Later Low Tide: ${secondLowTide.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: "America/Juneau",
        })}, ${secondLowTideFeet} ft`;
      }
    }

    // Update state with **multi-line** formatted tide info
    setTideLevel(`${tideLevelText}\n${nextLowTideText}\n${secondLowTideText}`);
  } catch (error) {
    console.error("Error fetching tide level:", error);
    setTideLevel("⚠️ Tide data unavailable. Please try again later.");
  }
};
