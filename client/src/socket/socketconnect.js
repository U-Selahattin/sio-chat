import { io } from 'socket.io-client';

// connexion au serveur socket.io
// on prend l'ip de la page automatiquement pour pas avoir a la changer a chaque fois
const host = window.location.hostname;
export const socket = io('http://' + host + ':3000');
