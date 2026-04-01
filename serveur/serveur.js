// On importe le module "http" de Node.js pour créer un serveur web basique
import { createServer } from "http";

// On importe la classe Server de socket.io pour gérer les WebSockets
import { Server } from "socket.io";

// On crée d'abord un serveur HTTP classique (nécessaire pour que Socket.IO fonctionne)
const httpServer = createServer();

// On crée le serveur Socket.IO en l'attachant au serveur HTTP
// cors: "*" signifie qu'on accepte les connexions depuis n'importe quelle adresse (utile en dev)
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

// On écoute l'événement "connection" : il se déclenche à chaque fois qu'un client se connecte
io.on('connection', (socket) => {
    console.log('Un utilisateur viens de se connecter');

    // L'événement "set pseudo" est envoyé par le client quand il choisit son pseudo
    // On stocke le pseudo dans l'objet socket pour pouvoir l'utiliser ensuite
    socket.on('set pseudo', (pseudo) => {
        socket.pseudo = pseudo;
        console.log(`Pseudo enregistré : ${pseudo}`);
    });

    // L'événement "chat message" est envoyé par le client quand il envoie un message
    // Le serveur le reçoit, puis le rediffuse à TOUS les clients connectés avec io.emit
    socket.on('chat message', (msg) => {
        // Si le client n'a pas de pseudo, on utilise son identifiant unique (socket.id)
        const auteur = socket.pseudo || socket.id;
        console.log(`${auteur} : ${msg}`);

        // On renvoie le message à tous les clients sous forme d'objet { auteur, texte }
        io.emit('chat message', { auteur, texte: msg });
    });

    // L'événement "disconnect" se déclenche quand un client se déconnecte
    socket.on('disconnect', () => {
        const auteur = socket.pseudo || socket.id;
        console.log(`${auteur} vient de se déconnecter`);
    });
});

// On définit le port d'écoute (3000 par défaut)
// process.env.PORT permet de changer le port via une variable d'environnement si besoin
const PORT = process.env.PORT || 3000;

// On démarre le serveur sur ce port
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
