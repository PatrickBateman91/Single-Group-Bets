import React, { Fragment, useState } from 'react';
import { auth } from '../../../../config/firebase';
import { formData as form } from './data/formData';
import { getTranslatedErrorMessage } from '../../../shared/functions/SimpleFunctions';
import { ErrorEnums } from '../../../Data/Enums/ErrorEnums';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { ServerResponses } from '../../../Data/Text/ServerResponses';
import AuthButton from '../../../shared/Buttons/AuthButton/AuthButton';
import IconSpinner from '../../../shared/Spinners/IconSpinner/IconSpinner';
import PropTypes from 'prop-types';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import './index.scss';

const ChangePasswordPage = (props) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [firstPassword, setFirstPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secondPassword, setSecondPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleError = (err) => {
    setErrorMessage(getTranslatedErrorMessage(err));
    setError(true);
    setLoading(false);
  };

  const handleChangePassword = (event) => {
    event.preventDefault();
    if (firstPassword !== secondPassword) {
      handleError({ code: ErrorEnums.PASSWORD_NOT_MATCH });
    } else {
      let user = auth.currentUser;
      setLoading(true);
      user
        .updatePassword(firstPassword)
        .then(() => {
          setSuccessMessage(ServerResponses.passwordChanged);
          setSuccess(true);
          setTimeout(() => {
            props.history.push('/');
          }, 1000);
        })
        .catch((err) => {
          handleError(err);
        });
    }
  };

  const hideMessages = () => {
    setSuccessMessage('');
    setSuccess(false);
    setErrorMessage('');
    setError(false);
  };

  return (
    <Fragment>
      <div className="auth-form-container">
        <div className="auth-main-title">{InterfaceTexts.changePasswordTitle}</div>
        <form
          name={form.formName}
          id={form.formName}
          onChange={hideMessages}
          onSubmit={handleChangePassword}
        >
          <div className="auth-form-holder">
            <div className="auth-fields">
              <div className="auth-line">
                <label htmlFor={form.formOneName}>{form.labelOneName}</label>
                <input
                  autoComplete={form.formOneAutocomplete}
                  name={form.formOneName}
                  value={firstPassword}
                  type={form.firstFieldType}
                  onChange={e => setFirstPassword(e.target.value)}
                ></input>
              </div>
              <div className="auth-line">
                <label htmlFor={form.formTwoName}>{form.labelTwoName}</label>
                <input
                  type="password"
                  name={form.formTwoName}
                  autoComplete={form.formTwoAutocomplete}
                  value={secondPassword}
                  onChange={e => setSecondPassword(e.target.value)}
                ></input>
              </div>
            </div>
            {error ? <div className="error-message">{errorMessage}</div> : null}
            {success ? (
              <div className="success-message">{successMessage}</div>
            ) : null}
            {loading ? (
              <IconSpinner loading={loading} />
            ) : (
              <AuthButton form={form.formName} text={form.buttonText}/>
            )}
          </div>
        </form>
        <ReturnButton
          classToDisplay="give-space"
          target="/"
          text={InterfaceTexts.mainMenu}
        />
      </div>
    </Fragment>
  );
};

ChangePasswordPage.propTypes = {
  handleError: PropTypes.func,
  history: PropTypes.object,
};

export default ChangePasswordPage;
