import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App.jsx';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AppContext);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Fetch events
  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // RSVP join/leave
  const handleRSVP = async (eventId, action) => {
    if (!user) return alert('Login first!');
    const token = localStorage.getItem('token');
    const method = action === 'join' ? 'POST' : 'DELETE';

    try {
      const res = await fetch(`${API_BASE}/api/events/${eventId}/rsvp`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Update local events
        setEvents(events.map(e => {
          if (e._id !== eventId) return e;
          const updatedRsvps = action === 'join'
            ? [...(e.rsvps || []), { user: user.id }]
            : (e.rsvps || []).filter(r => r.user !== user.id);
          return { ...e, rsvps: updatedRsvps };
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading events...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upcoming Events</h1>
        {user && (
          <a
            href="/events/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            + Create Event
          </a>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No events yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(e => (
            <div key={e._id} className="bg-white rounded-xl shadow overflow-hidden">
              {e.image && (
                <img
                  src={e.image}
                  alt={e.title}
                  className="w-full h-40 object-cover"
                  onError={ev => ev.target.style.display = 'none'}
                />
              )}
              <div className="p-5">
                <h3 className="font-bold text-lg">{e.title}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  📅 {new Date(e.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{e.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                    🎟️ {e.rsvps?.length || 0}/{e.capacity || '∞'}
                  </span>
                  {user ? (
                    <button
                      onClick={() =>
                        handleRSVP(
                          e._id,
                          e.rsvps?.some(r => r.user === user.id) ? 'leave' : 'join'
                        )
                      }
                      className={`px-3 py-1 rounded text-sm ${
                        e.rsvps?.some(r => r.user === user.id)
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-indigo-500 text-white'
                      }`}
                    >
                      {e.rsvps?.some(r => r.user === user.id) ? 'Going' : 'RSVP'}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">Login to RSVP</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
