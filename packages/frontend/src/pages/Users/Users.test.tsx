// import { render } from '@testing-library/react';
// import React from 'react';
import { Users } from './Users';

// test('renders users', () => {
//   const { getByText } = render(<Users />);
//   const el = getByText(/EM/i);
//   expect(el).toBeInTheDocument();
// });

test('Users', () => {
  expect(Users).toBeInstanceOf(Function);
});
