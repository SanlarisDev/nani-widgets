/**
 * ##########################
 * Widget Purple Chat
 * 
 * 🎨Design by @sayonanii []
 * 💻Develop by @sanlaris_game []
 * 
 * ¡¡Thanks for support us💖!! 
 * ##########################
 */

 let FieldData = {}
 let Widget = {
   container: $(".widget__right--wrapper"),
   pronouns: [],
   pronounsCache: [],
   totalMessages: 0,
   messagesLimit: 0,
   removeSelector: null,
   additon: null,
   hideCommands: [],
   ignoredUsers: [],
   animationIn: 'fadeInUp',
   animationOut: 'fadeOutUp'
 }
 
 /** Pronouns */
 const PRONOUNS_API_BASE = 'https://pronouns.alejo.io/api'
 const PRONOUNS_API = {
   user: username => `${PRONOUNS_API_BASE}/users/${username}`,
   pronouns: `${PRONOUNS_API_BASE}/pronouns`,
 }
 
 window.addEventListener('onWidgetLoad', async function(obj) {
     FieldData = obj.detail.fieldData;
     
     //Default
     FieldData.fontName = FieldData.fontName ?? "Baloo Bhai 2";
     FieldData.fontSizeLabel = FieldData.fontSizeLabel ?? 16;
     FieldData.fontSizeMessage = FieldData.fontSizeMessage ?? 14;
     FieldData.colorPrimary = FieldData.colorPrimary ?? "#aa89ff";
     FieldData.colorSecondary = FieldData.colorSecondary ?? "#0f101d";
     FieldData.foncolorMessageName = FieldData.colorMessage ?? "#ffffff";
     FieldData.thiknessLine = FieldData.thiknessLine ?? 2;
     FieldData.heightLine = FieldData.heightLine ?? 15;
     FieldData.showBudges = FieldData.showBudges ?? "true";
     FieldData.showPronouns = FieldData.showPronouns ?? "true";
     FieldData.timeMessages = FieldData.timeMessages ?? 60;
     Widget.messagesLimit = FieldData.messagesLimit ?? 20;
 
     if (FieldData.showPronouns) {
       await getPronouns();
     }
 
     Widget.removeSelector = ".purpleChat-bubble:nth-last-child(n+" + (Widget.messagesLimit + 1) + ")";
 });
 
 window.addEventListener('onEventReceived', async function(obj) {
     console.log(obj);
     const { event, listener } = obj.detail;
     const { data } = event;
 
     const actionMessage = {
         "delete-message": () => $(`.purpleChat-bubble[data-msgid=${event.msgId}]`).remove(),
         "delete-messages": () => $(`.purpleChat-bubble[data-sender=${event.userId}]`).remove(),
     }
 
     if (listener !== "message") {
       actionMessage[listener]();
       return;
     };
 
     let userName = data.displayName;
     let userMessage = event.renderedText;
 
    await addMessage(userName, userMessage, data.isAction, data.userId, data.msgId, data);
 });
 
 /** ----------------------------
  *   Format Message
  * ----------------------------*/
 
 async function addMessage(username, message, isAction, uid, msgId, data) {
     Widget.totalMessages += 1;
 
     let userBadge = FieldData.showBudges === 'true' ? 
     data.badges.map(badge => 
       `<img alt="${badge.type}" src="${badge.url}" class="badge">`
       ).join("")
       : "";
 
   let pronoun = FieldData.showPronouns === 'true' ? await getUserPronoun(username) : "";
   let userPronoun = pronoun ? " | " + pronoun : "";
     
     let actionClass = ""; // /me and actions
     if (isAction) {
         actionClass = "action";
     }

     const element =`
     <div data-sender="${uid}" data-msgid="${msgId}" 
            id="msg-${Widget.totalMessages}" 
            class="${Widget.animationIn} animated bubble">
     <div class="bubble__title">
         <span class="bubble__title--decoration">
             <svg id="svg-lines" xmlns="http://www.w3.org/2000/svg">
                 <path class="svg-lines"
                     d="M8.16,10.23v3.14c-.01,.48-.4,.86-.88,.87h-.18c-.48,0-.86-.38-.86-.86v-3.14c.01-.48,.4-.86,.88-.87h.18c.48,0,.86,.38,.86,.86Z" />
                 <path class="svg-lines"
                     d="M13.44,8.1h-3.23c-.48,.01-.86-.37-.86-.85v-.22c0-.48,.39-.86,.87-.87h3.23c.48-.01,.86,.37,.86,.85v.22c0,.48-.39,.86-.87,.87Z" />
                 <path class="svg-lines"
                     d="M6.28,4.12V.93c0-.48,.39-.87,.87-.87h.18c.48,0,.87,.39,.87,.87v3.19c0,.48-.39,.87-.87,.87h-.18c-.48,0-.87-.39-.87-.87Z" />
                 <path class="svg-lines"
                     d="M.93,6.26h3.28c.48,0,.87,.39,.87,.87v.22c0,.48-.39,.87-.87,.87H.93c-.48,0-.87-.39-.87-.87v-.22c0-.48,.39-.87,.87-.87Z" />
             </svg>
         </span>
         <span class="bubble__tittle--badges">
            ${userBadge}
         </span>
         <span class="bubble__tittle--label ${actionClass}">${username} ${userPronoun}</span>
     </div>
     <div class="bubble__message ${actionClass}" >
        ${message}
     </div>
 </div>
 `;
   
   $(element).appendTo(Widget.container).delay(FieldData.timeMessages * 1000);
 	console.log(Widget);
     if (Widget.totalMessages > Widget.messagesLimit) {
       $(Widget.removeSelector).length && $(Widget.removeSelector).remove();
   }
 }
 
 /** ----------------------------
  *   Pronouns API Functions
  * ----------------------------*/
   async function getPronouns() {
     const res = await get(PRONOUNS_API.pronouns)
     if (res) {
       res.forEach(pronoun => {
         Widget.pronouns[pronoun.name] = pronoun.display
       })
     }
   }
 
   async function getUserPronoun(username) {
     const lowercaseUsername = username.toLowerCase()
     let pronouns = Widget.pronounsCache[lowercaseUsername]
   
     if (!pronouns || pronouns.expire < Date.now()) {
       const res = await get(PRONOUNS_API.user(lowercaseUsername))
       const [newPronouns] = res
       Widget.pronounsCache[lowercaseUsername] = {
         ...newPronouns,
         expire: Date.now() + 1000 * 60 * 5,
       }
       pronouns = Widget.pronounsCache[lowercaseUsername]
     }
   
     if (!pronouns.pronoun_id) {
       return null
     }
   
     return Widget.pronouns[pronouns.pronoun_id]
   }
 
     // ---------------------
   //    Helper Functions
   // ---------------------
   async function get(URL) {
     return await fetch(URL)
       .then(async res => {
         if (!res.ok) return null
         return res.json()
       })
       .catch(error => null)
   }
