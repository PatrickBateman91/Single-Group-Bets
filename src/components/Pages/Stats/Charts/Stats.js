import React, { Component } from 'react';
import * as d3 from 'd3';
import { BetStateEnum, BetTypeEnum, BetWinnerEnum, JointBetEnum } from '../../../Data/Enums/BetEnums';
import { connect } from 'react-redux';
import { colorArray, darkerColorsArray } from './data/data';
import { InterfaceTexts } from '../../../Data/Text/InterfaceTexts';
import { legendColor } from 'd3-svg-legend';
import d3Tip from 'd3-tip';
import PropTypes from 'prop-types';
import ReturnButton from '../../../shared/Buttons/ReturnButton/ReturnButton';
import Spinner from '../../../shared/Spinners/Spinner/Spinner';
import { config } from '../../../../config/config';
import { StatsTexts } from '../../../Data/Text/StatsTexts';
import './index.scss';

class Stats extends Component {
  state = {
    data: [],
    finishedBets: false,
    pageLoaded: false,
  };

  componentDidMount = () => {
    window.scrollTo(0, 0);
    window.document.body.height = '100%';
    if (this.props.appLoaded) {
      this.filterData(this.props.rawData);
    }
  };

  componentDidUpdate () {
    if (this.props.appLoaded && !this.state.pageLoaded) {
      this.filterData(this.props.rawData);
    }
  }

  createSVGs = (finished, whichData, innerR, chartOrder, titleText) => {
    const tip = d3Tip().html((d) => {
      return !finished
        ? `
    <div class="tip-holder">
    <span class="tip-chart">${(whichData !== 'numberOfTimes' ? d.data[whichData].toFixed(2) : d.data[whichData])}${
          whichData !== 'numberOfTimes' ? ' KM' : ''
        }</span>
    ${
      whichData !== 'numberOfTimes'
        ? whichData === 'standsToGain'
          ? d.data.nonMoneyStandsToGain !== ''
            ? `<div class="additional-tip-info">
    <span class="other-tip-item">${d.data.nonMoneyStandsToGain}</span>
    </div>`
            : ''
          : d.data.nonMoneyInvested !== ''
            ? `<div class="additional-tip-info">
<span class="other-tip-item"> ${d.data.nonMoneyInvested}</span>
    </div>`
            : ''
        : ''
    }
    </div>`
        : `<div class="tip-holder">
    <span class="tip-chart">${whichData === 'totalMoneyEarned' || whichData === 'totalMoneyLost' ? (d.data[whichData]).toFixed(2) : d.data[whichData]}${
          whichData === 'totalMoneyEarned' || whichData === 'totalMoneyLost'
            ? ' KM'
            : ''
        }</span>
    ${
      whichData === 'totalMoneyEarned' || whichData === 'totalMoneyLost'
        ? whichData === 'totalMoneyEarned'
          ? d.data.nonMoneyWins !== ''
            ? `<div class="additional-tip-info">
  <span  class="other-tip-item"> ${d.data.nonMoneyWins}</span>
    </div>`
            : ''
          : d.data.nonMoneyLosses !== ''
            ? `<div class="additional-tip-info">
    <span class="other-tip-item"> ${d.data.nonMoneyLosses}</span>
    </div>`
            : ''
        : ''
    }
    </div>`;
    });

    const dims = { height: 300, width: 300, radius: 150 };
    const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

    const arcPath = d3
      .arc()
      .outerRadius(dims.radius)
      .innerRadius(dims.radius / innerR);

    const arcTweenEnter = (d) => {
      let i = d3.interpolate(d.endAngle, d.startAngle);

      return function (t) {
        d.startAngle = i(t);
        return arcPath(d);
      };
    };

    const svg = d3
      .select('#stats-svg-holder')
      .append('div')
      .attr('class', 'single-pie-chart')
      .append('svg')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', '0 0 450 450');

    const graph = svg
      .append('g')
      .attr('transform', `translate(${cent.x}, ${cent.y})`);

    const pie = d3
      .pie()
      .sort(null)
      .value((d) => d[whichData]);

    const filteredColorArray = [];

    let filteredData;

    let copyData = [...this.state.data];
    filteredData = copyData.filter((item, i) => {
      if (item[whichData] > 0) {
        filteredColorArray.push(colorArray[i]);
      }
      return item[whichData] > 0;
    });

    const colour = d3.scaleOrdinal(filteredColorArray);

    const handleMouseOut = (d, i, n) => {
      d3.select(n[i])
        .transition('changeSliceFill')
        .duration(300)
        .attr('fill', colour(d.data.name));
    };

    const handleMouseOver = (d, i, n) => {
      return d3
        .select(n[i])
        .transition('changeSliceFill')
        .duration(300)
        .attr('fill', darkerColorsArray[i]);
    };

    colour.domain(
      filteredData.map((d) => {
        return d.name;
      })
    );

    const legendGroup = svg
      .append('g')
      .attr('transform', `translate(${dims.width + 60}, 40)`);

    const legend = legendColor().shape('circle').scale(colour);
    legendGroup.call(legend);

    const paths = graph.selectAll('path').data(pie(this.state.data));

    paths
      .enter()
      .append('path')
      .attr('class', 'arc')
      .attr('d', arcPath)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('fill', (d) => colour(d.data.name))
      .transition()
      .duration(750)
      .attrTween('d', arcTweenEnter);

    graph
      .selectAll('path')
      .on('mouseover', (d, i, n) => {
        tip.show(d, n[i]);
        handleMouseOver(d, i, n);
      })
      .on('mouseout', (d, i, n) => {
        tip.hide();
        handleMouseOut(d, i, n);
      });

    graph.call(tip);
    const newDiv = document.createElement('DIV');
    newDiv.innerHTML = titleText;
    newDiv.className = 'single-pie-title';
    document
      .getElementById('stats-svg-holder')
      .childNodes[chartOrder - 1].appendChild(newDiv);
  };

