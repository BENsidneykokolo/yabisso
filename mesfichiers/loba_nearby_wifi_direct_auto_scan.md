# Loba - Nearby WiFi Direct Auto Scan (Code Fonctionnel)

Ce fichier contient le code de l'écran "Accueil Loba" avec le WiFi Direct et Nearby Mesh automatique qui fonctionne.

## Fichiers Sources
- `app/src/features/loba/screens/LobaHomeScreen.js` - Écran principal
- `app/src/features/bluetooth/services/WifiDirectService.js` - Service WiFi Direct
- `app/src/features/bluetooth/services/P2PAutoSync.js` - Moteur de sync auto
- `app/src/features/bluetooth/services/NearbyMeshService.js` - Service Mesh

---

## LobaHomeScreen.js - Code Cle (Auto Scan + Mesh)

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Alert,
  Share,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as SecureStore from 'expo-secure-store';
import LobaBottomNav from '../components/LobaBottomNav';
import withObservables from '@nozbe/with-observables';
import { database } from '../../../lib/db';
import { P2PAutoSync } from '../../bluetooth/services/P2PAutoSync';
import { WifiDirectService } from '../../bluetooth/services/WifiDirectService';
import { MeshContentUpdateEvents } from '../../bluetooth/services/NearbyMeshService';
import { useMeshConnection } from '../../bluetooth/hooks/useMeshConnection';
import { useWifiDirect } from '../hooks/useWifiDirect';
import { Q } from '@nozbe/watermelondb';

