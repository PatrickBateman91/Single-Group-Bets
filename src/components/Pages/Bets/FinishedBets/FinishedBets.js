import React, { useCallback, useEffect, useState } from 'react';
import { BetMessages } from '../../../Data/Text/BetMessages';
import {
  BetStateEnum,
  BetTypeEnum,
  BetWinnerEnum,
  PaidBetEnum,
} from '../../../Data/Enums/BetEnums';
import { BetModel } from '../../../Data/Models/BetModels';
import { connect } from 'react-redux';
import { config } from '../../../../config/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { finishedBetToFirebase as payedBetToFirebase } from '../../../shared/functions/FirebaseFunctions';
import {
  filterUserBets,
  getTitle,
  searchBets,
} from '../../../shared/functions/SimpleFunctions';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { NextMenuOptionModel } from '../../../Data/Models/NextMenuOptions';
import { NextMenuEnum } from '../../../Data/Enums/NextMenuEnums';
import { refreshApp } from '../../../shared/functions/SimpleFunctions';
import FilterPayedBets from '../shared/FilterPayedBets/FilterPayedBets';
import JointBet from '../shared/JointBet/JointBet';
import NextMenu from '../../../shared/Modals/NextMenu/NextMenu';
import PayedBet from '../shared/PayedBet/PayedBet';
import PropTypes from 'prop-types';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import Spinner from '../../../shared/Spinners/Spinner/Spinner';
import RegularBet from '../shared/RegularBet/RegularBet';
import SearchBar from '../shared/Searchbar/SearchBar';
import './index.scss';

