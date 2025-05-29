import './App.css'
import { useState, useRef } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

const parent = "localhost";

//TODO: Change between chats without whole page rendering
function Stream({stream, focusedStream, numStreams}) {
  const shouldMute = focusedStream === stream ? false : true;

  return ( <iframe title={`${stream}-stream`} style={{width: numStreams === 1 ? "100%" : numStreams <= 4 ? "49%" : "33%", height: numStreams === 1 ? "100%" : numStreams <= 4 ? "49%" : "33%"}} 
    class="stream" id={`${stream}-stream`} src={`https://player.twitch.tv/?channel=${stream}&parent=${parent}&muted=${shouldMute}`} allowfullscreen></iframe>
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

function Chat({focusedStream}) {
  return ( 
    <iframe title={`${focusedStream}-chat`}  class="chat" id={`${focusedStream}-chat`} src={`https://www.twitch.tv/embed/${focusedStream}/chat?parent=${parent}`} height="650" width="325"></iframe>
  )
}

function Button({stream, setFocusedStream}) {
  return ( <button id={`${stream}-button`} onClick={() => {setFocusedStream(stream)}}>{stream}</button> );
}

function handleSubmit(event, newStreamer, navigate, [streams, setStreams]) {
  event.preventDefault();

  if (!(streams.includes(newStreamer))) {  
    //Updating url page to include the newest streamer(s) added.
    navigate(newStreamer);
    setStreams([...streams, newStreamer]);
  }

  
  
}

function StreamPage() {
  const params = useParams();
  const navigate = useNavigate();
  const streamers = [...new Set(params["*"].split("/"))].filter(elem => elem !== "");
  const [focusedStream, setFocusedStream] = useState(streamers[0] ?? "");
  const [streams, setStreams] = useState(streamers);
  const [input, setInput] = useState("");
  const streamOptionRef = useRef(null);

  return (
    <div className='container'>
      <div class="stream-container">
        {streams.map(stream => <Stream stream={stream} focusedStream={focusedStream} numStreams={streams.length} />)}
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
            {streams.map(stream => <Button stream={stream} setFocusedStream={setFocusedStream}/>)}
          </div>
          <Chat focusedStream={focusedStream} />
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
