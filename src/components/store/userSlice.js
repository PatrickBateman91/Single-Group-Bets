import { createSlice } from '@reduxjs/toolkit';
import { UserModel } from '../Data/Models/UserModel';

const initState = {};

const userSlice = createSlice({
  name: 'user',
  initialState: initState,
  reducers: {

    logOutUser (state) {
      state = UserModel.createGuest();
      return state;
    },

    updateUser (state, action) {
      state = action.payload;
      return state;
    }
  }
});

export default userSlice.reducer;
