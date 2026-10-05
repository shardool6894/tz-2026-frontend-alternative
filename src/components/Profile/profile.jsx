import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthManager";
import { fetchEvents } from "../Events/eventsData";
import {EventsPage} from "../Events/EventsPage"
const Row = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 border-b border-cyan/10 last:border-0">
    <span className="text-sm text-white/60">{label}</span>
    <span className="text-sm font-medium break-words sm:text-right">{value || "—"}</span>
  </div>
);

export const Profile = () => {
  const { user } = useAuth();
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchEvents()
      .then((list) => {
        if (!cancelled) setAllEvents(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingEvents(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  // user.events holds event ids saved at login/registration time
  const ids = (Array.isArray(user.events) ? user.events : []).map((e) =>
    String(e && e._id ? e._id : e)
  );
  const byId = new Map(
    allEvents.filter((e) => e && e._id).map((e) => [String(e._id), e])
  );
  const registered = ids.map((id) => ({ id, event: byId.get(id) }));
  const unresolved = registered.filter((r) => !r.event).length;
  const members = Array.isArray(user.teamMembers) ? user.teamMembers : [];

  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-8 pb-10 pt-24 md:pt-32">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan text-center">My Profile</h1>

        <div className="bg-darkGray rounded-xl p-6 md:p-8 shadow-lg shadow-cyan/10">
          <h2 className="text-xl font-semibold mb-4 pb-3 border-b border-cyan/30">Details</h2>
          <Row label="Name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="College" value={user.collegeName} />
          <Row label="Registration number" value={user.registrationNum} />
          <Row
            label="Registration type"
            value={user.registrationType === "team" ? "Team" : "Individual"}
          />
          <Row label="Accommodation" value={user.accommodation ? "Requested" : "Not requested"} />
          {members.length > 0 && (
            <Row label="Team members" value={members.map((m) => m && m.name).filter(Boolean).join(", ")} />
          )}
        </div>

        <div className="bg-darkGray rounded-xl p-6 md:p-8 shadow-lg shadow-cyan/10">
          <h2 className="text-xl font-semibold mb-4 pb-3 border-b border-cyan/30">
            Registered Events {registered.length > 0 && <span className="text-cyan/70">({registered.length})</span>}
          </h2>

          {registered.length === 0 ? (
            <p className="text-white/60 text-sm">You haven't registered for any events yet.</p>
          ) : loadingEvents ? (
            <p className="text-white/60 text-sm">Loading your events…</p>
          ) : (
            <ul className="space-y-3">
              {registered.map(({ id, event }) =>
                event ? (
                  <li key={id} className="bg-gray rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-semibold">{event.name}</p>
                      <p className="text-sm text-cyan/70">{event.club}</p>
                    </div>
                    {event.eventType && (
                      <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full bg-cyan/20">
                        {event.eventType}
                      </span>
                    )}
                  </li>
                ) : null
              )}
            </ul>
          )}

          {!loadingEvents && unresolved > 0 && (
            <p className="mt-4 text-sm text-white/60">
              {unresolved === registered.length
                ? "Event details can't be loaded right now, please try again in a few minutes."
                : `${unresolved} event(s) couldn't be matched to the current event list.`}
            </p>
          )}

          <Link to="/events" className="inline-block mt-5 text-sm text-cyan hover:underline">
            Browse events →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;