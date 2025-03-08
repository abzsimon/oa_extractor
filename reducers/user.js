import { createSlice } from '@reduxjs/toolkit';

const initialState = {
 value: [],
};

export const userSlice = createSlice({
 name: 'user',

  initialState,
 reducers: {
   addFriendToStore: (state, action) => {
     state.value.push(action.payload);
   },
 },
});

export const { addFriendToStore } = userSlice.actions;
export default userSlice.reducer;