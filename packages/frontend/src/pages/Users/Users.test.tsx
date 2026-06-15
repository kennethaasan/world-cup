import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { User } from '../../generated/queries';
import { Users } from './Users';
import { getQuestionSummaries } from './questionSummaries';

const refetchMock = vi.hoisted(() => vi.fn());
const isMobileViewport = vi.hoisted(() => ({ current: false }));
const latestDataGridProps = vi.hoisted<{
  current:
    | undefined
    | {
        columns: Array<{
          field: string;
          headerName?: string;
          renderCell?: (params: { value: unknown }) => React.ReactNode;
        }>;
        rows: Array<Record<string, unknown>>;
      };
}>(() => ({ current: undefined }));

const users = vi.hoisted<User[]>(() => [
  {
    id: 'world-cup:user:1',
    name: 'Anna',
    rank: 1,
    points: 3,
    max_points: 5,
    remaining_possible_points: 2,
    questions: [
      {
        question: 'Mexico - Sør-Afrika',
        answer: '2-1',
        blueprint: '2-1',
        points: 2,
        max_points: 2,
        status: 'CORRECT',
        category: 'MATCHES',
      },
      {
        question: 'Toppscorer etter gruppespill',
        answer: 'Håland',
        blueprint: null,
        points: null,
        max_points: 3,
        status: 'UNSCORED',
        category: 'AWARDS',
      },
    ],
  },
  {
    id: 'world-cup:user:2',
    name: 'Bjørn',
    rank: 2,
    points: 1,
    max_points: 5,
    remaining_possible_points: 2,
    questions: [
      {
        question: 'Mexico - Sør-Afrika',
        answer: '2-0',
        blueprint: '2-1',
        points: 1,
        max_points: 2,
        status: 'PARTIAL',
        category: 'MATCHES',
      },
      {
        question: 'Toppscorer etter gruppespill',
        answer: 'Mbappe',
        blueprint: null,
        points: null,
        max_points: 3,
        status: 'UNSCORED',
        category: 'AWARDS',
      },
    ],
  },
]);

vi.mock('@mui/material/Box', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      component,
      ...props
    }: {
      children?: React.ReactNode;
      component?: React.ElementType;
      [key: string]: unknown;
    }) => {
      const cleanProps = { ...props };
      delete cleanProps.sx;
      return React.createElement(component || 'div', cleanProps, children);
    },
  };
});

vi.mock('@mui/material/Button', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      onClick,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
    }) => React.createElement('button', { onClick }, children),
  };
});

vi.mock('@mui/material/ButtonBase', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      onClick,
      ...props
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      [key: string]: unknown;
    }) => {
      const cleanProps = { ...props };
      delete cleanProps.sx;
      return React.createElement(
        'button',
        { ...cleanProps, onClick },
        children
      );
    },
  };
});

vi.mock('@mui/material/Chip', async () => {
  const React = await import('react');
  return {
    default: ({
      label,
      ...props
    }: {
      label?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const cleanProps = { ...props };
      delete cleanProps.color;
      delete cleanProps.size;
      delete cleanProps.sx;
      delete cleanProps.variant;
      return React.createElement('span', cleanProps, label);
    },
  };
});

vi.mock('@mui/material/CircularProgress', async () => {
  const React = await import('react');
  return {
    default: () => React.createElement('span', undefined, 'Laster'),
  };
});

vi.mock('@mui/material/Divider', async () => {
  const React = await import('react');
  return {
    default: () => React.createElement('hr'),
  };
});

vi.mock('@mui/material/Drawer', () => ({
  default: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div>{children}</div> : null),
}));

vi.mock('@mui/material/FormControlLabel', async () => {
  const React = await import('react');
  return {
    default: ({
      control,
      label,
    }: {
      control?: React.ReactNode;
      label?: React.ReactNode;
    }) => React.createElement('label', undefined, control, label),
  };
});

vi.mock('@mui/material/MenuItem', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      value,
    }: {
      children?: React.ReactNode;
      value?: string;
    }) => React.createElement('option', { value }, children),
  };
});

vi.mock('@mui/material/Paper', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const cleanProps = { ...props };
      delete cleanProps.sx;
      delete cleanProps.variant;
      return React.createElement('section', cleanProps, children);
    },
  };
});

