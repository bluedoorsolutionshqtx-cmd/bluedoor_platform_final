import { getFailed } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/event-store/index.js';
import { publish } from 'file:///data/data/com.termux/files/home/bluedoor_platform_final/packages/events/eventBus.js';

console.log('Replay worker started...');

setInterval(async () => {
  const failed = await getFailed(20);

  for (const evt of failed) {
    console.log('REPLAYING:', evt.event_id);

    await publish(evt.channel, evt.payload);
  }
}, 10000); // every 10s
