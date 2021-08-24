import React, { Fragment, useState } from 'react';
import { auth } from '../../../../config/firebase';
import { connect } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { formData as form } from './data/formData';
import {
  emailToName,
  getTranslatedErrorMessage,
  refreshApp,
} from '../../../shared/functions/SimpleFunctions';
import {
  addPublicProfileToFirebase,
  deleteExistingPublicProfile,
  uploadProfilePicture,
} from '../../../shared/functions/FirebaseFunctions';
import { ServerResponses } from '../../../Data/Text/ServerResponses';
import { UserModel } from '../../../Data/Models/UserModel';
import AuthButton from '../../../shared/Buttons/AuthButton/AuthButton';
import Backend from 'react-dnd-html5-backend';
import IconSpinner from '../../../shared/Spinners/IconSpinner/IconSpinner';
import PropTypes from 'prop-types';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import UploadPicture from '../shared/UploadPicture/UploadPicture';
import './index.scss';

const SignUpPage = (props) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const hideMessages = () => {
    setErrorMessage('');
    setError(false);
  };

  const handleError = (err) => {
    setErrorMessage(getTranslatedErrorMessage(err));
    setError(true);
    setLoading(false);
  };

  const handleImageFile = (item) => {
    if (item && item.files && item.files.length === 1) {
      if (
        item.files[0].type === 'image/png' ||
        item.files[0].type === 'image/jpg' ||
        item.files[0].type === 'image/jpeg'
      ) {
        if (item.files[0].size < 3145729) {
          setErrorMessage('');
          setError(false);
          setSelectedFile(item.files[0]);
        } else {
          setErrorMessage(ServerResponses.maxPictureSize);
          setError(true);
        }
      } else {
        window.location.reload();
      }
    }
  };

  const uploadPublicProfile = (uid, nickname, url) => {
    const deleteExistingProfilePromise = deleteExistingPublicProfile(nickname.toLowerCase());
    deleteExistingProfilePromise
      .then(() => {
        const setPeoplePromise = addPublicProfileToFirebase(uid, nickname, url,props.people.length);
        setPeoplePromise
          .then(() => {
            // Route guard will automatically reroute to home
            refreshApp(props);
          })
          .catch((err) => {
            handleError(err);
          });
      })
      .catch((err) => {
        handleError(err);
      });
  };

  const handleSignUp = (event) => {
    event.preventDefault();
    let fakeEmail = UserModel.createFakeEmail(name);
    setLoading(true);
    auth
      .createUserWithEmailAndPassword(fakeEmail, password)
      .then((userCredential) => {
        if (selectedFile) {
          const uploadPicturePromise = uploadProfilePicture(
            selectedFile,
            `users/${emailToName(userCredential.user.email)}-profile-picture`
          );
          uploadPicturePromise.then((urlResponse) => {
            uploadPublicProfile(
              userCredential.user.uid,
              emailToName(userCredential.user.email),
              urlResponse
            );
          });
        } else {
          uploadPublicProfile(
            userCredential.user.uid,
            emailToName(userCredential.user.email),
            ''
          );
        }
      })
      .catch((err) => {
        handleError(err);
      });
  };

  return (
    <DndProvider backend={Backend}>
      <Fragment>
        <div className="auth-form-container">
          <div className="auth-main-title">{InterfaceTexts.registerTitle}</div>
          <form
            name={form.formName}
            id={form.formName}
            onChange={hideMessages}
            onSubmit={handleSignUp}
          >
            <div className="auth-form-holder">
              <div className="sign-up-upload-picture-container">
                <UploadPicture
                  handleImageFile={handleImageFile}
                  id="change-profile-picture"
                  labelText="Dodaj profilnu sliku"
                  selectedFile={selectedFile ? selectedFile.name : null}
                />
              </div>
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
              {error ? (
                <div className="error-message">{errorMessage}</div>
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
    </DndProvider>
  );
};

SignUpPage.propTypes = {
  people: PropTypes.array
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    people: state.appInformation.people,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAppLoaded: (appLoaded) => {
      dispatch({ type: 'appInformation/setAppLoaded', payload: appLoaded });
    },
    setBets: (bets) => {
      dispatch({ type: 'bets/setBets', payload: bets });
    },
    setFullPublicUsers: (publicUsers) => {
      dispatch({
        type: 'appInformation/setFullPublicUsers',
        payload: publicUsers,
      });
    },
    setPeople: (people) => {
      dispatch({ type: 'appInformation/setPeople', payload: people });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUpPage);
