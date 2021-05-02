import React from 'react'
import Navbar from './Navbar/Navbar'
import './App.css'
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Registration from './Registration/Registration';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar/>
        <Switch>
          <Route path="/registration" component={Registration}/>
        </Switch>
      </div>
    </BrowserRouter>
   
  );
}

export default App;
