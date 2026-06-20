export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const offset = (page - 1) * limit;
  const cursor = query.cursor || null;
  return { page, limit, offset, cursor };
}

export function paginateResult(items, total, { page, limit }) {
  return { items, total, page, limit, hasMore: page * limit < total };
}
