import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const VideoCallPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [hasVideo, setHasVideo] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const myStreamRef = useRef<MediaStream | null>(null);

  // Note: For a complete WebRTC connection, you need a signaling server and STUN/TURN servers.
  // This is a basic mock implementation structure emphasizing UI and basic Socket.IO presence for a demo.

  useEffect(() => {
    socketRef.current = io('http://localhost:5000');

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      myStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Setup WebRTC peer and emit join (abbreviated logic)
      socketRef.current?.emit('join-room', roomId, user?.id || 'demo-user');
      
      socketRef.current?.on('user-connected', (userId: string) => {
        // Here we'd create a peer connection and send an offer
        console.log('User connected:', userId);
      });
    });

    return () => {
      myStreamRef.current?.getTracks().forEach((track) => track.stop());
      socketRef.current?.disconnect();
    };
  }, [roomId, user?.id]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleVideo = () => {
    if (myStreamRef.current) {
      const videoTrack = myStreamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setHasVideo(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (myStreamRef.current) {
      const audioTrack = myStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setHasAudio(audioTrack.enabled);
    }
  };

  const endCall = () => {
    myStreamRef.current?.getTracks().forEach((track) => track.stop());
    socketRef.current?.disconnect();
    navigate('/meetings');
  };

  return (
    <div className="h-[80vh] flex flex-col bg-gray-900 rounded-lg overflow-hidden animate-fade-in relative">
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Remote Video Placeholder */}
        {!remoteStream ? (
          <div className="text-gray-400 text-xl font-medium">Waiting for others to join...</div>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />
        )}

        {/* Local Video Picture-in-Picture */}
        <div className="absolute bottom-6 right-6 w-48 h-32 bg-gray-800 rounded-lg overflow-hidden shadow-xl border-2 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="h-20 bg-gray-800 flex items-center justify-center gap-6">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${hasAudio ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          {hasAudio ? <Mic /> : <MicOff />}
        </button>
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${hasVideo ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          {hasVideo ? <Video /> : <VideoOff />}
        </button>
        <button
          onClick={endCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
        >
          <PhoneOff />
        </button>
      </div>
    </div>
  );
};
