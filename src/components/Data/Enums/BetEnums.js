export const BetWinnerEnum = {
  NO_WINNER: 'Nije niko'
};

export const BetTypeEnum = {
  REGULAR_BET: 0,
  JOINT_BET: 1
};

export const BetStateEnum = {
  ACTIVE: 0,
  FINISHED: 1
};

export const JointBetEnum = {
  LEFT: 'left',
  RIGHT: 'right'
};

export const PaidBetEnum = {
  PAID: 0,
  UNPAID: 1
};

Object.freeze(BetWinnerEnum, BetTypeEnum, BetStateEnum, JointBetEnum);
