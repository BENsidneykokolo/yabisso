import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WifiDirectService } from '../../bluetooth/services/WifiDirectService';
import { P2PAutoSync } from '../../bluetooth/services/P2PAutoSync';
import { NetworkRailDetector } from '../../bluetooth/services/NetworkRailDetector';
import { LobaPackService } from '../../loba/services/LobaPackService';

export default function LobaPacksScreen({ onBack }) {
  const [mode, setMode] = useState(null); // 'send' | 'receive' | null
  const [peers, setPeers] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); 
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const [connectedPeerName, setConnectedPeerName] = useState('');
  const [availablePacks, setAvailablePacks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [decompressProgress, setDecompressProgress] = useState(0);
  const [p2pStatus, setP2pStatus] = useState({ role: '', ip: '' });
  const [expandLogs, setExpandLogs] = useState(false);

  useEffect(() => {
    // Phase 14: On rallume le moteur de sync ici
    P2PAutoSync.start();

    const init = async () => {
      setIsInitializing(true);
      addLog('Initialisation du service WiFi...');
      const ok = await WifiDirectService.initialize();
      if (ok) {
        addLog('✅ Service WiFi prêt.');
        const packs = await LobaPackService.getAvailablePacks();
        setAvailablePacks(packs);
      } else {
        addLog('❌ Échec initialisation. Vérifiez vos permissions et le GPS.');
      }
      setIsInitializing(false);
    };
    init();

    const unsubPeers = WifiDirectService.on('onPeersUpdates', (peersList) => {
      setPeers(peersList || []);
    });

    const unsubConn = WifiDirectService.on('onConnectionChange', ({ connected, isGroupOwner, info }) => {
      setIsConnected(connected);
      setIsGroupOwner(!!isGroupOwner);
      setIsConnecting(false); 
      
      if (connected) {
        const ip = WifiDirectService.groupOwnerAddress || '192.168.49.1';
        setP2pStatus({
          role: isGroupOwner ? 'Group Owner (Portail)' : 'Client',
          ip: ip
        });
        addLog(`✅ État P2P: ${isGroupOwner ? 'Portail Ouvert' : 'Connecté au Portail'}`);
        if (WifiDirectService.connectedPeer) {
           setConnectedPeerName(WifiDirectService.connectedPeer.deviceName || 'Inconnu');
        }
      } else {
        setP2pStatus({ role: '', ip: '' });
        setConnectedPeerName('');
      }
    });

    const unsubProgress = WifiDirectService.on('onTransferProgress', ({ progress, status }) => {
      setSyncProgress(progress);
      if (status === 'sending') {
        setSyncStatus(`📤 Envoi en cours : ${progress}%`);
      } else if (status === 'receiving') {
        setIsSyncing(true);
        setSyncStatus(`📥 Réception du pack : ${progress}%`);
      } else if (status === 'complete') {
        setSyncProgress(100);
        setSyncStatus('📦 Pack reçu !');
      }
    });

    const unsubSync = WifiDirectService.on('onSyncStatus', ({ status, progress, message }) => {
      if (status === 'PACKING') {
        setIsSyncing(true);
        setSyncProgress(0);
        setSyncStatus(message || '📦 Création du pack...');
      } else if (status === 'SENDING') {
        setSyncStatus(message || '📤 Envoi en cours...');
      } else if (status === 'RECEIVING') {
        setIsSyncing(true);
        setSyncStatus(message || '🧬 Décompression en cours...');
        setDecompressProgress(0);
        // On attache l'intervalle à un identifiant dans la window ou une réf (simplifié: via état local)
        if (window._decompressInterval) clearInterval(window._decompressInterval);
        window._decompressInterval = setInterval(() => {
          setDecompressProgress(prev => {
            if (prev >= 90) return 90;
            return prev + 10;
          });
        }, 500);
      } else if (status === 'SUCCESS') {
        if (window._decompressInterval) clearInterval(window._decompressInterval);
        setDecompressProgress(100);
        setSyncProgress(100);
        setSyncStatus('✅ Synchronisation réussie !');
        addLog('✅ Contenu traité avec succès !');
        setTimeout(() => {
          setIsSyncing(false);
          setSyncStatus('');
          setSyncProgress(0);
          setDecompressProgress(0);
        }, 2000);
      } else if (status === 'ERROR') {
        if (window._decompressInterval) clearInterval(window._decompressInterval);
        addLog(`❌ Erreur: ${message}`);
        setIsSyncing(false);
        setSyncStatus('');
        setSyncProgress(0);
        setDecompressProgress(0);
      } else if (status === 'IDLE') {
        if (window._decompressInterval) clearInterval(window._decompressInterval);
        setIsSyncing(false);
        setSyncStatus('');
        setSyncProgress(0);
        setDecompressProgress(0);
      }
    });

    return () => {
      unsubPeers();
      unsubConn();
      unsubSync();
      unsubProgress();
      // Phase 14: On arrête le moteur en partant pour éviter les batteries drains
      P2PAutoSync.stop();
    };
  }, []);

  const addLog = (msg) => {
    console.log('[LobaPacksScreen]', msg);
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  const handleStartReceive = async () => {
    setMode('receive');
    addLog('Démarrage mode Recevoir (Group Owner)...');
    try {
      const success = await WifiDirectService.createGroup();
      if (success) {
        addLog('✔️ Groupe créé. En attente de connexion (Diffuse Loba)...');
      } else {
        addLog('❌ Échec création du groupe.');
      }
    } catch (e) {
      addLog('❌ Erreur: ' + e.message);
    }
  };

  const handleStartSend = async () => {
    setMode('send');
    addLog('Démarrage mode Envoyer (Client)...');
    try {
      addLog('Nettoyage du matériel WiFi...');
      await WifiDirectService.removeGroup();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsDiscovering(true);
      await WifiDirectService.startDiscovery(true);
      addLog('Recherche des téléphones Loba...');
    } catch (e) {
      addLog('❌ Erreur scan: ' + e.message);
      setIsDiscovering(false);
    }
  };

  const connectToPeer = async (peer) => {
    addLog(`Tentative connexion à ${peer.deviceName}...`);
    setIsConnecting(true);
    try {
      const success = await WifiDirectService.connectToPeer(peer);
      if (!success) {
         addLog('❌ Échec connexion.');
         setIsConnecting(false);
      }
    } catch (e) {
      addLog('❌ Erreur: ' + e.message);
      setIsConnecting(false);
    }
  };

  const stopP2P = async () => {
    addLog('Arrêt du P2P...');
    await WifiDirectService.cleanup();
    setMode(null);
    setPeers([]);
    setIsConnected(false);
    setIsConnecting(false);
    setConnectedPeerName('');
    setP2pStatus({ role: '', ip: '' });
    addLog('P2P Arrêté.');
  };

  const handleHardReset = async () => {
    addLog('♻️ Réinitialisation forcée du matériel...');
    try {
      await WifiDirectService.removeGroup();
      await WifiDirectService.stopDiscovery();
      setIsConnecting(false);
      addLog('✅ Matériel réinitialisé.');
      Alert.alert('Succès', 'Le matériel WiFi Direct a été réinitialisé. Vous pouvez recommencer.');
    } catch (e) {
      addLog('❌ Erreur reset: ' + e.message);
    }
  };

  const syncPacks = async (category = null) => {
    if (!isConnected) {
      Alert.alert('Erreur', 'Vous devez d\'abord vous connecter à un pair.');
      return;
    }

    if (isGroupOwner) {
      Alert.alert(
        'Action non autorisée', 
        'Ce téléphone est en mode "Portail" (Récepteur). C\'est à votre ami (l\'Envoyeur) de cliquer sur "Transférer" pour vous envoyer son pack.'
      );
      return;
    }

    addLog(`🚀 Lancement de la synchronisation ${category || 'Générale'}...`);
    P2PAutoSync.triggerSync(category);
  };

  useEffect(() => {
    addLog('Écran LobaPacks initialisé. Mode: ' + mode);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Partage Packs (P2P)</Text>
        <Pressable style={styles.stopBtn} onPress={stopP2P}>
           <MaterialCommunityIcons name="close-circle-outline" size={24} color="#ef4444" />
        </Pressable>
      </View>

      {/* HUD de Progression Flottant */}
      {isSyncing && (
        <View style={styles.floatingProgress}>
           <ActivityIndicator size="small" color="#fff" />
           <View style={styles.floatingProgressInfo}>
              <Text style={styles.floatingProgressText}>{syncStatus}</Text>
              
              {/* Barre de progression transfert */}
              {syncProgress > 0 && syncProgress < 100 && (
                <View style={styles.miniProgressBarBg}>
                   <View style={[styles.miniProgressBarFill, { width: `${syncProgress}%` }]} />
                </View>
              )}
              
              {/* Barre de progression décompression */}
              {decompressProgress > 0 && (
                <View style={{ marginTop: 8 }}>
                   <Text style={styles.decompressLabel}>🧬 Décompression: {decompressProgress}%</Text>
                   <View style={[styles.miniProgressBarBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                      <View style={[styles.miniProgressBarFill, { width: `${decompressProgress}%`, backgroundColor: '#F59E0B' }]} />
                   </View>
                </View>
              )}
           </View>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {isInitializing && (
          <View style={{ padding: 20, alignItems: 'center' }}>
             <ActivityIndicator size="large" color="#3B82F6" />
             <Text style={[styles.infoText, { marginTop: 10 }]}>Initialisation du matériel WiFi...</Text>
          </View>
        )}

        {mode === null && !isInitializing && (
          <View style={styles.selectionView}>
             <Text style={styles.infoText}>
                Pour partager des packs Loba hors ligne sans conflit, choisissez qui envoie et qui reçoit.
             </Text>
             
             <View style={styles.cardRow}>
               <Pressable 
                   style={[styles.modeCard, { borderColor: '#3B82F6' }]} 
                   onPress={handleStartReceive}
               >
                  <MaterialCommunityIcons name="download" size={48} color="#3B82F6" />
                  <Text style={styles.modeTitle}>Recevoir</Text>
                  <Text style={styles.modeDesc}>Ouvrir le portail</Text>
               </Pressable>

               <Pressable 
                   style={[styles.modeCard, { borderColor: '#10B981' }]} 
                   onPress={handleStartSend}
               >
                  <MaterialCommunityIcons name="upload" size={48} color="#10B981" />
                  <Text style={styles.modeTitle}>Envoyer</Text>
                  <Text style={styles.modeDesc}>Chercher un ami</Text>
               </Pressable>
             </View>
          </View>
        )}

        {mode === 'receive' && (
          <View style={styles.activeView}>
             <MaterialCommunityIcons name="cellphone-wireless" size={64} color="#3B82F6" style={{ alignSelf: 'center' }} />
             <Text style={styles.activeTitle}>Mode Réception Actif</Text>
             <Text style={styles.activeSub}>Demandez à votre ami de faire "Envoyer" et de vous choisir dans la liste.</Text>
             
             {isConnected ? (
                <View style={[styles.connectedChip, { backgroundColor: isGroupOwner ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
                   <MaterialCommunityIcons 
                      name={isGroupOwner ? "broadcast" : "check-circle"} 
                      size={20} 
                      color={isGroupOwner ? "#3B82F6" : "#10B981"} 
                   />
                   <Text style={[styles.connectedText, { color: isGroupOwner ? "#3B82F6" : "#10B981" }]}>
                      {isGroupOwner ? "Portail Ouvert / En attente" : "Connecté au Portail"}
                   </Text>
                </View>
             ) : (
                <View style={[styles.connectedChip, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                   <ActivityIndicator size="small" color="#ef4444" style={{ marginRight: 8 }} />
                   <Text style={[styles.connectedText, { color: '#ef4444' }]}>Relance du groupe...</Text>
                </View>
             )}

             <View style={styles.statusDetail}>
                <Text style={styles.statusDetailText}>Role: {p2pStatus.role || 'HOSTE (Portail)'}</Text>
                <Text style={styles.statusDetailText}>IP: {p2pStatus.ip || '192.168.49.1'}</Text>
             </View>

             <Pressable style={styles.resetBtn} onPress={handleHardReset}>
                <MaterialCommunityIcons name="refresh" size={20} color="#94a3b8" />
                <Text style={styles.resetBtnText}>Réinitialisation Matérielle</Text>
             </Pressable>
          </View>
        )}

        {mode === 'send' && (
          <View style={styles.activeView}>
             <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <ActivityIndicator size="small" color="#10B981" animating={(isDiscovering || isConnecting) && !isConnected} />
                <Text style={styles.activeTitle}> Amis à proximité</Text>
             </View>
             
             {isConnected ? (
                <View style={styles.connectedChip}>
                   <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                   <Text style={styles.connectedText}>Connecté à {connectedPeerName}</Text>
                </View>
             ) : (
                peers.length === 0 ? (
                   <View style={{ alignItems: 'center', padding: 20 }}>
                      <Text style={styles.activeSub}>Aucun appareil Loba trouvé.</Text>
                      <Text style={[styles.activeSub, { fontSize: 12, marginTop: 4 }]}>Assurez-vous que l'autre téléphone est en mode "Recevoir".</Text>
                      <Pressable 
                        style={{ marginTop: 15, padding: 10, backgroundColor: '#334155', borderRadius: 8 }}
                        onPress={() => WifiDirectService.startDiscovery(true)}
                      >
                         <Text style={{ color: '#fff', fontSize: 12 }}>Relancer la recherche</Text>
                      </Pressable>
                   </View>
                ) : (
                   peers.map((peer, i) => (
                      <Pressable key={i} style={styles.peerCard} onPress={() => connectToPeer(peer)}>
                         <MaterialCommunityIcons name="cellphone" size={24} color="#fff" />
                         <View style={{ marginLeft: 12 }}>
                            <Text style={styles.peerName}>{peer.deviceName || 'Inconnu'}</Text>
                            <Text style={styles.peerMac}>{peer.deviceAddress}</Text>
                         </View>
                         <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" style={{ marginLeft: 'auto' }} />
                      </Pressable>
                   ))
                )
             )}

             {isConnected && !isSyncing && (
                <View style={styles.packGrid}>
                   <Text style={styles.sectionTitle}>Ma Bibliothèque de Packs</Text>
                   {availablePacks.length === 0 ? (
                      <View style={styles.emptyPacks}>
                         <MaterialCommunityIcons name="package-variant" size={40} color="#334155" />
                         <Text style={styles.emptyPacksText}>Aucun contenu à partager pour le moment.</Text>
                      </View>
                   ) : (
                      availablePacks.map((pack) => (
                         <Pressable 
                            key={pack.id} 
                            style={styles.packCard}
                            onPress={() => syncPacks(pack.category)}
                         >
                            <View style={[styles.packIcon, { backgroundColor: pack.id === 'general' ? '#8B5CF6' : '#3B82F6' }]}>
                               <MaterialCommunityIcons name="package-variant-closed" size={32} color="#fff" />
                            </View>
                            <View style={styles.packInfo}>
                               <Text style={styles.packTitle}>{pack.title}</Text>
                               <Text style={styles.packMeta}>{pack.count} items • {pack.sizeMB} MB</Text>
                            </View>
                            <View style={styles.packShareBtn}>
                               <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
                            </View>
                         </Pressable>
                      ))
                   )}
                </View>
             )}

             <View style={styles.statusDetail}>
                <Text style={styles.statusDetailText}>Role: {p2pStatus.role || (isConnecting ? 'Négociation...' : 'Attente')}</Text>
                <Text style={styles.statusDetailText}>IP: {p2pStatus.ip || (isConnecting ? 'Handshake système...' : 'À connecter')}</Text>
             </View>

             <Pressable style={styles.resetBtn} onPress={handleHardReset}>
                <MaterialCommunityIcons name="refresh" size={20} color="#94a3b8" />
                <Text style={styles.resetBtnText}>Réinitialisation Matérielle</Text>
             </Pressable>
          </View>
        )}

        <View style={styles.logsBox}>
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.logsTitle}>Logs P2P</Text>
              <Pressable onPress={() => setExpandLogs(!expandLogs)}>
                 <MaterialCommunityIcons name={expandLogs ? "chevron-down" : "chevron-up"} size={20} color="#fff" />
              </Pressable>
           </View>
           
           {!expandLogs && logs.length === 0 && (
             <Text style={styles.logLine}>En attente d'actions...</Text>
           ) || expandLogs && logs.length === 0 && (
              <Text style={styles.logLine}>Aucun log pour le moment...</Text>
           )}

           {expandLogs && logs.map((log, i) => (
              <Text key={i} style={styles.logLine}>{log}</Text>
           ))}
           
           {!expandLogs && logs.length > 0 && (
              <Text style={styles.logLine}>{logs[0]}</Text>
           )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101922',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  selectionView: {
    marginTop: 40,
  },
  infoText: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modeCard: {
    width: '45%',
    backgroundColor: '#1c2a38',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
  },
  modeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  modeDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  activeView: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1c2a38',
    borderRadius: 16,
  },
  activeTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  activeSub: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  peerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  peerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  peerMac: {
    color: '#94a3b8',
    fontSize: 12,
  },
  connectedChip: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: 'rgba(16, 185, 129, 0.1)',
     padding: 12,
     borderRadius: 12,
     marginTop: 20,
  },
  connectedText: {
     color: '#10B981',
     fontWeight: 'bold',
     marginLeft: 8,
     fontSize: 16,
  },
  floatingProgress: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#10B981',
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    zIndex: 10000,
  },
  floatingProgressInfo: {
    flex: 1,
    marginLeft: 15,
  },
  floatingProgressText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  miniProgressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 8,
    width: '100%',
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  decompressLabel: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  packGrid: {
    marginTop: 10,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  packIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packInfo: {
    flex: 1,
    marginLeft: 16,
  },
  packTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  packMeta: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  packShareBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPacks: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyPacksText: {
    color: '#64748b',
    marginTop: 12,
    fontSize: 14,
  },
  logsBox: {
     marginTop: 40,
     padding: 16,
     backgroundColor: '#000',
     borderRadius: 12,
     minHeight: 150,
  },
  logsTitle: {
     color: '#fff',
     fontWeight: 'bold',
     marginBottom: 10,
  },
  logLine: {
     color: '#10B981',
     fontSize: 11,
     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
     marginBottom: 4,
  },
  statusDetail: {
     marginTop: 15,
     padding: 10,
     backgroundColor: 'rgba(0,0,0,0.2)',
     borderRadius: 8,
  },
  statusDetailText: {
     color: '#94a3b8',
     fontSize: 12,
     fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  resetBtn: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     marginTop: 15,
     padding: 8,
     borderWidth: 1,
     borderColor: '#334155',
     borderRadius: 8,
  },
  resetBtnText: {
     color: '#94a3b8',
     fontSize: 12,
     marginLeft: 6,
  }
});
