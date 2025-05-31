import './App.css'
import { useState, useRef, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

const parent = "localhost";

//TODO: Change between chats without whole page rendering
function Stream({stream, focusedStream, size}) {
  const shouldMute = focusedStream === stream ? false : true;

  return ( <iframe class="stream" title={`${stream}-stream`} style={{width: size.streamWidth, height: size.streamHeight}} src={`https://player.twitch.tv/?channel=${stream}&parent=${parent}&muted=${shouldMute}`} allowfullscreen></iframe>
  )
}

function StreamOptions ({streams, setStreams}) {
  return (
    streams.map(stream => {
      return (
      <li key={`${stream}`}>
        <input type='checkbox' defaultChecked onChange={(e) => {if (e.target.checked === false) {setStreams(streams.filter(elem => elem !== stream))}}}></input>
        <label>{stream}</label>
      </li>)
    })
  )
}

function Chat({stream, focusedChat}) {
  const display = stream === focusedChat ? "block" : "none";
  return (
    <iframe title={`${stream}-chat`} class="chat" style={{display: display}} id={`${stream}-chat`} src={`https://www.twitch.tv/embed/${stream}/chat?parent=${parent}`}></iframe>
  )
}
//Inner-width - 310 - 2.8 = stream-container's width
//stream-container's height
//All of the stream's height must be less than window.innerHeight / or better yet (chat's height)
//All of the stream's width must be less than window.innerWidth


function Button({stream, setFocusedChat}) {
  return ( <button id={`${stream}-button`} onClick={() => {setFocusedChat(stream)}}>{stream}</button> );
}

function handleSubmit(event, newStreamer, navigate, [streams, setStreams]) {
  event.preventDefault();

  if (!(streams.includes(newStreamer))) {  
    //Updating url page to include the newest streamer(s) added.
    navigate(newStreamer);
    setStreams([...streams, newStreamer]);
  }
}

function bestStreamSize(streamNums) {
  let bestWidth = 0, bestHeight = 0;
  let height = window.innerHeight, width = window.innerWidth, chatWidth = 304;

  width -= chatWidth;

  for (let numInRow = 1; numInRow <= streamNums; numInRow++) {
    let numRows = Math.ceil(streamNums/numInRow);
    let maxWidth = Math.floor(width/numInRow);
    let maxHeight = Math.floor(height/numRows);
  
    if (maxWidth * 9/16 < maxHeight) {
      maxHeight = maxWidth * 9/16;
    }
    else {
      maxWidth = maxHeight * 16/9;
    }

    if (maxWidth > bestWidth) {
      bestWidth = maxWidth;
      bestHeight = maxHeight;
    }
  }

  bestHeight -= 16;
  bestWidth -= 28;
  return {containerWidth: width, streamWidth: bestWidth, streamHeight: bestHeight};
}

function StreamPage() {
  const params = useParams();
  const navigate = useNavigate();
  const streamers = [...new Set(params["*"].split("/"))].filter(elem => elem !== "");
  const [focusedStream, setFocusedStream] = useState(streamers[0] ?? "");
  const [size, setSize] = useState(bestStreamSize(streamers.length));
  const [focusedChat, setFocusedChat] = useState(streamers[0] ?? "");
  const [streams, setStreams] = useState(streamers);
  const [input, setInput] = useState("");
  const streamOptionRef = useRef(null);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setSize(bestStreamSize(streamers.length));
    });
  }, [streamers]);
 
  return (
    <div className='container'>
      <div class="stream-container" style={{width: size.containerWidth}}>
        {streams.map(stream => <Stream stream={stream} focusedStream={focusedStream} numStreams={streams.length} size={size} />)}
        <div id="stream-options" ref={streamOptionRef}>
          <div>Currently Watching</div>
          <ul id="stream-list">
          <StreamOptions streams={streams} setStreams={setStreams}/>
          </ul>
          <form onSubmit={(e) => { handleSubmit(e, input, navigate, [streams, setStreams]); setInput("")}}>
            <input value={input} onChange={(e) => setInput(e.target.value)}></input>
            <div id="form-options">
              <button type='button' onClick={() => {streamOptionRef.current.style.display = "none"; setInput("")}}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
        <div class="chat-container">
          <div id="chat-buttons">
            {streams.map(stream => <Button stream={stream} setFocusedChat={setFocusedChat}/>)}
          </div>
          {streams.map(stream => <Chat stream={stream} focusedChat={focusedChat} />)}
          <div id="chat-options">
            <button onClick={() => {streamOptionRef.current.style.display = "flex"}}>Add Streamer</button>
            <button>Toggle Chat</button>
          </div>
        </div>
    </div>
  );
}

function App() {
return (
    <Routes>
        <Route path="/*" element={<StreamPage />} />
    </Routes>
  );
}

export default App;
