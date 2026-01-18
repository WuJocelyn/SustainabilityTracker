import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [actions, setActions] = useState([]);
   
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

  
  
  
  
  
  
  return(
    <>
      <h1>Sustainability Tracker</h1>

      <div>
        <input type = "text" placeholder = "Sustainability Action (ex. Recycling)..."/>
        <input type="date"/>
        <input type = "number" placeholder = "Points Awarded..."/>
        <button> Add Sustinability Action </button>
      </div>
      
      {actions.map((action) => (     /*each individual action in actions useState will be dispalyed*/
        <div>
          <p>ID: {action.id}</p>
          <p>Action Name: {action.action}</p>
          <p>Date: {action.date} </p>
          <p>Points: {action.points}</p>
          
        </div>
      ))}
    
    
    </>
  );

  
  
}

export default App;
