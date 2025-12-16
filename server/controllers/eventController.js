import Event from '../models/Event.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('creator', 'email')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, capacity, image } = req.body;
    const event = new Event({
      title,
      description,
      date,
      location,
      capacity: parseInt(capacity),
      image,
      creator: req.user.id
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rsvpEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Event not found' });
    }

    // 🔒 ATOMIC UPDATE: capacity + no duplicate
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        'rsvps.user': { $ne: userId },
        rsvps: { $size: { $lt: event.capacity } }
      },
      { $push: { rsvps: { user: userId } } },
      { new: true, session }
    );

    if (!updatedEvent) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Event full or already RSVP’d' });
    }

    await session.commitTransaction();
    res.json({ 
      message: 'RSVP successful', 
      rsvps: updatedEvent.rsvps.length 
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

export const cancelRsvp = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $pull: { rsvps: { user: req.user.id } } },
      { new: true }
    );
    if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'RSVP cancelled', rsvps: updatedEvent.rsvps.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
