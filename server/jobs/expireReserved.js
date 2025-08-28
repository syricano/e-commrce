// server/jobs/expireReserved.js
import { Op } from 'sequelize';
import Listing from '../models/Listing.js';

const FIFTEEN_MIN_MS = 15 * 60 * 1000;

export default function startExpireReservedJob() {
  const run = async () => {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    try {
      await Listing.update(
        { status: 'active', reservedAt: null, publishedAt: new Date() },
        {
          where: {
            status: 'reserved',
            reservedAt: { [Op.lt]: fortyEightHoursAgo },
          },
        }
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('expireReserved job error:', err?.message || err);
    }
  };

  // kick and schedule
  run();
  setInterval(run, FIFTEEN_MIN_MS);
}

