import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000/api";

function App() {
  const [actions, setActions] = useState([]);
  const [actionName, setActionName] = useState("");
  const [date, setDate] = useState("")
  const [points, setPoints] = useState(0);

  //for PUT/EDIT state 
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    action: "",
    date: "",
    points: "",
  });


  // ------- chart UI state -------
  const [group, setGroup] = useState("day"); // "day" | "month" | "year"
  const [startDate, setStartDate] = useState(""); // "YYYY-MM-DD"
  const [endDate, setEndDate] = useState("");     // "YYYY-MM-DD"
  const [series, setSeries] = useState([]); // backend returns [{period, total_points}, ...]

  const [loadingSeries, setLoadingSeries] = useState(false);
  const [seriesError, setSeriesError] = useState("");


   
  useEffect(() => {   /*When page renders, will automatically fetch actions*/
    fetchActions();
  }, []);
  
  const fetchActions = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/actions/"); /* wait for backend to return data*/
      const data = response.data; 
      setActions(data);
    } 
    
    catch (err) {
      console.log(err);
    }
  };


  
  const addAction = async () => {
    const actionData = {
      action: actionName,
      date: date,
      points: points,
    };
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/actions/create/", actionData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      setActions((prev) => [...prev, data]);
    } catch (err) {
      console.log(err);
    }
  };
  
  const deleteAction = async (pk) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/actions/${pk}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setActions((prev) => prev.filter((action) => action.id !== pk));
    } catch (err) {
      console.log(err);
    }
  };
  
  // ENTER edit mode and preload inputs
  const startEdit = (actionObj) => {
    setEditingId(actionObj.id);
    setEditForm({
      action: actionObj.action,
      date: actionObj.date,
      points: actionObj.points,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ action: "", date: "", points: "" });
  };

  // PUT update (action/date/points)
  const updateAction = async (pk) => {
    const actionData = {
      action: editForm.action,
      date: editForm.date,
      points: Number(editForm.points),
    };

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/actions/${pk}/`, actionData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;

      // update UI immediately (tutorial style)
      setActions((prev) =>
        prev.map((a) => (a.id === pk ? data : a))
      );

      cancelEdit();
    } catch (err) {
      console.log(err);
    }
  };


  const fetchPointsTimeseries = async () => {
    setLoadingSeries(true);
    setSeriesError("");

    try {
      const res = await axios.get(`${API_BASE}/actions/points-timeseries/`, {
        params: {
          group,          // day/month/year
          start: startDate || undefined,
          end: endDate || undefined,
        },
      });

      setSeries(res.data);
    } catch (err) {
      console.log(err);
      setSeriesError("Could not load chart data. Check your endpoint and query params.");
    } finally {
      setLoadingSeries(false);
    }
  };

  // Convert backend series to Plotly arrays
  const x = series.map((r) => r.period);
  const y = series.map((r) => r.total_points);
  
  return (

    
    <div className="page">
      <div className="container">
        {/* Title */}
        <h1 className="title">Sustainability Tracker</h1>
    
        {/* ---------------- Chart Section ---------------- */}
      <div className="chartCard">
        <div className="chartHeader">
          <h2>Points Habit Tracker</h2>

          <div className="chartControls">
            <label className="control">
              Group:
              <select value={group} onChange={(e) => setGroup(e.target.value)}>
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </label>

            <label className="control">
              Start:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="control">
              End:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <button className="primaryBtn" type="button" onClick={fetchPointsTimeseries}>
              {loadingSeries ? "Loading..." : "Apply"}
            </button>

            <button
              className="secondaryBtn"
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setGroup("day");
                setSeries([]);
                setSeriesError("");
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {seriesError && <div className="error">{seriesError}</div>}

        {/* Only show chart if we have data */}
        {series.length > 0 ? (
          <Plot
            data={[
              {
                type: "scatter",
                mode: "lines+markers",
                x,
                y,
                name: "Total Points",
              },
            ]}
            layout={{
              title:
                group === "month"
                  ? "Total Points per Month"
                  : group === "year"
                  ? "Total Points per Year"
                  : "Total Points per Day",
              xaxis: {
                title: group === "month" ? "Month" : group === "year" ? "Year" : "Date",
                tickangle: -45,
                // nice UX for day mode
                rangeslider: group === "day" ? { visible: true } : undefined,
              },
              yaxis: { title: "Total Points" },
              margin: { t: 60, l: 60, r: 20, b: 90 },
            }}
            style={{ width: "100%", height: "420px" }}
            useResizeHandler
          />
        ) : (
          <div className="emptyState">
            Choose a date range (optional), pick Day/Month/Year, then click <b>Apply</b>.
          </div>
        )}
      </div>



        {/* Form */}
        <div className="formCard">
          <div className="formGrid">
            <input
              className="input"
              type="text"
              placeholder="Action (e.g., Recycling)"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
            />

            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <input
              className="input"
              type="number"
              placeholder="Points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />

            <button className="primaryButton" onClick={addAction}>
              Add Action
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="tableCard">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Date</th>
                <th>Points</th>
                <th>Adjust</th>
              </tr>
            </thead>

            <tbody>
              {actions.map((action) => (
                <tr key={action.id}>
                  <td>{action.id}</td>
                  <td>{action.action}</td>
                  <td>{action.date}</td>
                  <td>{action.points}</td>

                  <td>
                    {editingId === action.id ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          className="input"
                          type="text"
                          value={editForm.action}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              action: e.target.value,
                            }))
                          }
                        />

                        <input
                          className="input"
                          type="date"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />

                        <input
                          className="input"
                          type="number"
                          value={editForm.points}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              points: e.target.value,
                            }))
                          }
                        />

                        <button
                          className="primaryButton"
                          onClick={() => updateAction(action.id)}
                        >
                          Save
                        </button>

                        {/* If you don't have secondaryButton in CSS, change to primaryButton */}
                        <button className="secondaryButton" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="primaryButton"
                          onClick={() => startEdit(action)}
                        >
                          Edit
                        </button>

                        <button
                          className="dangerButton"
                          onClick={() => deleteAction(action.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      
);


  
  
}

export default App;
