// Convierte cada BigInt a Number (o usa v.toString() si prefieres string)
export const toPlain = (row) =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k,
      typeof v === 'bigint' ? Number(v) : v
    ])
  );
