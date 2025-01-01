const express = require('express');
const http = require('http');

// compiler change
const { spawn } = require("child_process");
const fs = require("fs");



const cors = require("cors");
const { Server } = require("socket.io");

const { v4: uuidv4 } = require('uuid');

const app = express();
const httpServer = http.createServer(app);

app.use(cors()); // Allow all origins (default setting)
app.use(express.json());

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Allow requests from this origin
        methods: ["GET", "POST"] // Allow only GET and POST requests
    }
});
const PORT = process.env.PORT || 5000;

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(httpServer, {
    debug: true
});
// const { v4: uuidV4 } = require('uuid')

app.use('/peerjs', peerServer);



io.on('connection', (socket) => {
    console.log('A user connected'); // Add this line

    // Handle joining a room with user ID, name, and room name
    socket.on('joinRoom', ({ userId, userName, room }) => {
        socket.join(room);
        console.log(`${userId} joined room ${room}`); // Add this line
        console.log('---------------------------------------------\n')

        // const uId = uuidv4();
        // Broadcast to all users in the room that a new user has joined
        // socket.to(room).emit('userJoined', { userId, userName });
        socket.on('ready', () => {
            socket.broadcast.to(room).emit('userJoined', { userId, userName });
        })
    });

    // Handle changing text within a room
    socket.on('changeText', ({ text, user, room }) => {
        io.to(room).emit('updateText', text); // Emit updateText event to all users in the room
        // console.log(`${user} changed text in room ${room}`);
    });

    // Handle changing language within a room
    socket.on('updateLang', ({ lang, user, room }) => {
        io.to(room).emit('updateLang', lang); // Emit updateText event to all users in the room
        // console.log(`${user} changed text in room ${room}`);
    });

    // Handle changing compiler input within a room
    socket.on('updateCompilerInput', ({ compInp, user, room }) => {
        io.to(room).emit('updateCompilerInput', compInp); // Emit updateText event to all users in the room
        // console.log(`${user} changed text in room ${room}`);
    });

    // Handle changing compiler output within a room
    socket.on('updateCompilerOutput', ({ compOut, user, room }) => {
        io.to(room).emit('updateCompilerOutput', compOut); // Emit updateText event to all users in the room
        // console.log(`${user} changed text in room ${room}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected'); // Add this line
    });
});



// compiler change
app.post("/executeCode", (req, res) => {

    const { text, language, inputs } = req.body;

    // Validate the code input
    if (typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ error: "Code is required" });
    }

    if (!Array.isArray(inputs)) {
        return res.status(400).json({ error: "Inputs must be an array" });
    }

    let fileName, command;

    // Set file name and command based on the language
    if (language === "python") {
        fileName = `temp.py`;
        command = "python";
    } else if (language === "java") {
        fileName = `Temp.java`;
        command = "javac"; // First compile Java
    } else {
        return res.status(400).json({ error: "Unsupported language" });
    }

    // Write the code to a file
    fs.writeFileSync(fileName, text);

    // Compile Java code if necessary
    if (language === "java") {
        const compileProcess = spawn(command, [fileName]);

        compileProcess.on("close", (code) => {
            if (code !== 0) {
                return res.status(400).json({ error: "Compilation error" });
            }

            // Execute the compiled Java code
            const execution = spawn("java", ["Temp"]);

            const inputArray = Array.isArray(inputs) ? inputs : [];

            inputArray.forEach((input) => execution.stdin.write(`${input}\n`));
            execution.stdin.end();

            let output = "";
            execution.stdout.on("data", (data) => {
                output += data.toString();
            });

            execution.stderr.on("data", (data) => {
                output += data.toString();
            });

            execution.on("close", () => {
                res.json({ output });
                cleanupFiles([fileName, "Temp.class"]); // Clean up files
            });
        });
    } else {
        // For Python
        const execution = spawn(command, [fileName]);

        inputs.forEach((input) => execution.stdin.write(`${input}\n`));
        execution.stdin.end();

        let output = "";
        execution.stdout.on("data", (data) => {
            output += data.toString();
        });

        execution.stderr.on("data", (data) => {
            output += data.toString();
        });

        execution.on("close", () => {
            res.json({ output });
            fs.unlinkSync(fileName); // Clean up
        });
    }
});

// Helper function to clean up files
function cleanupFiles(files) {
    files.forEach(file => {
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
    });
}

app.get("/", (req, res) => {
    res.send("Welcome to the Collax Server!");
});


httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
