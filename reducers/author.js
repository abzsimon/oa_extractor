// reducers/author.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  /* ===== Données récupérées (OpenAlex ou manual) ===== */
  id: "",                 
  source: "",
  orcid: "",
  display_name: "",
  cited_by_count: 0,
  works_count: 0,
  institutions: [],
  countries: [],
  overall_works: "",
  doctypes: [],
  study_works: [],
  top_five_topics: [],
  top_five_fields: [],
  top_two_domains: [],
  topic_tree: {},
  db_topic_tree: {},      // si tu veux toujours garder la version DB
  isInDb: false,

  /* ===== Informations ajoutées manuellement ===== */
  gender: "",
  status: "",
  annotation: "",
  completionRate: 0,
};

const authorSlice = createSlice({
  name: "author",
  initialState,
  reducers: {
    setAuthor: (state, action) => ({ ...initialState, ...action.payload }),
    clearAuthor: () => initialState,
    updateAuthorField: (state, action) => {
      const { field, value } = action.payload;
      if (field in state) state[field] = value;
    },
  },
});

export const { setAuthor, clearAuthor, updateAuthorField } = authorSlice.actions;
export default authorSlice.reducer;
