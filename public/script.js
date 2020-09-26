const socket = io('/');

const myVideo = document.createElement('video');
const videoGrid = document.getElementById('video-grid');
let peer = new Peer(null, {
  path: '/peerjs',
  host: '/',
  port: '443'
});
const mainChatWindow = document.querySelector('.main__chat__window');
let msg = document.querySelector('#chat_message');
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

socket.on('createMessage', msg => {
  const li = document.createElement('li');
  li.innerHTML = `<b class = 'text-success'>User:</b> <br/>  ${msg}`;
  document.querySelector('.messages').append(li);
  mainChatWindow.scrollTop = mainChatWindow.scrollHeight;
});
const setUnmuteButton = () => {
  let html = `
<i class="_red fas fa-microphone-slash"></i>
              <span>Unmute</span>
`;
  document.querySelector('.main__mute__button').innerHTML = html;
};
const setMuteButton = () => {
  let html = `
<i class="fas fa-microphone"></i>
              <span>Mute</span>
`;
  document.querySelector('.main__mute__button').innerHTML = html;
};
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};
const setStopButton = () => {
  let html = `
  <i class=" _red fas fa-video-slash"></i>
  <span>Stop Video</span>
`;
  document.querySelector('.main__videoControl__button').innerHTML = html;
};
const setPlayButton = () => {
  let html = `
  <i class="fas fa-video"></i>
  <span>Play Video</span>
`;
  document.querySelector('.main__videoControl__button').innerHTML = html;
};

const togglePlayVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setStopButton();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setPlayButton();
  }
};

window.onkeydown = e => {
  if (e.which == 13 && msg.value !== 0) {
    socket.emit('message', msg.value);
    msg.value = '';
  }
};
