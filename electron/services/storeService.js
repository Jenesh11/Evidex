import { ipcMain } from 'electron';
import Store from 'electron-store';

const store = new Store({
    name: 'evidex-config',
    encryptionKey: 'evidex-secure-storage-key' // In real production, this should be more dynamic or system keychain based
});

export const setupStoreHandlers = () => {
    ipcMain.handle('store:get', (event, key) => {
        return store.get(key);
    });

    ipcMain.handle('store:set', (event, key, value) => {
        store.set(key, value);
        return true;
    });

    ipcMain.handle('store:delete', (event, key) => {
        store.delete(key);
        return true;
    });
};
