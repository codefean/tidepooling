import React, { useEffect } from "react";
import TidepoolingApp from "./pages/TidepoolingApp";
import "./pages/TidepoolingApp.css";

function App() {
  useEffect(() => {
    document.title = "Tidepools"; // Set the tab title
  }, []);

  return (
    <div className="App">
      <TidepoolingApp />
    </div>
  );
}

export default App;