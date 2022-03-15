import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css';
import './App.css';

import { AuthProvider } from './context/auth';
import AuthRoute from './util/AuthRoute';

import MenuBar from './components/MenuBar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Approve from './pages/Approve';

function App() {
  const basename = process.env.PUBLIC_URL || "/appauth";
  const api_regex = /^\/scidb\/api\/.*/
  // if using "/api/" in the pathname, don't use React Router
  if (api_regex.test(window.location.pathname)) {
    return <div /> // must return at least an empty div
  } else {
    return (
      <AuthProvider>
        <Router basename={basename}>
          <Container>
            <MenuBar />
            <Switch>
              <Route exact path="/" component={Home} />
              <AuthRoute exact path="/login" component={Login} />
              <Route exact path="/approve" component={Approve} />
              <Route exact path="/admin" component={Admin} />
              <Route exact path="*" render={() => <h1>404</h1>} />
            </Switch>
          </Container>
        </Router>
      </AuthProvider>
    );
  }
}

export default App;
