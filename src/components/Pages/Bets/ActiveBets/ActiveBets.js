import React, { useCallback, useEffect, useState } from 'react';
import {
  BetStateEnum,
  BetTypeEnum,
  BetWinnerEnum,
} from '../../../Data/Enums/BetEnums';
import { BetModel } from '../../../Data/Models/BetModels';
import { BetMessages } from '../../../Data/Text/BetMessages';
import { connect } from 'react-redux';
import { config } from '../../../../config/config';
import { currentTimestamp } from '../../../../config/firebase';
import { finishedBetToFirebase } from '../../../shared/functions/FirebaseFunctions';
import {
  filterUserBets,
  getTitle,
  refreshApp,
  searchBets,
} from '../../../shared/functions/SimpleFunctions';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { NextMenuOptionModel } from '../../../Data/Models/NextMenuOptions';
import { NextMenuEnum } from '../../../Data/Enums/NextMenuEnums';
import JointBet from '../shared/JointBet/JointBet';
import NextMenu from '../../../shared/Modals/NextMenu/NextMenu';
import PropTypes from 'prop-types';
import RegularBet from '../shared/RegularBet/RegularBet';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import SearchBar from '../shared/Searchbar/SearchBar';
import Spinner from '../../../shared/Spinners/Spinner/Spinner';
import WhoWon from '../shared/WhoWon/WhoWon';
import './index.scss';

