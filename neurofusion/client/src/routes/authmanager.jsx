import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { loginUser, checkUser } from '../services/auth';


const AuthManager = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(null);

  const [user, setUser] = useState({ isLoggedIn: false, email: '' });

  useEffect(() => {
    console.log("User login status is ", user.isLoggedIn);
    if (user.isLoggedIn) {
      window.location.href = '/lab';
    }
    
    const validateUser = async () => {
      setLoading(true);
      try {
        await checkUser(setUser);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    validateUser();
  }, [user.isLoggedIn]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    if (!email) {
      setLoading(false);
      setError('Email is Invalid');
      return;
    }
    try {
      await loginUser(email, setUser);
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
  }

  return (
    <div style={EmailForm}>
      <img src={logo} style={logoStyle} alt="logo" height={150}/>
      <h1>Login to NEUROFUSION</h1>

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

export default AuthManager;
