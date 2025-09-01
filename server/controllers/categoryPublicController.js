// server/controllers/categoryPublicController.js
import { literal } from 'sequelize';
import Category from '../models/Category.js';
import CategoryTranslation from '../models/CategoryTranslation.js';

const listPublic = async (req, res, next) => {
  try {
    const locale = String(req.query.locale || 'ar');                 // Arabic default
    const leafOnly = String(req.query.leaf || 'false') === 'true';
    const withListings = String(req.query.withListings || 'false') === 'true';

    // Count active listings per category (paranoid-aware)
    const listingCountExpr = literal(`(
      SELECT COUNT(*)
      FROM listings l
      WHERE l.category_id = "Category".id
        AND l.status = 'active'
        AND l.deleted_at IS NULL
    )`);

    const rows = await Category.findAll({
      where: { isActive: true },
      include: [{
        model: CategoryTranslation,
        as: 'translations',
        required: false,
        where: { locale },
        attributes: ['name', 'slug', 'locale'],
      }],
      attributes: {
        include: [[listingCountExpr, 'listingCount']],
      },
      order: [['position', 'ASC'], ['id', 'ASC']],
    });

    // Determine which categories have children
    const childSet = new Set();
    for (const c of rows) {
      const pid = c.parentId ?? c.get?.('parentId') ?? c.parent_id ?? null;
      if (pid) childSet.add(pid);
    }

    let items = rows.map((c) => {
      const tr = c.translations?.[0] || null;
      const hasChildren = childSet.has(c.id);
      const listingCount = Number(c.get?.('listingCount') ?? 0);
      return {
        id: c.id,
        parentId: c.parentId ?? null,
        position: c.position,
        isActive: c.isActive,
        metadata: c.metadata,
        name: tr?.name || null,
        slug: tr?.slug || null,
        hasChildren,
        listingCount,
      };
    });

    if (leafOnly) items = items.filter((x) => !x.hasChildren);
    if (withListings) items = items.filter((x) => x.listingCount > 0);

    return res.json({ items });
  } catch (e) {
    return next(e);
  }
};

export { listPublic };
export default { listPublic };