const FinishedBets = (props) => {
  let bets;
  let count = -1;

  const nextMenuOptions = [
    new NextMenuOptionModel(
      BetMessages.finishedBets,
      null,
      false,
      NextMenuEnum.CLOSE
    ),
    new NextMenuOptionModel(
      BetMessages.activeBets,
      config.routes.activeBets,
      true,
      null
    ),
    new NextMenuOptionModel(
      InterfaceTexts.mainMenu,
      config.routes.home,
      true,
      null
    ),
  ];

  const [betToPay, setBetToPay] = useState(null);
  const [change, setChange] = useState(false);
  const [finishedBets, setFinishedBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextMenuModal, setNextMenuModal] = useState(false);
  const [nickname, setNickname] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [paidBets, setPaidBets] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [searchParameter, setSearchParameter] = useState('');
  const [unpaidBets, setUnpaidBets] = useState(false);

  const refreshBets = useCallback(() => {
    let filteredBets = [
      ...props.rawData.filter((bet) => bet.state === BetStateEnum.FINISHED),
    ];
    if (nickname) {
      filteredBets = filterUserBets(
        filteredBets,
        nickname,
        BetStateEnum.FINISHED
      );
    }

    if (searchParameter !== '') {
      filteredBets = searchBets(
        filteredBets,
        searchParameter,
        BetStateEnum.FINISHED
      );
    }

    if (paidBets) {
      filteredBets = filteredBets.filter(
        (bet) => bet.state === BetStateEnum.FINISHED && bet.payed
      );
    }

    if (unpaidBets) {
      filteredBets = filteredBets.filter(
        (bet) =>
          bet.state === BetStateEnum.FINISHED &&
          !bet.payed &&
          bet.winner !== BetWinnerEnum.NO_WINNER
      );
    }
    filteredBets.sort(
      (a, b) => b.dateResolved.toMillis() - a.dateResolved.toMillis()
    );
    setFinishedBets(filteredBets);
  }, [nickname, paidBets, unpaidBets, props.rawData, searchParameter]);

  const handlePayedFilter = (type, event) => {
    setSearchParameter('');

    if (type === PaidBetEnum.PAID) {
      setUnpaidBets(false);
      if (event.target.checked) {
        setPaidBets(true);
      } else {
        setPaidBets(false);
      }
    } else if (type === PaidBetEnum.UNPAID) {
      setPaidBets(false);
      if (event.target.checked) {
        setUnpaidBets(true);
      } else {
        setUnpaidBets(false);
      }
    }

    setChange(true);
  };

  const handlePayModal = (event, bet) => {
    event.stopPropagation();
    if (props.user.email === config.admin) {
      if (!bet) {
        setPayModal(false);
        document.querySelector('body').style.overflowY = 'auto';
      } else if (bet.state === BetStateEnum.FINISHED && !bet.payed) {
        setBetToPay(bet);
        setPayModal(true);
      }
    }
  };

  const handleBetPay = (event) => {
    event.stopPropagation();
    const strippedBet = BetModel.stripForFirebase(betToPay);
    const id = betToPay.id;
    strippedBet.payed = true;
    setLoading(true);
    const payedBetToFirebasePromise = payedBetToFirebase(strippedBet, id);
    payedBetToFirebasePromise
      .then(() => {
        setLoading(false);
        setPayModal(false);
        setBetToPay(null);
        setNextMenuModal(true);

        refreshApp(props);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const nextMenuCallback = (type, option, event) => {
    event.stopPropagation();
    document.querySelector('body').style.overflowY = 'auto';
    if (type === NextMenuEnum.CLOSE) {
      setNextMenuModal(false);
      setChange(true);
    } else if (type === NextMenuEnum.REDIRECT) {
      props.history.push(option.link);
    }
  };

  const handleSearch = (event) => {
    setSearchParameter(event.target.value);
    setChange(true);
  };

  useEffect(() => {
    // Reset on name click
    setPaidBets(false);
    setUnpaidBets(false);
    setSearchParameter('');

    if (props.match.params.nickname) {
      window.scrollTo(0, 0);
      setNickname(props.match.params.nickname);
      setChange(true);
    } else {
      setNickname(null);
      setChange(true);
    }
  }, [props.match.params]);

  useEffect(() => {
    if (change) {
      setChange(false);
      refreshBets();
    }
  }, [change, refreshBets]);

  useEffect(() => {
    if (!pageLoaded) {
      window.scrollTo(0, 0);
      window.document.body.height = '100%';
      if (props.appLoaded) {
        setPageLoaded(true);
      }
    }
  }, [pageLoaded, props.appLoaded]);

  useEffect(() => {
    if (payModal) {
      document.getElementById(
        'payed-bet-modal'
      ).style.top = `${window.pageYOffset}px`;
      document.querySelector('body').style.overflowY = 'hidden';
    }
  }, [payModal]);

  useEffect(() => {
    if (nextMenuModal) {
      document.getElementById(
        'next-menu-container'
      ).style.top = `${window.pageYOffset}px`;
      document.querySelector('body').style.overflowY = 'hidden';
    }
  }, [nextMenuModal]);

  if (props.appLoaded) {
    bets = finishedBets.map((bet) => {
      count++;
      if (bet.type === BetTypeEnum.JOINT_BET) {
        return (
          <JointBet
            bet={bet}
            key={bet.id}
            handlePayModal={handlePayModal}
            idx={count}
            numberOfBets={finishedBets.length}
            user={props.user}
          />
        );
      } else {
        return (
          <RegularBet
            bet={bet}
            handlePayModal={handlePayModal}
            idx={count}
            key={bet.id}
            numberOfBets={finishedBets.length}
            user={props.user}
          />
        );
      }
    });
  }

  return (
    <div className="all-bets-container">
      <div className="whose-bets-title">
        <span
          className={
            props.match.params.nickname
              ? props.match.params.nickname.toLowerCase()
              : ''
          }
        >
          {getTitle(
            props.match.params.nickname
              ? props.match.params.nickname.toLowerCase()
              : null,
            InterfaceTexts.finished
          )}
        </span>
        <SearchBar
          classNameToDisplay="search-input"
          searchParameter={searchParameter}
          searchBets={handleSearch}
        />
        <ReturnButton
          target="/"
          text={InterfaceTexts.mainMenu}
        />
      </div>
      <FilterPayedBets
        paidBets={paidBets}
        unpaidBets={unpaidBets}
        handlePayedFilter={handlePayedFilter}
      />
      {finishedBets.length > 0 ? (
        bets
      ) : pageLoaded ? (
        <div className="no-finished-bets">{BetMessages.noBetFound}</div>
      ) : (
        <Spinner />
      )}
      <div className="legend-finished-bets">
        <div>
          <span>{InterfaceTexts.legendFinishedBet}</span>
          <FontAwesomeIcon icon={faCheck} />
        </div>
        <div>
          <span>{InterfaceTexts.legendFinishedAndPayedBet}</span>
          <FontAwesomeIcon icon={faCheck} />
          <FontAwesomeIcon icon={faCheck} />
        </div>
      </div>
      <ReturnButton
        classToDisplay="return-center-button"
        target="/"
        text={InterfaceTexts.mainMenu}
      />

      {payModal ? (
        <PayedBet
          bet={betToPay}
          full={true}
          loading={loading}
          handlePayModal={handlePayModal}
          handleBetPay={handleBetPay}
        />
      ) : null}
      {nextMenuModal ? (
        <NextMenu
          message={BetMessages.betMarkedAsPayedSuccessfully}
          options={nextMenuOptions}
          handleClick={nextMenuCallback}
        />
      ) : null}
    </div>
  );
};

FinishedBets.propTypes = {
  appLoaded: PropTypes.bool,
  history: PropTypes.object,
  match: PropTypes.object,
  rawData: PropTypes.array,
  user: PropTypes.object
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    rawData: state.bets.rawData,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAppLoaded: (loaded) => {
      dispatch({ type: 'appInformation/setAppLoaded', payload: loaded });
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

export default connect(mapStateToProps, mapDispatchToProps)(FinishedBets);
