import { useEffect, useState } from "react";

function TestPage() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/scheduler/health/")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Frontend ↔ Backend Test</h1>
      <p>Django says: <b>{status}</b></p>
    </div>
  );
}

export default TestPage;
