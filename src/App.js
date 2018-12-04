import React, { Component } from 'react';
import Header from './components/header/header';
import Middle from './components/middle/middle';
import './App.css';

class App extends Component {
  state = {
    Age: '',
    Physician: '',
    DRG: ''
  }
  render() {
    return (
      <div className="App">
        <div className="Header">
          <Header />
        </div>
        <div className="Middle">
          <Middle />
        </div>
        {/* <div className="Footer">
          <Footer />
        </div> */}
      </div>
    );
  }
}

export default App;
