import express from 'express';
import { nearbyListings } from '../controllers/geoSearchController.js';

const geoSearchRouter = express.Router();
geoSearchRouter.get('/nearby', nearbyListings);
export default geoSearchRouter;