function LobaHomeScreen({ onBack, onNavigate, posts = [] }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Helper pour obtenir une URL media valide
  const getValidMediaUri = (post) => {
    if (post.localMediaPath && typeof post.localMediaPath === 'string' && post.localMediaPath.length > 0) {
      return post.localMediaPath;
    }
    if (post.videoUrl && typeof post.videoUrl === 'string' && post.videoUrl.length > 0) {
      return post.videoUrl;
    }
    if (post.imageUrl && typeof post.imageUrl === 'string' && post.imageUrl.length > 0) {
      return post.imageUrl;
    }
    return null;
  };

  // Merge DB posts with initial mock videos
  const getDisplayPosts = () => [
    ...posts.map(p => {
      const mediaUri = getValidMediaUri(p);
      return {
        id: p.id,
        username: p.username,
        avatar: p.avatar,
        video: mediaUri,
        hasMedia: !!mediaUri,
        type: p.videoUrl || (p.localMediaPath && p.localMediaPath.endsWith('.mp4')) ? 'video' : 'photo',
        caption: p.content,
        song: 'Original Sound - ' + p.username,
        likes: p.likes,
        comments: p.comments,
        progress: 0,
        liked: p.isLiked,
        followed: false,
        saved: false,
        filterColor: p.filterColor,
      };
    })
  ];

  const meshState = useMeshConnection();
  const wifiState = useWifiDirect();

  const [p2pLogModal, setP2pLogModal] = useState(false);
  const [p2pLogs, setP2pLogs] = useState([]);

  const [feedVideos, setFeedVideos] = useState(getDisplayPosts());

  useEffect(() => {
    // Phase 14: Démarrage automatique du P2P Auto Sync
    P2PAutoSync.start();
    P2PAutoSync.requestWifiDirectActivation();

    const unsubLogs = P2PAutoSync.onLogUpdate((logs) => {
      setP2pLogs([...logs]);
    });
    
    const unsubContent = MeshContentUpdateEvents.subscribe(({ count, source }) => {
      console.log(`[LobaHomeScreen] Nouveau contenu reçu de ${source}: ${count} posts`);
      setTimeout(async () => {
        try {
          const freshPosts = await database.get('loba_posts')
            .query(Q.sortBy('created_at', Q.desc), Q.take(50))
            .fetch();
          setFeedVideos(freshPosts.map(p => ({
            id: p.id,
            username: p.username,
            avatar: p.avatar,
            video: p.localMediaPath || p.videoUrl || p.imageUrl,
            type: p.videoUrl || (p.localMediaPath && p.localMediaPath.endsWith('.mp4')) ? 'video' : 'photo',
            caption: p.content,
            song: 'Original Sound - ' + p.username,
            likes: p.likes,
            comments: p.comments,
            progress: 0,
            liked: p.isLiked,
            followed: false,
            saved: false,
            filterColor: p.filterColor,
          })));
          console.log(`[LobaHomeScreen] Feed mis à jour: ${freshPosts.length} posts`);
        } catch (e) {
          console.error('[LobaHomeScreen] Erreur mise à jour feed:', e);
        }
      }, 500);
    });
    
    // Charger les logs initiaux immédiatement
    setP2pLogs([...P2PAutoSync.stats.logs]);

    const unsubSync = WifiDirectService.on('onSyncStatus', ({ status }) => {
      if (status === 'SUCCESS') {
        console.log('[LobaHomeScreen] Pack traité, rechargement du feed depuis la DB...');
        setTimeout(async () => {
          try {
            const freshPosts = await database.get('loba_posts')
              .query(Q.sortBy('created_at', Q.desc), Q.take(50))
              .fetch();
            setFeedVideos(freshPosts.map(p => ({
              id: p.id,
              username: p.username,
              avatar: p.avatar,
              video: p.localMediaPath || p.videoUrl || p.imageUrl,
              type: p.videoUrl || (p.localMediaPath && p.localMediaPath.endsWith('.mp4')) ? 'video' : 'photo',
              caption: p.content,
              song: 'Original Sound - ' + p.username,
              likes: p.likes,
              comments: p.comments,
              progress: 0,
              liked: p.isLiked,
              followed: false,
              saved: false,
              filterColor: p.filterColor,
            })));
            console.log(`[LobaHomeScreen] Feed rechargé: ${freshPosts.length} posts`);
          } catch (e) {
            console.error('[LobaHomeScreen] Erreur reload feed:', e);
          }
        }, 1500);
      }
    });

    return () => {
      P2PAutoSync.stop();
      unsubLogs();
      unsubSync();
      unsubContent();
    };
  }, []);

  // ... (le reste du code pour likes, comments, share, etc.)

  return (
    <View style={styles.container}>
      {/* GPS Warning */}
      {!wifiState.isLocationEnabled && Platform.OS === 'android' && (
        <View style={styles.gpsWarning}>
          <MaterialCommunityIcons name="map-marker-off" size={16} color="#fff" />
          <Text style={styles.gpsWarningText}>Localisation désactivée. Allumez le GPS pour le partage.</Text>
        </View>
      )}
      
      {/* Header Status */}
      <View style={styles.header}>
        <Pressable 
          style={styles.refreshBtn} 
          onPress={() => P2PAutoSync.forceRefresh()}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
        </Pressable>

        <Pressable 
          style={styles.statusChip} 
          onPress={() => P2PAutoSync.forceRefresh()}
          onLongPress={() => setP2pLogModal(true)}
        >
          {wifiState.connectedPeer ? (
             <MaterialCommunityIcons name="wifi-star" size={14} color="#22c55e" />
          ) : wifiState.isDiscovering ? (
             <ActivityIndicator size={10} color="#fbbf24" style={{ marginRight: 4 }} />
          ) : meshState.isConnected ? (
            <MaterialCommunityIcons name="bluetooth-connect" size={14} color="#22c55e" />
          ) : (
            <MaterialCommunityIcons name="wifi-off" size={14} color="#fbbf24" />
          )}
          <Text style={[styles.statusText, (wifiState.connectedPeer || meshState.isConnected) && { color: '#22c55e' }]}>
            {wifiState.connectedPeer 
              ? 'WiFi P2P Connecté' 
              : wifiState.isDiscovering 
                ? 'Recherche...' 
                : meshState.isConnected 
                  ? `Mesh Actif (${meshState.peerCount})` 
                  : 'Mode Offline'}
          </Text>
        </Pressable>
      </View>
 
      {/* Mesh Status Overlay */}
      {meshState.isConnected && !wifiState.connectedPeer && (
        <View style={styles.meshOverlay}>
          <Text style={styles.meshOverlayText}>Diffusion locale (Mesh) active ✨</Text>
        </View>
      )}

      {/* Feed Video */}
      {feedVideos.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#101922' }}>
          <MaterialCommunityIcons name="image-off-outline" size={64} color="rgba(255,255,255,0.1)" />
          <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16, fontSize: 16 }}>Aucune publication pour le moment</Text>
        </View>
      ) : (
        <FlatList
          data={feedVideos}
          renderItem={renderVideo}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          pagingEnabled
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          vertical
          showsVerticalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
          removeClippedSubviews={true}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.y / height);
            setCurrentVideoIndex(index);
          }}
        />
      )}

      {/* P2P Logs Modal */}
      <Modal
        visible={p2pLogModal}
        transparent
        animationType="fade"
        onRequestClose={() => setP2pLogModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '60%', backgroundColor: '#000' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Logs Partage Offline</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable 
                  style={styles.pingBtn} 
                  onPress={() => P2PAutoSync.sendTestPing()}
                >
                  <Text style={styles.pingBtnText}>Test Ping</Text>
                </Pressable>
                <Pressable 
                  style={[styles.pingBtn, { backgroundColor: '#ef4444', marginLeft: 10 }]} 
                  onPress={() => P2PAutoSync.forceRefresh()}
                >
                  <Text style={styles.pingBtnText}>RESET HP</Text>
                </Pressable>
                <Pressable onPress={() => setP2pLogModal(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#fff" style={{ marginLeft: 15 }} />
                </Pressable>
              </View>
            </View>
            <ScrollView style={styles.logContainer}>
              {p2pLogs.length === 0 ? (
                <Text style={styles.emptyLogText}>Aucun log pour le moment...</Text>
              ) : (
                p2pLogs.map((log, i) => (
                  <Text key={i} style={styles.logText}>{log}</Text>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <LobaBottomNav activeTab="home" onNavigate={(tab) => {
        if (tab === 'home') onNavigate?.('loba_home');
        else if (tab === 'friends') onNavigate?.('loba_friends');
        else if (tab === 'create') onNavigate?.('loba_record');
        else if (tab === 'messages') onNavigate?.('loba_messages');
        else if (tab === 'profile') onNavigate?.('loba_profile');
      }} />
    </View>
  );
}
```

---

## Hooks Utilisés

### useWifiDirect (app/src/features/loba/hooks/useWifiDirect.js)
```javascript
import { useState, useEffect } from 'react';
import { WifiDirectService } from '../../bluetooth/services/WifiDirectService';

export function useWifiDirect() {
  const [state, setState] = useState({
    isInitialized: false,
    isDiscovering: false,
    connectedPeer: null,
    isGroupOwner: false,
    groupOwnerAddress: null,
    peers: [],
    isLocationEnabled: true,
  });

  useEffect(() => {
    const unsubPeers = WifiDirectService.on('onPeersUpdates', (peers) => {
      setState(prev => ({ ...prev, peers: peers || [] }));
    });

    const unsubConn = WifiDirectService.on('onConnectionChange', ({ connected, isGroupOwner, info }) => {
      setState(prev => ({ 
        ...prev, 
        connectedPeer: connected ? info : null,
        isGroupOwner,
        groupOwnerAddress: info?.groupOwnerAddress,
      }));
    });

    const unsubLoc = WifiDirectService.on('onLocationStatus', ({ enabled }) => {
      setState(prev => ({ ...prev, isLocationEnabled: enabled }));
    });

    // État initial
    setState({
      isInitialized: WifiDirectService.initialized,
      isDiscovering: WifiDirectService.isDiscovering,
      connectedPeer: WifiDirectService.connectedPeer,
      isGroupOwner: WifiDirectService.isGroupOwner,
      groupOwnerAddress: WifiDirectService.groupOwnerAddress,
      peers: WifiDirectService.peers,
      isLocationEnabled: WifiDirectService.isLocationEnabled,
    });

    return () => {
      unsubPeers();
      unsubConn();
      unsubLoc();
    };
  }, []);

  return state;
}
```

### useMeshConnection (app/src/features/bluetooth/hooks/useMeshConnection.js)
```javascript
import { useState, useEffect } from 'react';
import { NearbyMeshService } from '../services/NearbyMeshService';

export function useMeshConnection() {
  const [state, setState] = useState({
    isRunning: false,
    isConnected: false,
    peerCount: 0,
    peers: [],
  });

  useEffect(() => {
    const unsubStatus = NearbyMeshService.on('onStatusChange', ({ isRunning, isConnected }) => {
      setState(prev => ({ ...prev, isRunning, isConnected }));
    });

    const unsubPeers = NearbyMeshService.on('onPeerUpdate', ({ peers }) => {
      setState(prev => ({ ...prev, peers, peerCount: peers.length }));
    });

    // État initial
    setState({
      isRunning: NearbyMeshService.isRunning,
      isConnected: NearbyMeshService.isConnected,
      peerCount: NearbyMeshService.connectedPeers?.size || 0,
      peers: Array.from(NearbyMeshService.connectedPeers?.values() || []),
    });

    return () => {
      unsubStatus();
      unsubPeers();
    };
  }, []);

  return state;
}
```

---

## Services Liés

### WifiDirectService.js
- `initialize()` - Initialise le service
- `startDiscovery()` - Démarre la découverte
- `createGroup()` - Crée le groupe (GO)
- `connectToPeer(peer)` - Connecte à un peer
- `sendFile(path, metadata)` - Envoie un fichier
- `receiveFile(handler)` - Reçoit un fichier
- Events: `onPeersUpdates`, `onConnectionChange`, `onSyncStatus`, `onTransferProgress`

### NearbyMeshService.js
- `start()` - Démarre le mesh
- `stop()` - Arrête le mesh
- `discoverPeers()` - Découve les peers
- Events: `onPeerFound`, `onPeerLost`, `onStatusChange`

### P2PAutoSync.js
- `start()` - Démarre le sync automatique
- `stop()` - Arrête le sync
- `triggerSync(category)` - Déclenche un sync manuel
- `forceRefresh()` - Force le refresh
- `sendTestPing()` - Envoie un ping de test
- Events: `onLogUpdate`, `onSyncStatus`

---

## Notes
- Le code intègre automatiquement le WiFi Direct et le Mesh Nearby
- Auto-démarrage au montage de l'écran
- Logs disponibles via modal (long press sur le status chip)
- Refresh via le bouton refresh dans le header