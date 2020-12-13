import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Login: React.FC = () => {
  const [authUrl, setAuthUrl] = useState('');

  // effect: fetch authorization URL
  useEffect(() => {
    const fetchAuthUrl = async () => {
      const response = await axios.get<string>(
        'http://localhost:5000/api/auth'
      );
      setAuthUrl(response.data);
    };

    fetchAuthUrl();
  }, []);

  return !authUrl ? <h1>asdf</h1> : <a href={authUrl}>Login with Spotify</a>;
};

export default Login;
