import { createSlice } from '@reduxjs/toolkit';
import {BetModel} from '../Data/Models/BetModels';

const initState = {
  rawData: []
};


const betsSlice = createSlice({
  name: 'bets',
  initialState: initState,
  reducers: {
    setBets: (state, action) => {
      action.payload.sort((a, b) => {
        return b.timestamp.toMillis() - a.timestamp.toMillis();
      });
      state.rawData = action.payload.map(bet => BetModel.serialize(bet));
      return state;
    }
  }
});

export default betsSlice.reducer;
