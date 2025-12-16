import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as eventCtrl from '../controllers/eventController.js';

const router = Router();

router.get('/', eventCtrl.getEvents);
router.post('/', protect, eventCtrl.createEvent);
router.put('/:id', protect, eventCtrl.updateEvent);
router.delete('/:id', protect, eventCtrl.deleteEvent);
router.post('/:eventId/rsvp', protect, eventCtrl.rsvpEvent);
router.delete('/:eventId/rsvp', protect, eventCtrl.cancelRsvp);

export default router;
