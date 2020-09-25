const socket = io('/');

const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
let peer = new Peer(null, {
  path: '/peerjs',
  host: '/',
  port: '443'
});

const addVideoStream = (_video, _stream) => {
  _video.srcObject = _stream;
  _video.addEventListener('loadedmetadata', () => _video.play());
  videoGrid.append(_video);
};

const connectToNewUser = (userId, stream) => {
  let call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', remoteStream => {
    addVideoStream(video, remoteStream);
  });
};

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(_stream => {
    myVideoStream = _stream;

    addVideoStream(myVideo, _stream);

    peer.on('call', call => {
      call.answer(_stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on('user-connected', userId => {
      connectToNewUser(userId, _stream);
    });
  })
  .catch(e => {
    console.log('media file error..', e);
    videoGrid.innerHTML = '<h1>Error in loading media file</h1>';
  });

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});
