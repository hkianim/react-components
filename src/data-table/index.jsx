import { memo, useEffect, useMemo, useRef, useState } from "react";

import {
    Box,
    CircularProgress,
    IconButton,
    LinearProgress,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

// --------------------------------------------------
// Constants
// --------------------------------------------------

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const DEFAULT_OPERATIONS = {
    edit: {
        key: "edit",
        label: "ویرایش",
        icon: <EditOutlinedIcon />,
        color: "default",
        visible: true,
        disabled: false,
    },
    delete: {
        key: "delete",
        label: "حذف",
        icon: <DeleteOutlinedIcon />,
        color: "error",
        visible: true,
        disabled: false,
    },
};

const DEFAULT_COLUMN_WIDTH = 150;
const OPERATION_BUTTON_WIDTH = 40;
const OPERATION_COLUMN_PADDING = 16;

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const noop = () => {};

function getOperationValue(value, row) {
    return typeof value === "function" ? value(row) : value;
}

function formatValue(value, column, row, selected) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const context = {
        column,
        selected,
    };

    const format = column.format;

    // Custom formatter
    if (typeof format === "function") {
        return format(value, row, context);
    }

    // Resolve format type and custom options
    const formatType =
        typeof format === "string"
            ? format
            : typeof format === "object" && format !== null
              ? format.type
              : "text";

    const formatOptions =
        typeof format === "object" && format !== null ? { ...format } : {};

    delete formatOptions.type;

    switch (formatType) {
        case "number":
            return new Intl.NumberFormat("fa-IR", formatOptions).format(
                Number(value),
            );

        case "currency":
            return new Intl.NumberFormat("fa-IR", {
                style: "currency",
                currency: column.currency || "IRR",
                maximumFractionDigits: 0,
                ...formatOptions,
            }).format(Number(value));

        case "percent":
            return new Intl.NumberFormat("fa-IR", {
                style: "percent",
                maximumFractionDigits: 2,
                ...formatOptions,
            }).format(Number(value));

        case "date":
        case "datetime": {
            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return value;
            }

            const defaultOptions = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            };

            if (formatType === "datetime") {
                defaultOptions.hour = "2-digit";
                defaultOptions.minute = "2-digit";
            }

            return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                ...defaultOptions,
                ...formatOptions,
            }).format(date);
        }

        case "text":
        default:
            return String(value);
    }
}

// --------------------------------------------------
// Column width helpers
// --------------------------------------------------

function getColumnMinWidth(column) {
    if (column.minWidth == null) {
        return 0;
    }

    const minWidth = Number(column.minWidth);

    return Number.isFinite(minWidth) ? Math.max(0, minWidth) : 0;
}

function getColumnMaxWidth(column) {
    if (column.maxWidth == null) {
        return Infinity;
    }

    const maxWidth = Number(column.maxWidth);

    return Number.isFinite(maxWidth)
        ? Math.max(getColumnMinWidth(column), maxWidth)
        : Infinity;
}

function getColumnBaseWidth(column) {
    const minWidth = getColumnMinWidth(column);
    const maxWidth = getColumnMaxWidth(column);

    const requestedWidth =
        column.width == null ? DEFAULT_COLUMN_WIDTH : Number(column.width);

    const width = Number.isFinite(requestedWidth)
        ? requestedWidth
        : DEFAULT_COLUMN_WIDTH;

    return Math.min(Math.max(width, minWidth), maxWidth);
}

// Distribute extra space proportionally.
// Columns reaching maxWidth are excluded from further distribution.
function distributeExtraSpace(widths, columns, availableWidth) {
    const result = [...widths];

    let remaining =
        availableWidth - result.reduce((total, width) => total + width, 0);

    while (remaining > 0.01) {
        const eligible = columns
            .map((column, index) => ({
                index,
                maxWidth: getColumnMaxWidth(column),
            }))
            .filter(({ index, maxWidth }) => result[index] < maxWidth - 0.01);

        if (eligible.length === 0) {
            break;
        }

        const totalWeight = eligible.reduce(
            (total, { index }) => total + Math.max(widths[index], 1),
            0,
        );

        if (totalWeight <= 0) {
            break;
        }

        const reachedMaxWidth = eligible.filter(({ index, maxWidth }) => {
            const share =
                (remaining * Math.max(widths[index], 1)) / totalWeight;

            return share >= maxWidth - result[index] - 0.01;
        });

        // No column reaches maxWidth.
        // Distribute all remaining space.
        if (reachedMaxWidth.length === 0) {
            for (const { index } of eligible) {
                const share =
                    (remaining * Math.max(widths[index], 1)) / totalWeight;

                result[index] += share;
            }

            remaining = 0;
            break;
        }

        // Lock columns that reach maxWidth.
        let distributed = 0;

        for (const { index } of reachedMaxWidth) {
            const capacity = getColumnMaxWidth(columns[index]) - result[index];

            result[index] += capacity;
            distributed += capacity;
        }

        if (distributed <= 0) {
            break;
        }

        remaining -= distributed;
    }

    return result;
}

