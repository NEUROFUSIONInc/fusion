import React from 'react';
import logo from '../assets/logo.png';
import { logoutUser } from '../services/auth';

const navStyle = {
  position: 'fixed',
  left: 0,
  top: 0,
  width: '12%',
  height: '100%',
  overflow: 'auto',
  backgroundColor: 'rgb(16 43 83)',
  color: '#fff',
  padding: '20px 0',
  display: 'flex',
  flexDirection: 'column-reverse'
};

const titleStyle = {
  margin: 0,
  padding: '0 20px',
  fontSize: '1.2em',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};

const itemStyle = {
  margin: '10px 0',
  padding: '0 20px',
};

const linkStyle = {
  color: '#fff',
  textDecoration: 'underline',
};

const logoStyle = {
  padding: '0 20px',
  width: '-webkit-fill-available',
  borderRadius: '61px'
}

const SideNavBar = () => {
  return (
    <nav style={navStyle}>
      <div>
        <img src={logo} style={logoStyle} alt="logo" width={150} height={150}/>
      </div>

      <h3 style={titleStyle}>NEUROFUSION</h3>
      <ul style={listStyle}>
        <li style={itemStyle}>
          <a style={linkStyle} href="/lab">Playground</a>
        </li>
        <li style={itemStyle}>
          <a style={linkStyle} href="/recordings">Recordings</a>
        </li>
        <li style={itemStyle}>
          <a style={linkStyle} href="/analysis">Analysis</a>
        </li>
        <li style={itemStyle}>
          <a style={linkStyle} href="https://neurofusion.substack.com">Research</a>
        </li>
        <li style={itemStyle}>
          <a style={linkStyle} href="/settings">Settings</a>
        </li>
        <li style={itemStyle}>
          <a style={linkStyle} href="#" onClick={logoutUser}>Logout</a>
        </li>
      </ul>

    </nav>
  );
};

export default SideNavBar;
