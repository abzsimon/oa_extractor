import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Authentification / user info
  token: null,            // le JWT renvoyé par le backend
  isActive: false,        // issu de la base (active ou non)
  username: null,         // champ "username" du schéma Mongoose
  role: null,             // "user" ou "admin"
  lastLogin: null,        // date de la dernière connexion
  projectIds: [],         // tableau d'ObjectId (String) des projets
  
  // Champs temporaires liés à la session de navigation
  selectedArticleId: "",
  selectedAuthorId: "",
  selectedAuthorName: "",
  OaWorksQuery: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // À appeler après un login/register réussi
    authSucceeded: (state, action) => {
      // action.payload doit contenir :
      // { token, isActive, username, role, lastLogin, projectIds }
      const { token, isActive, username, role, lastLogin, projectIds } = action.payload;
      state.token = token;
      state.isActive = isActive;
      state.username = username;
      state.role = role;
      state.lastLogin = lastLogin;
      // Ensure projectIds is always an array
      state.projectIds = Array.isArray(projectIds) ? projectIds : [];
    },

    // Déconnexion : on réinitialise tout
    logout: (state) => {
      // Reset to initial state
      return { ...initialState };
    },

    // Update last login time
    updateLastLogin: (state, action) => {
      state.lastLogin = action.payload;
    },

    // UI reducers existants :
    setSelectedArticleId: (state, action) => {
      state.selectedArticleId = action.payload || "";
    },

    setSelectedAuthorId: (state, action) => {
      state.selectedAuthorId = action.payload;
    },

    // Nouveau : stocker le nom sélectionné d'un auteur
    setSelectedAuthorName: (state, action) => {
      state.selectedAuthorName = action.payload || "";
    },

    setOaWorksQuery: (state, action) => {
      state.OaWorksQuery = action.payload;
    },

    setProjectIds: (state, action) => {
      // Ensure we always get an array
      state.projectIds = Array.isArray(action.payload) ? action.payload : [];
    },

    addProjectId: (state, action) => {
      const projectId = action.payload;
      if (projectId && !state.projectIds.includes(projectId)) {
        state.projectIds.push(projectId);
      }
    },

    removeProjectId: (state, action) => {
      const projectId = action.payload;
      state.projectIds = state.projectIds.filter(id => id !== projectId);
    },

    resetUserState: () => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('persist/REHYDRATE', (state, action) => {
        if (action.payload?.user) {
          const rehydratedUser = action.payload.user;
          return {
            ...state,
            ...rehydratedUser,
            projectIds: Array.isArray(rehydratedUser.projectIds) ? rehydratedUser.projectIds : [],
            selectedArticleId: rehydratedUser.selectedArticleId || "",
            selectedAuthorId: rehydratedUser.selectedAuthorId || null,
            selectedAuthorName: rehydratedUser.selectedAuthorName || "",
          };
        }
        return state;
      });
  }
});

export const {
  authSucceeded,
  logout,
  updateLastLogin,
  setSelectedArticleId,
  setSelectedAuthorId,
  setSelectedAuthorName,
  setOaWorksQuery,
  setProjectIds,
  addProjectId,
  removeProjectId,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;
