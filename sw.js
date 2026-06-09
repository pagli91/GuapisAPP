// GuapisAPP Service Worker
const CACHE='guapisapp-v1';

self.addEventListener('install',e=>{
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(clients.claim());
});

// Manejar notificaciones al hacer click
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window'}).then(clientList=>{
      for(const client of clientList){
        if(client.url.includes('GuapisAPP')&&'focus' in client)
          return client.focus();
      }
      if(clients.openWindow)
        return clients.openWindow('/GuapisAPP/');
    })
  );
});
