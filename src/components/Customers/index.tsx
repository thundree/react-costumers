import React, { useEffect, useState } from 'react'
import clsx from 'clsx'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import { withStyles, WithStyles } from '@mui/styles'
import TableCell from '@mui/material/TableCell'
import { Theme, createTheme } from '@mui/material/styles'

import { AutoSizer, Column, Table } from 'react-virtualized'
import { CardContent, Grid, TextField } from '@mui/material'

const styles = (theme: Theme) =>
  ({
    flexContainer: {
      display: 'flex',
      alignItems: 'center',
      boxSizing: 'border-box',
    },
    table: {},
    tableRow: {
      cursor: 'default',
    },
    tableRowHover: {
      '&:hover': {
        cursor: 'pointer',
        backgroundColor: theme.palette.grey[200],
      },
    },
    tableCell: {
      flex: 1,
    },
    noClick: {
      cursor: 'initial',
    },
  } as const)

interface Customer {
  age: number
  email: string
  id: number
  name: string
  search: string
}

type CustomerRow = [string, string, number]
interface ColumnData {
  dataKey: string
  label: string
  numeric?: boolean
  width: number
}

interface Row {
  index: number
}

interface MuiVirtualizedTableProps extends WithStyles<typeof styles> {
  columns: readonly ColumnData[]
  headerHeight?: number
  onRowClick?: () => void
  rowCount: number
  rowGetter: (row: Row) => Customer
  rowHeight?: number
}

class MuiVirtualizedTable extends React.PureComponent<
  MuiVirtualizedTableProps
> {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
  }

  getRowClassName = ({ index }: Row) => {
    const { classes, onRowClick } = this.props

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    })
  }

  cellRenderer: any = ({
    cellData,
    columnIndex,
  }: {
    cellData: string
    columnIndex: number
  }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props
    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null,
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={
          (columnIndex != null && columns[columnIndex].numeric) || false
            ? 'right'
            : 'left'
        }
      >
        {cellData}
      </TableCell>
    )
  }

  headerRenderer = ({ label, columnIndex }: any & { columnIndex: number }) => {
    const { headerHeight, columns, classes } = this.props

    return (
      <TableCell
        component="div"
        className={clsx(
          classes.tableCell,
          classes.flexContainer,
          classes.noClick,
        )}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
      >
        <span>{label}</span>
      </TableCell>
    )
  }

  render() {
    const {
      classes,
      columns,
      rowHeight,
      headerHeight,
      ...tableProps
    } = this.props
    return (
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <Table
            height={height}
            width={width}
            rowHeight={rowHeight!}
            gridStyle={{
              direction: 'inherit',
            }}
            headerHeight={headerHeight!}
            className={classes.table}
            {...tableProps}
            rowClassName={this.getRowClassName}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps: any) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              )
            })}
          </Table>
        )}
      </AutoSizer>
    )
  }
}

const defaultTheme = createTheme()
const VirtualizedTable = withStyles(styles, { defaultTheme })(
  MuiVirtualizedTable,
)

const customers: readonly CustomerRow[] = [
  ['Customer 1', 'email1@user.com', 24],
  ['Customer 2', 'email2@user.com', 28],
  ['Customer 3', 'email3@user.com', 28],
]

function createData(
  id: number,
  name: string,
  email: string,
  age: number,
): Customer {
  return {
    id,
    name,
    email,
    age,
    search: `${id}|${name}|${email}|${age}`,
  }
}

const rows: Customer[] = []

for (let i = 0; i < 5000; i += 1) {
  const randomSelection =
    customers[Math.floor(Math.random() * customers.length)]
  rows.push(createData(i + 1, ...randomSelection))
}

let filterTimeout: any

const Customers = (): JSX.Element => {
  const [customersArr, setCustomersArr] = useState<Customer[]>(rows)
  const [searchTerms, setSearchTerms] = useState('')
  const [updatedSearch, setUpdatedSearch] = useState(true)

  useEffect(() => {
    if (updatedSearch) return
    clearTimeout(filterTimeout)

    filterTimeout = setTimeout(() => {
      if (searchTerms) {
        const filteredArr = rows.filter(
          (customer) => customer.search.indexOf(searchTerms) >= 0,
        )
        setCustomersArr(filteredArr)
      } else {
        setCustomersArr(rows)
      }
      setSearchTerms('')
    }, 500)

    setUpdatedSearch(true)
  }, [
    updatedSearch,
    setUpdatedSearch,
    searchTerms,
    customersArr,
    setCustomersArr,
  ])

  const handleInput = (text: string) => {
    setUpdatedSearch(false)
    setSearchTerms(text)
  }

  return (
    <Card sx={{ width: '90%', maxWidth: 600, marginX: 'auto', mt: '24px' }}>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <Typography
            variant="h6"
            component="div"
            align="left"
            sx={{ flexGrow: 1, marginY: '16px', paddingLeft: '16px' }}
          >
            Customers
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <TextField
            style={{ width: '90%' }}
            id="standard-basic"
            label="Filter"
            variant="standard"
            onKeyUp={(event: any) => handleInput(event.target.value)}
          />
        </Grid>
      </Grid>
      <CardContent>
        <Paper elevation={0} style={{ height: 400, width: '100%' }}>
          <VirtualizedTable
            rowCount={customersArr.length}
            rowGetter={({ index }) => customersArr[index]}
            columns={[
              {
                width: 100,
                label: 'ID',
                dataKey: 'id',
              },
              {
                width: 220,
                label: 'Name',
                dataKey: 'name',
              },
              {
                width: 200,
                label: 'Email',
                dataKey: 'email',
              },
              {
                width: 60,
                label: 'Age',
                dataKey: 'age',
                numeric: true,
              },
            ]}
          />
        </Paper>
      </CardContent>
    </Card>
  )
}

export default Customers