vi.mock('@mui/material/Stack', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const cleanProps = { ...props };
      delete cleanProps.component;
      delete cleanProps.direction;
      delete cleanProps.spacing;
      delete cleanProps.sx;
      return React.createElement('div', cleanProps, children);
    },
  };
});

vi.mock('@mui/material/Switch', async () => {
  const React = await import('react');
  return {
    default: ({
      checked,
      onChange,
    }: {
      checked?: boolean;
      onChange?: (event: { target: { checked: boolean } }) => void;
    }) =>
      React.createElement('input', {
        checked,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
          onChange?.({ target: { checked: event.target.checked } }),
        type: 'checkbox',
      }),
  };
});

vi.mock('@mui/material/TextField', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      label,
      onChange,
      select,
      value,
    }: {
      children?: React.ReactNode;
      label?: string;
      onChange?: (event: { target: { value: string } }) => void;
      select?: boolean;
      value?: string;
    }) =>
      React.createElement(
        'label',
        undefined,
        label,
        select
          ? React.createElement(
              'select',
              {
                'aria-label': label,
                onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
                  onChange?.({ target: { value: event.target.value } }),
                value,
              },
              children
            )
          : React.createElement('input', {
              'aria-label': label,
              onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                onChange?.({ target: { value: event.target.value } }),
              value,
            })
      ),
  };
});

vi.mock('@mui/material/Typography', async () => {
  const React = await import('react');
  return {
    default: ({
      children,
      ...props
    }: {
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const cleanProps = { ...props };
      delete cleanProps.color;
      delete cleanProps.noWrap;
      delete cleanProps.sx;
      delete cleanProps.variant;
      return React.createElement('span', cleanProps, children);
    },
  };
});

vi.mock('@mui/material/useMediaQuery', () => ({
  default: () => isMobileViewport.current,
}));

vi.mock('@mui/x-data-grid', async () => {
  const React = await import('react');
  return {
    DataGrid: ({
      columns,
      rows,
    }: {
      columns: Array<{
        field: string;
        headerName?: string;
        renderCell?: (params: { value: unknown }) => React.ReactNode;
      }>;
      rows: Array<Record<string, unknown>>;
    }) => {
      latestDataGridProps.current = { columns, rows };

      return React.createElement(
        'table',
        { role: 'grid' },
        React.createElement(
          'thead',
          undefined,
          React.createElement(
            'tr',
            undefined,
            columns.map((column) =>
              React.createElement(
                'th',
                { key: column.field },
                column.headerName
              )
            )
          )
        ),
        React.createElement(
          'tbody',
          undefined,
          rows.map((row) =>
            React.createElement(
              'tr',
              { key: String(row.id) },
              columns.map((column) =>
                React.createElement(
                  'td',
                  { key: column.field },
                  (() => {
                    const value = row[column.field];

                    if (column.renderCell) {
                      return column.renderCell({ value });
                    }

                    if (
                      typeof value === 'string' ||
                      typeof value === 'number'
                    ) {
                      return String(value);
                    }

                    return '';
                  })()
                )
              )
            )
          )
        )
      );
    },
  };
});

vi.mock('../../generated/queries', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../generated/queries')>();

  return {
    ...actual,
    useGetUserQuery: vi.fn(
      (options: { skip?: boolean; variables?: { userId?: string } } = {}) => ({
        data: options.skip
          ? undefined
          : {
              getUser: users.find(
                (user) => user.id === options.variables?.userId
              ),
            },
        error: undefined,
        loading: false,
      })
    ),
    useGetUsersQuery: vi.fn(() => ({
      data: { getUsers: users },
      error: undefined,
      loading: false,
      refetch: refetchMock,
    })),
  };
});

class ResizeObserverMock {
  public disconnect() {
    return undefined;
  }

  public observe() {
    return undefined;
  }

  public unobserve() {
    return undefined;
  }
}

