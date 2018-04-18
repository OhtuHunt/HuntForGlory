'use strict';

const applicationServerPublicKey = 'BP7Qda2PFbhXlbC4UDwHWjicJJLKTUE3f_pCFlkXYg4CIgnu8NF6CMTRRPkxx62FJ83m4zHKfXYjB5cn6OeeYk4';
let isSubscribed = false;
let swRegistration = null;

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('pwabuilder-sw.js')
        .then(function (swReg) {
            navigator.serviceWorker.ready.then(function (swReg) {
                // const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
                // swReg.pushManager.subscribe({
                //     userVisibleOnly: true,
                //     applicationServerKey: applicationServerKey
                // })
                console.log('Service Worker is registered', swReg)
                console.log("Subscribed")
                swReg.update().then(function(res) {
                    console.log("Service Worker updated")
                })
                .catch(function(error) {
                    console.log("error: "+ error)
                })
            })
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}