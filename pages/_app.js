import '../styles/globals.css';
import Head from 'next/head';
import Menu from '../components/Menu';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import user from '../reducers/user'; // Import Redux reducer
import author from '../reducers/author'

const store = configureStore({
  reducer: { 
    user: user,
    author : author },
});

function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Head>
        <title>Next.js App</title>
      </Head>
      <Menu />
      <Component {...pageProps} />
    </Provider>
  );
}

export default App;
