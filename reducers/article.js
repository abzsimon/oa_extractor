import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // === Source and OpenAlex Data ===
  source: '',                // 'openalex' or 'manual'
  id: '',
  title: '',
  authors: [],
  authorsFullNames: [],
  abstract: 'No Abstract',
  publishedIn: 'None',
  url: 'None',
  doi: 'None',
  pubyear: null,
  pdfRelativePath: 'None',
  referenceType: '',
  oa_status: false,
  topics: [],
  domains: [],
  fields: [],
  subfields: [],

  // === User-Input Data ===
  language: null,
  selectedSubfield: null,             
  keywords: [],
  openAccess: null,
  objectFocus: null,
  dataTypesDiscussed: [],
  additionalDataTypes: [],
  discourseGenre: [],
  methodology: [],
  funding: null,
  positionOnDataOpenAccess: [],
  barriers: [],
  remarksOnBarriers: [],
  positionOnOpenAccessAndIssues: [],
  remarks: null,
  completionRate: 0,
  fulltext: null,

  // === Association ===
  projectId: '',

  // === Front-end flags ===
  isInDb: false,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setArticle: (state, action) => ({ ...initialState, ...action.payload }),
    clearArticle: () => initialState,
    updateArticleField: (state, action) => {
      const { field, value } = action.payload;
      if (field in state) {
        state[field] = value;
      }
    },
    // Ajout d'une remarque de frein
    addBarrierRemark: (state, action) => {
      // action.payload should be an object { type, citation, paragraphe }
      state.remarksOnBarriers.push(action.payload);
    },
    // Suppression d'une remarque de frein par index
    removeBarrierRemark: (state, action) => {
      const idx = action.payload;
      if (idx >= 0 && idx < state.remarksOnBarriers.length) {
        state.remarksOnBarriers.splice(idx, 1);
      }
    },
    // Mise à jour d'un champ d'une remarque de frein
    updateBarrierRemark: (state, action) => {
      const { index, field, value } = action.payload;
      const remark = state.remarksOnBarriers[index];
      if (remark && Object.prototype.hasOwnProperty.call(remark, field)) {
        remark[field] = value;
      }
    },
  },
});

export const {
  setArticle,
  clearArticle,
  updateArticleField,
  addBarrierRemark,
  removeBarrierRemark,
  updateBarrierRemark,
} = articleSlice.actions;

export default articleSlice.reducer;
