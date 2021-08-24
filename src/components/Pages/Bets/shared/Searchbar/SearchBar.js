import React from 'react';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import PropTypes from 'prop-types';
import './index.scss';

const SearchBar = (props) => {
  return (
    <input
      type="text"
      className={props.classNameToDisplay}
      placeholder={InterfaceTexts.search}
      value={props.searchParameter}
      onChange={props.searchBets}/>
  );
};

SearchBar.propTypes = {
  classNameToDisplay: PropTypes.string,
  searchParameter: PropTypes.string,
  searchBets: PropTypes.func
};

export default SearchBar;