describe('getQuestionSummaries', () => {
  test('counts scored and unscored question states', () => {
    expect(getQuestionSummaries(users)).toEqual([
      {
        question: 'Mexico - Sør-Afrika',
        category: 'MATCHES',
        hasBlueprint: true,
        correct: 1,
        partial: 1,
        wrong: 0,
        unscored: 0,
        spread: 1,
      },
      {
        question: 'Toppscorer etter gruppespill',
        category: 'AWARDS',
        hasBlueprint: false,
        correct: 0,
        partial: 0,
        wrong: 0,
        unscored: 2,
        spread: 0,
      },
    ]);
  });
});

describe('Users', () => {
  beforeEach(() => {
    isMobileViewport.current = false;
    latestDataGridProps.current = undefined;
    refetchMock.mockClear();
    globalThis.ResizeObserver = ResizeObserverMock;
  });

  test('refreshes the users query when Oppdater is clicked', async () => {
    render(<Users />);

    await userEvent.click(screen.getByRole('button', { name: 'Oppdater' }));

    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  test('shows remaining possible points per person and omits the table column', () => {
    render(<Users />);

    expect(screen.getByText('Mulige poeng igjen')).toBeInTheDocument();
    expect(
      latestDataGridProps.current?.columns.map((column) => column.field)
    ).not.toContain('remaining_possible_points');
    expect(latestDataGridProps.current?.rows[0]).not.toHaveProperty(
      'remaining_possible_points'
    );
  });

  test('filters participant rows by search text', async () => {
    render(<Users />);

    expect(latestDataGridProps.current?.rows.map((row) => row.name)).toEqual([
      'Anna',
      'Bjørn',
    ]);

    await userEvent.type(screen.getByLabelText('Søk deltaker'), 'Anna');

    expect(latestDataGridProps.current?.rows.map((row) => row.name)).toEqual([
      'Anna',
    ]);
  });

  test('filters question columns by match or question search text', async () => {
    render(<Users />);

    expect(
      latestDataGridProps.current?.columns.map((column) => column.field)
    ).toContain('Mexico - Sør-Afrika');
    expect(
      latestDataGridProps.current?.columns.map((column) => column.field)
    ).toContain('Toppscorer etter gruppespill');

    await userEvent.type(screen.getByLabelText('Søk kamp/spørsmål'), 'sor');

    expect(
      latestDataGridProps.current?.columns.map((column) => column.field)
    ).toContain('Mexico - Sør-Afrika');
    expect(
      latestDataGridProps.current?.columns.map((column) => column.field)
    ).not.toContain('Toppscorer etter gruppespill');
  });

  test('toggles question cells between answers and points', async () => {
    render(<Users />);

    expect(screen.getByText('2-1')).toBeInTheDocument();
    expect(screen.queryByText('2/2')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Vis svar'));

    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  test('only shows resolved questions in the impact list', () => {
    render(<Users />);

    expect(screen.getByText('Mest utslagsgivende')).toBeInTheDocument();
    expect(screen.getAllByText('Mexico - Sør-Afrika').length).toBeGreaterThan(
      1
    );
    expect(screen.getAllByText('Toppscorer etter gruppespill')).toHaveLength(1);
  });

  test('renders a compact mobile matrix with a readable active question', async () => {
    isMobileViewport.current = true;

    render(<Users />);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByTestId('mobile-score-matrix')).toBeInTheDocument();
    expect(
      screen.getByText('Mexico - Sør-Afrika', {
        selector: '[aria-live="polite"]',
      })
    ).toBeInTheDocument();
    const participantButton = screen.getByRole('button', { name: /Anna/u });
    expect(participantButton).toBeInTheDocument();
    expect(participantButton).toHaveTextContent('3 poeng');
    expect(participantButton).not.toHaveTextContent('2 igjen');
    expect(screen.queryByText('Spm 1')).not.toBeInTheDocument();

    fireEvent.scroll(screen.getByTestId('mobile-score-matrix-scroll'), {
      target: { scrollLeft: 176 },
    });

    expect(
      screen.getByText('Toppscorer etter gruppespill', {
        selector: '[aria-live="polite"]',
      })
    ).toBeInTheDocument();

    await userEvent.click(participantButton);

    expect(
      screen.getByText('#1 · 3/5 poeng · 2 mulige igjen')
    ).toBeInTheDocument();
  });
});
