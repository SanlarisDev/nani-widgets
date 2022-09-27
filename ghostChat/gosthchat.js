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
   container: $(".purpleChat"),
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
     const element = $.parseHTML(`
     <div data-sender="${uid}" data-msgid="${msgId}" id="msg-${Widget.totalMessages}" class=" ${Widget.animationIn} animated purpleChat-bubble">
     <div class="headerBubble">
       <div class="headerBubble-icon">
       <svg id="star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5.63 5.3"><path class="star" d="M3.11,.22l.62,1.31c.03,.09,.11,.15,.21,.15l1.38,.16c.21,0,.3,.28,.13,.4l-1,1.1c-.08,.06-.11,.15-.08,.25l.24,1.35c.06,.2-.16,.38-.33,.25l-1.17-.67c-.08-.06-.32-.07-.41,0l-1.24,.67c-.17,.13-.4-.04-.33-.25l.2-1.33c.03-.09,0-.19-.08-.25L.29,2.26c-.17-.13-.08-.4,.13-.4l1.36-.18c.09,0,.18-.06,.21-.15L2.69,.22c.06-.2,.35-.2,.41,0Z" /></svg>
       </div>
       <div class="headerBubble-separator">
   </div>
     </div>
     <div class="bodyBubble">
       <div ${actionClass} class="bodyBubble-label">
         <span class="bodyBubble-label__badges">
         ${userBadge}
         </span>
         <span class="bodyBubble-label__username">${username}${userPronoun}</span>
 
       </div>
       <div class="bodyBubble-message ${actionClass}">
           <div class="bodyBubble-message__text">
           ${message}
           </div>
           <div class="bodyBubble-message__decoration">
           <svg id="star2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.78 16.96">
             <path class="star" 
                         d="M12.61,1.89l1.59-1.3c.37-.3,.92-.05,.93,.42l.07,2.03c0,.19,.11,.36,.27,.46l1.72,1.09c.4,.25,.34,.86-.11,1.02l-1.93,.7c-.18,.06-.31,.21-.36,.39l-.52,1.98c-.12,.46-.71,.58-1,.21l-1.27-1.61c-.12-.15-.3-.23-.48-.22l-2.05,.13c-.47,.03-.77-.5-.51-.89l1.14-1.69c.11-.16,.13-.35,.06-.53l-.75-1.89c-.17-.44,.23-.89,.69-.76l1.98,.56c.18,.05,.37,.01,.52-.11Z"/>
                 <g id="dot1">
                   <path  class="dot1"  
                               d="M.93,3.8c-.36,0-.65,.29-.65,.65s.29,.65,.65,.65,.65-.29,.65-.65-.29-.65-.65-.65Z"/>
                 </g>
                 <g id="dot2">
                   <path class="dot2" 
                               d="M17.59,14.85c-.51,0-.92,.41-.92,.92s.41,.92,.92,.92,.92-.41,.92-.92-.41-.92-.92-.92Z"/>
                 </g>
           </svg>
           </div>
       </div>
     </div>
   </div>`);
   
   $(element).appendTo(Widget.container).delay(FieldData.timeMessages * 1000);
 
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
