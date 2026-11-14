"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[498],{168:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.css=void 0,t.css=e=>`
${e} * {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  -ms-overflow-style: none; 
  scrollbar-width: none; 
  color: #fff;
}

${e} *::-webkit-scrollbar { 
  display: none;
}

${e} p,
${e} h1,
${e} h2,
${e} h3,
${e} h4,
${e} h5,
${e} h6 {
  margin: 0;
}

${e} .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100000000;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    transition: opacity 0.2s ease-in-out;
}

@media (max-width: 600px) {
  ${e} .modal-container {
    justify-content: flex-end;
  }
}

${e} .modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  max-width: 420px;
  max-height: 615px;
  width: 100%;
  border-radius: 24px;
  background: #0d0d0d;
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease-in-out;
}

@media (max-width: 600px) {
  ${e} .modal-content {
    max-width: 100%;
    width: 100%;
    max-height: 80%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border: none;
    border-top: 1.5px solid rgba(255, 255, 255, 0.1);
  }
}


${e} .modal-header {
  display: flex;
  padding: 16px;
  gap: 16px;
  align-self: stretch;
  align-items: center;
  justify-content: center;
  position: relative;
}

${e} .modal-header button {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

${e} .modal-header button:hover {
  background: rgba(255, 255, 255, 0.04);
}
  
${e} .modal-header p {
  color: #fff;
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  margin: 0;
}


${e} .modal-body {
  display: flex;
  padding: 16px;
  flex-direction: column;
  align-items: flex-start;
  text-align: center;
  gap: 8px;
  overflow: auto;

  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  width: 100%;
  flex: 1;
}

${e} .modal-body textarea {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: #0d0d0d;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
  outline: none;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
  font-family: monospace;
  font-size: 12px;
}

${e} .modal-body button {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  color: #000;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
  margin-top: 16px;
}

${e} .footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;
  color: #fff;
  gap: 12px;
}

${e} .modal-body p {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.8px;
}

${e} .footer img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

${e} .get-wallet-link {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  margin-left: auto;
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  cursor: pointer;
}
  
${e} .get-wallet-link:hover {
  color: rgba(255, 255, 255, 1);
}


${e} .connect-item {
  display: flex;
  padding: 8px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  cursor: pointer;

  transition: background 0.2s ease-in-out;
  border-radius: 24px;
}

${e} .connect-item img {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  object-fit: cover;
  flex-shrink: 0;
}

${e} .connect-item-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  flex: 1;
  margin-top: -2px;
}

