import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import "./App.css";


/**
 * App.jsx
 * -------
 * Main React component for the Sustainability Tracker.
 * Responsibilities:
 *  - Fetch existing actions from the Django API (GET)
 *  - Create new actions (POST)
 *  - Edit existing actions (PUT)
 *  - Delete actions (DELETE)
 *  - Fetch aggregated points timeseries for a Plotly chart (GET w/ query params)
 */


function App() {
  
  // List of actions currently displayed in the table
  const [actions, setActions] = useState([]);


   // "Add Action" form fields
  const [actionName, setActionName] = useState(""); 
  const [date, setDate] = useState("")
  const [points, setPoints] = useState(0);

  // Edit (PUT) state 
  const [editingId, setEditingId] = useState(null);  // If not null, we are editing the row with this id
  const [editForm, setEditForm] = useState({ // Holds the values in the "edit mode" inputs (separate from create form)
    action: "",
    date: "",
    points: "",
  });

  // Line Chart - Chart controls + chart data
  // Controls how backend aggregates points: day/month/year

  
  const [group, setGroup] = useState("day"); // either "day", "month", "year"

  
  const [startDate, setStartDate] = useState(""); // "YYYY-MM-DD" // Optional chart filter range (sent as query params if provided)
  const [endDate, setEndDate] = useState("");     // "YYYY-MM-DD"
  
const [series, setSeries] = useState([]); // backend returns [{period, total_points}, ...] 
// Example: [{ period: "2026-01-01", total_points: 40 }, ...]

 
  const [loadingSeries, setLoadingSeries] = useState(false);  // UI feedback for chart request
  const [seriesError, setSeriesError] = useState("");


   
  useEffect(() => {   // On first render, will automatically fetch actions
    fetchActions();
  }, []);
  
   /**
   * GET /api/actions/
   * Fetch all sustainability actions and store them in state.
   */

  const fetchActions = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/actions/");  // axios.get returns a response object: { data, status, headers, ... }
      const data = response.data; // response.data is the JSON payload returned by your API
      setActions(data); // Update UI state so React re-renders the table
    } 
    
    catch (err) {
      console.log(err);
    }
  };

   /**
   * POST /api/actions/create/
   * Create a new action based on current form inputs,
   * then append it to the actions list for immediate UI update.
   */
  
  const addAction = async () => {
    const actionData = {  // Build the JSON body expected by your backend
      action: actionName,
      date: date,
      points: points,
    };
    try {  
      const response = await axios.post("http://127.0.0.1:8000/api/actions/create/", actionData, {   // Send JSON to backend (Axios automatically JSON-stringifies objects)
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;  // Newly created object returned by backend (often includes id)
      setActions((prev) => [...prev, data]); // prev is the current actions array; append the new action
    } catch (err) {
      console.log(err);
    }
  };
  
   /**
   * DELETE /api/actions/<id>/
   * Delete the given action on the backend and remove it from UI state.
   *
   * @param {number} pk - primary key / id of the action to delete
   */
  const deleteAction = async (pk) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/actions/${pk}/`, { // DELETE request to backend
        headers: {
          "Content-Type": "application/json",
        },
      });

      setActions((prev) => prev.filter((action) => action.id !== pk)); // Remove deleted item from UI list without refetching everything
    } catch (err) {
      console.log(err);
    }
  };
  
  /**
   * Enter "edit mode" for a single row and preload the edit inputs.
   *
   * @param {object} actionObj - the action row object being edited
   */

  const startEdit = (actionObj) => {  // Set which row is currently in edit mode
    setEditingId(actionObj.id);
    setEditForm({           // Pre-fill the edit form with existing values so user can modify them
      action: actionObj.action,
      date: actionObj.date,
      points: actionObj.points,
    });
  };


  /**
   * PUT /api/actions/<id>/
   * Save edited values for the row currently in edit mode.
   *
   * @param {number} pk - primary key / id of the action to update
   */

  
  const updateAction = async (pk) => {
    const actionData = {   // Build payload from editForm state
      action: editForm.action,
      date: editForm.date,
      points: Number(editForm.points), // Ensure points is numeric (inputs often return strings)
    };

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/actions/${pk}/`, actionData, {   // Send update to backend
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;  // Updated object returned by backend


      setActions((prev) =>  // map over previous array and replace only the edited item
        prev.map((a) => (a.id === pk ? data : a))
      );

      cancelEdit();
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * GET /api/actions/points-timeseries/?group=day|month|year&start=YYYY-MM-DD&end=YYYY-MM-DD
   * Pull aggregated totals for the Plotly chart based on current filters.
   */

  const fetchPointsTimeseries = async () => {
    setLoadingSeries(true); 
    setSeriesError("");

    try {
      // Axios "params" becomes query string parameters (?group=...&start=...&end=...)
      const res = await axios.get(`http://127.0.0.1:8000/api/actions/points-timeseries/`, { 
        params: {
          group,          // day/month/year
          start: startDate || undefined,
          end: endDate || undefined,
        },
      });

      setSeries(res.data); // Store series for chart rendering
    } 
    
    catch (err) {
      console.log(err);
      setSeriesError("Could not load chart data. Check your endpoint and query params.");
    } 
    
    finally {
      setLoadingSeries(false);
    }
  };

  // Convert backend series (array of objects) into Plotly x/y arrays
  const x = series.map((r) => r.period);
  const y = series.map((r) => r.total_points);
  
  return (

    
    <div className="page">
      <div className="container">
        {/* Title */}
        <h1 className="title">Sustainability Tracker</h1>
    
      {/* Line Chart */}
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
