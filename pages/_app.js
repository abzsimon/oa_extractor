import "../styles/globals.css";
import Head from "next/head";
import Menu from "../components/Menu";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
// ne pas oublier d'importer les reducers pour les combiner
import user from "../reducers/user";
import author from "../reducers/author";
import article from "../reducers/article"

const store = configureStore({
  reducer: {
    user: user,
    author: author,
    article: article,
  },
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
