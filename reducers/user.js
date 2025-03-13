import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    selectedArticleId: "",
    selectedOrcid: null,  // Store the selected ORCID ID
  },
  reducers: {
    setSelectedArticleId: (state, action) => {
      state.selectedArticleId = action.payload;
    },
    setSelectedOrcid: (state, action) => {
      state.selectedOrcid = action.payload;
    },
  },
});

export const { setSelectedArticleId, setSelectedOrcid } = userSlice.actions;
export default userSlice.reducer;
