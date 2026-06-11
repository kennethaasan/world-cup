import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { Users } from './pages/Users';
import { theme } from './theme';
import { getEnvVar } from './utils/env';

const client = new ApolloClient({
  uri: getEnvVar('VITE_GRAPHQL_SERVER_URI'),
  cache: new InMemoryCache(),
});

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApolloProvider client={client}>
        <Header />
        <Users />
      </ApolloProvider>
    </ThemeProvider>
  </React.StrictMode>
);
