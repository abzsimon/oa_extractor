import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  // Champs OpenAlex / récupérés API
  id: "",
  title: "",
  authors: [],
  authorsFullNames: [],
  abstract: "No Abstract",
  publishedIn: "None",
  url: "None",
  doi: "None",
  pubyear: null,
  pdfRelativePath: "None",
  referenceType: "",
  oa_status: false,
  openAccess: false,
  topics: [],
  domains: [],
  fields: [],
  subfields: [],

  // Champs saisis manuellement
  language: null,
  keywords: [],
  objectFocus: null,
  dataTypesDiscussed: [],
  additionalDataTypes: [],
  discourseGenre: [],
  methodology: [],
  funding: null,
  positionOnDataOpenAccess: null,
  barriers: [],
  positionOnOpenAccessAndIssues: [],
  remarks: null,
  completionRate: null,

  // Spécifique front
  isInDb: false,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setArticle: (state, action) => {
      return { ...initialState, ...action.payload };
    },
    clearArticle: () => initialState,
    updateArticleField: (state, action) => {
      const { field, value } = action.payload;
      if (field in state) {
        state[field] = value;
      }
    },
  }
});

export const { setArticle, clearArticle, updateArticleField } = articleSlice.actions;

export default articleSlice.reducer;