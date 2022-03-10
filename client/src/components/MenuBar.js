import React, { useContext } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link, withRouter } from 'react-router-dom';

import { AuthContext } from '../context/auth';

const TITLE = 'AppAuth';

function MenuBar({history}) {
  const { user, logout } = useContext(AuthContext);
  const pathname = window.location.pathname;
  const path = pathname === '/' ? TITLE : pathname.substr(1);

  const menuBar = user ? (
    <Menu pointing secondary size="massive" color="teal">
      <Menu.Item
        name={TITLE}
        active={path === TITLE}
        as={Link}
        to="/"
      />
      <Menu.Menu position="right">
        <Menu.Item>{`${user.email}`}</Menu.Item>
        <Menu.Item name="logout" onClick={() => {
          logout();
          history.push('/');
        }} />
      </Menu.Menu>
    </Menu>
  ) : (
    <Menu pointing secondary size="massive" color="teal">
      <Menu.Item
        name={TITLE}
        active={path === TITLE}
        as={Link}
        to="/"
      />
      <Menu.Menu position="right">
        <Menu.Item
          name="login"
          active={path === 'login'}
          as={Link}
          to="/login"
        />
      </Menu.Menu>
    </Menu>
  );

  return menuBar;
}

export default withRouter(MenuBar);
