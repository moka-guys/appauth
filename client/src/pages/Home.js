import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import { AuthContext } from '../context/auth';

const Home = () => {
  const { user } = useContext(AuthContext);
  return user ? (
    <>
      <h1>You are logged in.</h1>
      <Button href={user.redirect}>Continue</Button>
    </>
  ) : (
    <Redirect to={'/login'} />
  )
}

export default Home;
