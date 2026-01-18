import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [actions, setActions] = useState([]);
  const [actionName, setActionName] = useState("");
  const [date, setDate] = useState("")
  const [points, setPoints] = useState(0);

   
  useEffect(() => {   /*When page renders, will automatically fetch actions*/
    fetchActions();
  }, []);
  
  const fetchActions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/actions/"); /* wait for backend to return data*/
      const data = await response.json(); 
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
      const response = await fetch("http://127.0.0.1:8000/api/actions/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(actionData),
      });

      const data = await response.json();
      setActions((prev) => [...prev, data]);
    } catch (err) {
      console.log(err);
    }
  };
  
  const deleteAction = async (pk) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/actions/${pk}/`, {
        method: "DELETE",
      });

      setActions((prev) => prev.filter((action) => action.id !== pk));
    } catch (err) {
      console.log(err);
    }
  };
  
  
  
  return (
  <div className="page">
    <div className="container">
      {/* Title */}
      <h1 className="title">Sustainability Tracker</h1>

      {/* Form */}
      <div className="formCard">
        <div className="formGrid">
          <input
            className="input"
            type="text"
            placeholder="Action (e.g., Recycling)"
            onChange={(e) => setActionName(e.target.value)}
          />

          <input
            className="input"
            type="date"
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            className="input"
            type="number"
            placeholder="Points"
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
                  <button
                    className="dangerButton"
                    onClick={() => deleteAction(action.id)}
                  >
                    Delete
                  </button>
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
