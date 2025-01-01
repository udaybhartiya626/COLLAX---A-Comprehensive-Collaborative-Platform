import React, { useState, useEffect, useRef } from "react";
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
// import Avatar from 'react-avatar';

import { Button } from "@material-tailwind/react";
import { IconButton } from "@material-tailwind/react";

import { IoVideocam } from "react-icons/io5";
import { IoVideocamOff } from "react-icons/io5";
import { IoMdMic } from "react-icons/io";
import { IoMdMicOff } from "react-icons/io";
import { MdCallEnd } from "react-icons/md";
import { FaKeyboard } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa6";
import { FaRegCopy } from "react-icons/fa6";

import Editor from "@monaco-editor/react";

import Peer from 'peerjs';

import { useParams } from "react-router-dom";

import {
  Card,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";

const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '5000'
});

const socket = io.connect('http://localhost:5000');


function MainScreen() {

    const { id } = useParams(); 

    const uniqueId = uuidv4();
    const [userName, setUserName] = useState('');
    const [text, setText] = useState('');
    const roomId = id; // Static room ID
    const userId = uniqueId; // Use uniqueId as user ID
  
    const [myVideoStream, setMyVideoStream] = useState(null);
    const [peers, setPeers] = useState({});
    const videoGridRef = React.useRef(null);

    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [isCameraOpen, setIsCameraOpen] = useState(true)
    const [isMicOpen, setIsMicOpen] = useState(false)
    const [language, setLanguage] = useState('c');


    const [localStream, setLocalStream] = useState(null);






    // compiler change
    const [isRunning, setIsRunning] = useState(false); // Toggle between Edit and Terminal mode
  const [code, setCode] = useState(""); // Stores initial code
  const [terminalOutput, setTerminalOutput] = useState("> "); // Terminal-like output display
  const [currentInput, setCurrentInput] = useState(""); // Tracks live input in Terminal mode


  const handleRun = async () => {
    console.log("run");
    setIsRunning(true); // Switch to Terminal mode
    setTerminalOutput(`> Running... `); // Initial terminal display
    socket.emit('updateCompilerOutput', { compOut: '> Running... ', user: userName, room: roomId });


    const inputsArray = currentInput.trim().split(/\s+/);

      const updatedTerminalOutput = `${terminalOutput}\n`;

      console.log(currentInput);
      // Send code and inputs to backend
      const response = await fetch("http://localhost:5000/executeCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language,
          inputs: inputsArray, // Send each terminal input as an array
        }),
      });

      const data = await response.json();
      // const newOutput = `${updatedTerminalOutput}> ${data.output}>`;
      const newOutput = `> ${data.output}>`;
      setTerminalOutput(newOutput);
      socket.emit('updateCompilerOutput', { compOut: newOutput, user: userName, room: roomId });
      setCurrentInput(""); // Reset current input
  };


  
    useEffect(() => {
      navigator.mediaDevices.getUserMedia({ video: isCameraOpen, audio: isMicOpen }).then(stream => {
        setMyVideoStream(stream);
        addVideoStream(stream);
        setLocalStream(stream);
  
        myPeer.on('call', call => {
          call.answer(stream);
          call.on('stream', userVideoStream => {
            addVideoStream(userVideoStream, call.peer);
          });
        });

       
  
        socket.emit('ready');
  
        socket.on('userJoined', (userId, username) => {
          connectToNewUser(userId.userId, stream);
        });
      });
  
      myPeer.on('open', userId => {
        socket.emit('joinRoom', { userId, userName, room: roomId });
      });
  
      socket.on('updateText', newText => {
        setText(newText);
      });

      socket.on('updateLang', newLang => {
        setLanguage(newLang);
      });

      socket.on('updateCompilerInput', compInp => {
        setCurrentInput(compInp);
      });

      socket.on('updateCompilerOutput', compOut => {
        setTerminalOutput(compOut);
      });
  
      return () => {
        socket.off('updateText');
        socket.off('updateLang');
      };
      
    }, []);
  
    const addVideoStream = (stream, userId) => {
      const existingVideo = document.getElementById(userId);
      if (existingVideo) {
        return; // If video element already exists, do nothing
      }
  
      const video = document.createElement('video');
      Object.keys(styles.video).forEach((styleKey) => {
        video.style[styleKey] = styles.video[styleKey];
      });
      video.srcObject = stream;
      video.id = userId;
      video.addEventListener('loadedmetadata', () => {
        video.play();
      });
      videoGridRef.current.appendChild(video);
    };
  
    const connectToNewUser = (userId, stream) => {
      if (peers[userId]) {
        return; // If already connected, do nothing
      }
  
      const call = myPeer.call(userId, stream);
      call.on('stream', userVideoStream => {
        addVideoStream(userVideoStream, userId);
      });
      call.on('close', () => {
        const video = document.getElementById(userId);
        if (video) {
          video.remove();
        }
        // Remove the peer from the peers state
        setPeers(prevPeers => {
          delete prevPeers[userId];
          return { ...prevPeers };
        });
      });
  
      // Store the call object in the peers state
      setPeers(prevPeers => ({
        ...prevPeers,
        [userId]: call
      }));
    };
  
    const handleChange = (e, a) => {
      // console.log(object)
      setText(e);
      socket.emit('changeText', { text: e, user: userName, room: roomId });
    };









   



   

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
        socket.emit('updateLang', { lang: event.target.value, user: userName, room: roomId });
    };


    // onMount provides access to both editor and monaco instances
    const handleEditorDidMount = (editor, monaco) => {
        // Define a custom theme
        monaco.editor.defineTheme("myCustomTheme", {
            base: "vs-dark", // Base theme to inherit settings (use "vs-light" for light mode)
            inherit: true, // Inherit base theme settings
            rules: [],
            colors: {
                "editor.background": "#28292d10", // Custom background color

            },
        });

        // Set the custom theme
        monaco.editor.setTheme("myCustomTheme");
    };




    // compiler handlers
    const handleCompilerInput = (e) => {
      setCurrentInput(e.target.value)
      socket.emit('updateCompilerInput', { compInp: e.target.value, user: userName, room: roomId });
    }

