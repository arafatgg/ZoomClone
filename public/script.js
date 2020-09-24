const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: 3030
});

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream);
    });
    peer.on('call', call => {
      call.answer(stream);
      addVideoOnCall(call);
    });
  })
  .catch(e => {
    console.log('media file error..', e);
    videoGrid.innerHTML = '<h1>Error in loading media file</h1>';
  });

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  addVideoOnCall(call);
};

const addVideoOnCall = call => {
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
};
const addVideoStream = (video, stream) => {
  video.srcObj = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.appendChild(video);
};

