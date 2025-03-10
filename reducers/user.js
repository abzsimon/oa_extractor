import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: {
    selectedArticleId : "W2741809807",
  }, // Keeps the existing array if needed
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSelectedArticleId: (state, action) => {
      state.selectedArticleId = action.payload; // Store selected article ID
    },
  },
});

export const { setSelectedArticleId } = userSlice.actions;
export default userSlice.reducer;
