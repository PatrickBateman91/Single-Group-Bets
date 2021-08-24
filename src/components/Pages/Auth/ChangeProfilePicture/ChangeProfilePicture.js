import React, { Fragment, useState } from 'react';
import { addPublicProfileToFirebase, uploadProfilePicture } from '../../../shared/functions/FirebaseFunctions';
import { connect } from 'react-redux';
import { config } from '../../../../config/config';
import { DndProvider } from 'react-dnd';
import { getOrderNumber } from '../../../shared/functions/SimpleFunctions';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { ServerResponses } from '../../../Data/Text/ServerResponses';
import AuthButton from '../../../shared/Buttons/AuthButton/AuthButton';
import Backend from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import Spinner from '../../../shared/Spinners/Spinner/Spinner';
import UploadPicture from '../shared/UploadPicture/UploadPicture';
import './index.scss';

const ChangeProfilePicture = (props) => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handlePictureUpload = (event) => {
    event.preventDefault();
    if (selectedFile) {
      setLoading(true);
      const uploadPicturePromise = uploadProfilePicture(
        selectedFile,
        `users/${props.user.nickname}-profile-picture`
      );
      uploadPicturePromise
        .then((urlResponse) => {
          const setPeoplePromise = addPublicProfileToFirebase(
            props.user.uid,
            props.user.nickname,
            urlResponse,
            getOrderNumber(props.fullPublicUsers, props.user.nickname));
          setPeoplePromise.then(() => {
            props.setAppLoaded(false);
            props.history.push(`${config.routes.profile}/${props.user.nickname}`);
          })
            .catch(err => {
              setErrorMessage(err.message);
              setError(true);
              setLoading(false);
            });
        })
        .catch(err => {
          setErrorMessage(err.message);
          setError(true);
          setLoading(false);
        });
    } else {
      setErrorMessage(ServerResponses.pictureNotSelected);
      setError(true);
    }
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

  return (
    <DndProvider backend={Backend}>
      <div className="main-container">
        {props.appLoaded && !loading ? (
          <Fragment>
            <div className="change-profile-holder">
              <div className="change-profile-form-container">
                <form
                  name="change-profile-picture-form"
                  id="change-profile-picture-form"
                  onSubmit={handlePictureUpload}
                  encType="multipart/form-data"
                >
                  <UploadPicture
                    handleImageFile={handleImageFile}
                    id="change-profile-picture"
                    labelText={InterfaceTexts.addNewProfilePicture}
                    selectedFile={
                      selectedFile
                        ? selectedFile.name
                        : null
                    }
                  />
                  {error ? (
                    <div className="error-message">
                      <span>{errorMessage}</span>
                    </div>
                  ) : null}
                  <AuthButton form="change-profile-picture-form" text={InterfaceTexts.upload} />
                </form>
              </div>
            </div>
            <ReturnButton
              classToDisplay="give-space"
              target="/"
              text={InterfaceTexts.mainMenu}
            />
          </Fragment>
        ) : (
          <Spinner loading={loading} />
        )}
      </div>
    </DndProvider>
  );
};

ChangeProfilePicture.propTypes = {
  appLoaded: PropTypes.bool,
  fullPublicUsers: PropTypes.array,
  history: PropTypes.object,
  setAppLoaded: PropTypes.func,
  user: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    fullPublicUsers: state.appInformation.fullPublicUsers,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAppLoaded: (appLoaded) => {
      dispatch({type: 'appInformation/setAppLoaded', payload: appLoaded});
    },

    updateUser: (user) => {
      dispatch({ type: 'user/updateUser', payload: user });
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeProfilePicture);