const ActiveBets = (props) => {
  let betsDiv;

  const nextMenuOptions = [
    new NextMenuOptionModel(BetMessages.activeBets, null, false),
    new NextMenuOptionModel(
      BetMessages.finishedBets,
      config.routes.finishedBets,
      true
    ),
    new NextMenuOptionModel(InterfaceTexts.mainMenu, config.routes.home, true),
  ];

  const [change, setChange] = useState(false);
  const [finishedBet, setFinishedBet] = useState(null);
  const [activeBets, setActiveBets] = useState([]);
  const [nickname, setNickname] = useState(false);
  const [finishModal, setFinishModal] = useState(false);
  const [nextMenuModal, setNextMenuModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [payed, setPayed] = useState(false);
  const [searchParameter, setSearchParameter] = useState('');
  const [winner, setWinner] = useState('');

  const closeFinishModal = () => {
    setWinner('');
    setFinishModal(false);
    setFinishedBet(null);
    document.querySelector('body').style.overflowY = 'auto';
  };

  const handleEdit = (ID) => {
    props.history.push({
      pathname: config.routes.addNewBet,
      state: {
        ID,
      },
    });
  };

  const handleBetPayed = (event) => {
    setPayed(event.target.checked);
  };

  const handleSearch = (e) => {
    setSearchParameter(e.target.value);
    setChange(true);
  };

  const handleFinishModal = (bet, event) => {
    event.stopPropagation();
    const finishedBet = BetModel.serialize(bet);
    setFinishedBet(finishedBet);
    setFinishModal(true);
  };

  const nextMenuCallback = (type, option, event) => {
    document.querySelector('body').style.overflowY = 'auto';
    event.stopPropagation();
    if (type === NextMenuEnum.CLOSE) {
      setNextMenuModal(false);
      setChange(true);
    } else if (type === NextMenuEnum.REDIRECT) {
      props.history.push(option.link);
    }
  };

  const uploadFinishedBetToFirebase = (event, bet) => {
    event.stopPropagation();
    if (winner && winner !== '') {
      setLoading(true);
      const changedBet = BetModel.stripForFirebase(bet);
      const id = bet.id;
      changedBet.state = BetStateEnum.FINISHED;
      changedBet.winner = winner;
      changedBet.dateResolved = currentTimestamp.now();
      changedBet.payed =
        changedBet.winner === BetWinnerEnum.NO_WINNER ? false : payed;

      const finishBetPromise = finishedBetToFirebase(changedBet, id);
      finishBetPromise
        .then(() => {
          setFinishModal(false);
          setLoading(false);
          setWinner('');
          setChange(true);
          setNextMenuModal(true);
          setPayed(false);
          refreshApp(props);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          console.log('Dogodila se pogreška');
        });
    }
  };

  const refreshBets = useCallback(() => {
    let filteredBets = [
      ...props.rawData.filter((bet) => bet.state === BetStateEnum.ACTIVE),
    ];
    if (nickname) {
      filteredBets = filterUserBets(
        filteredBets,
        nickname,
        BetStateEnum.ACTIVE
      );
    }

    if (searchParameter !== '') {
      filteredBets = searchBets(
        filteredBets,
        searchParameter,
        BetStateEnum.ACTIVE
      );
    }

    setActiveBets(filteredBets);
  }, [nickname, props.rawData, searchParameter]);

  useEffect(() => {
    if (props.match.params.nickname) {
      window.scrollTo(0, 0);
      setSearchParameter('');
      setNickname(props.match.params.nickname);
      setChange(true);
    } else {
      setSearchParameter('');
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
    if (finishModal) {
      document.getElementById(
        'finish-bet'
      ).style.top = `${window.pageYOffset}px`;
      document.querySelector('body').style.overflowY = 'hidden';
    }
  }, [finishModal]);

  useEffect(() => {
    if (nextMenuModal) {
      document.getElementById(
        'next-menu-container'
      ).style.top = `${window.pageYOffset}px`;
      document.querySelector('body').style.overflowY = 'hidden';
    }
  }, [nextMenuModal]);

  if (props.appLoaded) {
    let betOrderNumber = -1;
    betsDiv = activeBets.map((bet) => {
      if (bet.state === BetStateEnum.ACTIVE) {
        betOrderNumber++;
        if (bet.type === BetTypeEnum.JOINT_BET) {
          return (
            <JointBet
              bet={bet}
              chooseBetWinner={setWinner}
              filterUserBets={props.filterUserBets}
              handleEdit={handleEdit}
              handleFinishModal={handleFinishModal}
              idx={betOrderNumber}
              key={bet.id}
              numberOfBets={activeBets.length}
              winner={winner}
              user={props.user}
            />
          );
        } else {
          return (
            <RegularBet
              bet={bet}
              handleEdit={handleEdit}
              handleFinishModal={handleFinishModal}
              idx={betOrderNumber}
              key={bet.id}
              numberOfBets={activeBets.length}
              winner={winner}
              user={props.user}
            />
          );
        }
      } else {
        return null;
      }
    });
  }
  return (
    <div className="all-bets-container" onClick={closeFinishModal}>
      <div className="whose-bets-title">
        <span
          className={
            props.match.params.nickname ? props.match.params.nickname : ''
          }
        >
          {getTitle(
            props.match.params.nickname ? props.match.params.nickname : null,
            InterfaceTexts.active
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
      {activeBets.length > 0 ? (
        betsDiv
      ) : pageLoaded ? (
        <div className="no-finished-bets">{BetMessages.noBetFound}</div>
      ) : (
        <Spinner />
      )}
      <ReturnButton
        classToDisplay="return-center-button"
        target="/"
        text={InterfaceTexts.mainMenu}
      />

      {finishModal ? (
        <WhoWon
          bet={finishedBet}
          chooseBetWinner={setWinner}
          finishBet={uploadFinishedBetToFirebase}
          loading={loading}
          handleBetPayed={handleBetPayed}
          payed={payed}
          winner={winner}
        />
      ) : null}

      {nextMenuModal ? (
        <NextMenu
          message={BetMessages.betFinishedSuccessfully}
          options={nextMenuOptions}
          handleClick={nextMenuCallback}
        />
      ) : null}
    </div>
  );
};

ActiveBets.propTypes = {
  appLoaded: PropTypes.bool,
  filterUserBets: PropTypes.func,
  history: PropTypes.object,
  match: PropTypes.object,
  people: PropTypes.array,
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

export default connect(mapStateToProps, mapDispatchToProps)(ActiveBets);
