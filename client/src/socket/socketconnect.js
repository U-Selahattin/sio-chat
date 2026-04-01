// On importe la fonction "io" depuis la bibliothèque socket.io-client
import { io } from 'socket.io-client';

// On récupère automatiquement l'adresse de la machine qui sert la page
// Comme ça peu importe l'IP du réseau, ça marche toujours
const host = window.location.hostname;

// On crée la connexion Socket.IO vers le serveur Node.js sur le port 3000
export const socket = io(`http://${host}:3000`);
