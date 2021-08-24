import React, { Fragment, useEffect, useState } from 'react';
import { auth } from '../../../../config/firebase';
import { config } from '../../../../config/config';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import PropTypes from 'prop-types';
import './index.scss';

const Logout = (props) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    if (!pageLoaded) {
      setPageLoaded(true);
      auth.signOut().then(() => {
        setSuccessMessage(InterfaceTexts.logoutSuccessful);
        setSuccess(true);
        setTimeout(() => props.history.push(config.routes.history), 1000);
      }).catch(err => {
        setErrorMessage(err.message);
        setError(true);
      });
    }
  }, [pageLoaded, props.history]);

  return (
    <Fragment>
      <div className="auth-form-container">
        {error ? (
          <div className="error-message">{errorMessage}</div>
        ) : null}
        {success ? (
          <div className="success-message">{successMessage}</div>
        ) : null}
      </div>
    </Fragment>
  );
};

Logout.propTypes = {
  history: PropTypes.object
};

export default Logout;
