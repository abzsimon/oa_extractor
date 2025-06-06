// pages/_app.js
import "../styles/globals.css";
import Head from "next/head";
import Menu from "../components/Menu";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Tes slices Redux
import user from "../reducers/user";
import author from "../reducers/author";
import article from "../reducers/article";

// Combine reducers into a rootReducer
const rootReducer = {
  user,
  author,
  article,
};

// Configure Redux store
const store = configureStore({
  reducer: rootReducer,
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>Review Pilot for OpenAlex</title>
      </Head>
      <Menu />
      <Component {...pageProps} />
    </Provider>
  );
}

export default App;
