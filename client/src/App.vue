<template>
  <div class="container">

    <!-- page pour choisir son pseudo -->
    <div v-if="!connecte">
      <h1>SioChat</h1>
      <form @submit.prevent="rejoindre">
        <p>Entrez votre pseudo :</p>
        <input v-model="pseudoSaisi" type="text" placeholder="Votre pseudo..." />
        <br>
        <button type="submit">Rejoindre</button>
      </form>
    </div>

    <!-- page du chat -->
    <div v-else>
      <h1>SioChat - {{ monPseudo }}</h1>

      <!-- affichage des messages -->
      <ul id="liste-messages">
        <li v-for="(msg, i) in listeMsgs" :key="i" :class="msg.auteur === monPseudo ? 'moi' : ''">
          <b>{{ msg.auteur }}</b> : {{ msg.texte }}
        </li>
      </ul>

      <!-- formulaire envoi message -->
      <form @submit.prevent="envoyerMessage">
        <input v-model="msgSaisi" type="text" placeholder="Votre message..." autocomplete="off" />
        <button type="submit">Envoyer</button>
      </form>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
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

    // quand on clique sur rejoindre
    function rejoindre() {
      if (pseudoSaisi.value == '') return;
      monPseudo.value = pseudoSaisi.value;
      // on envoie le pseudo au serveur
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
      rejoindre,
      envoyerMessage
    };
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background-color: #f0f0f0;
}

.container {
  width: 500px;
  margin: 50px auto;
  background-color: white;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

h1 {
  text-align: center;
}

input {
  padding: 8px;
  width: 70%;
  margin-right: 5px;
}

button {
  padding: 8px 15px;
  background-color: #4a90e2;
  color: white;
  border: none;
  cursor: pointer;
}

#liste-messages {
  list-style: none;
  padding: 0;
  border: 1px solid #ddd;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 10px;
}

#liste-messages li {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

/* messages envoyes par moi en bleu */
#liste-messages li.moi {
  background-color: #d0e8ff;
}
</style>
