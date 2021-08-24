import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { emailToName } from '../../shared/functions/SimpleFunctions';
import { UserEnums } from '../../Data/Enums/UserEnums';
import LoginNavigation from '../../shared/Navigation/LoginNavigation/LoginNavigation';
import Menu from '../../shared/Navigation/Menu/Menu';
import PropTypes from 'prop-types';
import SignOutNavigation from '../../shared/Navigation/SignOutNavigation/SignOutNavigation';
import Spinner from '../../shared/Spinners/Spinner/Spinner';
import './index.scss';

const Home = (props) => {
  const [pageLoaded, setPageLoaded] = useState(false);
  const menuClick = (event, menuItem) => {
    event.stopPropagation();
    if (menuItem.protected && menuItem.dynamic) {
      const name = emailToName(props.user.email).toLowerCase();
      props.history.push(`${menuItem.route}/${name}`);
    } else {
      props.history.push(menuItem.route);
    }
  };

  useEffect(() => {
    if (!pageLoaded) {
      window.scrollTo(0, 0);
      window.document.body.height = '100%';
      setPageLoaded(true);
    }
  }, [pageLoaded]);

  return (
    props.appLoaded && pageLoaded ?
      <div className="front-menu-container">
        {props.user.type === UserEnums.USER ? <SignOutNavigation /> : <LoginNavigation />}
        <Menu user={props.user} menuClick={menuClick} />
      </div> : <Spinner />
  );
};

Home.propTypes = {
  appLoaded: PropTypes.bool,
  history: PropTypes.object,
  user: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    user: state.user,
  };
};

export default connect(mapStateToProps)(Home);