// Shrink columns proportionally while respecting minWidth.
// Columns reaching minWidth are excluded from further shrinking.
function shrinkColumns(widths, columns, availableWidth) {
    const result = [...widths];

    const minWidths = columns.map(getColumnMinWidth);

    let deficit =
        result.reduce((total, width) => total + width, 0) - availableWidth;

    while (deficit > 0.01) {
        const eligible = result
            .map((width, index) => ({
                index,
                width,
                minWidth: minWidths[index],
            }))
            .filter(({ width, minWidth }) => width > minWidth + 0.01);

        if (eligible.length === 0) {
            break;
        }

        const totalWeight = eligible.reduce(
            (total, item) => total + item.width,
            0,
        );

        if (totalWeight <= 0) {
            break;
        }

        const reachedMinWidth = eligible.filter((item) => {
            const share = (deficit * item.width) / totalWeight;

            const capacity = item.width - item.minWidth;

            return share >= capacity - 0.01;
        });

        // No column reaches minWidth.
        // Distribute the deficit proportionally.
        if (reachedMinWidth.length === 0) {
            for (const item of eligible) {
                const share = (deficit * item.width) / totalWeight;

                result[item.index] -= share;
            }

            deficit = 0;
            break;
        }

        // Lock columns that reach minWidth.
        let distributed = 0;

        for (const item of reachedMinWidth) {
            const capacity = item.width - item.minWidth;

            result[item.index] = item.minWidth;
            distributed += capacity;
        }

        if (distributed <= 0) {
            break;
        }

        deficit -= distributed;
    }

    return result;
}

// --------------------------------------------------
// Component
// --------------------------------------------------

