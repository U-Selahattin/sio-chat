<template>
  <div class="container">

    <!-- page pour choisir son pseudo -->
    <div v-if="!connecte" class="page-pseudo">
      <h1>💬 SioChat</h1>
      <p class="sous-titre">Application de chat en temps réel</p>
      <form @submit.prevent="rejoindre" class="formulaire-pseudo">
        <input v-model="pseudoSaisi" type="text" placeholder="Entrez votre pseudo..." />
        <button type="submit">Rejoindre le chat</button>
      </form>
    </div>

    <!-- page du chat -->
    <div v-else>
      <div class="entete">
        <h1>💬 SioChat</h1>
        <span class="badge-pseudo">{{ monPseudo }}</span>
      </div>

      <!-- liste des messages -->
      <ul id="liste-messages" ref="listeRef">
        <li v-for="(msg, i) in listeMsgs" :key="i" :class="msg.auteur === monPseudo ? 'moi' : 'autre'">
          <span class="auteur">{{ msg.auteur }}</span>
          <span class="texte">{{ msg.texte }}</span>
        </li>
      </ul>

      <!-- formulaire envoi -->
      <form @submit.prevent="envoyerMessage" class="formulaire-chat">
        <input v-model="msgSaisi" type="text" placeholder="Votre message..." autocomplete="off" />
        <button type="submit">Envoyer</button>
      </form>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { socket } from './socket/socketconnect';

export default {
  name: 'App',
  setup() {

    // variables
    const pseudoSaisi = ref('');
    const monPseudo = ref('');
    const connecte = ref(false);
    const msgSaisi = ref('');
    const listeMsgs = ref([]);
    const listeRef = ref(null);

    // quand on clique sur rejoindre
    function rejoindre() {
      if (pseudoSaisi.value == '') return;
      monPseudo.value = pseudoSaisi.value;
      socket.emit('set pseudo', monPseudo.value);
      connecte.value = true;
    }

    // quand on envoie un message
    function envoyerMessage() {
      if (msgSaisi.value == '') return;
      socket.emit('chat message', msgSaisi.value);
      msgSaisi.value = '';
    }

    // quand on recoit un message du serveur on l'ajoute a la liste
    onMounted(() => {
      socket.on('chat message', (msg) => {
        listeMsgs.value.push(msg);
        // scroll automatique vers le bas
        nextTick(() => {
          if (listeRef.value) {
            listeRef.value.scrollTop = listeRef.value.scrollHeight;
          }
        });
      });
    });

    onUnmounted(() => {
      socket.off('chat message');
    });

    return {
      pseudoSaisi,
      monPseudo,
      connecte,
      msgSaisi,
      listeMsgs,
      listeRef,
      rejoindre,
      envoyerMessage
    };
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #e8edf3;
  font-family: Arial, sans-serif;
}

.container {
  width: 550px;
  margin: 40px auto;
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 5px;
}

/* --- page pseudo --- */
.page-pseudo {
  text-align: center;
}

.sous-titre {
  color: #888;
  margin-bottom: 25px;
  font-size: 14px;
}

.formulaire-pseudo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.formulaire-pseudo input {
  width: 280px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 15px;
}

/* --- entete chat --- */
.entete {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
}

.badge-pseudo {
  background-color: #4a90e2;
  color: white;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
}

/* --- liste messages --- */
#liste-messages {
  list-style: none;
  border: 1px solid #ddd;
  border-radius: 5px;
  height: 320px;
  overflow-y: auto;
  padding: 10px;
  margin-bottom: 12px;
  background-color: #f9f9f9;
}

#liste-messages li {
  padding: 7px 10px;
  border-radius: 5px;
  margin-bottom: 6px;
}

#liste-messages li.autre {
  background-color: #fff;
  border: 1px solid #eee;
}

/* mes messages en bleu */
#liste-messages li.moi {
  background-color: #d6eaff;
  border: 1px solid #b3d4f5;
}

.auteur {
  font-weight: bold;
  color: #4a90e2;
  margin-right: 8px;
}

.texte {
  color: #333;
}

/* --- formulaire chat --- */
.formulaire-chat {
  display: flex;
  gap: 8px;
}

.formulaire-chat input {
  flex: 1;
  padding: 9px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

button {
  padding: 9px 18px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background-color: #357abd;
}
</style>
