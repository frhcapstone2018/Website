import React, { Component } from 'react';
import headerImage from '../header/header_photo.jpg'
import '../header/header.css';
class Header extends Component {
  render() {
    return (
      <div className="Header">
        <div className="HeaderTop"><br/></div>
        <img className="ImageHeaderTop" src = {headerImage} alt = "Forbes Hospital logo"/>
      </div>
    );
  }
}

export default Header;