function DataTable({
    // Data
    columns = [],
    rows = [],
    getRowId = (row) => row.id,

    // Loading and error
    loading = false,
    fetching = false,
    error = false,
    errorMessage = "خطایی در دریافت اطلاعات رخ داده است.",
    emptyMessage = "اطلاعاتی برای نمایش وجود ندارد",

    // Pagination
    pagination = {
        page: 1,
        pageSize: 20,
        total: 0,
    },
    onPaginationChange = noop,

    // Sorting
    sorting = [],
    onSortChange = noop,

    // Selection
    selectedRowId = null,
    onRowSelect = noop,

    // Row styling
    getRowSx = null,

    // Operations
    operations = ["edit", "delete"],
    onOperation = noop,

    // Column fitting: scroll | shrink
    columnFit = "scroll",

    // Other
    showHeader = true,
}) {
    const [hoveredRowId, setHoveredRowId] = useState(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const tableViewportRef = useRef(null);

    const theme = useTheme();

    const isSm = useMediaQuery(theme.breakpoints.up("sm"));
    const isMd = useMediaQuery(theme.breakpoints.up("md"));
    const isLg = useMediaQuery(theme.breakpoints.up("lg"));
    const isXl = useMediaQuery(theme.breakpoints.up("xl"));

    const breakpoints = {
        xs: true,
        sm: isSm,
        md: isMd,
        lg: isLg,
        xl: isXl,
    };

    // --------------------------------------------------
    // Resolve responsive columnFit
    // --------------------------------------------------

    const resolvedColumnFit = useMemo(() => {
        const validValues = ["scroll", "shrink"];

        if (typeof columnFit === "string") {
            return validValues.includes(columnFit) ? columnFit : "scroll";
        }

        if (!columnFit || typeof columnFit !== "object") {
            return "scroll";
        }

        const breakpointOrder = ["xs", "sm", "md", "lg", "xl"];

        let result = "scroll";

        for (const breakpoint of breakpointOrder) {
            const value = columnFit[breakpoint];

            if (breakpoints[breakpoint] && validValues.includes(value)) {
                result = value;
            }
        }

        return result;
    }, [columnFit, isSm, isMd, isLg, isXl]);

    // --------------------------------------------------
    // Container width
    // --------------------------------------------------

    useEffect(() => {
        const element = tableViewportRef.current;

        if (!element) {
            return;
        }

        const updateWidth = () => {
            const width = element.clientWidth;

            setContainerWidth((previousWidth) =>
                previousWidth === width ? previousWidth : width,
            );
        };

        // Initial measurement
        updateWidth();

        // Observe actual available width.
        if (typeof ResizeObserver !== "undefined") {
            const observer = new ResizeObserver(updateWidth);

            observer.observe(element);

            return () => {
                observer.disconnect();
            };
        }

        // Fallback for browsers without ResizeObserver.
        window.addEventListener("resize", updateWidth);

        return () => {
            window.removeEventListener("resize", updateWidth);
        };
    }, []);

    // --------------------------------------------------
    // Visible columns
    // --------------------------------------------------

    const visibleColumns = useMemo(
        () => columns.filter((column) => !column.hidden),
        [columns],
    );

    // --------------------------------------------------
    // Normalize operations
    // --------------------------------------------------

    const normalizedOperations = useMemo(() => {
        return operations
            .map((operation) => {
                if (typeof operation === "string") {
                    return DEFAULT_OPERATIONS[operation] || null;
                }

                if (typeof operation === "object" && operation !== null) {
                    const defaultOperation =
                        DEFAULT_OPERATIONS[operation.key] || {};

                    return {
                        color: "default",
                        visible: true,
                        disabled: false,
                        ...defaultOperation,
                        ...operation,
                    };
                }

                return null;
            })
            .filter(Boolean);
    }, [operations]);

    const hasOperations = normalizedOperations.length > 0;

    // --------------------------------------------------
    // Operation column width
    // --------------------------------------------------

    const operationColumnWidth = hasOperations
        ? Math.max(
              OPERATION_BUTTON_WIDTH,
              normalizedOperations.length * OPERATION_BUTTON_WIDTH,
          ) + OPERATION_COLUMN_PADDING
        : 0;

    // --------------------------------------------------
    // Column widths
    // --------------------------------------------------

    const columnWidths = useMemo(() => {
        const baseWidths = visibleColumns.map(getColumnBaseWidth);

        if (containerWidth <= 0 || visibleColumns.length === 0) {
            return baseWidths;
        }

        const availableWidth = Math.max(
            0,
            containerWidth - operationColumnWidth,
        );

        const totalWidth = baseWidths.reduce(
            (total, width) => total + width,
            0,
        );

        // Extra space: always distribute proportionally.
        if (totalWidth < availableWidth) {
            return distributeExtraSpace(
                baseWidths,
                visibleColumns,
                availableWidth,
            );
        }

        // Narrow table: optionally shrink columns.
        if (totalWidth > availableWidth && resolvedColumnFit === "shrink") {
            return shrinkColumns(baseWidths, visibleColumns, availableWidth);
        }

        // Preserve original widths and allow horizontal scrolling.
        return baseWidths;
    }, [
        visibleColumns,
        containerWidth,
        operationColumnWidth,
        resolvedColumnFit,
    ]);

    const tableWidth =
        columnWidths.reduce((total, width) => total + width, 0) +
        operationColumnWidth;

    // --------------------------------------------------
    // Current sorting
    // --------------------------------------------------

    const currentSort = sorting[0] || null;

    // --------------------------------------------------
    // Pagination
    // --------------------------------------------------

    const handlePageChange = (_, newPage) => {
        onPaginationChange({
            page: newPage + 1,
            pageSize: pagination.pageSize,
        });
    };

    const handlePageSizeChange = (event) => {
        onPaginationChange({
            page: 1,
            pageSize: Number(event.target.value),
        });
    };

    // --------------------------------------------------
    // Sorting
    // --------------------------------------------------

    const handleSortChange = (field) => {
        let nextSorting = [];

        if (!currentSort || currentSort.field !== field) {
            nextSorting = [
                {
                    field,
                    direction: "asc",
                },
            ];
        } else if (currentSort.direction === "asc") {
            nextSorting = [
                {
                    field,
                    direction: "desc",
                },
            ];
        }

        onSortChange(nextSorting);

        if (pagination && pagination.page !== 1) {
            onPaginationChange({
                page: 1,
                pageSize: pagination.pageSize,
            });
        }
    };

    // --------------------------------------------------
    // Row selection
    // --------------------------------------------------

    const handleRowClick = (row) => {
        const rowId = getRowId(row);

        if (selectedRowId === rowId) {
            onRowSelect(null, null);
        } else {
            onRowSelect(rowId, row);
        }
    };

    // --------------------------------------------------
    // Operations
    // --------------------------------------------------

    const handleOperation = (event, operation, row) => {
        event.stopPropagation();

        const rowId = getRowId(row);

        // Select the row before notifying the parent.
        if (selectedRowId !== rowId) {
            onRowSelect(rowId, row);
        }

        onOperation(operation.key, row);
    };

    // --------------------------------------------------
    // Cell rendering
    // --------------------------------------------------

    const renderCell = (column, row, selected) => {
        const value = row[column.field];

        const context = {
            column,
            selected,
            formatValue: (customValue = value) =>
                formatValue(customValue, column, row, selected),
        };

        if (typeof column.renderCell === "function") {
            return column.renderCell(value, row, context);
        }

        return formatValue(value, column, row, selected);
    };

    // --------------------------------------------------
    // Row styling
    // --------------------------------------------------

    const getRowStyles = (row, selected, hovered) => {
        const context = {
            selected,
            hovered,
            formatValue: (value, column) =>
                formatValue(value, column, row, selected),
        };

        if (typeof getRowSx === "function") {
            return getRowSx(row, context) || {};
        }

        return {
            cursor: "pointer",
            transition: "background-color 150ms ease",

            backgroundColor: selected ? "action.selected" : "background.paper",

            "&:hover": {
                backgroundColor: "action.hover",
            },
        };
    };

    // --------------------------------------------------
    // Status rows
    // --------------------------------------------------

    const renderStatusRow = (content) => (
        <TableRow>
            <TableCell
                colSpan={Math.max(
                    1,
                    visibleColumns.length + (hasOperations ? 1 : 0),
                )}
                align="center"
                sx={{ py: 5 }}
            >
                {content}
            </TableCell>
        </TableRow>
    );

    // --------------------------------------------------
    // Render
    // --------------------------------------------------

    return (
        <Box
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            {/* Fetching indicator */}
            {fetching && !loading && !error && rows.length > 0 && (
                <LinearProgress
                    sx={{
                        borderRadius: 1,
                        mb: 0.5,
                    }}
                />
            )}

            {/* Table viewport */}
            <Box
                ref={tableViewportRef}
                sx={{
                    width: "100%",
                    minWidth: 0,
                }}
            >
                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                        width: "100%",
                        minWidth: 0,
                        overflowX: "auto",
                        borderRadius: 1,
                    }}
                >
                    <Table
                        size="small"
                        sx={{
                            width: `${tableWidth} px`,
                            minWidth: `${tableWidth} px`,
                            tableLayout: "fixed",
                        }}
                    >
                        {/* Column widths */}
                        <colgroup>
                            {visibleColumns.map((column, index) => (
                                <col
                                    key={column.field}
                                    style={{
                                        width: `${columnWidths[index]} px`,
                                    }}
                                />
                            ))}

                            {hasOperations && (
                                <col
                                    style={{
                                        width: `${operationColumnWidth} px`,
                                    }}
                                />
                            )}
                        </colgroup>

                        {/* Header */}
                        {showHeader && (
                            <TableHead>
                                <TableRow>
                                    {visibleColumns.map((column, index) => {
                                        const active =
                                            currentSort?.field === column.field;

                                        return (
                                            <TableCell
                                                key={column.field}
                                                sx={{
                                                    width: columnWidths[index],
                                                    fontWeight: 700,
                                                    whiteSpace: "nowrap",
                                                    textAlign:
                                                        column.alignment ||
                                                        "start",
                                                }}
                                            >
                                                {column.sortable ? (
                                                    <TableSortLabel
                                                        active={active}
                                                        direction={
                                                            active
                                                                ? currentSort.direction
                                                                : "asc"
                                                        }
                                                        onClick={() =>
                                                            handleSortChange(
                                                                column.field,
                                                            )
                                                        }
                                                    >
                                                        {column.caption}
                                                    </TableSortLabel>
                                                ) : (
                                                    column.caption
                                                )}
                                            </TableCell>
                                        );
                                    })}

                                    {hasOperations && (
                                        <TableCell
                                            align="center"
                                            sx={{
                                                width: operationColumnWidth,
                                                whiteSpace: "nowrap",
                                                fontWeight: 700,
                                            }}
                                        >
                                            عملیات
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                        )}

                        {/* Body */}
                        <TableBody>
                            {/* Initial loading */}
                            {loading
                                ? renderStatusRow(
                                      <Stack
                                          direction="row"
                                          spacing={1.5}
                                          alignItems="center"
                                          justifyContent="center"
                                      >
                                          <CircularProgress size={24} />

                                          <Typography variant="body2">
                                              در حال دریافت اطلاعات...
                                          </Typography>
                                      </Stack>,
                                  )
                                : error
                                  ? // Error
                                    renderStatusRow(
                                        <Typography
                                            color="error"
                                            variant="body2"
                                        >
                                            {errorMessage}
                                        </Typography>,
                                    )
                                  : rows.length === 0
                                    ? // Empty
                                      renderStatusRow(
                                          <Typography
                                              color="text.secondary"
                                              variant="body2"
                                          >
                                              {emptyMessage}
                                          </Typography>,
                                      )
                                    : // Data rows
                                      rows.map((row) => {
                                          const rowId = getRowId(row);
                                          const selected =
                                              selectedRowId === rowId;
                                          const hovered =
                                              hoveredRowId === rowId;

                                          return (
                                              <TableRow
                                                  key={rowId}
                                                  onClick={() =>
                                                      handleRowClick(row)
                                                  }
                                                  onMouseEnter={() =>
                                                      setHoveredRowId(rowId)
                                                  }
                                                  onMouseLeave={() =>
                                                      setHoveredRowId(null)
                                                  }
                                                  sx={getRowStyles(
                                                      row,
                                                      selected,
                                                      hovered,
                                                  )}
                                              >
                                                  {visibleColumns.map(
                                                      (column, index) => (
                                                          <TableCell
                                                              key={column.field}
                                                              sx={{
                                                                  width: columnWidths[
                                                                      index
                                                                  ],
                                                                  direction:
                                                                      column.dir ||
                                                                      "auto",
                                                                  textAlign:
                                                                      column.alignment ||
                                                                      "start",
                                                              }}
                                                          >
                                                              {renderCell(
                                                                  column,
                                                                  row,
                                                                  selected,
                                                              )}
                                                          </TableCell>
                                                      ),
                                                  )}

                                                  {/* Operations */}
                                                  {hasOperations && (
                                                      <TableCell
                                                          align="center"
                                                          sx={{
                                                              width: operationColumnWidth,
                                                          }}
                                                      >
                                                          <Stack
                                                              direction="row"
                                                              spacing={0.5}
                                                              justifyContent="center"
                                                          >
                                                              {normalizedOperations.map(
                                                                  (
                                                                      operation,
                                                                  ) => {
                                                                      const visible =
                                                                          getOperationValue(
                                                                              operation.visible,
                                                                              row,
                                                                          );

                                                                      const disabled =
                                                                          getOperationValue(
                                                                              operation.disabled,
                                                                              row,
                                                                          );

                                                                      if (
                                                                          !visible
                                                                      ) {
                                                                          return null;
                                                                      }

                                                                      return (
                                                                          <Tooltip
                                                                              key={
                                                                                  operation.key
                                                                              }
                                                                              title={
                                                                                  operation.label
                                                                              }
                                                                              arrow
                                                                          >
                                                                              <span>
                                                                                  <IconButton
                                                                                      size="small"
                                                                                      color={
                                                                                          operation.color ||
                                                                                          "default"
                                                                                      }
                                                                                      disabled={Boolean(
                                                                                          disabled,
                                                                                      )}
                                                                                      onClick={(
                                                                                          event,
                                                                                      ) =>
                                                                                          handleOperation(
                                                                                              event,
                                                                                              operation,
                                                                                              row,
                                                                                          )
                                                                                      }
                                                                                  >
                                                                                      {
                                                                                          operation.icon
                                                                                      }
                                                                                  </IconButton>
                                                                              </span>
                                                                          </Tooltip>
                                                                      );
                                                                  },
                                                              )}
                                                          </Stack>
                                                      </TableCell>
                                                  )}
                                              </TableRow>
                                          );
                                      })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Pagination */}
            {pagination && (
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={Math.max(0, pagination.page - 1)}
                    rowsPerPage={pagination.pageSize}
                    rowsPerPageOptions={DEFAULT_PAGE_SIZE_OPTIONS}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handlePageSizeChange}
                    labelRowsPerPage="تعداد در هر صفحه:"
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from.toLocaleString("fa-IR")} تا ${to.toLocaleString("fa-IR")} از ${
                            count !== -1
                                ? count.toLocaleString("fa-IR")
                                : "بیشتر"
                        } `
                    }
                />
            )}
        </Box>
    );
}

export default memo(DataTable);
