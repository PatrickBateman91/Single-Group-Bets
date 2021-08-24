
import React from 'react';
import { css } from '@emotion/react';
import ClipLoader from 'react-spinners/ClipLoader';
import PropTypes from 'prop-types';

const IconSpinner = (props) => {
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;

  return (
    <div className="icon-spinner-container">
      <ClipLoader color={'#900C3F'} loading={props.pageLoaded} css={override} size={50} />
    </div>
  );
};

IconSpinner.propTypes = {
  pageLoaded: PropTypes.bool
};

export default IconSpinner;
