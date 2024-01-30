import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import Script from 'next/script';
import { configureChains, createClient, useProvider, WagmiConfig } from 'wagmi';
import { arbitrum } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { isMobile } from "react-device-detect";
// import { Analytics } from "@vercel/analytics/react";
import { useConfigStore } from "../hooks/useConfigStore";
import {
  chainProperties,
  supportedNetworkNames,
  arbitrumSepolia,
  chainIdToRpc,
  scroll,
} from "../utils/chains";
import TermsOfService from "../components/Modals/ToS";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useTradeStore } from "../hooks/useTradeStore";
import { useRangeLimitStore } from "../hooks/useRangeLimitStore";
import { fetchListedTokenBalances, fetchTokenMetadata } from "../utils/tokens";
import { Toaster } from 'sonner';

const { chains, provider } = configureChains(
  [arbitrum, arbitrumSepolia, scroll],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chainIdToRpc[chain.id],
      }),
    }),
  ]
);

// Rainbow Kit
const { connectors } = getDefaultWallets({
  appName: "Poolshark UI",
  chains,
});

// Wagmi
const wagmiClient = createClient({
  connectors,
  provider,
  autoConnect: true,
});

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();

  const [_isConnected, _setIsConnected] = useState(false);
  const [_isMobile, _setIsMobile] = useState(false);

  const [walletConnected, setWalletConnected] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);

  useEffect(() => {
    // Check if terms of service is accepted
    const isTosAccepted = localStorage.getItem("tosAccepted") === "true";
    setTosAccepted(isTosAccepted);

    // Simulate wallet connection logic
    // In real scenario, this will be replaced with actual wallet connection logic
    // setWalletConnected(true/false) based on wallet connection status
  }, []);

  const handleTosAccept = () => {
    localStorage.setItem("tosAccepted", "true");
    setTosAccepted(true);
  };

  const [
    listed_tokens,
    networkName,
    search_tokens,
    setChainId,
    setNetworkName,
    setLimitSubgraph,
    setCoverSubgraph,
    setCoverFactoryAddress,
    setListedTokenList,
    setSearchTokenList,
    setDisplayTokenList,
  ] = useConfigStore((state) => [
    state.listedtokenList,
    state.networkName,
    state.searchtokenList,
    state.setChainId,
    state.setNetworkName,
    state.setLimitSubgraph,
    state.setCoverSubgraph,
    state.setCoverFactoryAddress,
    state.setListedTokenList,
    state.setSearchTokenList,
    state.setDisplayTokenList,
  ]);

  const [resetTradeLimitParams] = useTradeStore((state) => [
    state.resetTradeLimitParams,
  ]);

  const [resetLimitStore] = useRangeLimitStore((state) => [
    state.resetRangeLimitParams,
  ]);

  const {
    network: { chainId, name },
  } = useProvider();

  useEffect(() => {
    setChainId(chainId);
  }, [chainId]);

  useEffect(() => {
    if (listed_tokens && address) {
      fetchListedTokenBalances(
        chainId,
        address,
        listed_tokens,
        search_tokens
      ).then();
    }
  }, [listed_tokens, address]);

  useEffect(() => {
    resetTradeLimitParams(chainId);
    resetLimitStore(chainId);
    fetchTokenMetadata(
      chainId,
      setListedTokenList,
      setDisplayTokenList,
      setSearchTokenList,
      setIsLoading
    );
  }, [chainId]);

  useEffect(() => {
    const networkName = supportedNetworkNames[name] ?? "unknownNetwork";
    const chainConstants = chainProperties[networkName]
      ? chainProperties[networkName]
      : chainProperties["arbitrum"];
    setLimitSubgraph(chainConstants["limitSubgraphUrl"]);
    setCoverSubgraph(chainConstants["coverSubgraphUrl"]);
    setCoverFactoryAddress(chainConstants["coverPoolFactory"]);
    setNetworkName(networkName);
  }, [name]);

  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);
  useEffect(() => {
    _setIsMobile(isMobile);
  }, [isMobile]);

  return (
    <>
    <Head>
       <title>Poolshark</title>
    </Head>
        <Toaster richColors theme="dark"/>
    <Script
      id="Safary" // A unique ID for your script
      strategy="afterInteractive" // or "beforeInteractive" or "lazyOnload"
      data-product-id="prd_LlXf5ZMaBY"
      data-name="safary-sdk"
      defer
    >
      {` !function(){"use strict";function e(e){return e&&"undefined"!=typeof Symbol&&e.constructor===Symbol?"symbol":typeof e}function t(t,r,n,a){if((r||void 0!==t)&&(void 0===t?"undefined":e(t))!==n)throw new Error("Assertion failed: Expected ".concat(null!=a?a:"value"," to be of type ").concat(n," but received ").concat(void 0===t?"undefined":e(t)))}function r(e,t){if(void 0===e)throw new Error("Assertion failed: Expected ".concat(null!=t?t:"value"," to exist but received undefined"))}function n(e,t,r,n,a,o,s){try{var i=e[o](s),u=i.value}catch(e){return void r(e)}i.done?t(u):Promise.resolve(u).then(n,a)}function a(e){return function(){var t=this,r=arguments;return new Promise((function(a,o){var s=e.apply(t,r);function i(e){n(s,a,o,i,u,"next",e)}function u(e){n(s,a,o,i,u,"throw",e)}i(void 0)}))}}function o(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function s(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r,n,a,o,s={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:i(0),throw:i(1),return:i(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function i(o){return function(i){return function(o){if(r)throw new TypeError("Generator is already executing.");for(;s;)try{if(r=1,n&&(a=2&o[0]?n.return:o[0]?n.throw||((a=n.return)&&a.call(n),0):n.next)&&!(a=a.call(n,o[1])).done)return a;switch(n=0,a&&(o=[2&o[0],a.value]),o[0]){case 0:case 1:a=o;break;case 4:return s.label++,{value:o[1],done:!1};case 5:s.label++,n=o[1],o=[0];continue;case 7:o=s.ops.pop(),s.trys.pop();continue;default:if(!((a=(a=s.trys).length>0&&a[a.length-1])||6!==o[0]&&2!==o[0])){s=0;continue}if(3===o[0]&&(!a||o[1]>a[0]&&o[1]<a[3])){s.label=o[1];break}if(6===o[0]&&s.label<a[1]){s.label=a[1],a=o;break}if(a&&s.label<a[2]){s.label=a[2],s.ops.push(o);break}a[2]&&s.ops.pop(),s.trys.pop();continue}o=t.call(e,s)}catch(e){o=[6,e],n=0}finally{r=a=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,i])}}}var u=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),s(this,"localItemName","____sfry_anonymous"),s(this,"sessionId","none"),s(this,"sessionData",{sessionId:"none"}),s(this,"previousLocalStorageData",{sessionId:"n"}),s(this,"currentWallets",new Array),s(this,"currentListenerWallets",new Array),s(this,"SAFARY_BACKEND_ORIGIN","https://tag.safary.club"),s(this,"SAFARY_SCRIPT_VERSION",null!=="0.1.5"?"0.1.5":"v0.0.0-dev"),s(this,"SAFARY_TAG",void 0),s(this,"PRODUCT_ID",void 0),s(this,"BACKEND_URL",void 0),s(this,"timeScriptLoaded",(new Date).toISOString()),s(this,"pooling_active",!1),this.SAFARY_TAG=t,this.PRODUCT_ID=this.getProductID(),this.BACKEND_URL="".concat(this.SAFARY_BACKEND_ORIGIN,"/sfry/?id=").concat(this.PRODUCT_ID)}var n,u,l;return n=e,u=[{key:"setup",value:function(){var e=this;return a((function(){return i(this,(function(t){switch(t.label){case 0:return t.trys.push([0,2,,3]),[4,e.setupSession()];case 1:return t.sent(),e.setupEthereumListeners(),e.setupTrackingFunctions(),e.setupWalletConnect(),[3,3];case 2:return t.sent(),console.error("Error during stag setup."),[3,3];case 3:return[2]}}))}))()}},{key:"getProductID",value:function(){var t=window.document.querySelector('script[data-name="safary-sdk"]');if(t||(t=this.SAFARY_TAG),t){var r=null==t?void 0:t.getAttribute("data-product-id");if(!r){var n=null==t?void 0:t.getAttribute("src");n&&(r=new URL(n).searchParams.get("id"))}if(r&&e.isValidProductID(r))return r}}},{key:"getSessionID",value:function(){return this.sessionId}},{key:"getSessionData",value:function(){return this.sessionData}},{key:"setupSession",value:function(){var t=this;return a((function(){var r,n;return i(this,(function(a){switch(a.label){case 0:return null!=(r=window.localStorage.getItem(t.localItemName))&&r.length>0&&(t.previousLocalStorageData=r.startsWith("{")?JSON.parse(r):{sessionId:r},n=t.previousLocalStorageData.sessionId,e.isValidSessionID(n)&&(t.sessionId=n,t.sessionData={sessionId:t.sessionId})),"none"!==t.sessionId?[3,2]:[4,t.getNewSession()];case 1:a.sent(),window.localStorage.setItem(t.localItemName,JSON.stringify(t.sessionData)),a.label=2;case 2:return[2]}}))}))()}},{key:"getNewSession",value:function(){var t=this;return a((function(){return i(this,(function(r){switch(r.label){case 0:return[4,fetch("".concat(t.SAFARY_BACKEND_ORIGIN,"/session.json?id=").concat(t.PRODUCT_ID)).then((function(e){if(!e.ok)throw new Error("Network response was not ok");return e.json()})).then((function(r){if(!e.isValidSessionID(r.sessionId))throw new Error("Invalid session id");t.sessionData=r,t.sessionId=r.sessionId}))];case 1:return r.sent(),[2]}}))}))()}},{key:"visit",value:function(){var e=this;return a((function(){var t;return i(this,(function(r){switch(r.label){case 0:return r.trys.push([0,3,,4]),[4,e.processWallet()];case 1:return r.sent(),t=e.getInfoObject("vt"),[4,e.sendVisitData(t,e.BACKEND_URL)];case 2:return r.sent(),[3,4];case 3:return r.sent(),console.error("Error during stag execution."),[3,4];case 4:return[2]}}))}))()}},{key:"setupTrackingFunctions",value:function(){window.safary=window.safary||{},window.safary.track=this.track.bind(this),window.safary.trackSwap=this.trackSwaps.bind(this),window.safary.trackDeposit=this.trackDeposit.bind(this),window.safary.trackWithdrawal=this.trackWithdrawal.bind(this),window.safary.trackNFTPurchase=this.trackNFTPurchase.bind(this)}},{key:"track",value:function(e){var n=this;return a((function(){var a;return i(this,(function(o){switch(o.label){case 0:try{t(e,!0,"object","params"),r(e.eventType,"eventType"),r(e.eventName,"eventName"),t(e.parameters,!1,"object","parameters")}catch(e){return console.error("ERROR: safary.track(): there were some validation errors."),[2]}return a=n.getInfoObject("trk",{"trk-type":e.eventType,"trk-name":e.eventName,"trk-param":e.parameters}),[4,n.sendVisitData(a,n.BACKEND_URL)];case 1:return o.sent(),[2]}}))}))()}},{key:"getInfoObject",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"vt",t=arguments.length>1?arguments[1]:void 0,r=this.isEmptyOrValidStart(window.location.href,!1),n=this.isEmptyOrValidStart(document.referrer,!0);if(r&&n)return{si:this.sessionId,pls:this.previousLocalStorageData.sessionId,sd:this.sessionData,plsd:this.previousLocalStorageData,u:window.location.href,r:document.referrer,tag:this.PRODUCT_ID,wa:this.currentWallets.length>0?this.currentWallets:void 0,evt:e,"evt-trk":null!=t?t:null,v:this.SAFARY_SCRIPT_VERSION,time:"vt"==e?this.timeScriptLoaded:(new Date).toISOString()};throw console.error("ERROR: Invalid URL or Referrer."),new Error("Invalid URL or Referrer. URL: ".concat(window.location.href," Referrer: ").concat(document.referrer))}},{key:"isEmptyOrValidStart",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return null==e?t:"string"==typeof e&&(!(!t||0!==e.length)||/^[A-Za-z0-9]/.test(e))}},{key:"sendVisitData",value:function(e,t){return a((function(){return i(this,(function(r){return[2,fetch(t,{method:"POST",headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*"},body:JSON.stringify({v:e})})]}))}))()}},{key:"setWalletType",value:function(e){var t,r={isBraveWallet:"Brave",isBitKeep:"BitKeep",isPhantom:"Phantom",isCoinbaseWallet:"Coinbase",isMetaMask:"MetaMask"};for(t in r)if(e[t])return r[t];return"Unknown"}},{key:"addWalletFromProvider",value:function(e){var t=this;return a((function(){var r,n,a;return i(this,(function(o){switch(o.label){case 0:return o.trys.push([0,5,,6]),e&&(null==e?void 0:e.selectedAddress)?null===(r=null==e?void 0:e.chainId)||void 0===r?[3,1]:(a=r,[3,3]):[3,4];case 1:return[4,null==e?void 0:e.request({method:"eth_chainId"})];case 2:a=o.sent(),o.label=3;case 3:return n=a,[2,[null==e?void 0:e.selectedAddress,t.setWalletType(e),n,"eth_sfry_all"]];case 4:return[3,6];case 5:return o.sent(),console.error("Error Adding Wallet From Provider."),[3,6];case 6:return[2,[]]}}))}))()}},{key:"getEthereumProvider",value:function(){return void 0===window.phantom?window.ethereum:void 0!==window.ethereum&&void 0!==window.ethereum.detected&&window.ethereum.detected.length>0?window.ethereum.detected[0]:void 0}},{key:"processWallet",value:function(){var e=this;return a((function(){var t,r,n,a,o;return i(this,(function(s){switch(s.label){case 0:return void 0===window.ethereum?[3,5]:(t=e.getEthereumProvider())?[4,t.request({method:"eth_accounts"})]:[3,3];case 1:return void 0!==(r=s.sent())&&r.length>0?[4,t.request({method:"eth_chainId"})]:[3,3];case 2:n=s.sent(),r.forEach((function(t){e.currentWallets.push({address:t,event:"eth_accounts",type:null,chainId:n})})),s.label=3;case 3:return[4,e.processEthereum()];case 4:(a=s.sent()).length>0&&a.forEach((function(t){t.length>0&&e.currentWallets.push({address:t[0],event:"eth_accounts__eth",type:t[1],chainId:t[2]})})),s.label=5;case 5:return[4,e.handleWalletConnect({key:"SAFARY_VISIT",value:""})];case 6:return(o=s.sent()).length>0&&o.forEach((function(t){null!==t.address&&e.currentWallets.push(t)})),[2]}}))}))()}},{key:"processEthereum",value:function(){var e=this;return a((function(){var t,r,n;return i(this,(function(o){switch(o.label){case 0:return t=[],void 0!==window.ethereum.providers&&window.ethereum.providers.forEach((s=a((function(r){var n;return i(this,(function(a){switch(a.label){case 0:return n=t.push,[4,e.addWalletFromProvider(r)];case 1:return n.apply(t,[a.sent()]),[2]}}))})),function(e){return s.apply(this,arguments)})),void 0===window.ethereum.selectedProvider?[3,2]:(r=t.push,[4,e.addWalletFromProvider(window.ethereum.selectedProvider)]);case 1:return r.apply(t,[o.sent()]),[3,4];case 2:return n=t.push,[4,e.addWalletFromProvider(e.getEthereumProvider())];case 3:n.apply(t,[o.sent()]),o.label=4;case 4:return[2,t]}var s}))}))()}},{key:"setupEthereumListeners",value:function(){if(void 0!==window.ethereum){var e,t=this;window.ethereum.on("accountsChanged",(e=a((function(e){var r,n;return i(this,(function(o){switch(o.label){case 0:return r=new Array,Array.isArray(e)||(e=[e]),[4,window.ethereum.request({method:"eth_chainId"})];case 1:return n=o.sent(),e.forEach(function(){var e=a((function(e){return i(this,(function(t){return r.push({address:e,event:"accountsChanged",type:null,chainId:n}),[2]}))}));return function(t){return e.apply(this,arguments)}}()),[4,t.processEthereum()];case 2:return o.sent().forEach((function(e){null!==e[0]&&void 0!==e[0]&&r.push({address:e[0],event:"eth_accounts__eth_listener",type:e[1],chainId:e[2]})})),t.sendWalletData(r),[2]}}))})),function(t){return e.apply(this,arguments)}))}else window.__defineSetter__("ethereum",this.setupEthereumListeners)}},{key:"setupWalletConnect",value:function(){try{var e=window.localStorage.setItem;window.localStorage.setItem=function(t,r){try{e.call(this,t,r);var n=new CustomEvent("localStorageSetItem",{detail:{key:t,value:r}});window.dispatchEvent(n)}catch(e){console.error("Error Saving Local Storage.")}};var t=this;window.addEventListener("localStorageSetItem",(r=a((function(e){var r,n,a;return i(this,(function(o){switch(o.label){case 0:return["wagmi.store"].includes(e.detail.key)?(r=t.handleWagmi(e.detail.value),[4,t.sendWalletData(r)]):[3,2];case 1:return o.sent(),[3,7];case 2:return["li.fi-wallets"].includes(e.detail.key)?(n=t.handleLiFi(e.detail.value),[4,t.sendWalletData(n)]):[3,4];case 3:return o.sent(),[3,7];case 4:return[4,t.handleWalletConnect(e.detail,!0)];case 5:return a=o.sent(),[4,t.sendWalletData(a)];case 6:o.sent(),o.label=7;case 7:return[2]}}))})),function(e){return r.apply(this,arguments)}))}catch(e){console.error("Error Setting up Wallet Connect.")}var r}},{key:"sendWalletData",value:function(t){var r=this;return a((function(){var n,a;return i(this,(function(o){switch(o.label){case 0:return t.length>0&&(n=e.filterExistingObjects(t,r.currentListenerWallets)).length>0?(r.currentListenerWallets=r.currentListenerWallets.concat(n),(a=r.getInfoObject("wl")).wa=n,[4,r.sendVisitData(a,r.BACKEND_URL)]):[3,2];case 1:o.sent(),o.label=2;case 2:return[2]}}))}))()}},{key:"handleWagmi",value:function(e){try{var t,r=JSON.parse(e);if(r&&(null==r||null===(t=r.state)||void 0===t?void 0:t.data)){var n,a=null==r||null===(n=r.state)||void 0===n?void 0:n.data;if(a&&a.account&&a.account.length>0){var o,s=null;try{s=JSON.parse(window.localStorage.getItem("wagmi.wallet")||"")}catch(e){s=null}return[{address:a.account,event:"wagmi_wallets",type:s,chainId:null==a||null===(o=a.chain)||void 0===o?void 0:o.id}]}}}catch(e){return[]}return[]}},{key:"handleLiFi",value:function(e){try{var t=JSON.parse(e);if(t&&t.length>0){var r=t[t.length-1];if(r&&(null==r?void 0:r.address)&&(null==r?void 0:r.address.length)>0)return[{address:r.address,event:"lifi_wallets",type:r.name,chainId:null}]}}catch(e){return[]}return[]}},{key:"handleWalletConnect",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],r=this;return a((function(){var n,a,o,s,u,l;return i(this,(function(i){switch(i.label){case 0:return n=e.key,["wc@2:client:0.3//session","WALLETCONNECT_DEEPLINK_CHOICE","wc@2:ethereum_provider:/chainId","WCM_RECENT_WALLET_DATA","WCM_VERSION","SAFARY_VISIT","SAFARY_POOLING"].includes(n)?(a=window.localStorage.getItem("wc@2:client:0.3//session"))&&(null==a?void 0:a.length)>0?[4,r.processWalletConnect(t,a)]:[3,2]:[3,10];case 1:case 6:return[2,i.sent()];case 2:return i.trys.push([2,9,,10]),[4,r.getValueFromIndexedDB("wc@2:client:0.3:session")];case 3:return(o=i.sent())&&(null==o?void 0:o.length)>0?[4,r.getValueFromIndexedDB("WALLETCONNECT_DEEPLINK_CHOICE")]:[3,7];case 4:return s=i.sent(),[4,r.getValueFromIndexedDB("wc@2:ethereum_provider:chainId")];case 5:return u=i.sent(),[4,r.processWalletConnect(t,o,s,u)];case 7:throw new Error("Error Reading Wallet Connect from IndexedDB.");case 8:return[3,10];case 9:return i.sent(),!1===r.pooling_active&&(l=window.setInterval((function(){if(r.pooling_active){var e=new CustomEvent("localStorageSetItem",{detail:{key:"SAFARY_POOLING",value:""}});window.dispatchEvent(e)}}),1e4),window.setTimeout((function(){window.clearInterval(l),r.pooling_active=!1}),6e4),r.pooling_active=!0),[3,10];case 10:return[2,[]]}}))}))()}},{key:"getValueFromIndexedDB",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"WALLET_CONNECT_V2_INDEXED_DB",r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"keyvaluestorage";return a((function(){return i(this,(function(n){return[2,new Promise((function(n,a){var o=window.indexedDB.open(t);o.onerror=function(e){console.error("IndexedDB Database error."),a(o.error)},o.onsuccess=function(t){var s=o.result;try{var i=s.transaction([r],"readonly").objectStore(r).get(e);i.onerror=function(e){console.error("IndexedDB Error getting value."),a(i.error)},i.onsuccess=function(e){n(i.result)}}catch(e){n(null)}}}))]}))}))()}},{key:"processWalletConnect",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:window.localStorage.getItem("wc@2:client:0.3//session"),r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:window.localStorage.getItem("WALLETCONNECT_DEEPLINK_CHOICE"),n=arguments.length>3&&void 0!==arguments[3]?arguments[3]:window.localStorage.getItem("wc@2:ethereum_provider:/chainId"),o=this;return a((function(){var a,s,u,l,c;return i(this,(function(i){a=new Array;try{t&&(s=JSON.parse(t||"")[0],u=s.namespaces.eip155.accounts[0].split(":").pop(),l=o.getWalletTypeForWalletConnect(r,s),c=n,a.push({address:u,event:e?"eth_sfry_wc_listener":"eth_sfry_wc",type:l,chainId:c}),o.pooling_active=!1)}catch(e){console.error("Error Processing Wallet Connect.",e)}return[2,a]}))}))()}},{key:"getWalletTypeForWalletConnect",value:function(e,t){var r=void 0;try{var n,a,o;e&&e.trim().length>0&&(r=null===(n=JSON.parse(e))||void 0===n?void 0:n.name),r&&0!==r.trim().length||(r=(null==t||null===(o=t.peer)||void 0===o||null===(a=o.metadata)||void 0===a?void 0:a.name)||"Unknown")}catch(e){}return r}},{key:"trackSwaps",value:function(e){var n=this;return a((function(){var a;return i(this,(function(o){try{t(e,!0,"object","params"),r(null==e?void 0:e.fromAmount,"fromAmount"),r(null==e?void 0:e.fromCurrency,"fromCurrency"),r(null==e?void 0:e.contractAddress,"contractAddress"),t(null==e?void 0:e.parameters,!1,"object","parameters")}catch(e){return console.error("ERROR: safary.trackSwaps(): there were some validation errors."),[2]}return[2,n.track({eventType:"swap",eventName:null!==(a=null==e?void 0:e.eventName)&&void 0!==a?a:"Swaps",parameters:{default__fromAmount:null==e?void 0:e.fromAmount,default__fromCurrency:null==e?void 0:e.fromCurrency,default__contractAddress:null==e?void 0:e.contractAddress,default__fromAmountUSD:null==e?void 0:e.fromAmountUSD}})]}))}))()}},{key:"trackDeposit",value:function(e){var n=this;return a((function(){var a;return i(this,(function(o){try{t(e,!0,"object","params"),r(null==e?void 0:e.amount,"fromAmount"),r(null==e?void 0:e.currency,"fromCurrency"),r(null==e?void 0:e.contractAddress,"contractAddress"),t(null==e?void 0:e.parameters,!1,"object","parameters")}catch(e){return console.error("ERROR: safary.trackDeposit(): there were some validation errors."),[2]}return[2,n.track({eventType:"deposit",eventName:null!==(a=null==e?void 0:e.eventName)&&void 0!==a?a:"Deposits",parameters:{default__fromAmount:null==e?void 0:e.amount,default__fromCurrency:null==e?void 0:e.currency,default__contractAddress:null==e?void 0:e.contractAddress,default__fromAmountUSD:null==e?void 0:e.amountUSD}})]}))}))()}},{key:"trackWithdrawal",value:function(e){var n=this;return a((function(){var a;return i(this,(function(o){try{t(e,!0,"object","params"),r(null==e?void 0:e.amount,"fromAmount"),r(null==e?void 0:e.currency,"fromCurrency"),r(null==e?void 0:e.contractAddress,"contractAddress"),t(null==e?void 0:e.parameters,!1,"object","parameters")}catch(e){return console.error("ERROR: safary.trackWithdrawal(): there were some validation errors."),[2]}return[2,n.track({eventType:"withdrawal",eventName:null!==(a=null==e?void 0:e.eventName)&&void 0!==a?a:"Withdrawals",parameters:{default__fromAmount:null==e?void 0:e.amount,default__fromCurrency:null==e?void 0:e.currency,default__contractAddress:null==e?void 0:e.contractAddress,default__fromAmountUSD:null==e?void 0:e.amountUSD}})]}))}))()}},{key:"trackNFTPurchase",value:function(e){var n=this;return a((function(){var a;return i(this,(function(o){try{t(e,!0,"object","params"),r(null==e?void 0:e.amount,"fromAmount"),r(null==e?void 0:e.currency,"fromCurrency"),r(null==e?void 0:e.contractAddress,"contractAddress"),r(null==e?void 0:e.tokenId,"tokenId"),t(null==e?void 0:e.parameters,!1,"object","parameters")}catch(e){return console.error("ERROR: safary.trackNFTPurchase(): there were some validation errors."),[2]}return[2,n.track({eventType:"NFT Purchase",eventName:null!==(a=null==e?void 0:e.eventName)&&void 0!==a?a:"NFT Purchases",parameters:{default__fromAmount:null==e?void 0:e.amount,default__fromCurrency:null==e?void 0:e.currency,default__fromAmountUSD:null==e?void 0:e.amountUSD,default__contractAddress:null==e?void 0:e.contractAddress,default__tokenId:null==e?void 0:e.tokenId}})]}))}))()}}],l=[{key:"isValidProductID",value:function(e){return"string"!=typeof e?(console.error("ERROR: safary.isValidProductID(): the product ID must be a string."),!1):14!==e.length?(console.error("ERROR: safary.isValidProductID(): the product ID must have 14 characters."),!1):e.startsWith("prd_")?!!/^[a-z0-9]+$/i.test(e.substring(4))||(console.error("ERROR: safary.isValidProductID(): the product ID must be alphanumeric."),!1):(console.error('ERROR: safary.isValidProductID(): the product ID must start with "prd_".'),!1)}},{key:"isValidSessionID",value:function(e){return"string"!=typeof e?(console.error("ERROR: safary.isValidSessionID(): the session ID must be a string."),!1):36!==e.length?(console.error("ERROR: safary.isValidSessionID(): the session ID must have 36 characters."),!1):!!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(e)||(console.error("ERROR: safary.isValidSessionID(): the session ID must be a valid UUID."),!1)}},{key:"isObjectInList",value:function(e,t){return t.some((function(t){return t.address===e.address&&t.event===e.event&&t.type===e.type&&t.chainId===e.chainId}))}},{key:"filterExistingObjects",value:function(t,r){return t.filter((function(t){return!e.isObjectInList(t,r)}))}}],u&&o(n.prototype,u),l&&o(n,l),e}();function l(e,t,r,n,a,o,s){try{var i=e[o](s),u=i.value}catch(e){return void r(e)}i.done?t(u):Promise.resolve(u).then(n,a)}function c(e){return function(){var t=this,r=arguments;return new Promise((function(n,a){var o=e.apply(t,r);function s(e){l(o,n,a,s,i,"next",e)}function i(e){l(o,n,a,s,i,"throw",e)}s(void 0)}))}}function d(e,t){var r,n,a,o,s={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:i(0),throw:i(1),return:i(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function i(o){return function(i){return function(o){if(r)throw new TypeError("Generator is already executing.");for(;s;)try{if(r=1,n&&(a=2&o[0]?n.return:o[0]?n.throw||((a=n.return)&&a.call(n),0):n.next)&&!(a=a.call(n,o[1])).done)return a;switch(n=0,a&&(o=[2&o[0],a.value]),o[0]){case 0:case 1:a=o;break;case 4:return s.label++,{value:o[1],done:!1};case 5:s.label++,n=o[1],o=[0];continue;case 7:o=s.ops.pop(),s.trys.pop();continue;default:if(!((a=(a=s.trys).length>0&&a[a.length-1])||6!==o[0]&&2!==o[0])){s=0;continue}if(3===o[0]&&(!a||o[1]>a[0]&&o[1]<a[3])){s.label=o[1];break}if(6===o[0]&&s.label<a[1]){s.label=a[1],a=o;break}if(a&&s.label<a[2]){s.label=a[2],s.ops.push(o);break}a[2]&&s.ops.pop(),s.trys.pop();continue}o=t.call(e,s)}catch(e){o=[6,e],n=0}finally{r=a=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,i])}}}var h=window.document.currentScript,v="____sfry_loaded";function f(){return(f=c((function(){return d(this,(function(e){switch(e.label){case 0:return window[v]?[2]:(window[v]=!0,"complete"!==document.readyState?[3,2]:[4,p()]);case 1:return e.sent(),[3,3];case 2:window.addEventListener("load",p,!1),e.label=3;case 3:return[2]}}))}))).apply(this,arguments)}function p(){return m.apply(this,arguments)}function m(){return(m=c((function(){var e;return d(this,(function(t){switch(t.label){case 0:return[4,(e=new u(h)).setup()];case 1:return t.sent(),[4,e.visit()];case 2:return t.sent(),[2]}}))}))).apply(this,arguments)}"undefined"!=typeof window&&function(){f.apply(this,arguments)}()}(); `}
    </Script>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} initialChain={arbitrum}>
          {/* <ApolloProvider client={apolloClient}> */}
          <>
            {_isConnected && !tosAccepted && (
              <TermsOfService
                setIsOpen={true}
                isOpen={true}
                onAccept={handleTosAccept}
              />
            )}
            {!isLoading ? (
              <div className="font-Jetbrains">
                <Component {...pageProps} />
              </div>
            ) : (
              <div className="h-screen w-screen flex justify-center items-center text-main2 flex-col gap-y-5">
                <svg
                  stroke="currentColor"
                  className="animate-spin"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  height="3em"
                  width="3em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                <h1 className="text-white -mr-8">Loading...</h1>
              </div>
            )}
          </>
          <SpeedInsights />
          {/* <Analytics /> </ApolloProvider> */}
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp;
