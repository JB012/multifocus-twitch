import './App.css'
import { useState, useRef, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';

const parent = window.location.hostname;

function Stream({stream, focusedStream, size}) {
  return ( <iframe className="stream" title={`${stream}-stream`} style={{width: size.streamWidth, height: size.streamHeight, boxShadow: focusedStream === stream ? "#b9a3e3 0px 1px 6px 1px" : "none"}} src={`https://player.twitch.tv/?channel=${stream}&parent=${parent}&muted=true`} allowFullScreen></iframe>
  )
}

function changeUrl(streams, navigate) {
  let newUrl = "";
  for (let stream of streams) {
    newUrl += `/${stream}`;
  }

  navigate(newUrl, {replace: true});
}

function StreamOptions ({streams, setStreams, setSize, bestStreamSize, toggleChat}) {
  function handleCheck(e, stream) {
    if (e.target.checked === false) {
      const filteredStreams = streams.filter(elem => elem !== stream);
      setStreams(filteredStreams);
      setSize(bestStreamSize(filteredStreams.length, toggleChat));
    }
  }
  return (
    streams.map(stream => {
      return (
      <li key={`${stream}`}>
        <input type='checkbox' defaultChecked onChange={(e) => handleCheck(e, stream)}></input>
        <label>{stream}</label>
      </li>)
    })
  )
}

function Chat({stream, focusedChat}) {
  const display = stream === focusedChat ? "block" : "none";
  return (
    <iframe title={`${stream}-chat`} className="chat" style={{display: display}} id={`${stream}-chat`} src={`https://www.twitch.tv/embed/${stream}/chat?parent=${parent}`}></iframe>
  )
}

function Button({stream, focusedStream, setFocusedChat}) {
  return ( <button id={`${stream}-button`} className={stream === focusedStream ? "focusedButton" : ""} onClick={() => {setFocusedChat(stream)}}>{stream}</button> );
}

function handleSubmit(event, newStreamer, [streams, setStreams], setSize, toggleChat) {
  event.preventDefault();

  if (!(streams.includes(newStreamer))) {
    setStreams([...streams, newStreamer]);
    setSize(bestStreamSize(streams.length + 1, toggleChat));
  }
}

function bestStreamSize(streamNums, toggleChat) {
  let bestWidth = 0, bestHeight = 0;
  let height = window.innerHeight, width, chatWidth = 304;

  width = toggleChat ? window.innerWidth - chatWidth : window.outerWidth;

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
  const [toggleChat, setToggleChat] = useState(true);
  const streamOptionRef = useRef(null);

  useEffect(() => {
    changeUrl(streams, navigate);
    function handleKeyPress(e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        let index = streams.findIndex((stream) => stream === focusedStream);
        if (e.key === "ArrowRight") {
          if (index + 1 === streams.length) {
            index = 0;
          }
          else {
            index += 1;
          }
        }
        else if (e.key === "ArrowLeft") {
          if (index - 1 === -1) {
            index = streams.length - 1;
          }
          else {
            index -= 1;
          }
        }

        setFocusedStream(streams[index]);
        setFocusedChat(streams[index]);
      
      }
    }

    function handleResize() {
      setSize(bestStreamSize(streams.length, toggleChat));
    }

    document.addEventListener('keyup', handleKeyPress);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keyup', handleKeyPress);
      window.removeEventListener('resize', handleResize);
    } 
  }, [streams, focusedStream, toggleChat, navigate, setFocusedStream, setFocusedChat]);
 
  return (
    <div className='container'>
      <div className="stream-container" style={{width: size.containerWidth, position: toggleChat ? "relative" : "absolute", height: toggleChat ? "auto" : "100%"}}>
        {streams.map(stream => <Stream key={stream} stream={stream} focusedStream={focusedStream} numStreams={streams.length} size={size} />)}
        <div id="stream-options" ref={streamOptionRef}>
          <div>Currently Watching</div>
          <ul id="stream-list">
          <StreamOptions streams={streams} setStreams={setStreams} setSize={setSize} bestStreamSize={bestStreamSize} toggleChat={toggleChat}/>
          </ul>
          <form onSubmit={(e) => { handleSubmit(e, input, [streams, setStreams], setSize, toggleChat); setInput("")}}>
            <input value={input} onChange={(e) => setInput(e.target.value)}></input>
            <div id="form-options">
              <button type='button' onClick={() => {streamOptionRef.current.style.display = "none"; setInput("")}}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
        <div className="chat-container">
          <div style={{display: toggleChat ? "block" : "none"}}>
            <div id="chat-buttons">
              {streams.map(stream => <Button key={stream} stream={stream} focusedStream={focusedStream} setFocusedChat={setFocusedChat}/>)}
            </div>
            {streams.map(stream => <Chat key={stream} stream={stream} focusedChat={focusedChat} />)}
          </div>
          <div id="chat-options">
            <button onClick={() => {streamOptionRef.current.style.display = "flex"}}>Add Streamer</button>
            <button onClick={() => {setToggleChat(!toggleChat); setSize(bestStreamSize(streams.length, !toggleChat));}}>Toggle Chat</button>
          </div>
        </div>
    </div>
  );
}

function IntroductionPage() {
  return (
    <div className="introduction">
        MultiFocus Twitch allows users to watch multiple streams at the same time (ex: <a href="/" style={{color: "white"}}>http://{parent}/streamer1/streamer2</a>).<br /> 
        The key feature is that "focusing" on a stream switches to its respective chat. To focus between streams, use the &larr; and &rarr; key. <br />
    </div>
  );
}

function App() {
return (
    <Routes>
        <Route path="/" element={<IntroductionPage />}/>
        <Route path="/*" element={<StreamPage />} />
    </Routes>
  );
}

export default App;
