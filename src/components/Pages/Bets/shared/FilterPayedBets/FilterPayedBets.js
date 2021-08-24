import React from 'react';
import { PaidBetEnum } from '../../../../Data/Enums/BetEnums';
import { InterfaceTexts } from '../../../../Data/Text/InterfaceTexts';
import PropTypes from 'prop-types';
import './index.scss';

const FilterPayedBets = (props) => {
  return (
    <div className="filter-payed-container">
      <div className="filter-checkboxes-holder">
        <label htmlFor="payed-check">{InterfaceTexts.paidBets}</label>
        <input type="checkbox" id="payed-check" checked={props.paidBets} onChange={props.handlePayedFilter.bind(null, PaidBetEnum.PAID)} />
      </div>

      <div className="filter-checkboxes-holder">
        <label htmlFor="payed-false-check">{InterfaceTexts.unpaidBets}</label>
        <input type="checkbox" id="payed-false-check" checked={props.unpaidBets} onChange={props.handlePayedFilter.bind(null, PaidBetEnum.UNPAID)} />
      </div>
    </div>
  );
};

FilterPayedBets.propTypes = {
  handlePayedFilter: PropTypes.func,
  paidBets: PropTypes.bool,
  unpaidBets: PropTypes.bool
};

export default FilterPayedBets;