${e} .connect-item-info .wallet-address {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

${e} .connect-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

${e} .connect-item img {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  object-fit: cover;
}

${e} .connect-item p {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.36px;
  margin: 0;
}
`},560:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.NearWalletsPopup=void 0;let o=n(3277),a=n(4689),r=n(3224),s={id:"custom-wallet",name:"Custom Wallet",icon:"https://www.mynearwallet.com/images/webclip.png",description:"Custom wallet for NEAR.",website:"",version:"1.0.0",executor:"your-executor-url.js",type:"sandbox",platform:{},features:{signMessage:!0,signInWithoutAddKey:!0,signInAndSignMessage:!0,signAndSendTransaction:!0,signAndSendTransactions:!0,signDelegateActions:!0},permissions:{storage:!0,allowsOpen:[]}};class i extends r.Popup{delegate;constructor(e){super(e),this.delegate=e,this.update({wallets:e.wallets,showSettings:!1})}handlers(){super.handlers(),this.addListener(".settings-button","click",()=>this.update({showSettings:!0})),this.addListener(".back-button","click",()=>this.update({showSettings:!1})),this.root.querySelectorAll(".connect-item").forEach(e=>{e instanceof HTMLDivElement&&this.addListener(e,"click",()=>this.delegate.onSelect(e.dataset.type))}),this.root.querySelectorAll(".remove-wallet-button").forEach(e=>{e instanceof SVGSVGElement&&this.addListener(e,"click",async t=>{t.stopPropagation(),await this.delegate.onRemoveDebugManifest(e.dataset.type);let n=this.state.wallets.filter(t=>t.id!==e.dataset.type);this.update({wallets:n})})}),this.addListener(".add-debug-manifest-button","click",async()=>{try{let e=this.root.querySelector("#debug-manifest-input")?.value??"",t=await this.delegate.onAddDebugManifest(e);this.update({showSettings:!1,wallets:[t,...this.state.wallets]})}catch(e){alert(`Something went wrong: ${e}`)}})}create(){super.create({show:!0})}walletDom(e){let t=(0,o.html)`
      <svg
        class="remove-wallet-button"
        data-type="${e.id}"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style="margin-right: 4px;"
      >
        <path d="M18 6L6 18" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6 6L18 18" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `;return(0,o.html)`
      <div class="connect-item" data-type="${e.id}">
        <img style="background: #333" src="${e.icon}" alt="${e.name}" />
        <div class="connect-item-info">
          <span>${e.name}</span>
          <span class="wallet-address">${(0,a.parseUrl)(e.website)?.hostname}</span>
        </div>
        ${e.debug?t:""}
      </div>
    `}get footer(){if(!this.delegate.footer)return"";let{icon:e,heading:t,link:n,linkText:a}=this.delegate.footer;return(0,o.html)`
      <div class="footer">
        ${e?(0,o.html)`<img src="${e}" alt="${t}" />`:""}
        <p>${t}</p>
        <a class="get-wallet-link" href="${n}" target="_blank">${a}</a>
      </div>
    `}get dom(){return this.state.showSettings?(0,o.html)`
        <div class="modal-container">
          <div class="modal-content">
            <div class="modal-header">
              <button class="back-button" style="left: 16px; right: unset;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <p>Settings</p>
            </div>

            <div class="modal-body">
              <p style="text-align: left;">
                You can add your wallet to dapp for debug,
                <a href="https://github.com/azbang/hot-connector" target="_blank">read the documentation.</a> Paste your manifest and click "Add".
              </p>

              <textarea style="width: 100%;" id="debug-manifest-input" rows="10">${JSON.stringify(s,null,2)}</textarea>
              <button class="add-debug-manifest-button">Add</button>
            </div>

            ${this.footer}
          </div>
        </div>
      `:(0,o.html)`<div class="modal-container">
      <div class="modal-content">
        <div class="modal-header">
          <p>Select wallet</p>
          <button class="settings-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="19" cy="12" r="2" fill="rgba(255,255,255,0.5)" />
              <circle cx="5" cy="12" r="2" fill="rgba(255,255,255,0.5)" />
            </svg>
          </button>
        </div>

        <div class="modal-body">${this.state.wallets.map(e=>this.walletDom(e))}</div>

        ${this.footer}
      </div>
    </div>`}}t.NearWalletsPopup=i},2290:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0});class n{dbName;storeName;version;constructor(e,t){this.dbName=e,this.storeName=t,this.version=1}getDb(){return new Promise((e,t)=>{if("undefined"==typeof window||"undefined"==typeof indexedDB)return void t(Error("IndexedDB is not available (SSR environment)"));let n=indexedDB.open(this.dbName,this.version);n.onerror=e=>{console.error("Error opening database:",e.target.error),t(Error("Error opening database"))},n.onsuccess=t=>{e(n.result)},n.onupgradeneeded=e=>{let t=n.result;t.objectStoreNames.contains(this.storeName)||t.createObjectStore(this.storeName)}})}async getItem(e){let t=await this.getDb();if("number"==typeof e&&(e=e.toString()),"string"!=typeof e)throw Error("Key must be a string");return new Promise((n,o)=>{if(!this.storeName)return void o(Error("Store name not set"));let a=t.transaction(this.storeName,"readonly");a.onerror=e=>o(a.error);let r=a.objectStore(this.storeName).get(e);r.onerror=e=>o(r.error),r.onsuccess=()=>{n(r.result),t.close()}})}async setItem(e,t){let n=await this.getDb();if("number"==typeof e&&(e=e.toString()),"string"!=typeof e)throw Error("Key must be a string");return new Promise((o,a)=>{if(!this.storeName)return void a(Error("Store name not set"));let r=n.transaction(this.storeName,"readwrite");r.onerror=e=>a(r.error);let s=r.objectStore(this.storeName).put(t,e);s.onerror=e=>a(s.error),s.onsuccess=()=>{n.close(),o()}})}async removeItem(e){let t=await this.getDb();if("number"==typeof e&&(e=e.toString()),"string"!=typeof e)throw Error("Key must be a string");return new Promise((n,o)=>{if(!this.storeName)return void o(Error("Store name not set"));let a=t.transaction(this.storeName,"readwrite");a.onerror=e=>o(a.error);let r=a.objectStore(this.storeName).delete(e);r.onerror=e=>o(r.error),r.onsuccess=()=>{t.close(),n()}})}async keys(){let e=await this.getDb();return new Promise((t,n)=>{if(!this.storeName)return void n(Error("Store name not set"));let o=e.transaction(this.storeName,"readonly");o.onerror=e=>n(o.error);let a=o.objectStore(this.storeName).getAllKeys();a.onerror=e=>n(a.error),a.onsuccess=()=>{t(a.result),e.close()}})}async count(){let e=await this.getDb();return new Promise((t,n)=>{if(!this.storeName)return void n(Error("Store name not set"));let o=e.transaction(this.storeName,"readonly");o.onerror=e=>n(o.error);let a=o.objectStore(this.storeName).count();a.onerror=e=>n(a.error),a.onsuccess=()=>{t(a.result),e.close()}})}async length(){return this.count()}async clear(){let e=await this.getDb();return new Promise((t,n)=>{if(!this.storeName)return void n(Error("Store name not set"));let o=e.transaction(this.storeName,"readwrite");o.onerror=e=>n(o.error);let a=o.objectStore(this.storeName).clear();a.onerror=e=>n(a.error),a.onsuccess=()=>{e.close(),t()}})}}t.default=n},2498:(e,t,n)=>{t.NearConnector=void 0,n(5845),n(9002),n(8018),n(7079);var o=n(3087);Object.defineProperty(t,"NearConnector",{enumerable:!0,get:function(){return o.NearConnector}}),n(5286),n(9622)},3087:function(e,t,n){var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.NearConnector=void 0;let a=n(8309),r=n(560),s=n(5845),i=o(n(2290)),l=n(9002),c=n(7079),d=n(8018),h=["https://raw.githubusercontent.com/hot-dao/near-selector/refs/heads/main/repository/manifest.json","https://cdn.jsdelivr.net/gh/azbang/hot-connector/repository/manifest.json"];class u{storage;events;db;logger;wallets=[];manifest={wallets:[],version:"1.0.0"};features={};network="mainnet";providers={mainnet:[],testnet:[]};walletConnect;footerBranding;excludedWallets=[];autoConnect;cspNonce;whenManifestLoaded;constructor(e){this.db=new i.default("hot-connector","wallets"),this.storage=e?.storage??new s.LocalStorage,this.events=e?.events??new a.EventEmitter,this.logger=e?.logger,this.cspNonce=e?.cspNonce,this.network=e?.network??"mainnet",this.walletConnect=e?.walletConnect,this.autoConnect=e?.autoConnect??!0,this.providers=e?.providers??{mainnet:[],testnet:[]},this.excludedWallets=e?.excludedWallets??[],this.features=e?.features??{},e?.footerBranding!==void 0?this.footerBranding=e?.footerBranding:this.footerBranding={icon:"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%20512%20512%22%20class%3D%22size-7%22%3E%3Crect%20width%3D%22512%22%20height%3D%22512%22%20fill%3D%22%2300ec97%22%20rx%3D%22110%22%2F%3E%3Cpath%20fill%3D%22%23000%22%20d%3D%22M373.89%20106.199a31.95%2031.95%200%200%200-27.213%2015.207l-62.631%2092.979a6.67%206.67%200%200%200-.989%205.001%206.66%206.66%200%200%200%202.837%204.235%206.67%206.67%200%200%200%208.032-.494l61.643-53.47c1.02-.924%202.599-.827%203.523.193.419.473.644%201.074.644%201.697v167.402a2.49%202.49%200%200%201-2.502%202.491%202.48%202.48%200%200%201-1.912-.891L168.976%20117.497a31.93%2031.93%200%200%200-24.356-11.298h-6.508c-17.623%200-31.917%2014.294-31.917%2031.917v235.767c0%2017.623%2014.294%2031.917%2031.917%2031.917a31.94%2031.94%200%200%200%2027.213-15.206l62.631-92.98a6.66%206.66%200%200%200-1.847-9.236%206.67%206.67%200%200%200-8.033.494l-61.643%2053.471c-1.02.923-2.599.826-3.522-.194a2.5%202.5%200%200%201-.634-1.697V173.008a2.49%202.49%200%200%201%202.502-2.492c.731%200%201.439.322%201.912.891l186.313%20223.096a31.95%2031.95%200%200%200%2024.357%2011.297h6.508c17.623%200%2031.927-14.272%2031.938-31.895V138.116c0-17.623-14.294-31.917-31.917-31.917%22%2F%3E%3C%2Fsvg%3E",heading:"NEAR Connector",link:"https://wallet.near.org",linkText:"Don't have a wallet?"},this.whenManifestLoaded=new Promise(async t=>{e?.manifest==null||"string"==typeof e.manifest?this.manifest=await this._loadManifest(e?.manifest).catch(()=>({wallets:[],version:"1.0.0"})):this.manifest=e?.manifest??{wallets:[],version:"1.0.0"};let n=new Set(this.excludedWallets);n.delete("hot-wallet"),this.manifest.wallets=this.manifest.wallets.filter(e=>!(e.permissions.walletConnect&&!this.walletConnect||n.has(e.id))),await new Promise(e=>setTimeout(e,100)),t()}),"undefined"!=typeof window&&(window.addEventListener("near-wallet-injected",this._handleNearWalletInjected),window.dispatchEvent(new Event("near-selector-ready")),window.addEventListener("message",async e=>{"near-wallet-injected"===e.data.type&&(await this.whenManifestLoaded.catch(()=>{}),this.wallets=this.wallets.filter(t=>t.manifest.id!==e.data.manifest.id),this.wallets.unshift(new l.ParentFrameWallet(this,e.data.manifest)),this.events.emit("selector:walletsChanged",{}),this.autoConnect&&this.connect({walletId:e.data.manifest.id}))})),this.whenManifestLoaded.then(()=>{"undefined"!=typeof window&&window.parent.postMessage({type:"near-selector-ready"},"*"),this.manifest.wallets.forEach(e=>this.registerWallet(e)),this.storage.get("debug-wallets").then(e=>{JSON.parse(e??"[]").forEach(e=>this.registerDebugWallet(e))})})}get availableWallets(){return this.wallets.filter(e=>Object.entries(this.features).every(([t,n])=>!n||!!e.manifest.features?.[t])).filter(e=>"testnet"!==this.network||!!e.manifest.features?.testnet)}_handleNearWalletInjected=e=>{this.wallets=this.wallets.filter(t=>t.manifest.id!==e.detail.manifest.id),this.wallets.unshift(new c.InjectedWallet(this,e.detail)),this.events.emit("selector:walletsChanged",{})};async _loadManifest(e){for(let t of e?[e]:h){let e=await fetch(t).catch(()=>null);if(e&&e.ok)return await e.json()}throw Error("Failed to load manifest")}async switchNetwork(e,t){this.network!==e&&(await this.disconnect().catch(()=>{}),this.network=e,await this.connect(t))}async registerWallet(e){if("sandbox"!==e.type)throw Error("Only sandbox wallets are supported");this.wallets.find(t=>t.manifest.id===e.id)||(this.wallets.push(new d.SandboxWallet(this,e)),this.events.emit("selector:walletsChanged",{}))}async registerDebugWallet(e){let t="string"==typeof e?JSON.parse(e):e;if("sandbox"!==t.type)throw Error("Only sandbox wallets type are supported");if(!t.id)throw Error("Manifest must have an id");if(!t.name)throw Error("Manifest must have a name");if(!t.icon)throw Error("Manifest must have an icon");if(!t.website)throw Error("Manifest must have a website");if(!t.version)throw Error("Manifest must have a version");if(!t.executor)throw Error("Manifest must have an executor");if(!t.features)throw Error("Manifest must have features");if(!t.permissions)throw Error("Manifest must have permissions");if(this.wallets.find(e=>e.manifest.id===t.id))throw Error("Wallet already registered");t.debug=!0,this.wallets.unshift(new d.SandboxWallet(this,t)),this.events.emit("selector:walletsChanged",{});let n=this.wallets.filter(e=>e.manifest.debug).map(e=>e.manifest);return this.storage.set("debug-wallets",JSON.stringify(n)),t}async removeDebugWallet(e){this.wallets=this.wallets.filter(t=>t.manifest.id!==e);let t=this.wallets.filter(e=>e.manifest.debug).map(e=>e.manifest);this.storage.set("debug-wallets",JSON.stringify(t)),this.events.emit("selector:walletsChanged",{})}async selectWallet({features:e={}}={}){return await this.whenManifestLoaded.catch(()=>{}),new Promise((t,n)=>{let o=new r.NearWalletsPopup({footer:this.footerBranding,wallets:this.availableWallets.filter(t=>0===Object.entries(e).length||Object.entries(e).filter(([e,t])=>!0===t).every(([e])=>t.manifest.features?.[e]===!0)).map(e=>e.manifest),onRemoveDebugManifest:async e=>this.removeDebugWallet(e),onAddDebugManifest:async e=>this.registerDebugWallet(e),onReject:()=>(n(Error("User rejected")),o.destroy()),onSelect:e=>(t(e),o.destroy())});o.create()})}async connect(e={}){let t=e.walletId,n=e.signMessageParams;await this.whenManifestLoaded.catch(()=>{}),t||(t=await this.selectWallet({features:{signInAndSignMessage:null!=e.signMessageParams||void 0,signInWithFunctionCallKey:null!=e.addFunctionCallKey||void 0}}));try{let o,a=await this.wallet(t);if(this.logger?.log("Wallet available to connect",a),await this.storage.set("selected-wallet",t),this.logger?.log(`Set preferred wallet, try to signIn${null!=n?" (with signed message)":""}`,t),null!=e.addFunctionCallKey&&(this.logger?.log("Adding function call access key during sign in with params",e.addFunctionCallKey),o={...e.addFunctionCallKey,gasAllowance:e.addFunctionCallKey.gasAllowance??{amount:"250000000000000000000000",kind:"limited"}}),null!=n){let e=await a.signInAndSignMessage({addFunctionCallKey:o,messageParams:n,network:this.network});if(!e?.length)throw Error("Failed to sign in");this.logger?.log("Signed in to wallet (with signed message)",t,e),this.events.emit("wallet:signInAndSignMessage",{wallet:a,accounts:e,success:!0}),this.events.emit("wallet:signIn",{wallet:a,accounts:e.map(e=>({accountId:e.accountId,publicKey:e.publicKey})),success:!0,source:"signInAndSignMessage"})}else{let e=await a.signIn({addFunctionCallKey:o,network:this.network});if(!e?.length)throw Error("Failed to sign in");this.logger?.log("Signed in to wallet",t,e),this.events.emit("wallet:signIn",{wallet:a,accounts:e,success:!0,source:"signIn"})}return a}catch(e){throw this.logger?.log("Failed to connect to wallet",e),e}}async disconnect(e){e||(e=await this.wallet()),await e.signOut({network:this.network}),await this.storage.remove("selected-wallet"),this.events.emit("wallet:signOut",{success:!0})}async getConnectedWallet(){await this.whenManifestLoaded.catch(()=>{});let e=await this.storage.get("selected-wallet"),t=this.wallets.find(t=>t.manifest.id===e);if(!t)throw Error("No wallet selected");let n=await t.getAccounts();if(!n?.length)throw Error("No accounts found");return{wallet:t,accounts:n}}async wallet(e){if(await this.whenManifestLoaded.catch(()=>{}),!e)return this.getConnectedWallet().then(({wallet:e})=>e).catch(async()=>{throw await this.storage.remove("selected-wallet"),Error("No accounts found")});let t=this.wallets.find(t=>t.manifest.id===e);if(!t)throw Error("Wallet not found");return t}async use(e){await this.whenManifestLoaded.catch(()=>{}),this.wallets=this.wallets.map(t=>new Proxy(t,{get(t,n,o){let a=Reflect.get(t,n,o);if(n in e&&"function"==typeof a){let o=e[n];return function(...e){let n=()=>a.apply(t,e);return e.length>0?o.call(this,...e,n):o.call(this,void 0,n)}}return a}}))}on(e,t){this.events.on(e,t)}once(e,t){this.events.once(e,t)}off(e,t){this.events.off(e,t)}removeAllListeners(e){this.events.removeAllListeners(e)}}t.NearConnector=u},3224:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Popup=void 0;let o=n(168),a=n(3277),r=`n${Math.random().toString(36).substring(2,15)}`;if("undefined"!=typeof document){let e=document.createElement("style");e.textContent=(0,o.css)(`.${r}`),document.head.append(e)}class s{delegate;isClosed=!1;root=document.createElement("div");state={};constructor(e){this.delegate=e}get dom(){return(0,a.html)``}disposables=[];addListener(e,t,n){let o="string"==typeof e?this.root.querySelector(e):e;o&&(o.addEventListener(t,n),this.disposables.push(()=>o.removeEventListener(t,n)))}handlers(){this.disposables.forEach(e=>e()),this.disposables=[];let e=this.root.querySelector(".modal-container");this.root.querySelector(".modal-content").onclick=e=>e.stopPropagation(),e.onclick=()=>{this.delegate.onReject(),this.destroy()};let t=e=>{"Escape"===e.key&&(this.delegate.onReject(),this.destroy())};document.addEventListener("keydown",t),this.disposables.push(()=>document.removeEventListener("keydown",t))}update(e){this.state={...this.state,...e},this.root.innerHTML=this.dom.html,this.handlers()}create({show:e=!0}){this.root.className=`${r} hot-connector-popup`,this.root.style.display="none",this.root.innerHTML=this.dom.html,document.body.append(this.root),this.handlers();let t=this.root.querySelector(".modal-container");this.root.querySelector(".modal-content").style.transform="translateY(50px)",t.style.opacity="0",e&&setTimeout(()=>this.show(),10)}show(){let e=this.root.querySelector(".modal-container"),t=this.root.querySelector(".modal-content");t.style.transform="translateY(50px)",e.style.opacity="0",this.root.style.display="block",setTimeout(()=>{t.style.transform="translateY(0)",e.style.opacity="1"},100)}hide(){let e=this.root.querySelector(".modal-container");this.root.querySelector(".modal-content").style.transform="translateY(50px)",e.style.opacity="0",setTimeout(()=>{this.root.style.display="none"},200)}destroy(){this.isClosed||(this.isClosed=!0,this.disposables.forEach(e=>e()),this.disposables=[],this.hide(),setTimeout(()=>{this.root.remove()},200))}}t.Popup=s},3277:(e,t)=>{function n(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}Object.defineProperty(t,"__esModule",{value:!0}),t.escapeHtml=n,t.html=function(e,...t){let a=e[0];for(let r=0;r<t.length;r++){for(let e of Array.isArray(t[r])?t[r]:[t[r]]){let t=e?.[o]?e[o]:n(String(e??""));a+=t}a+=e[r+1]}return Object.freeze({[o]:a,get html(){return a}})};let o=Symbol("htmlTag")},3439:function(e,t,n){var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let a=n(4689),r=n(5711),s=n(7010),i=n(9175),l=o(n(5198)),c=(0,r.uuid4)();class d{connector;manifest;activePanels={};storageSpace;constructor(e,t){this.connector=e,this.manifest=t,this.storageSpace=t.id}checkPermissions(e,t){if("walletConnect"===e)return!!this.manifest.permissions.walletConnect;if("external"===e){let e=this.manifest.permissions.external;return!!e&&!!t?.entity&&e.includes(t.entity)}if("allowsOpen"===e){let e=(0,a.parseUrl)(t?.url||""),n=this.manifest.permissions.allowsOpen;return!!e&&!!n&&!!Array.isArray(n)&&0!==n.length&&n.some(t=>{let n=(0,a.parseUrl)(t);return!!n&&e.protocol===n.protocol&&(!n.hostname||e.hostname===n.hostname)&&(!n.pathname||"/"===n.pathname||e.pathname===n.pathname)})}return this.manifest.permissions[e]}assertPermissions(e,t,n){if(!this.checkPermissions(t,n.data.params))throw e.postMessage({...n.data,status:"failed",result:"Permission denied"}),Error("Permission denied")}_onMessage=async(e,t)=>{let n=n=>{e.postMessage({...t.data,status:"success",result:n})},o=n=>{e.postMessage({...t.data,status:"failed",result:n})};if("ui.showIframe"===t.data.method){e.show(),n(null);return}if("ui.hideIframe"===t.data.method){e.hide(),n(null);return}if("storage.set"===t.data.method){this.assertPermissions(e,"storage",t),localStorage.setItem(`${this.storageSpace}:${t.data.params.key}`,t.data.params.value),n(null);return}if("storage.get"===t.data.method){this.assertPermissions(e,"storage",t),n(localStorage.getItem(`${this.storageSpace}:${t.data.params.key}`));return}if("storage.keys"===t.data.method){this.assertPermissions(e,"storage",t),n(Object.keys(localStorage).filter(e=>e.startsWith(`${this.storageSpace}:`)));return}if("storage.remove"===t.data.method){this.assertPermissions(e,"storage",t),localStorage.removeItem(`${this.storageSpace}:${t.data.params.key}`),n(null);return}if("panel.focus"===t.data.method){let e=this.activePanels[t.data.params.windowId];e&&e.focus(),n(null);return}if("panel.postMessage"===t.data.method){let e=this.activePanels[t.data.params.windowId];e&&e.postMessage(t.data.params.data,"*"),n(null);return}if("panel.close"===t.data.method){let e=this.activePanels[t.data.params.windowId];e&&e.close(),delete this.activePanels[t.data.params.windowId],n(null);return}if("walletConnect.connect"===t.data.method){this.assertPermissions(e,"walletConnect",t);try{if(!this.connector.walletConnect)throw Error("WalletConnect is not configured");let e=await this.connector.walletConnect,o=await e.connect(t.data.params);o.approval(),n({uri:o.uri})}catch(e){o(e)}return}if("walletConnect.getProjectId"===t.data.method){if(!this.connector.walletConnect)throw Error("WalletConnect is not configured");this.assertPermissions(e,"walletConnect",t),n((await this.connector.walletConnect).core.projectId);return}if("walletConnect.disconnect"===t.data.method){this.assertPermissions(e,"walletConnect",t);try{if(!this.connector.walletConnect)throw Error("WalletConnect is not configured");let e=await this.connector.walletConnect,o=await e.disconnect(t.data.params);n(o)}catch(e){o(e)}return}if("walletConnect.getSession"===t.data.method){this.assertPermissions(e,"walletConnect",t);try{if(!this.connector.walletConnect)throw Error("WalletConnect is not configured");let e=await this.connector.walletConnect,t=e.session.keys[e.session.keys.length-1],o=t?e.session.get(t):null;n(o?{topic:o.topic,namespaces:o.namespaces}:null)}catch(e){o(e)}return}if("walletConnect.request"===t.data.method){this.assertPermissions(e,"walletConnect",t);try{if(!this.connector.walletConnect)throw Error("WalletConnect is not configured");let e=await this.connector.walletConnect,o=await e.request(t.data.params);n(o)}catch(e){o(e)}return}if("clipboard.writeText"===t.data.method){this.assertPermissions(e,"clipboardWrite",t);try{await (0,s.copyText)(t.data.params.text),n(null)}catch(e){o(e)}return}if("external"===t.data.method){this.assertPermissions(e,"external",t);try{let{entity:e,key:o,args:a}=t.data.params,r=e.split(".").reduce((e,t)=>e[t],window);"nightly.near"===e&&"signTransaction"===o&&(a[0].encode=()=>a[0]);let s="function"==typeof r[o]?await r[o](...a||[]):r[o];n(s)}catch(e){o(e)}return}if("open"===t.data.method){this.assertPermissions(e,"allowsOpen",t);let o=(0,a.parseUrl)(t.data.params.url);if(o&&"https:"===o.protocol&&(0,i.isTelegramMiniApp)()){"t.me"===o.hostname?(0,i.openTelegramLink)(o):(0,i.openExternalLink)(o),n(null);return}let s=window.open(t.data.params.url,"_blank",t.data.params.features),l=s?(0,r.uuid4)():null,c=n=>{let o=(0,a.parseUrl)(t.data.params.url);o&&o.origin===n.origin&&e.postMessage(n.data)};if(n(l),window.addEventListener("message",c),s&&l){this.activePanels[l]=s;let t=setInterval(()=>{if(s?.closed){window.removeEventListener("message",c),delete this.activePanels[l],clearInterval(t);try{e.postMessage({method:"proxy-window:closed",windowId:l})}catch{}}},500)}return}if("open.nativeApp"===t.data.method){this.assertPermissions(e,"allowsOpen",t);let n=(0,a.parseUrl)(t.data.params.url);if(!n||["https","http","javascript:","file:","data:","blob:","about:"].includes(n.protocol))throw o("Invalid URL"),Error("[open.nativeApp] Invalid URL");let r=document.createElement("iframe");r.src=t.data.params.url,r.style.display="none",document.body.appendChild(r),e.postMessage({...t.data,status:"success",result:null});return}};actualCode=null;async checkNewVersion(e,t){if(this.actualCode)return this.connector.logger?.log("New version of code already checked"),this.actualCode;let n=(0,a.parseUrl)(e.manifest.executor);if(n||(n=(0,a.parseUrl)(location.origin+e.manifest.executor)),!n)throw Error("Invalid executor URL");n.searchParams.set("nonce",c);let o=await fetch(n.toString()).then(e=>{if(!e.ok)throw Error(`Failed to load executor: ${e.status}`);return e.text()});return(this.connector.logger?.log("New version of code fetched"),this.actualCode=o,o===t)?(this.connector.logger?.log("New version of code is the same as the current version"),this.actualCode):(await this.connector.db.setItem(`${this.manifest.id}:${this.manifest.version}`,o).then(()=>this.connector.logger?.log("New version of code saved to cache")).catch(e=>this.connector.logger?.log("Failed to cache new version of code",e)),o)}async loadCode(){let e=await this.connector.db.getItem(`${this.manifest.id}:${this.manifest.version}`).catch(()=>null);this.connector.logger?.log("Code loaded from cache",null!==e);let t=this.checkNewVersion(this,e);return e||await t}async call(e,t){this.connector.logger?.log("Add to queue",e,t),this.connector.logger?.log("Calling method",e,t);let n=await this.loadCode();this.connector.logger?.log("Code loaded, preparing");let o=new l.default(this,n,this._onMessage,this.connector.cspNonce);this.connector.logger?.log("Code loaded, iframe initialized"),await o.readyPromise,this.connector.logger?.log("Iframe ready");let a=(0,r.uuid4)();return new Promise((n,r)=>{try{let s=i=>{i.data.id===a&&i.data.origin===o.origin&&(o.dispose(),window.removeEventListener("message",s),this.connector.logger?.log("postMessage",{result:i.data,request:{method:e,params:t}}),"failed"===i.data.status?r(i.data.result):n(i.data.result))};window.addEventListener("message",s),o.postMessage({method:e,params:t,id:a}),o.on("close",()=>r(Error("Wallet closed")))}catch(e){this.connector.logger?.log("Iframe error",e),r(e)}})}async getAllStorage(){let e=Object.keys(localStorage).filter(e=>e.startsWith(`${this.storageSpace}:`)),t={};for(let n of e)t[n.replace(`${this.storageSpace}:`,"")]=localStorage.getItem(n);return t}async clearStorage(){for(let e of Object.keys(localStorage).filter(e=>e.startsWith(`${this.storageSpace}:`)))localStorage.removeItem(e)}}t.default=d},3619:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.IframeWalletPopup=void 0;let o=n(3277),a=n(3224);class r extends a.Popup{delegate;constructor(e){super(e),this.delegate=e}handlers(){super.handlers(),this.addListener("button","click",()=>this.delegate.onApprove())}create(){super.create({show:!1}),this.root.querySelector(".modal-body").appendChild(this.delegate.iframe),this.delegate.iframe.style.width="100%",this.delegate.iframe.style.height="720px",this.delegate.iframe.style.border="none"}get footer(){if(!this.delegate.footer)return"";let{icon:e,heading:t}=this.delegate.footer;return(0,o.html)`
      <div class="footer">
        ${e?(0,o.html)`<img src="${e}" alt="${t}" />`:""}
        <p>${t}</p>
      </div>
    `}get dom(){return(0,o.html)`<div class="modal-container">
      <div class="modal-content">
        <div class="modal-body" style="padding: 0; overflow: auto;"></div>
        ${this.footer}
      </div>
    </div>`}}t.IframeWalletPopup=r},4404:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.encodeBase58=function(e){if(0===e.length)return"";let t=0,o=0;for(;o<e.length&&0===e[o];)t++,o++;let a=[0];for(;o<e.length;o++){let t=e[o];for(let e=0;e<a.length;++e)t+=a[e]<<8,a[e]=t%58,t=t/58|0;for(;t>0;)a.push(t%58),t=t/58|0}for(;a.length>0&&0===a[a.length-1];)a.pop();let r="";for(let e=0;e<t;e++)r+=n[0];for(let e=a.length-1;e>=0;--e)r+=n[a[e]];return r};let n="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"},4689:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.parseUrl=void 0,t.parseUrl=e=>{try{return new URL(e)}catch{return null}}},5198:function(e,t,n){var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});let a=n(8309),r=n(5711),s=n(3619),i=o(n(6663));class l{executor;origin;disposed=!1;iframe=document.createElement("iframe");events=new a.EventEmitter;popup;handler;readyPromiseResolve;readyPromise=new Promise(e=>{this.readyPromiseResolve=e});constructor(e,t,n,o){this.executor=e,this.origin=(0,r.uuid4)(),this.handler=e=>{e.data.origin===this.origin&&("wallet-ready"===e.data.method&&this.readyPromiseResolve(),n(this,e))},window.addEventListener("message",this.handler);let a=[];this.executor.checkPermissions("usb")&&a.push("usb *;"),this.executor.checkPermissions("hid")&&a.push("hid *;"),this.executor.checkPermissions("clipboardRead")&&a.push("clipboard-read;"),this.executor.checkPermissions("clipboardWrite")&&a.push("clipboard-write;"),this.executor.checkPermissions("bluetooth")&&a.push("bluetooth *;"),this.iframe.allow=a.join(" "),this.iframe.setAttribute("sandbox","allow-scripts"),(0,i.default)({id:this.origin,executor:this.executor,code:t,cspNonce:o}).then(e=>{this.executor.connector.logger?.log("Iframe code injected"),this.iframe.srcdoc=e}),this.popup=new s.IframeWalletPopup({footer:this.executor.connector.footerBranding,iframe:this.iframe,onApprove:()=>{},onReject:()=>{this.disposed=!0,window.removeEventListener("message",this.handler),this.events.emit("close",{}),this.popup.destroy()}}),this.popup.create()}on(e,t){this.events.on(e,t)}show(){this.popup.show()}hide(){this.popup.hide()}postMessage(e){if(this.disposed)return;let t=this.iframe.contentWindow;if(!t)throw Error(`Iframe not loaded for ${e?.method??"unknown method"}`);t.postMessage({...e,origin:this.origin},"*")}dispose(){this.disposed=!0,window.removeEventListener("message",this.handler),this.popup.destroy()}}t.default=l},5286:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.nearActionsToConnectorActions=void 0;let o=n(4404);t.nearActionsToConnectorActions=e=>e.map(e=>{if("type"in e)return e;if(e.signedDelegate)throw Error("SignedDelegate actions cannot be sent through the wallet connector; wallets sign delegates via signDelegateActions");if(e.functionCall)return{type:"FunctionCall",params:{methodName:e.functionCall.methodName,args:(e=>{try{return JSON.parse(new TextDecoder().decode(e))}catch{return e}})(e.functionCall.args),gas:e.functionCall.gas.toString(),deposit:e.functionCall.deposit.toString()}};if(e.deployGlobalContract)return{type:"DeployGlobalContract",params:{code:e.deployGlobalContract.code,deployMode:(e=>null!=e.enum?"AccountId"===e.enum:"AccountId"in e)(e.deployGlobalContract.deployMode)?"AccountId":"CodeHash"}};if(e.createAccount)return{type:"CreateAccount"};if(e.useGlobalContract){let t=e.useGlobalContract.contractIdentifier;return{type:"UseGlobalContract",params:{contractIdentifier:null!=t.AccountId?{accountId:t.AccountId}:{codeHash:(0,o.encodeBase58)(t.CodeHash)}}}}if(e.deployContract)return{type:"DeployContract",params:{code:e.deployContract.code}};if(e.deleteAccount)return{type:"DeleteAccount",params:{beneficiaryId:e.deleteAccount.beneficiaryId}};if(e.deleteKey)return{type:"DeleteKey",params:{publicKey:e.deleteKey.publicKey.toString()}};if(e.transfer)return{type:"Transfer",params:{deposit:e.transfer.deposit.toString()}};if(e.stake)return{type:"Stake",params:{stake:e.stake.stake.toString(),publicKey:e.stake.publicKey.toString()}};if(e.addKey){let t,{permission:n}=e.addKey.accessKey;if(n.functionCall)t={receiverId:n.functionCall.receiverId,allowance:n.functionCall.allowance?.toString(),methodNames:n.functionCall.methodNames};else if((e=>null!=e.enum?"fullAccess"===e.enum:"fullAccess"in e)(n))t="FullAccess";else throw Error("Unsupported access-key permission on AddKey: only functionCall and fullAccess can be sent through the wallet connector (pass a ConnectorAction otherwise)");return{type:"AddKey",params:{publicKey:e.addKey.publicKey.toString(),accessKey:{nonce:Number(e.addKey.accessKey.nonce),permission:t}}}}throw Error("Unsupported action type")})},5711:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.uuid4=void 0,t.uuid4=()=>"undefined"!=typeof window&&void 0!==window.crypto&&"function"==typeof window.crypto.randomUUID?window.crypto.randomUUID():"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){let t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)})},5845:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.LocalStorage=void 0;class n{async get(e){return"undefined"==typeof window?null:localStorage.getItem(e)}async set(e,t){"undefined"!=typeof window&&localStorage.setItem(e,t)}async remove(e){"undefined"!=typeof window&&localStorage.removeItem(e)}}t.LocalStorage=n},6663:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0});let o=n(9984);t.default=async function(e){let t=await e.executor.getAllStorage(),n=e.executor.connector.providers,a=e.executor.manifest,r=e.id,s=e.code.replaceAll(".localStorage",".sandboxedLocalStorage").replaceAll("window.top","window.selector").replaceAll("window.open","window.selector.open"),i=e.cspNonce?` nonce="${e.cspNonce.replace(/[^A-Za-z0-9+/=]/g,"")}"`:"";return`
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <div id="root"></div>

      <style>
        :root {
          --background-color: rgb(40, 40, 40);
          --text-color: rgb(255, 255, 255);
          --border-color: rgb(209, 209, 209);
        }

        * {
          font-family: system-ui, Avenir, Helvetica, Arial, sans-serif
        }

        body, html {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          background-color: var(--background-color);
          color: var(--text-color);
        }

        #root {
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          background: radial-gradient(circle at center, #2c2c2c 0%, #1a1a1a 100%);
          text-align: center;
        }

        #root * {
          box-sizing: border-box;
          font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          color-scheme: light dark;
          color: rgb(255, 255, 255);
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
        }

        .prompt-container img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 12px;
        }

        .prompt-container h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          margin-top: 16px;
        }

        .prompt-container p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: rgb(209, 209, 209);
        }

        .prompt-container button {
          background-color: #131313;
          border: none;
          border-radius: 12px;
          padding: 12px 24px;
          cursor: pointer;
          transition: border-color 0.25s;
          color: #fff;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          margin-top: 16px;
        }
      </style>


      <script${i}>
      window.sandboxedLocalStorage = (() => {
        let storage = ${JSON.stringify(t)}

        return {
          setItem: function(key, value) {
            window.selector.storage.set(key, value)
            storage[key] = value || '';
          },
          getItem: function(key) {
            return key in storage ? storage[key] : null;
          },
          removeItem: function(key) {
            window.selector.storage.remove(key)
            delete storage[key];
          },
          get length() {
            return Object.keys(storage).length;
          },
          key: function(i) {
            const keys = Object.keys(storage);
            return keys[i] || null;
          },
        };
      })();

      const showPrompt = async (args) => {
        const root = document.getElementById("root");   
        root.style.display = "flex";
        root.innerHTML = \`
          <div class="prompt-container">
            <img src="${a.icon}" />
            <h1>${a.name}</h1>
            <p>\${args.title}</p>
            <button>\${args.button}</button>
          </div>
        \`;

        return new Promise((resolve) => {
          root.querySelector("button")?.addEventListener("click", () => {
            root.innerHTML = "";
            resolve(true);
          });
        });
      }

      class ProxyWindow {
        constructor(url, features) {
          this.closed = false;
          this.windowIdPromise = window.selector.call("open", { url, features });

          window.addEventListener("message", async (event) => {            
            if (event.data.origin !== "${r}") return;
            if (!event.data.method?.startsWith("proxy-window:")) return;
            const method = event.data.method.replace("proxy-window:", "");
            if (method === "closed" && event.data.windowId === await this.id()) this.closed = true;
          });
        } 

        async id() {
          return await this.windowIdPromise;
        }

        async focus() {
          await window.selector.call("panel.focus", { windowId: await this.id() });
        }

        async postMessage(data) {
          window.selector.call("panel.postMessage", { windowId: await this.id(), data });
        }

        async close() {
          await window.selector.call("panel.close", { windowId: await this.id() });
        }
      }

      window.selector = {
        wallet: null,
        location: "${window.location.href}",
        nearConnectVersion: "${o.NEAR_CONNECT_VERSION}",
        
        outerHeight: ${window.outerHeight},
        screenY: ${window.screenY},
        outerWidth: ${window.outerWidth},
        screenX: ${window.screenX},

        providers: {
          mainnet: ${JSON.stringify(n.mainnet)},
          testnet: ${JSON.stringify(n.testnet)},
        },

        uuid() {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        },

        walletConnect: {
          connect(params) {
            return window.selector.call("walletConnect.connect", params);
          },
          disconnect(params) {
            return window.selector.call("walletConnect.disconnect", params);
          },
          request(params) {
            return window.selector.call("walletConnect.request", params);
          },
          getProjectId() {
            return window.selector.call("walletConnect.getProjectId", {});
          },
          getSession() {
            return window.selector.call("walletConnect.getSession", {});
          },
        },
      
        async ready(wallet) {
          wallet.manifest = ${JSON.stringify(a)};
          window.parent.postMessage({ method: "wallet-ready", origin: "${r}" }, "*");
          window.selector.wallet = wallet;
        },

        async call(method, params) {
          const id = window.selector.uuid();
          window.parent.postMessage({ method, params, id, origin: "${r}" }, "*");

          return new Promise((resolve, reject) => {
            const handler = (event) => {
              if (event.data.id !== id || event.data.origin !== "${r}") return;
              window.removeEventListener("message", handler);

              if (event.data.status === "failed") reject(event.data.result);
              else resolve(event.data.result);
            };

            window.addEventListener("message", handler);
          });
        },

        panelClosed(windowId) {
          window.parent.postMessage({ 
            method: "panel.closed", 
            origin: "${r}", 
            result: { windowId } 
          }, "*");
        },

        open(url, _, params) {
          return new ProxyWindow(url, params)
        },

        external(entity, key, ...args) {
          return window.selector.call("external", { entity, key, args: args || [] });
        },

        openNativeApp(url) {
          return window.selector.call("open.nativeApp", { url });
        },

        ui: {
          async whenApprove(options) {
            window.selector.ui.showIframe();
            await showPrompt(options);
            window.selector.ui.hideIframe();
          },

          async showIframe() {
            return await window.selector.call("ui.showIframe");
          },

          async hideIframe() {
            return await window.selector.call("ui.hideIframe");
          },
        },

        storage: {
          async set(key, value) {
            await window.selector.call("storage.set", { key, value });
          },
      
          async get(key) {
            return await window.selector.call("storage.get", { key });
          },
      
          async remove(key) {
            await window.selector.call("storage.remove", { key });
          },

          async keys() {
            return await window.selector.call("storage.keys", {});
          },
        },
      };

      // Clipboard API often rejects inside the sandbox (Android WebView), copy through the dApp page then.
      // Plain assignment to navigator.clipboard is a no-op (getter on the prototype), so redefine the method
      const clipboard = navigator.clipboard || {};
      const nativeWriteText = clipboard.writeText ? clipboard.writeText.bind(clipboard) : null;
      Object.defineProperty(clipboard, "writeText", {
        configurable: true,
        value: async (text) => {
          try {
            if (nativeWriteText) return await nativeWriteText(text);
          } catch {}
          await window.selector.call("clipboard.writeText", { text });
        },
      });
      if (!navigator.clipboard) Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard });

      window.addEventListener("message", async (event) => {
        if (event.data.origin !== "${r}") return;
        if (!event.data.method?.startsWith("wallet:")) return;
      
        const wallet = window.selector.wallet;
        const method = event.data.method.replace("wallet:", "");
        const payload = { id: event.data.id, origin: "${r}", method };
      
        if (wallet == null || typeof wallet[method] !== "function") {
          const data = { ...payload, status: "failed", result: "Method not found" };
          window.parent.postMessage(data, "*");
          return;
        }
        
        try {
          const result = await wallet[method](event.data.params);
          window.parent.postMessage({ ...payload, status: "success", result }, "*");
        } catch (error) {
          const data = { ...payload, status: "failed", result: error };
          window.parent.postMessage(data, "*");
        }
      });
      </script>

      <script type="module"${i}>${s}</script>
    </body>
  </html>
    `}},7010:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.copyText=void 0,t.copyText=async e=>{try{await navigator.clipboard.writeText(e);return}catch{}let t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select();try{if(!document.execCommand("copy"))throw Error("Copy failed")}finally{t.remove()}}},7079:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.InjectedWallet=void 0;let o=n(5286),a=n(9622);class r{connector;wallet;constructor(e,t){this.connector=e,this.wallet=t}get manifest(){return this.wallet.manifest}async signIn({addFunctionCallKey:e,network:t}){return this.wallet.signIn({network:t??this.connector.network,addFunctionCallKey:e})}async signInAndSignMessage(e){return this.wallet.signInAndSignMessage({network:e?.network??this.connector.network,addFunctionCallKey:e.addFunctionCallKey,messageParams:e.messageParams})}async signOut(e){await this.wallet.signOut({network:e?.network??this.connector.network})}async getAccounts(e){return this.wallet.getAccounts({network:e?.network??this.connector.network})}async signAndSendTransaction(e){let t=(0,o.nearActionsToConnectorActions)(e.actions);(0,a.assertGasKeyActionsSupported)(this.manifest.features,t,this.manifest.name);let n=e.network??this.connector.network,r=await this.wallet.signAndSendTransaction({...e,actions:t,network:n});if(!r)throw Error("No result from wallet");return Array.isArray(r.transactions)?r.transactions[0]:r}async signAndSendTransactions(e){let t=e.network??this.connector.network,n=e.transactions.map(e=>({actions:(0,o.nearActionsToConnectorActions)(e.actions),receiverId:e.receiverId}));(0,a.assertGasKeyActionsSupported)(this.manifest.features,n.flatMap(e=>e.actions),this.manifest.name);let r=await this.wallet.signAndSendTransactions({...e,transactions:n,network:t});if(!r)throw Error("No result from wallet");return Array.isArray(r.transactions)?r.transactions:r}async signMessage(e){return this.wallet.signMessage({...e,network:e.network??this.connector.network})}async signDelegateActions(e){let t=e.delegateActions.map(e=>({...e,actions:(0,o.nearActionsToConnectorActions)(e.actions)}));return(0,a.assertGasKeyActionsSupported)(this.manifest.features,t.flatMap(e=>e.actions),this.manifest.name),this.wallet.signDelegateActions({...e,delegateActions:t,network:e.network??this.connector.network})}}t.InjectedWallet=r},8018:function(e,t,n){var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.SandboxWallet=void 0;let a=n(5286),r=n(9622),s=o(n(3439));class i{connector;manifest;executor;constructor(e,t){this.connector=e,this.manifest=t,this.executor=new s.default(e,t)}async signIn(e){return this.executor.call("wallet:signIn",{network:e?.network??this.connector.network,addFunctionCallKey:e?.addFunctionCallKey})}async signInAndSignMessage(e){return this.executor.call("wallet:signInAndSignMessage",{network:e?.network??this.connector.network,addFunctionCallKey:e?.addFunctionCallKey,messageParams:e.messageParams})}async signOut(e){let t={...e,network:e?.network??this.connector.network};await this.executor.call("wallet:signOut",t),await this.executor.clearStorage()}async getAccounts(e){let t={...e,network:e?.network??this.connector.network};return this.executor.call("wallet:getAccounts",t)}async signAndSendTransaction(e){let t=(0,a.nearActionsToConnectorActions)(e.actions);(0,r.assertGasKeyActionsSupported)(this.manifest.features,t,this.manifest.name);let n={...e,actions:t,network:e.network??this.connector.network};return this.executor.call("wallet:signAndSendTransaction",n)}async signAndSendTransactions(e){let t=e.transactions.map(e=>({actions:(0,a.nearActionsToConnectorActions)(e.actions),receiverId:e.receiverId}));(0,r.assertGasKeyActionsSupported)(this.manifest.features,t.flatMap(e=>e.actions),this.manifest.name);let n={...e,transactions:t,network:e.network??this.connector.network};return this.executor.call("wallet:signAndSendTransactions",n)}async signMessage(e){let t={...e,network:e.network??this.connector.network};return this.executor.call("wallet:signMessage",t)}async signDelegateActions(e){let t={...e,delegateActions:e.delegateActions.map(e=>({...e,actions:(0,a.nearActionsToConnectorActions)(e.actions)})),network:e.network??this.connector.network};return(0,r.assertGasKeyActionsSupported)(this.manifest.features,t.delegateActions.flatMap(e=>e.actions),this.manifest.name),this.executor.call("wallet:signDelegateActions",t)}}t.SandboxWallet=i,t.default=i},8309:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.EventEmitter=void 0;class n{events={};on(e,t){this.events[e]||(this.events[e]=[]),this.events[e].push(t)}emit(e,t){this.events[e]?.forEach(e=>e(t))}off(e,t){this.events[e]=this.events[e]?.filter(e=>e!==t)}once(e,t){let n=o=>{t(o),this.off(e,n)};this.on(e,n)}removeAllListeners(e){e?delete this.events[e]:this.events={}}}t.EventEmitter=n},9002:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.ParentFrameWallet=void 0;let o=n(5286),a=n(9622),r=n(5711);class s{connector;manifest;constructor(e,t){this.connector=e,this.manifest=t}callParentFrame(e,t){let n=(0,r.uuid4)();return window.parent.postMessage({type:"near-wallet-injected-request",id:n,method:e,params:t},"*"),new Promise((e,t)=>{let o=a=>{"near-wallet-injected-response"===a.data.type&&a.data.id===n&&(window.removeEventListener("message",o),a.data.success?e(a.data.result):t(a.data.error))};window.addEventListener("message",o)})}async signIn(e){let t=await this.callParentFrame("near:signIn",{network:e?.network??this.connector.network,addFunctionCallKey:e?.addFunctionCallKey});return Array.isArray(t)?t:[t]}async signInAndSignMessage(e){let t=await this.callParentFrame("near:signInAndSignMessage",{network:e?.network??this.connector.network,addFunctionCallKey:e?.addFunctionCallKey,messageParams:e.messageParams});return Array.isArray(t)?t:[t]}async signOut(e){let t={...e,network:e?.network??this.connector.network};await this.callParentFrame("near:signOut",t)}async getAccounts(e){let t={...e,network:e?.network??this.connector.network};return this.callParentFrame("near:getAccounts",t)}async signAndSendTransaction(e){let t=(0,o.nearActionsToConnectorActions)(e.actions);(0,a.assertGasKeyActionsSupported)(this.manifest.features,t,this.manifest.name);let n={...e,actions:t,network:e.network??this.connector.network};return this.callParentFrame("near:signAndSendTransaction",n)}async signAndSendTransactions(e){let t=e.transactions.map(e=>({actions:(0,o.nearActionsToConnectorActions)(e.actions),receiverId:e.receiverId}));(0,a.assertGasKeyActionsSupported)(this.manifest.features,t.flatMap(e=>e.actions),this.manifest.name);let n={...e,transactions:t,network:e.network??this.connector.network};return this.callParentFrame("near:signAndSendTransactions",n)}async signMessage(e){let t={...e,network:e.network??this.connector.network};return this.callParentFrame("near:signMessage",t)}async signDelegateActions(e){let t={...e,delegateActions:e.delegateActions.map(e=>({...e,actions:(0,o.nearActionsToConnectorActions)(e.actions)})),network:e.network||this.connector.network};return(0,a.assertGasKeyActionsSupported)(this.manifest.features,t.delegateActions.flatMap(e=>e.actions),this.manifest.name),this.callParentFrame("near:signDelegateActions",t)}}t.ParentFrameWallet=s},9175:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.openExternalLink=t.openTelegramLink=t.isTelegramMiniApp=void 0;let n=()=>{let e=window?.Telegram?.WebApp;return e&&e.platform&&"unknown"!==e.platform?e:null};t.isTelegramMiniApp=()=>"undefined"!=typeof window&&(!!n()||!!window.TelegramWebviewProxy||(()=>{try{if(location.hash.includes("tgWebAppData"))return!0;return!!sessionStorage.getItem("__telegram__initParams")}catch{return!1}})());let o=(e,t)=>{let n=window.TelegramWebviewProxy;if(n?.postEvent)return n.postEvent(e,JSON.stringify(t));let o=window.external;if(o&&"notify"in o)return o.notify(JSON.stringify({eventType:e,eventData:t}));window.parent!==window&&window.parent.postMessage(JSON.stringify({eventType:e,eventData:t}),"https://web.telegram.org")};t.openTelegramLink=e=>{let t=n();if(t)return t.openTelegramLink(e.toString());o("web_app_open_tg_link",{path_full:e.pathname+e.search})},t.openExternalLink=e=>{let t=n();if(t)return t.openLink(e.toString());o("web_app_open_link",{url:e.toString()})}},9622:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.isGasKeyAction=void 0,t.assertGasKeyActionsSupported=function(e,n,o){if(e?.gasKeys)return;let a=n.filter(t.isGasKeyAction).map(e=>e.type);if(0!==a.length)throw Error(`${o} does not advertise gas-key support (manifest features.gasKeys), so ${[...new Set(a)].join(", ")} cannot be sent through it; a wallet that does not know gasKeyInfo could add a plain key instead. Sign locally with a full-access key, or use a wallet whose manifest sets features.gasKeys.`)},t.isGasKeyAction=e=>"TransferToGasKey"===e.type||"WithdrawFromGasKey"===e.type||"AddKey"===e.type&&null!=e.params.gasKeyInfo},9984:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.NEAR_CONNECT_VERSION=void 0,t.NEAR_CONNECT_VERSION="0.12.0"}}]);