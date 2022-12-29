import React, { useState } from 'react';
import { loginUser } from '../services/magic';
import logo from '../assets/logo.png';

const Authenticate = ({ setStatus }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!email) {
      setLoading(false);
      setError('Email is Invalid');
      return;
    }
    try {
      await loginUser(email, setStatus);
      setLoading(false);
    } catch (error) {
      setError('Unable to log in');
      console.error(error);
    }
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const EmailForm = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    flexDirection: 'column'
  }

  const logoStyle = {
    padding: '0 20px'
  }

  return (

    <div style={EmailForm}>
      <img src={logo} style={logoStyle} alt="logo" width={100} height={100} />
      <h1>Login to Neurofusion</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="email" name="email" onChange={handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default Authenticate;
