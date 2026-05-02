// DELETED: This service is no longer used and caused build failures due to missing native dependencies.
// All P2P mesh logic has been migrated to NearbyMeshService.js using expo-nearby-connections.
export const MeshSyncService = {
  start: () => console.log('MeshSyncService is deprecated'),
  stop: () => {},
  on: () => (() => {}),
};