// const videoRef = useRef(null);

//   useEffect(() => {
//     const startVideo = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//         }
//       } catch (error) {
//         console.error('Error accessing webcam:', error);
//       }
//     };

//     startVideo();
//   }, []);

    return (
        <div className="bg-[#161719] h-screen w-full">
            <div className="h-[90vh] w-full flex p-4 gap-4">

                            <div className={`${isEditorOpen ? 'w-[80%]' : 'hidden'} transition-all duration-300 ease-in-out transform h-full`}>
                            <div className="w-full h-full flex bg-[#28292d] rounded-lg">
                                <div className="w-[60%]">
                                    <Editor
                                        height="70vh"
                                        className='-pl-4'
                                        // defaultLanguage={language}
                                        language={language}
                                        value={text}
                                        theme="myCustomTheme"
                                        options={{
                                            fontSize: 18,
                                            scrollbar: {
                                                // Hide horizontal and vertical scrollbars
                                                verticalScrollbarSize: 0,
                                                horizontalScrollbarSize: 0
                                            },
                                            lineNumbersMinChars: 3,
                                            padding: {
                                                top: 15,
                                                bottom: 10,
                                                left: 5,
                                                right: 5,
                                            },
                                        }}
                                        onChange={handleChange}
                                        style={{ overflow: 'hidden' }}
                                        onMount={handleEditorDidMount}
                                    />

                                    <div className="flex justify-between py-14 px-4">
                                        <select value={language} onChange={handleLanguageChange} className="bg-[#28292d] border-2 border-gray-800 p-2 px-6 rounded text-white font-myfont-normal" name="" id="">
                                        <option value="c">C Language</option>
                                            
                                            <option value="cpp">C++</option>
                                            <option value="java">Java</option>
                                            <option value="python">Python</option>
                                        </select>

                                        <Button onClick={handleRun} className="font-myfont-normal flex items-center gap-3 capitalize rounded bg-[#548218] text-sm">
                                    <FaPlay className="text-lg" />
                                    Run
                                </Button>

                                {/* <Avatar name="John Doe" size="50" round={true} /> */}
                                        
                                    </div>
                        
                                </div>
                                <div className="w-[40%] border-l-2 border-[#ffffff05]">
                                    <p className="font-terminal-normal text-gray-800 px-4 py-2"><span className="italic">// Enter Input test cases here</span></p>
                                <textarea
                                  rows="3"
                                  cols="50"
                                  value={currentInput}
                                  onChange={handleCompilerInput}
                                  className="font-terminal-normal text-[16px] bg-[#16171950] focus:outline-none rounded mx-4 p-4 text-[#ffffff50]"
                                />

                                  <p className="font-terminal-normal text-[16px] text-gray-800 px-4 py-2"><span className="italic">// Your output</span></p>
                                        <textarea
                                          rows="10"
                                          cols="50"
                                          value={terminalOutput}
                                          readOnly
                                          className="font-terminal-normal bg-[#16171950] focus:outline-none rounded mx-4 p-4 text-[#ffffff50]"
                                        />
                                
                                </div>
                            </div>
                            </div>
                     


                <div id="video-grid" ref={videoGridRef} className={`${isEditorOpen ? 'w-[20%] grid-cols-1 gap-0' : 'w-full grid-cols-4 gap-4'} grid p-4 bg-[#28292d] rounded-lg h-full`}>
                    
                    {/* <video ref={videoRef} style={styles.video} autoPlay playsInline /> */}
                    
                </div>
            </div>
            <div className="h-[10vh] w-full">
                <div className="flex justify-center gap-4 p-4 rounded-2xl m-auto">
                  
                    <IconButton className={`rounded-full ${isCameraOpen ? 'bg-[#065cbd] text-[#ffffff]' : 'bg-[#28292d]'}`} onClick={() => toggleVideo}>
                        {isCameraOpen ? <IoVideocam className="text-lg" /> : <IoVideocamOff className="text-lg" />}
                    </IconButton>
                    <IconButton className={`rounded-full ${isMicOpen ? 'bg-[#065cbd] text-[#ffffff]' : 'bg-[#28292d]'}`} onClick={() => setIsMicOpen(!isMicOpen)}>
                        {isMicOpen ? <IoMdMic className="text-lg" /> : <IoMdMicOff className="text-lg" />}
                    </IconButton>
                    <IconButton className={`rounded-full ${isEditorOpen ? 'bg-[#065cbd] text-[#ffffff]' : 'bg-[#28292d]'}`} onClick={() => setIsEditorOpen(!isEditorOpen)}>
                        <FaKeyboard className="text-lg" />
                    </IconButton>
                    <IconButton className="rounded-full bg-[#d23325]">
                        <MdCallEnd className="text-lg" />
                    </IconButton>
                </div>
                
                <div className="mt-6 w-auto absolute bottom-4 left-4 p-3 bg-[#28292d] rounded-md flex font-myfont-normal">
                
       <span className="p-1 text-[#ffffff30]">{import.meta.env.JOIN_MEETING_URL+"/meeting/"+id}</span> <span className="p-2 ml-4 bg-[#ffffff30] rounded cursor-pointer  hover:bg-[#ffffff20]"><FaRegCopy /></span>
    </div>


                
            </div>
        </div>
    )
}


const styles = {
    video: {
      maxWidth: '100%',
      minWidth: '120px',
      borderRadius: '10px',
      boxSizing: 'border-box',
      display: 'inline-block',
      transition: 'all 0.3s ease-in-out',
    },
};



export default MainScreen




