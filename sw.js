// GuapisAPP Service Worker v2
const ICON = '/GuapisAPP/icon-192.png';
let scheduledNotifs = [];

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });

// Recibir lista de notificaciones desde la app
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SCHEDULE'){
    scheduledNotifs = e.data.notifications || [];
    // Arrancar el chequeo periódico
    startChecking();
  }
});

// Chequear cada minuto si hay notificaciones para disparar
let checkInterval = null;
function startChecking(){
  if(checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(checkAndFire, 60000);
  checkAndFire(); // chequear inmediatamente también
}

function checkAndFire(){
  const now = Date.now();
  const pending = [];
  scheduledNotifs.forEach(n => {
    // Disparar si el tiempo programado ya pasó (con margen de 90 segundos)
    if(n.time <= now + 90000 && n.time > now - 90000){
      self.registration.showNotification(n.title, {
        body: n.body,
        icon: ICON,
        badge: ICON,
        vibrate: [200, 100, 200],
        tag: 'guapisapp-' + n.time
      });
    } else if(n.time > now){
      pending.push(n); // mantener las futuras
    }
  });
  scheduledNotifs = pending;
  if(scheduledNotifs.length === 0 && checkInterval){
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

// Abrir la app al tocar la notificación
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for(const client of clientList){
        if(client.url.includes('GuapisAPP') && 'focus' in client)
          return client.focus();
      }
      if(clients.openWindow) return clients.openWindow('/GuapisAPP/');
    })
  );
});
