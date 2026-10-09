import { getApiConfig } from '../../shared/http/apiConfig';
import { ApiError, errorMessage } from '../../shared/http/ApiError';
import { sendPendingActions } from './actionsStep';
import { hasPulledBefore, pullAndMerge } from './pullStep';
import { pushPending } from './pushStep';
import { refreshReadings } from './readingsStep';
import { getSyncStatus, updateSyncStatus } from './syncStatus';

/**
 * One full sync: upload first (so nothing local is lost), then pending actions, then download.
 * Safe to call at any moment: if one is already running, the call is ignored.
 */
export async function runSync(): Promise<void> {
  if (getSyncStatus().running) return;
  if (!navigator.onLine) {
    updateSyncStatus({ lastError: 'Sin conexión: los registros quedan guardados en el celular' });
    return;
  }

  updateSyncStatus({ running: true, lastError: undefined });
  try {
    const { deviceId } = await getApiConfig();
    const { hadStale, uploaded } = await pushPending(deviceId);
    await sendPendingActions();
    await pullAndMerge(hadStale || !(await hasPulledBefore()));
    await refreshReadings();
    updateSyncStatus({ running: false, lastSuccessAt: new Date().toISOString(), lastUploaded: uploaded });
  } catch (error) {
    const message = error instanceof ApiError && error.isTemporary
      ? `${errorMessage(error)}. Se reintentará solo.`
      : errorMessage(error);
    updateSyncStatus({ running: false, lastError: message });
  }
}
