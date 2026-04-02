export const parseNumericList = (input) => {
  const values = input
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item))

  if (!values.length) {
    throw new Error('empty numeric list')
  }

  return values
}

export const parseMatrixInput = (input) => {
  const matrix = input
    .split(';')
    .map((row) => row.split(',').map((value) => Number(value.trim())))

  if (!matrix.length || matrix.some((row) => row.some((value) => !Number.isFinite(value)))) {
    throw new Error('invalid matrix')
  }

  return matrix
}
