<template>
  <div class="chat-container">

    <!--
      On affiche l'écran de choix du pseudo TANT QUE pseudoConfirme est false.
      Dès que l'utilisateur valide son pseudo, on bascule sur l'écran du chat.
    -->
    <div v-if="!pseudoConfirme" class="pseudo-screen">
      <h1>SioChat</h1>
      <form @submit.prevent="confirmerPseudo" class="pseudo-form">
        <label for="pseudo-input">Choisissez votre pseudo</label>
        <!-- v-model lie la valeur de l'input à la variable "pseudoSaisie" en temps réel -->
        <input
          id="pseudo-input"
          v-model="pseudoSaisie"
          type="text"
          placeholder="Ex : Jean, Alice..."
          autocomplete="off"
          class="pseudo-input"
          autofocus
        />
        <button type="submit" class="chat-btn">Rejoindre le chat</button>
      </form>
    </div>

    <!-- Écran du chat, affiché une fois le pseudo validé -->
    <div v-else>
      <!-- On affiche le pseudo de l'utilisateur dans le titre -->
      <h1>SioChat <span class="pseudo-badge">{{ pseudo }}</span></h1>

      <!--
        Liste des messages reçus.
        v-for parcourt le tableau "messages" et affiche chaque message.
        La classe "message-moi" est ajoutée si le message vient de l'utilisateur courant.
      -->
      <ul class="messages-list" ref="listRef">
        <li
          v-for="(msg, index) in messages"
          :key="index"
          class="message-item"
          :class="{ 'message-moi': msg.auteur === pseudo }"
        >
          <!-- On affiche le nom de l'auteur en gras, puis le texte du message -->
          <span class="message-auteur">{{ msg.auteur }}</span>
          <span class="message-texte">{{ msg.texte }}</span>
        </li>
      </ul>

      <!-- Formulaire d'envoi de message -->
      <!-- @submit.prevent empêche le rechargement de la page à la soumission du formulaire -->
      <form @submit.prevent="sendMessage" class="chat-form">
        <input
          v-model="message"
          type="text"
          placeholder="Votre message..."
          autocomplete="off"
          class="chat-input"
        />
        <button type="submit" class="chat-btn">Envoyer</button>
      </form>
    </div>

  </div>
</template>

<script>
// On importe les fonctions Vue dont on a besoin
// ref : pour créer des variables réactives (la vue se met à jour automatiquement)
// nextTick : pour exécuter du code après que Vue a mis à jour le DOM
// onMounted / onUnmounted : cycle de vie du composant (équivalent de useEffect en React)
import { ref, nextTick, onMounted, onUnmounted } from 'vue';

// On importe la connexion Socket.IO depuis notre fichier dédié
import { socket } from './socket/socketconnect';

export default {
  name: 'App',

  setup() {
    // --- Variables réactives ---

    // pseudo : le pseudo définitif de l'utilisateur (après validation)
    const pseudo = ref('');

    // pseudoSaisie : ce que l'utilisateur tape dans le champ pseudo (avant validation)
    const pseudoSaisie = ref('');

    // pseudoConfirme : booléen qui contrôle quel écran on affiche (pseudo ou chat)
    const pseudoConfirme = ref(false);

    // message : le texte en cours de saisie dans le champ message
    const message = ref('');

    // messages : tableau qui stocke tous les messages reçus pour les afficher
    const messages = ref([]);

    // listRef : référence vers l'élément <ul> pour pouvoir le faire défiler automatiquement
    const listRef = ref(null);


    // --- Fonctions ---

    // confirmerPseudo : appelée quand l'utilisateur valide son pseudo
    function confirmerPseudo() {
      // On vérifie que le champ n'est pas vide
      if (pseudoSaisie.value.trim() === '') return;

      // On enregistre le pseudo
      pseudo.value = pseudoSaisie.value.trim();

      // On envoie le pseudo au serveur via Socket.IO pour qu'il le mémorise
      socket.emit('set pseudo', pseudo.value);

      // On bascule sur l'écran du chat
      pseudoConfirme.value = true;
    }

    // sendMessage : appelée quand l'utilisateur envoie un message
    function sendMessage() {
      // On ne fait rien si le message est vide
      if (message.value.trim() === '') return;

      // On envoie le message au serveur via l'événement "chat message"
      socket.emit('chat message', message.value);

      // On vide le champ de saisie
      message.value = '';
    }


    // --- Cycle de vie ---

    // onMounted : s'exécute quand le composant est chargé dans la page
    onMounted(() => {
      // On écoute l'événement "chat message" envoyé par le serveur
      // À chaque message reçu, on l'ajoute dans le tableau "messages"
      socket.on('chat message', (msg) => {
        messages.value.push(msg);

        // nextTick attend que Vue ait mis à jour le DOM, puis on fait défiler la liste vers le bas
        nextTick(() => {
          if (listRef.value) {
            listRef.value.scrollTop = listRef.value.scrollHeight;
          }
        });
      });
    });

    // onUnmounted : s'exécute quand le composant est retiré de la page
    // On arrête d'écouter l'événement pour éviter les doublons
    onUnmounted(() => {
      socket.off('chat message');
    });

    // On expose les variables et fonctions au template HTML
    return {
      pseudo,
      pseudoSaisie,
      pseudoConfirme,
      message,
      messages,
      listRef,
      confirmerPseudo,
      sendMessage,
    };
  },
};
</script>

<style scoped>
/* Conteneur principal centré sur la page */
.chat-container {
  max-width: 600px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
  padding: 0 16px;
}

h1 {
  text-align: center;
  color: #333;
}

/* --- Écran de choix du pseudo --- */
.pseudo-screen {
  margin-top: 80px;
  text-align: center;
}

.pseudo-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.pseudo-form label {
  font-size: 16px;
  color: #555;
}

.pseudo-input {
  padding: 10px 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 15px;
  width: 260px;
}

/* Badge bleu qui affiche le pseudo de l'utilisateur dans le titre */
.pseudo-badge {
  font-size: 14px;
  background: #4a90e2;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  margin-left: 8px;
  vertical-align: middle;
}

/* --- Liste des messages --- */
.messages-list {
  list-style: none;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto; /* Défilement vertical si trop de messages */
  margin-bottom: 16px;
  background: #f9f9f9;
}

/* Style par défaut d'un message */
.message-item {
  padding: 6px 10px;
  border-radius: 4px;
  margin-bottom: 4px;
  font-size: 14px;
  color: #444;
  background: #fff;
  border: 1px solid #eee;
}

/* Les messages envoyés par l'utilisateur courant sont mis en bleu clair */
.message-moi {
  background: #dff0ff;
  border-color: #b3d9f7;
}

/* Nom de l'auteur en bleu et en gras */
.message-auteur {
  font-weight: bold;
  margin-right: 8px;
  color: #4a90e2;
}

.message-texte {
  color: #333;
}

/* --- Formulaire d'envoi --- */
.chat-form {
  display: flex;
  gap: 8px;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.chat-btn {
  padding: 8px 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.chat-btn:hover {
  background-color: #357abd;
}
</style>
