import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    selectedArticleId: "",
    selectedOrcid: null,  // Store the selected ORCID ID
    OaWorksQuery: null,
  },
  reducers: {
    setSelectedArticleId: (state, action) => {
      state.selectedArticleId = action.payload;
    },
    setSelectedOrcid: (state, action) => {
      state.selectedOrcid = action.payload;
    },
    setOaWorksQuery: (state, action) => {
      state.OaWorksQuery = action.payload;
    },
  },
});

export const { setSelectedArticleId, setSelectedOrcid, setOaWorksQuery } = userSlice.actions;
export default userSlice.reducer;
