import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import React from 'react';
import ReactDOM from 'react-dom';
import { Header } from './components/Header';
import { Users } from './pages/Users';
import { theme } from './theme';
import { getEnvVar } from './utils/env';

const client = new ApolloClient({
  uri: getEnvVar('REACT_APP_GRAPHQL_SERVER_URI'),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApolloProvider client={client}>
        <Header />
        <Users />
      </ApolloProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
