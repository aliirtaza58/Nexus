import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Calendar } from 'lucide-react';

export const MeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [attendeeId, setAttendeeId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchMeetings = async () => {
    try {
      const res = await axios.get('/api/meetings');
      if (res.data.success) {
        setMeetings(res.data.data);
      }
    } catch (e: any) {
      toast.error('Could not fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/meetings', {
        attendeeId,
        title,
        startTime,
        endTime
      });
      if (res.data.success) {
        toast.success('Meeting scheduled successfully!');
        fetchMeetings(); // Refresh list
        setTitle('');
        setAttendeeId('');
        setStartTime('');
        setEndTime('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to schedule meeting');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await axios.put(`/api/meetings/${id}`, { status });
      if (res.data.success) {
        toast.success('Status updated');
        fetchMeetings();
      }
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600">Schedule and manage your calendar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="mr-2" size={20} /> Upcoming Meetings
              </h2>
            </CardHeader>
            <CardBody>
              {loading ? (
                <p>Loading...</p>
              ) : meetings.length === 0 ? (
                <p className="text-gray-600 py-4">No meetings scheduled.</p>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div key={meeting._id} className="border p-4 rounded-md flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{meeting.title}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Status: <span className="capitalize">{meeting.status}</span></p>
                      </div>
                      <div className="space-x-2">
                        {meeting.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateStatus(meeting._id, 'accepted')}>Accept</Button>
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(meeting._id, 'rejected')}>Reject</Button>
                          </>
                        )}
                        {meeting.status === 'accepted' && meeting.meetingLink && (
                          <Button size="sm" onClick={() => alert(`Redirecting to video room: ${meeting.meetingLink}`)}>
                            Join Video Call
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Schedule New Meeting</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attendee Output ID</label>
                  <input
                    type="text"
                    required
                    placeholder="User's Database ID"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    value={attendeeId}
                    onChange={(e) => setAttendeeId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">Schedule</Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