  filterData = (data) => {
    let people = [...this.props.people];
    let countObject = [];
    let activeBetsTrigger = false;
    let finishedBetsTrigger = false;
    people.forEach((person) => {
      countObject.push({
        name: person,
        numberOfTimes: 0,
        totalMoneyEarned: 0,
        totalMoneyLost: 0,
        totalMoneyInvested: 0,
        betsWon: 0,
        betsLost: 0,
        standsToGain: 0,
        nonMoneyInvested: '',
        nonMoneyStandsToGain: '',
        nonMoneyWins: '',
        nonMoneyLosses: '',
      });
    });

    data.forEach((bet) => {
      //Nezavršene opklade

      if (bet.state === BetStateEnum.ACTIVE) {
        activeBetsTrigger = true;

        if (bet.type === BetTypeEnum.REGULAR_BET) {
          if (bet.differentStakes) {
            for (let i = 0; i < bet.participants.length; i++) {
              for (let j = 0; j < countObject.length; j++) {
                if (bet.participants[i].name === countObject[j].name) {
                  // Prvi natjecatelj => broj natjecatelja u opklada s različitim ulogom je uvijek 2
                  let n = i === 0 ? 1 : -1;
                  countObject[j].numberOfTimes++;
                  // Ako je novčana opklada
                  if (bet.stake.moneyBet) {
                    countObject[j].totalMoneyInvested += parseFloat(
                      bet.participants[i + n].singleStake
                    );
                    countObject[j].standsToGain += parseFloat(
                      bet.participants[i].singleStake
                    );
                  } else {
                    if (!isNaN(bet.participants[i].singleStake)) {
                      countObject[j].standsToGain += parseFloat(
                        bet.participants[i].singleStake
                      );
                    } else {
                      if (countObject[j].nonMoneyStandsToGain === '') {
                        countObject[j].nonMoneyStandsToGain += this.deleteU(
                          bet.participants[i].singleStake
                        );
                      } else {
                        countObject[
                          j
                        ].nonMoneyStandsToGain += `, ${this.deleteU(
                          bet.participants[i].singleStake
                        )}`;
                      }
                    }

                    if (!isNaN(bet.participants[i + n].singleStake)) {
                      countObject[j].totalMoneyInvested += parseFloat(
                        bet.participants[i + n].singleStake
                      );
                    } else {
                      if (countObject[j].nonMoneyInvested === '') {
                        countObject[j].nonMoneyInvested += this.deleteU(
                          bet.participants[i + n].singleStake
                        );
                      } else {
                        countObject[j].nonMoneyInvested += `, ${this.deleteU(
                          bet.participants[i + n].singleStake
                        )}`;
                      }
                    }
                  }
                }
              }
            }
          } else {
            for (let i = 0; i < bet.participants.length; i++) {
              for (let j = 0; j < countObject.length; j++) {
                if (bet.participants[i].name === countObject[j].name) {
                  countObject[j].numberOfTimes++;
                  // Ako je novčana opklada
                  if (bet.stake.moneyBet) {
                    countObject[j].totalMoneyInvested += parseFloat(
                      bet.stake.amount
                    );
                    countObject[j].standsToGain +=
                      parseFloat(bet.stake.amount) *
                      (bet.participants.length - 1);
                  } else {
                    if (countObject[j].nonMoneyInvested === '') {
                      countObject[j].nonMoneyInvested += this.deleteU(
                        bet.stake.amount
                      );
                    } else {
                      countObject[j].nonMoneyInvested += `, ${this.deleteU(
                        bet.stake.amount
                      )}`;
                    }

                    if (countObject[j].nonMoneyStandsToGain === '') {
                      countObject[j].nonMoneyStandsToGain += this.deleteU(
                        bet.stake.amount
                      );
                    } else {
                      countObject[
                        j
                      ].nonMoneyStandsToGain += `, ${this.deleteU(
                        bet.stake.amount
                      )}`;
                    }
                  }

                  break;
                }
              }
            }
          }
        } else if (bet.type === BetTypeEnum.JOINT_BET) {
          for (let index = 0; index < 2; index++) {
            let homeSide, awaySide;
            if (index === 0) {
              homeSide = JointBetEnum.LEFT;
              awaySide = JointBetEnum.RIGHT;
            } else {
              homeSide = JointBetEnum.RIGHT;
              awaySide = JointBetEnum.LEFT;
            }
            for (
              let i = 0;
              i < bet.participants[homeSide].people.length;
              i++
            ) {
              for (let j = 0; j < countObject.length; j++) {
                if (
                  bet.participants[homeSide].people[i] ===
                  countObject[j].name
                ) {
                  countObject[j].numberOfTimes++;

                  if (bet.stake.moneyBet) {
                    countObject[j].totalMoneyInvested +=
                    parseFloat(bet.participants[awaySide].bet) /
                    bet.participants[homeSide].people.length;
                    countObject[j].standsToGain +=
                    parseFloat(bet.participants[homeSide].bet) /
                    bet.participants[homeSide].people.length;
                  } else {
                    // Provjera da li je polovično novčana opklada
                    if (!isNaN(bet.participants[awaySide].bet)) {
                      countObject[j].totalMoneyInvested += parseFloat(
                        bet.participants[awaySide].bet /
                          bet.participants[homeSide].people.length
                      );
                    } else {
                      if (countObject[j].nonMoneyInvested === '') {
                        countObject[j].nonMoneyInvested += this.deleteU(
                          bet.participants[awaySide].bet
                        );
                      } else {
                        countObject[j].nonMoneyInvested += `, ${this.deleteU(
                          bet.participants[awaySide].bet
                        )}`;
                      }
                    }

                    if (!isNaN(bet.participants[homeSide].bet)) {
                      countObject[j].standsToGain += parseFloat(
                        bet.participants[homeSide].bet /
                          bet.participants[homeSide].people.length
                      );
                    } else {
                      if (countObject[j].nonMoneyStandsToGain === '') {
                        countObject[j].nonMoneyStandsToGain += this.deleteU(
                          bet.participants[homeSide].bet
                        );
                      } else {
                        countObject[
                          j
                        ].nonMoneyStandsToGain += `, ${this.deleteU(
                          bet.participants[homeSide].bet
                        )}`;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } else if (bet.state === BetStateEnum.FINISHED) {
        finishedBetsTrigger = true;

        if (bet.type === BetTypeEnum.REGULAR_BET) {
          if (bet.differentStakes) {
            for (let i = 0; i < bet.participants.length; i++) {
              for (let j = 0; j < countObject.length; j++) {
                if (bet.participants[i].name === countObject[j].name) {
                  // Prvi natjecatelj => broj natjecatelja u opklada s različitim ulogom je uvijek 2
                  let n = i === 0 ? 1 : -1;

                  if (countObject[j].name === bet.winner) {
                    countObject[j].betsWon++;
                  } else if (bet.winner !== BetWinnerEnum.NO_WINNER) {
                    countObject[j].betsLost++;
                  }

                  // Ako je novčana opklada
                  if (bet.stake.moneyBet) {
                    if (countObject[j].name === bet.winner) {
                      countObject[j].totalMoneyEarned += parseFloat(
                        bet.participants[i].singleStake
                      );
                    } else if (bet.winner !== BetWinnerEnum.NO_WINNER) {
                      countObject[j].totalMoneyLost += parseFloat(
                        bet.participants[i + n].singleStake
                      );
                    }
                  } else {
                    if (countObject[j].name === bet.winner) {
                      if (!isNaN(bet.participants[i].singleStake)) {
                        countObject[j].totalMoneyEarned += parseFloat(
                          bet.participants[i].singleStake
                        );
                      } else {
                        if (countObject[j].nonMoneyWins === '') {
                          countObject[j].nonMoneyWins += this.deleteU(
                            bet.participants[i].singleStake
                          );
                        } else {
                          countObject[j].nonMoneyWins += `, ${this.deleteU(
                            bet.participants[i].singleStake
                          )}`;
                        }
                      }
                    } else if (bet.winner !== BetWinnerEnum.NO_WINNER) {
                      if (!isNaN(bet.participants[i + n].singleStake)) {
                        countObject[j].totalMoneyLost += parseFloat(
                          bet.participants[i + n].singleStake
                        );
                      } else {
                        if (countObject[j].nonMoneyLosses === '') {
                          countObject[j].nonMoneyLosses += this.deleteU(
                            bet.participants[i + n].singleStake
                          );
                        } else {
                          countObject[j].nonMoneyLosses += `, ${this.deleteU(
                            bet.participants[i + n].singleStake
                          )}`;
                        }
                      }
                    }
                  }
                }
              }
            }
          } else {
            for (let i = 0; i < bet.participants.length; i++) {
              for (let j = 0; j < countObject.length; j++) {
                if (bet.participants[i].name === countObject[j].name) {
                  if (countObject[j].name === bet.winner) {
                    countObject[j].betsWon++;

                    if (bet.stake.moneyBet) {
                      countObject[j].totalMoneyEarned += parseFloat(
                        bet.stake.amount * (bet.participants.length - 1)
                      );
                    } else {
                      if (countObject[j].nonMoneyWins === '') {
                        countObject[j].nonMoneyWins += this.deleteU(
                          bet.stake.amount
                        );
                      } else {
                        countObject[j].nonMoneyWins += `, ${this.deleteU(
                          bet.stake.amount
                        )}`;
                      }
                    }
                  } else if (bet.winner !== BetWinnerEnum.NO_WINNER) {
                    countObject[j].betsLost++;

                    if (bet.stake.moneyBet) {
                      countObject[j].totalMoneyLost += parseFloat(
                        bet.stake.amount
                      );
                    } else {
                      if (countObject[j].nonMoneyLosses === '') {
                        countObject[j].nonMoneyLosses += this.deleteU(
                          bet.stake.amount
                        );
                      } else {
                        countObject[j].nonMoneyLosses += `, ${this.deleteU(
                          bet.stake.amount
                        )}`;
                      }
                    }
                  }
                }
              }
            }
          }
          // Isti ulozi
        } else if (bet.type === BetTypeEnum.JOINT_BET) {
          for (let index = 0; index < 2; index++) {
            let homeSide, awaySide;
            if (index === 0) {
              homeSide = JointBetEnum.LEFT;
              awaySide = JointBetEnum.RIGHT;
            } else {
              homeSide = JointBetEnum.RIGHT;
              awaySide = JointBetEnum.LEFT;
            }

            for (let i = 0; i < bet.participants[homeSide].people.length; i++) {
              for (let j = 0; j < countObject.length; j++) {
                if (
                  bet.participants[homeSide].people[i] ===
                  countObject[j].name
                ) {
                  if (bet.winner !== BetWinnerEnum.NO_WINNER && bet.winner.indexOf(countObject[j].name) !== -1) {
                    countObject[j].betsWon++;

                    if (bet.moneyBet) {
                      countObject[j].totalMoneyEarned += parseFloat(bet.participants[homeSide].bet / bet.participants[homeSide].people.length);
                    } else {
                      if (!isNaN(bet.participants[homeSide].bet)) {
                        countObject[j].totalMoneyEarned += parseFloat(bet.participants[homeSide].bet / bet.participants[homeSide].people.length);
                      } else {
                        if (countObject[j].nonMoneyWins === '') {
                          countObject[j].nonMoneyWins += this.deleteU(
                            bet.participants[homeSide].bet
                          );
                        } else {
                          countObject[j].nonMoneyWins += `, ${this.deleteU(
                            bet.participants[homeSide].bet
                          )}`;
                        }
                      }
                    }
                  } else if (bet.winner !== BetWinnerEnum.NO_WINNER) {
                    countObject[j].betsLost++;

                    if (bet.stake.moneyBet) {
                      countObject[j].totalMoneyLost += parseFloat(bet.participants[awaySide].bet / bet.participants[homeSide].people.length);
                    } else {
                      if (!isNaN(bet.participants[awaySide].bet)) {
                        countObject[j].totalMoneyLost += parseFloat(bet.participants[awaySide].bet / bet.participants[homeSide].people.length);
                      } else {
                        if (countObject[j].nonMoneyLosses === '') {
                          countObject[j].nonMoneyLosses += this.deleteU(
                            bet.participants[awaySide].bet
                          );
                        } else {
                          countObject[j].nonMoneyLosses += `, ${this.deleteU(
                            bet.participants[awaySide].bet
                          )}`;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    this.setState(
      {
        data: countObject,
        activeBets: activeBetsTrigger,
        finishedBets: finishedBetsTrigger,
        pageLoaded: true,
      },
      () => {
        let chartCounter = 0;
        if (this.state.activeBets) {
          chartCounter++;
          this.createSVGs(false, 'numberOfTimes', 100, chartCounter, StatsTexts.numberOfActiveBets);
          chartCounter++;
          this.createSVGs(false, 'standsToGain', 25, chartCounter, StatsTexts.potentialWinnings);
          chartCounter++;
          this.createSVGs(
            false,
            'totalMoneyInvested',
            15,
            chartCounter,
            StatsTexts.potentialLosses
          );
        }

        if (this.state.finishedBets) {
          chartCounter++;
          this.createSVGs(true, 'betsWon', 10, chartCounter, StatsTexts.numberOfBetsWon);
          chartCounter++;
          this.createSVGs(true, 'betsLost', 6, chartCounter, StatsTexts.numberOfBetsLost);
          let trigger = false;
          for (let i = 0; i < this.state.data.length; i++) {
            if (this.state.data[i].totalMoneyEarned > 0) {
              trigger = true;
              break;
            }
          }
          if (trigger) {
            chartCounter++;
            this.createSVGs(true, 'totalMoneyEarned', 3, chartCounter, StatsTexts.moneyWon);
            chartCounter++;
            this.createSVGs(true, 'totalMoneyLost', 2, chartCounter, StatsTexts.moneyLost);
          }
        }
      }
    );
  };

  deleteU = (item) => {
    if (item.startsWith('u ') || item.startsWith('U ')) {
      let newItem = item.slice(2);
      return newItem;
    } else {
      return item;
    }
  };

  render () {
    return (
      <div className="stats-container">
        <div className="stats-title">
          <div className="statistic-main-title">{InterfaceTexts.stats}</div>
          <ReturnButton
            classToDisplay="return-center-button"
            target={config.routes.home}
            text={InterfaceTexts.mainMenu}
          />
        </div>
        {!this.state.pageLoaded ? <Spinner /> : null}
        {!this.state.activeBets && this.state.pageLoaded ? (
          <div className="stats-no-bets">
            <span>{StatsTexts.noActiveBets}</span>
          </div>
        ) : null}
        <div id="stats-svg-holder"></div>
        {!this.state.finishedBets && this.state.pageLoaded ? (
          <div className="stats-no-bets">
            <span>{StatsTexts.noFinishedBets}</span>
          </div>
        ) : null}

        <ReturnButton
          classToDisplay="return-center-button"
          target={config.routes.home}
          text={InterfaceTexts.mainMenu}
        />
      </div>
    );
  }
}

Stats.propTypes = {
  appLoaded: PropTypes.bool,
  people: PropTypes.array,
  rawData: PropTypes.array
};

const mapStateToProps = (state) => {
  return {
    appLoaded: state.appInformation.appLoaded,
    rawData: state.bets.rawData,
    people: state.appInformation.people,
    user: state.user,
  };
};

export default connect(mapStateToProps, null)(Stats);
