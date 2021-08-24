import React, { Fragment, useState } from 'react';
import { auth } from '../../../../config/firebase';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { formData as form } from './data/formData';
import { getTranslatedErrorMessage } from '../../../shared/functions/SimpleFunctions';
import AuthButton from '../../../shared/Buttons//AuthButton/AuthButton';
import IconSpinner from '../../../shared/Spinners/IconSpinner/IconSpinner';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import { UserModel } from '../../../Data/Models/UserModel';
import './index.scss';

const LoginPage = () => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleError = (err) => {
    setErrorMessage(getTranslatedErrorMessage(err));
    setError(true);
    setLoading(false);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setLoading(true);
    const fakeEmail = UserModel.createFakeEmail(name);
    auth
      .signInWithEmailAndPassword(fakeEmail, password)
      .then(() => {
        // Route guard will automatically reroute logged in user to home
      })
      .catch((err) => {
        handleError(err);
      });
  };

  const hideMessages = () => {
    setErrorMessage('');
    setError(false);
  };

  return (
    <Fragment>
      <div className="auth-form-container">
        <div className="auth-main-title">{InterfaceTexts.loginTitle}</div>
        <form
          name={form.formName}
          id={form.formName}
          onChange={hideMessages}
          onSubmit={handleLogin}
        >
          <div className="auth-form-holder">
            <div className="auth-fields">
              <div className="auth-line">
                <label htmlFor={form.formOneName}>{form.labelOneName}</label>
                <input
                  autoComplete={form.formOneAutocomplete}
                  name={form.formOneName}
                  type={form.firstFieldType}
                  value={name}
                  onChange={e => setName(e.target.value)}
                ></input>
              </div>
              <div className="auth-line">
                <label htmlFor={form.formTwoName}>{form.labelTwoName}</label>
                <input
                  autoComplete={form.formTwoAutocomplete}
                  name={form.formTwoName}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                ></input>
              </div>
            </div>
            {error ? <div className="error-message">{errorMessage}</div> : null}
            {loading ? <IconSpinner loading={loading} /> :
              <AuthButton classToDisplay="give-space-top" form={form.formName} text={form.buttonText} />}
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

export default LoginPage;
