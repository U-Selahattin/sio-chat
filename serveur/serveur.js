import { createServer } from "http";
import { Server } from "socket.io";

// creation du serveur http et socket.io
const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

// quand un utilisateur se connecte
io.on('connection', (socket) => {
    console.log('un user vient de se co');

    // reception du pseudo choisi par le client
    socket.on('set pseudo', (pseudo) => {
        socket.pseudo = pseudo;
        console.log('pseudo recu : ' + pseudo);
    });

    // quand le serveur recoit un message il le renvoie a tout le monde
    socket.on('chat message', (msg) => {
        let auteur = socket.pseudo;
        if (!auteur) {
            auteur = socket.id;
        }
        console.log(auteur + ' dit : ' + msg);
        io.emit('chat message', { auteur: auteur, texte: msg });
    });

    // quand quelqu'un se deconnecte
    socket.on('disconnect', () => {
        console.log('un user vient de se deco');
    });
});

// on demarre le serveur sur le port 3000
const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log('serveur lance sur le port ' + PORT);
});
