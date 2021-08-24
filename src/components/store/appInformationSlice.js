import { createSlice } from '@reduxjs/toolkit';

const initState = {
  appLoaded: false,
  applicationError: false,
  applicationErrorMessage: '',
  fullPublicUsers: [],
  needsUpdate: false,
  people: []
};

const appInformationSlice = createSlice({
  name: 'appInformation',
  initialState: initState,
  reducers: {
    setAppLoaded: (state, action) => {
      state.appLoaded = action.payload;
      return state;
    },
    setFullPublicUsers (state, action) {
      state.fullPublicUsers = action.payload;
      return state;
    },
    setPeople: (state, action) => {
      state.people = action.payload;
      return state;
    }
  }
});

export default appInformationSlice.reducer;
