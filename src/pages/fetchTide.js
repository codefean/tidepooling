import React, { useState, useEffect } from "react";
import "./fetchTide.css";

export const TideDisplay = () => {
  const [tideLevel, setTideLevel] = useState(["Loading..."]);

  useEffect(() => {
    const fetchTideLevel = async () => {
      try {
        const stationID = "9452210"; // Juneau, AK tide station

        // Format dates as YYYY-MM-DD in Alaska time
        const formatDate = (date) => {
          return new Date(date.toLocaleString("en-US", { timeZone: "America/Juneau" }))
            .toISOString()
            .split("T")[0];
        };

        const juneauNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Juneau" }));
        const today = formatDate(juneauNow);
        const tomorrow = formatDate(new Date(juneauNow.getTime() + 86400000));

        const predictedTideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationID}&datum=MLLW&product=predictions&units=english&time_zone=gmt&format=json&begin_date=${today}&end_date=${tomorrow}&interval=hilo`;
        const currentTideUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?station=${stationID}&datum=MLLW&product=water_level&units=english&time_zone=gmt&format=json&begin_date=${today}&end_date=${today}&hours=2`;

        const [predictedTideResponse, currentTideResponse] = await Promise.all([
          fetch(predictedTideUrl),
          fetch(currentTideUrl),
        ]);

        if (!predictedTideResponse.ok || !currentTideResponse.ok) {
          throw new Error("Failed to fetch tide data from NOAA.");
        }

        const predictedTideData = await predictedTideResponse.json();
        const currentTideData = await currentTideResponse.json();

        const predictedTides = predictedTideData?.predictions || [];
        const currentTides = currentTideData?.data || [];

        if (!predictedTides.length || !currentTides.length) {
          setTideLevel(["⚠️ NOAA tide data is temporarily unavailable."]);
          return;
        }

        // 🔹 CURRENT TIDE DATA
        let tideLevelText = "Current tide: Unavailable";
        if (currentTides.length > 1) {
          const latest = parseFloat(currentTides[currentTides.length - 1].v).toFixed(2);
          const previous = parseFloat(currentTides[currentTides.length - 2].v).toFixed(2);
          const trend = latest > previous ? "Rising" : "Falling";

          const description =
            latest < 1.5 ? "Low Tide" : latest < 3.5 ? "Moderate Tide" : "High Tide";

          tideLevelText = `Current: ${description} (${trend}), ${latest} ft`;
        }

        // 🔹 LOW TIDE PREDICTIONS
        const lowTides = predictedTides
          .filter((tide) => tide.type === "L")
          .map((tide) => ({
            time: new Date(tide.t.replace(" ", "T") + "Z"),
            value: parseFloat(tide.v).toFixed(2),
          }))
          .sort((a, b) => a.time - b.time);

        const utcNow = new Date();
        const validTides = lowTides.filter((tide) => tide.time > utcNow);

        const formatTideTime = (date) =>
          new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            timeZone: "America/Juneau",
          }).format(date);

        let nextLowTideText = "Next Low Tide: Unavailable";
        let secondLowTideText = "Later Low Tide: Unavailable";

        if (validTides.length > 0) {
          const next = validTides[0];
          nextLowTideText = `Next Low Tide: ${formatTideTime(next.time)}, ${next.value} ft`;

          const diff = next.time - utcNow;
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            nextLowTideText += ` (${hours}h ${minutes}m away)`;
          }
        }

        if (validTides.length > 1) {
          const second = validTides[1];
          secondLowTideText = `Later Low Tide: ${formatTideTime(second.time)}, ${second.value} ft`;
        }

        setTideLevel([tideLevelText, nextLowTideText, secondLowTideText]);
      } catch (error) {
        console.error("Error fetching tide level:", error);
        setTideLevel(["⚠️ Tide data unavailable. Please try again later."]);
      }
    };

    fetchTideLevel();
  }, []);

  return (
    <div className="tide-container">
      <h3 className="tide-title">Tide Levels</h3>
      {tideLevel.map((line, index) => (
        <p key={index} className="tide-data">{line}</p>
      ))}
    </div>
  );
};
