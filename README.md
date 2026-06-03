# 📚 Flashy - Révisions de reconnaissances végétales
**Référentiel CAP Fleuriste 2026**

Flashy est une application web de fiches révisions facile d'utilisation basée sur l’**algorithme de répétition espacée SM-2** pour améliorer la mémorisation sur le long terme.

**Tout** le référentiel de reconnaissance végétale du **CAP Fleuriste 2026** est présent de base dans l'application.

---
### Comment fonctionne l'application ?

Simple et efficace, Flashy vous aide à apprendre et mémoriser du contenu grâce à des "fiches révisions" (flashcards), en utilisant un système de répétition scientifiquement reconnu. Elle s’adapte à vos performances pour afficher les cartes au bon moment.

👉 **Accéder à l’application ici :** https://maxencemillot.github.io/Flashy/

### 🧠 C'est quoi le SM-2 ?
Le **SM-2** est un algorithme qui permet de cibler votre apprentissage sur les cartes où vous avez des difficultés. Pour chaque carte, vous pouvez choisir si vous connaissiez la réponse : "_totalement_", "_un peu_" ou "_pas du tout_". Les cartes les moins maîtrisées auront plus de chance de vous être proposées pour travailler efficacement vos lacunes.

---

## ✨ Fonctionnalités

- 🪽 **Rapide et léger** - pas besoin de compte ou de téléchargement !
- 🖼️ **+1000 images de végétaux** pour les reconnaitre sous tous les angles
- 🔀 **Fusionnez et mélangez les cartes** pour des sessions flexibles  
- 📖 **Répétition espacée (algorithme SM-2)** pour un apprentissage optimisé
- 📱 **Application mobile offline** pour réviser en toute circonstance !
- 🐛 **Bouton pour signaler des bugs** ou des erreurs sur les cartes

**en cours...**
- 🚀 **Améliorations du préchargement des images** et de l'algorithme

**à venir...**
- 📖 **Session d'étude suivie et barre de progression** pour des séances efficaces et regulières 
- ⚙️ **Sessions d’étude personnalisables** pour customiser vos sessions
- 🗂️ **Ajoutez vos propre cartes et créez vos propre decks**  
- 📊 **Suivi de progression et statistiques** pour visualiser les cartes les moins maîtrisées et admirer son score !
- 📤 **Export** pour récupérer vos cartes et les partager
- 🪴 **UI 2.0** - refonte complète de l'interface et identité visuelle

**Prévu**
- 🚨 Notifications et rappels
- 🎮 Gamification

---

## 🧑‍💻 Aperçu Technique

### 🏗️ Stack
- HTML
- CSS
- Javascript
- PWA app
- python (for developement purpose)

---

### ⚙️ Fonctionnement

#### 📐 Algorithme SM-2

L’application utilise l’**algorithme SM-2**, développé à l’origine pour les systèmes de répétition espacée de type "flash cards" (fiches révisions).

Chaque carte possède :
- **Facteur de facilité (EF)** – niveau de difficulté perçu  
- **Intervalle** – délai avant la prochaine révision  
- **Nombre de répétitions**

Selon votre réponse (ex : “Raté”, “Presque”, “Correct”), le système :
1. Met à jour le facteur de facilité  
2. Ajuste l’intervalle  
3. Planifie la prochaine révision  

Ainsi, les cartes difficiles reviennent plus souvent, tandis que les plus faciles sont espacées.

---

## 🫶 Contribution

Les retours et idées sont les bienvenus !
