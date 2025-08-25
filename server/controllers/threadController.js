import { Op } from 'sequelize';
import MessageThread from '../models/MessageThread.js';
import Message from '../models/Message.js';
import Listing from '../models/Listing.js';

export const startThread = async (req,res,next)=>{
  try{
    const { listingId } = req.body;
    const listing = await Listing.findByPk(listingId);
    if(!listing) return res.status(404).json({ message:'listing not found' });
    if(listing.ownerUserId === req.user.id) return res.status(400).json({ message:'cannot message your own listing' });

    const [thread] = await MessageThread.findOrCreate({
      where:{ listingId, buyerUserId:req.user.id, sellerUserId: listing.ownerUserId },
      defaults:{ listingId, buyerUserId:req.user.id, sellerUserId: listing.ownerUserId, lastMessageAt: new Date() }
    });
    res.status(201).json(thread);
  }catch(e){ next(e); }
};

export const listThreads = async (req,res,next)=>{
  try{
    const rows = await MessageThread.findAll({
      where:{ [Op.or]: [{ buyerUserId:req.user.id }, { sellerUserId:req.user.id }] },
      order:[['lastMessageAt','DESC']]
    });
    res.json(rows);
  }catch(e){ next(e); }
};

export const sendMessage = async (req,res,next)=>{
  try{
    const { id } = req.params;
    const thread = await MessageThread.findByPk(id);
    if(!thread) return res.status(404).json({ message:'thread not found' });
    if (![thread.buyerUserId, thread.sellerUserId].includes(req.user.id)) return res.status(403).json({ message:'forbidden' });

    const msg = await Message.create({ threadId: thread.id, senderUserId: req.user.id, body: req.body.body, attachments: req.body.attachments });
    await thread.update({ lastMessageAt: new Date() });
    res.status(201).json(msg);
  }catch(e){ next(e); }
};

export default { startThread, listThreads, sendMessage };
