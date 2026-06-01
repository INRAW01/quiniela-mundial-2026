import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, onSnapshot, getDocs, writeBatch 
} from 'firebase/firestore';
import { Trophy, Clock, MapPin, User, CheckCircle, Lock, Settings, RefreshCw, AlertCircle } from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE (Datos exactos del usuario) ---
const firebaseConfig = {
  apiKey: "AIzaSyDdCGvIAt4A5AyF_yOvR5SPJsgPtMWpCYY",
  authDomain: "quiniela-2026-59b53.firebaseapp.com",
  projectId: "quiniela-2026-59b53",
  storageBucket: "quiniela-2026-59b53.firebasestorage.app",
  messagingSenderId: "1075755299669",
  appId: "1:1075755299669:web:f565bbd29ee371e60235dc",
  measurementId: "G-QC1R3L0261"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'quiniela-mundial-26';

// --- DATOS OFICIALES DEL MUNDIAL 2026 ---
const PARTIDOS_OFICIALES = [
  // GRUPO A
  { id: "M26-01", grupo: "Grupo A", local: "🇲🇽 México", visitante: "🇿🇦 Sudáfrica", fecha: "11/06/2026", hora: "13:00 CDMX", sede: "Estadio Azteca, CDMX" },
  { id: "M26-02", grupo: "Grupo A", local: "🇰🇷 Corea del Sur", visitante: "🇨🇿 Rep. Checa", fecha: "11/06/2026", hora: "20:00 CDMX", sede: "Estadio Akron, Guadalajara" },
  { id: "M26-03", grupo: "Grupo A", local: "🇲🇽 México", visitante: "🇰🇷 Corea del Sur", fecha: "18/06/2026", hora: "19:00 CDMX", sede: "Estadio Akron, Guadalajara" },
  { id: "M26-04", grupo: "Grupo A", local: "🇿🇦 Sudáfrica", visitante: "🇨🇿 Rep. Checa", fecha: "18/06/2026", hora: "12:00 CDMX", sede: "Mercedes-Benz Stadium, Atlanta" },
  { id: "M26-05", grupo: "Grupo A", local: "🇲🇽 México", visitante: "🇨🇿 Rep. Checa", fecha: "24/06/2026", hora: "19:00 CDMX", sede: "Estadio Azteca, CDMX" },
  { id: "M26-06", grupo: "Grupo A", local: "🇿🇦 Sudáfrica", visitante: "🇰🇷 Corea del Sur", fecha: "24/06/2026", hora: "19:00 CDMX", sede: "Estadio BBVA, Monterrey" },
  // GRUPO B
  { id: "M26-07", grupo: "Grupo B", local: "🇨🇦 Canadá", visitante: "🇧🇦 Bosnia y Herze.", fecha: "12/06/2026", hora: "13:00 CDMX", sede: "BMO Field, Toronto" },
  { id: "M26-08", grupo: "Grupo B", local: "🇶🇦 Qatar", visitante: "🇨🇭 Suiza", fecha: "13/06/2026", hora: "13:00 CDMX", sede: "Levi's Stadium, San Francisco" },
  { id: "M26-09", grupo: "Grupo B", local: "🇨🇦 Canadá", visitante: "🇶🇦 Qatar", fecha: "18/06/2026", hora: "16:00 CDMX", sede: "BC Place, Vancouver" },
  { id: "M26-10", grupo: "Grupo B", local: "🇧🇦 Bosnia y Herze.", visitante: "🇨🇭 Suiza", fecha: "18/06/2026", hora: "13:00 CDMX", sede: "SoFi Stadium, Los Ángeles" },
  { id: "M26-11", grupo: "Grupo B", local: "🇨🇦 Canadá", visitante: "🇨🇭 Suiza", fecha: "24/06/2026", hora: "12:00 CDMX", sede: "BC Place, Vancouver" },
  { id: "M26-12", grupo: "Grupo B", local: "🇧🇦 Bosnia y Herze.", visitante: "🇶🇦 Qatar", fecha: "24/06/2026", hora: "12:00 CDMX", sede: "Lumen Field, Seattle" },
  // GRUPO C
  { id: "M26-13", grupo: "Grupo C", local: "🇧🇷 Brasil", visitante: "🇲🇦 Marruecos", fecha: "13/06/2026", hora: "16:00 CDMX", sede: "MetLife Stadium, New Jersey" },
  { id: "M26-14", grupo: "Grupo C", local: "🇭🇹 Haití", visitante: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia", fecha: "13/06/2026", hora: "19:00 CDMX", sede: "Gillette Stadium, Boston" },
  { id: "M26-15", grupo: "Grupo C", local: "🇧🇷 Brasil", visitante: "🇭🇹 Haití", fecha: "19/06/2026", hora: "18:30 CDMX", sede: "Lincoln Financial Field, Philadelphia" },
  { id: "M26-16", grupo: "Grupo C", local: "🇲🇦 Marruecos", visitante: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia", fecha: "19/06/2026", hora: "16:00 CDMX", sede: "Gillette Stadium, Boston" },
  { id: "M26-17", grupo: "Grupo C", local: "🇧🇷 Brasil", visitante: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escocia", fecha: "24/06/2026", hora: "18:00 CDMX", sede: "Hard Rock Stadium, Miami" },
  { id: "M26-18", grupo: "Grupo C", local: "🇲🇦 Marruecos", visitante: "🇭🇹 Haití", fecha: "24/06/2026", hora: "18:00 CDMX", sede: "Mercedes-Benz Stadium, Atlanta" },
  // GRUPO D
  { id: "M26-19", grupo: "Grupo D", local: "🇺🇸 Estados Unidos", visitante: "🇵🇾 Paraguay", fecha: "12/06/2026", hora: "19:00 CDMX", sede: "SoFi Stadium, Los Ángeles" },
  { id: "M26-20", grupo: "Grupo D", local: "🇦🇺 Australia", visitante: "🇹🇷 Turquía", fecha: "13/06/2026", hora: "22:00 CDMX", sede: "BC Place, Vancouver" },
  { id: "M26-21", grupo: "Grupo D", local: "🇺🇸 Estados Unidos", visitante: "🇦🇺 Australia", fecha: "19/06/2026", hora: "13:00 CDMX", sede: "Lumen Field, Seattle" },
  { id: "M26-22", grupo: "Grupo D", local: "🇵🇾 Paraguay", visitante: "🇹🇷 Turquía", fecha: "19/06/2026", hora: "21:00 CDMX", sede: "Levi's Stadium, San Francisco" },
  { id: "M26-23", grupo: "Grupo D", local: "🇺🇸 Estados Unidos", visitante: "🇹🇷 Turquía", fecha: "25/06/2026", hora: "19:00 CDMX", sede: "SoFi Stadium, Los Ángeles" },
  { id: "M26-24", grupo: "Grupo D", local: "🇵🇾 Paraguay", visitante: "🇦🇺 Australia", fecha: "25/06/2026", hora: "19:00 CDMX", sede: "Levi's Stadium, San Francisco" },
  // GRUPO E
  { id: "M26-25", grupo: "Grupo E", local: "🇩🇪 Alemania", visitante: "🇨🇼 Curazao", fecha: "14/06/2026", hora: "11:00 CDMX", sede: "NRG Stadium, Houston" },
  { id: "M26-26", grupo: "Grupo E", local: "🇨🇮 Costa de Marfil", visitante: "🇪🇨 Ecuador", fecha: "14/06/2026", hora: "17:00 CDMX", sede: "Lincoln Financial Field, Philadelphia" },
  { id: "M26-27", grupo: "Grupo E", local: "🇩🇪 Alemania", visitante: "🇨🇮 Costa de Marfil", fecha: "20/06/2026", hora: "14:00 CDMX", sede: "BMO Field, Toronto" },
  { id: "M26-28", grupo: "Grupo E", local: "🇨🇼 Curazao", visitante: "🇪🇨 Ecuador", fecha: "20/06/2026", hora: "18:00 CDMX", sede: "Arrowhead Stadium, Kansas City" },
  { id: "M26-29", grupo: "Grupo E", local: "🇩🇪 Alemania", visitante: "🇪🇨 Ecuador", fecha: "25/06/2026", hora: "16:00 CDMX", sede: "MetLife Stadium, New Jersey" },
  { id: "M26-30", grupo: "Grupo E", local: "🇨🇼 Curazao", visitante: "🇨🇮 Costa de Marfil", fecha: "25/06/2026", hora: "16:00 CDMX", sede: "Lincoln Financial Field, Philadelphia" },
  // GRUPO F
  { id: "M26-31", grupo: "Grupo F", local: "🇳🇱 Países Bajos", visitante: "🇯🇵 Japón", fecha: "14/06/2026", hora: "14:00 CDMX", sede: "AT&T Stadium, Dallas" },
  { id: "M26-32", grupo: "Grupo F", local: "🇸🇪 Suecia", visitante: "🇹🇳 Túnez", fecha: "14/06/2026", hora: "20:00 CDMX", sede: "Estadio BBVA, Monterrey" },
  { id: "M26-33", grupo: "Grupo F", local: "🇳🇱 Países Bajos", visitante: "🇸🇪 Suecia", fecha: "20/06/2026", hora: "11:00 CDMX", sede: "NRG Stadium, Houston" },
  { id: "M26-34", grupo: "Grupo F", local: "🇯🇵 Japón", visitante: "🇹🇳 Túnez", fecha: "20/06/2026", hora: "22:00 CDMX", sede: "Estadio BBVA, Monterrey" },
  { id: "M26-35", grupo: "Grupo F", local: "🇳🇱 Países Bajos", visitante: "🇹🇳 Túnez", fecha: "25/06/2026", hora: "18:00 CDMX", sede: "Arrowhead Stadium, Kansas City" },
  { id: "M26-36", grupo: "Grupo F", local: "🇯🇵 Japón", visitante: "🇸🇪 Suecia", fecha: "25/06/2026", hora: "18:00 CDMX", sede: "AT&T Stadium, Dallas" },
  // GRUPO G
  { id: "M26-37", grupo: "Grupo G", local: "🇧🇪 Bélgica", visitante: "🇪🇬 Egipto", fecha: "15/06/2026", hora: "13:00 CDMX", sede: "Lumen Field, Seattle" },
  { id: "M26-38", grupo: "Grupo G", local: "🇮🇷 Irán", visitante: "🇳🇿 Nueva Zelanda", fecha: "15/06/2026", hora: "19:00 CDMX", sede: "SoFi Stadium, Los Ángeles" },
  { id: "M26-39", grupo: "Grupo G", local: "🇧🇪 Bélgica", visitante: "🇮🇷 Irán", fecha: "21/06/2026", hora: "13:00 CDMX", sede: "SoFi Stadium, Los Ángeles" },
  { id: "M26-40", grupo: "Grupo G", local: "🇪🇬 Egipto", visitante: "🇳🇿 Nueva Zelanda", fecha: "21/06/2026", hora: "19:00 CDMX", sede: "BC Place, Vancouver" },
  { id: "M26-41", grupo: "Grupo G", local: "🇧🇪 Bélgica", visitante: "🇳🇿 Nueva Zelanda", fecha: "26/06/2026", hora: "15:00 CDMX", sede: "Lumen Field, Seattle" },
  { id: "M26-42", grupo: "Grupo G", local: "🇪🇬 Egipto", visitante: "🇮🇷 Irán", fecha: "26/06/2026", hora: "15:00 CDMX", sede: "BC Place, Vancouver" },
  // GRUPO H
  { id: "M26-43", grupo: "Grupo H", local: "🇪🇸 España", visitante: "🇨🇻 Cabo Verde", fecha: "15/06/2026", hora: "10:00 CDMX", sede: "Mercedes-Benz Stadium, Atlanta" },
  { id: "M26-44", grupo: "Grupo H", local: "🇸🇦 Arabia Saudita", visitante: "🇺🇾 Uruguay", fecha: "15/06/2026", hora: "16:00 CDMX", sede: "Hard Rock Stadium, Miami" },
  { id: "M26-45", grupo: "Grupo H", local: "🇪🇸 España", visitante: "🇸🇦 Arabia Saudita", fecha: "21/06/2026", hora: "10:00 CDMX", sede: "Mercedes-Benz Stadium, Atlanta" },
  { id: "M26-46", grupo: "Grupo H", local: "🇨🇻 Cabo Verde", visitante: "🇺🇾 Uruguay", fecha: "21/06/2026", hora: "16:00 CDMX", sede: "Hard Rock Stadium, Miami" },
  { id: "M26-47", grupo: "Grupo H", local: "🇪🇸 España", visitante: "🇺🇾 Uruguay", fecha: "26/06/2026", hora: "18:00 CDMX", sede: "Mercedes-Benz Stadium, Atlanta" },
  { id: "M26-48", grupo: "Grupo H", local: "🇨🇻 Cabo Verde", visitante: "🇸🇦 Arabia Saudita", fecha: "26/06/2026", hora: "18:00 CDMX", sede: "Hard Rock Stadium, Miami" },
  // GRUPO I
  { id: "M26-49", grupo: "Grupo I", local: "🇫🇷 Francia", visitante: "🇸🇳 Senegal", fecha: "16/06/2026", hora: "13:00 CDMX", sede: "MetLife Stadium, New Jersey" },
  { id: "M26-50", grupo: "Grupo I", local: "🇮🇶 Irak", visitante: "🇳🇴 Noruega", fecha: "16/06/2026", hora: "16:00 CDMX", sede: "Gillette Stadium, Boston" },
  { id: "M26-51", grupo: "Grupo I", local: "🇫🇷 Francia", visitante: "🇮🇶 Irak", fecha: "22/06/2026", hora: "15:00 CDMX", sede: "Philadelphia Stadium" },
  { id: "M26-52", grupo: "Grupo I", local: "🇸🇳 Senegal", visitante: "🇳🇴 Noruega", fecha: "22/06/2026", hora: "18:00 CDMX", sede: "MetLife Stadium, New Jersey" },
  { id: "M26-53", grupo: "Grupo I", local: "🇫🇷 Francia", visitante: "🇳🇴 Noruega", fecha: "27/06/2026", hora: "12:00 CDMX", sede: "MetLife Stadium, New Jersey" },
  { id: "M26-54", grupo: "Grupo I", local: "🇸🇳 Senegal", visitante: "🇮🇶 Irak", fecha: "27/06/2026", hora: "12:00 CDMX", sede: "Gillette Stadium, Boston" },
  // GRUPO J
  { id: "M26-55", grupo: "Grupo J", local: "🇦🇷 Argentina", visitante: "🇩🇿 Argelia", fecha: "16/06/2026", hora: "19:00 CDMX", sede: "Arrowhead Stadium, Kansas City" },
  { id: "M26-56", grupo: "Grupo J", local: "🇦🇹 Austria", visitante: "🇯🇴 Jordania", fecha: "16/06/2026", hora: "22:00 CDMX", sede: "Levi's Stadium, San Francisco" },
  { id: "M26-57", grupo: "Grupo J", local: "🇦🇷 Argentina", visitante: "🇦🇹 Austria", fecha: "22/06/2026", hora: "20:00 CDMX", sede: "AT&T Stadium, Dallas" },
  { id: "M26-58", grupo: "Grupo J", local: "🇩🇿 Argelia", visitante: "🇯🇴 Jordania", fecha: "22/06/2026", hora: "21:00 CDMX", sede: "Levi's Stadium, San Francisco" },
  { id: "M26-59", grupo: "Grupo J", local: "🇦🇷 Argentina", visitante: "🇯🇴 Jordania", fecha: "27/06/2026", hora: "17:00 CDMX", sede: "Arrowhead Stadium, Kansas City" },
  { id: "M26-60", grupo: "Grupo J", local: "🇩🇿 Argelia", visitante: "🇦🇹 Austria", fecha: "27/06/2026", hora: "17:00 CDMX", sede: "Levi's Stadium, San Francisco" },
  // GRUPO K
  { id: "M26-61", grupo: "Grupo K", local: "🇵🇹 Portugal", visitante: "🇨🇩 RD Congo", fecha: "17/06/2026", hora: "11:00 CDMX", sede: "NRG Stadium, Houston" },
  { id: "M26-62", grupo: "Grupo K", local: "🇺🇿 Uzbekistán", visitante: "🇨🇴 Colombia", fecha: "17/06/2026", hora: "20:00 CDMX", sede: "Estadio Akron, Guadalajara" },
  { id: "M26-63", grupo: "Grupo K", local: "🇵🇹 Portugal", visitante: "🇺🇿 Uzbekistán", fecha: "23/06/2026", hora: "12:00 CDMX", sede: "NRG Stadium, Houston" },
  { id: "M26-64", grupo: "Grupo K", local: "🇨🇩 RD Congo", visitante: "🇨🇴 Colombia", fecha: "23/06/2026", hora: "20:00 CDMX", sede: "Estadio Akron, Guadalajara" },
  { id: "M26-65", grupo: "Grupo K", local: "🇵🇹 Portugal", visitante: "🇨🇴 Colombia", fecha: "27/06/2026", hora: "20:00 CDMX", sede: "NRG Stadium, Houston" },
  { id: "M26-66", grupo: "Grupo K", local: "🇨🇩 RD Congo", visitante: "🇺🇿 Uzbekistán", fecha: "27/06/2026", hora: "20:00 CDMX", sede: "Estadio Akron, Guadalajara" },
  // GRUPO L
  { id: "M26-67", grupo: "Grupo L", local: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", visitante: "🇭🇷 Croacia", fecha: "17/06/2026", hora: "14:00 CDMX", sede: "AT&T Stadium, Dallas" },
  { id: "M26-68", grupo: "Grupo L", local: "🇬🇭 Ghana", visitante: "🇵🇦 Panamá", fecha: "17/06/2026", hora: "17:00 CDMX", sede: "BMO Field, Toronto" },
  { id: "M26-69", grupo: "Grupo L", local: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", visitante: "🇬🇭 Ghana", fecha: "23/06/2026", hora: "15:00 CDMX", sede: "Gillette Stadium, Boston" },
  { id: "M26-70", grupo: "Grupo L", local: "🇭🇷 Croacia", visitante: "🇵🇦 Panamá", fecha: "23/06/2026", hora: "19:00 CDMX", sede: "BMO Field, Toronto" },
  { id: "M26-71", grupo: "Grupo L", local: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", visitante: "🇵🇦 Panamá", fecha: "27/06/2026", hora: "15:00 CDMX", sede: "AT&T Stadium, Dallas" },
  { id: "M26-72", grupo: "Grupo L", local: "🇭🇷 Croacia", visitante: "🇬🇭 Ghana", fecha: "27/06/2026", hora: "15:00 CDMX", sede: "BMO Field, Toronto" }
];

const generarPartidosIniciales = () => {
  return PARTIDOS_OFICIALES.map(p => ({
    ...p,
    estado: 'Pendiente',
    golesLocal: null,
    golesVisitante: null,
    resultadoReal: null
  }));
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  
  const [partidos, setPartidos] = useState([]);
  const [predicciones, setPredicciones] = useState({}); // Predicciones de TODOS los usuarios
  
  const [activeTab, setActiveTab] = useState('partidos');
  const [toast, setToast] = useState(null);

  // 1. Inicializar Autenticación (Regla estricta)
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Autenticación simplificada: usamos directamente signInAnonymously
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error:", err);
        setAuthError(err.message);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if(u) setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Escuchar Datos (Solo si hay usuario)
  useEffect(() => {
    if (!user) return;

    // Referencias a colecciones públicas
    const partidosRef = collection(db, 'artifacts', appId, 'public', 'data', 'matches');
    const predsRef = collection(db, 'artifacts', appId, 'public', 'data', 'predictions');

    // Inicializar partidos (Sobreescribe si detecta datos genéricos anteriores)
    const initDB = async () => {
      const snap = await getDocs(partidosRef);
      
      // Verificamos si la base de datos está vacía o si contiene los datos "falsos" viejos (sin banderas)
      const necesitaActualizacion = snap.empty || snap.docs.length !== 72 || !snap.docs[0].data().local.includes("🇲🇽");
      
      if (necesitaActualizacion) {
        const batch = writeBatch(db);
        const iniciales = generarPartidosIniciales();
        iniciales.forEach(p => {
          batch.set(doc(partidosRef, p.id), p);
        });
        await batch.commit();
      }
    };
    initDB();

    // Suscripción a Partidos
    const unsubPartidos = onSnapshot(partidosRef, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.id.localeCompare(b.id));
      setPartidos(data);
    }, (error) => console.error("Error partidos:", error));

    // Suscripción a Predicciones y Perfiles
    const unsubPreds = onSnapshot(predsRef, (snapshot) => {
      const predsMap = {};
      snapshot.docs.forEach(doc => {
        predsMap[doc.id] = doc.data(); // doc.id es el userId
      });
      setPredicciones(predsMap);
      
      if (predsMap[user.uid]) {
        setProfile(predsMap[user.uid]);
      }
    }, (error) => console.error("Error predicciones:", error));

    return () => { unsubPartidos(); unsubPreds(); };
  }, [user]);

  // Funciones de Acción
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCrearPerfil = async (e) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'predictions', user.uid);
      await setDoc(userDocRef, {
        username: usernameInput,
        picks: {},
        locked: false,
        points: 0
      }, { merge: true });
      showToast('¡Perfil creado con éxito!');
    } catch (err) {
      showToast('Error al crear perfil', 'error');
    }
  };

  const handleSelectPrediction = async (partidoId, seleccion) => {
    if (!profile || profile.locked) {
      showToast('Tu quiniela está bloqueada, no puedes modificarla.', 'error');
      return;
    }
    
    // Validar que el partido no haya terminado
    const partido = partidos.find(p => p.id === partidoId);
    if (partido?.estado === 'Finalizado') {
      showToast('Este partido ya finalizó.', 'error');
      return;
    }

    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'predictions', user.uid);
      await setDoc(userDocRef, {
        picks: { [partidoId]: seleccion }
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBloquearQuiniela = async () => {
    if (!profile) return;
    const picksCount = Object.keys(profile.picks || {}).length;
    if (picksCount < 72) {
      // Permitimos bloquear aunque no estén los 72, pero avisamos.
      // En un entorno real podrías forzar los 72.
    }
    try {
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'predictions', user.uid);
      await setDoc(userDocRef, { locked: true }, { merge: true });
      showToast('¡Quiniela Bloqueada! Ya no puedes hacer cambios.');
    } catch (err) {
      console.error(err);
    }
  };

  // --- MOTOR DE CÁLCULO DE PUNTOS ---
  const leaderboard = useMemo(() => {
    const scores = [];
    Object.keys(predicciones).forEach(uid => {
      const userProfile = predicciones[uid];
      let pts = 0;
      
      // Calcular puntos comparando picks con resultados reales
      partidos.forEach(partido => {
        if (partido.estado === 'Finalizado' && partido.resultadoReal) {
          const pickUsuario = userProfile.picks?.[partido.id];
          if (pickUsuario === partido.resultadoReal) {
            pts++;
          }
        }
      });

      scores.push({ ...userProfile, calculatedPoints: pts });
    });
    
    // Ordenar por puntos (mayor a menor)
    return scores.sort((a, b) => b.calculatedPoints - a.calculatedPoints);
  }, [predicciones, partidos]);

  // Agrupar partidos para la vista
  const partidosPorGrupo = useMemo(() => {
    const grupos = {};
    partidos.forEach(p => {
      if (!grupos[p.grupo]) grupos[p.grupo] = [];
      grupos[p.grupo].push(p);
    });
    return grupos;
  }, [partidos]);


  // --- MÓDULO DE SIMULACIÓN Y API ---
  const simularResultadosAPI = async () => {
    try {
      const batch = writeBatch(db);
      const partidosRef = collection(db, 'artifacts', appId, 'public', 'data', 'matches');
      
      // Tomamos 5 partidos al azar que estén pendientes y los simulamos
      const pendientes = partidos.filter(p => p.estado === 'Pendiente');
      const aSimular = pendientes.slice(0, 5); // Simulamos de 5 en 5 para ver efecto
      
      if (aSimular.length === 0) {
        showToast('Ya no hay partidos pendientes por simular.', 'error');
        return;
      }

      aSimular.forEach(p => {
        const golesL = Math.floor(Math.random() * 4);
        const golesV = Math.floor(Math.random() * 4);
        let resReal = 'empate';
        if (golesL > golesV) resReal = 'local';
        if (golesV > golesL) resReal = 'visitante';

        batch.update(doc(partidosRef, p.id), {
          estado: 'Finalizado',
          golesLocal: golesL,
          golesVisitante: golesV,
          resultadoReal: resReal
        });
      });

      await batch.commit();
      showToast('¡Resultados simulados obtenidos de la API (Demo)!');
    } catch (err) {
      console.error(err);
      showToast('Error al simular resultados', 'error');
    }
  };


  // --- RENDERIZADO ---
  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white font-sans p-6 text-center">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black mb-2">Error de Llave API</h2>
        <p className="text-slate-400 mb-4 max-w-md">No se pudo conectar a tu base de datos de Firebase por un error en la configuración:</p>
        <code className="bg-slate-800 text-red-400 p-4 rounded-xl text-sm mb-6 max-w-full break-words border border-red-500/30">
          {authError}
        </code>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 max-w-md text-left">
          <h3 className="font-bold text-emerald-400 mb-2">Cómo solucionarlo:</h3>
          <ol className="list-decimal pl-4 text-sm text-slate-300 space-y-2">
            <li>Ve a la consola de Firebase.</li>
            <li>Haz clic en el ícono del engranaje (⚙️ <strong>Project Settings</strong>).</li>
            <li>Baja hasta la sección <strong>"Your apps"</strong>.</li>
            <li>Copia el bloque <code>firebaseConfig</code> directamente desde ahí.</li>
            <li>Pégalo en la línea 12 del código aquí en el editor.</li>
          </ol>
        </div>
      </div>
    );
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <Trophy size={40} className="text-emerald-400" />
      <p className="font-bold">Conectando a Firebase...</p>
    </div>
  </div>;

  if (!profile?.username) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
          <div className="flex justify-center mb-6">
            <Trophy size={64} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-center mb-2">Quiniela Mundial</h1>
          <p className="text-slate-400 text-center mb-8">Fase de Grupos 2026</p>
          
          <form onSubmit={handleCrearPerfil} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Crea tu perfil de jugador</label>
              <input 
                type="text" 
                maxLength="20"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Ej. JuanPerez99"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-white placeholder-slate-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <User size={20} /> Entrar a Jugar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const progreso = Object.keys(profile.picks || {}).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
      {/* HEADER */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="text-emerald-400" size={28} />
            <h1 className="font-black text-xl tracking-tight hidden sm:block">Quiniela 2026</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="bg-slate-900 px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2">
              <User size={16} className="text-emerald-400" />
              <span>{profile.username}</span>
            </div>
          </div>
        </div>
        
        {/* TABS */}
        <div className="max-w-4xl mx-auto px-4 flex gap-6 overflow-x-auto no-scrollbar border-t border-slate-700/50 pt-2">
          <button 
            onClick={() => setActiveTab('partidos')}
            className={`pb-3 px-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'partidos' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            ⚽ Partidos
          </button>
          <button 
            onClick={() => setActiveTab('posiciones')}
            className={`pb-3 px-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'posiciones' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            🏆 Leaderboard
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`pb-3 px-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'admin' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            ⚙️ API / Admin
          </button>
        </div>
      </header>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className={`px-6 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
            {toast.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
            {toast.msg}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        
        {/* VISTA: PARTIDOS */}
        {activeTab === 'partidos' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Status Panel */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">Tu Progreso</h2>
                <p className="text-slate-400 text-sm">Has pronosticado {progreso} de 72 partidos.</p>
              </div>
              {profile.locked ? (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-xl font-bold border border-emerald-400/20">
                  <Lock size={18} /> Quiniela Bloqueada
                </div>
              ) : (
                <button 
                  onClick={handleBloquearQuiniela}
                  className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Lock size={18} /> Guardar y Bloquear
                </button>
              )}
            </div>

            {Object.keys(partidosPorGrupo).map((grupo) => (
              <div key={grupo} className="space-y-4">
                <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-2 mt-8 mb-4">
                  {grupo}
                  <div className="h-px bg-slate-700 flex-1 ml-4"></div>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partidosPorGrupo[grupo].map((partido) => {
                    const myPick = profile.picks?.[partido.id];
                    const isFinished = partido.estado === 'Finalizado';
                    const isLocked = profile.locked || isFinished;
                    
                    return (
                      <div key={partido.id} className={`bg-slate-800 rounded-2xl p-4 border transition-colors ${isFinished ? 'border-indigo-500/30 bg-slate-800/80' : 'border-slate-700 hover:border-slate-600'}`}>
                        {/* Header Tarjeta */}
                        <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-4 border-b border-slate-700/50 pb-2">
                          <div className="flex items-center gap-1"><Clock size={14}/> {partido.fecha} • {partido.hora}</div>
                          <div className="flex items-center gap-1 truncate max-w-[120px]"><MapPin size={14} className="flex-shrink-0"/> <span className="truncate">{partido.sede}</span></div>
                        </div>

                        {/* Equipos y Marcador (Si finalizó) */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex-1 text-center font-bold text-lg">{partido.local}</div>
                          
                          {isFinished ? (
                            <div className="bg-indigo-600/20 text-indigo-300 font-black px-4 py-1 rounded-lg border border-indigo-500/30 flex items-center gap-2 mx-2">
                              <span>{partido.golesLocal}</span>
                              <span className="text-slate-500">-</span>
                              <span>{partido.golesVisitante}</span>
                            </div>
                          ) : (
                            <div className="text-slate-500 font-black px-4 py-1 mx-2">VS</div>
                          )}
                          
                          <div className="flex-1 text-center font-bold text-lg">{partido.visitante}</div>
                        </div>

                        {/* Botones de Predicción */}
                        <div className="grid grid-cols-3 gap-2">
                          <button 
                            onClick={() => handleSelectPrediction(partido.id, 'local')}
                            disabled={isLocked}
                            className={`py-2 px-2 rounded-xl text-sm font-bold border transition-all ${
                              myPick === 'local' 
                                ? 'bg-emerald-500 text-white border-emerald-400' 
                                : isLocked ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Local
                          </button>
                          <button 
                            onClick={() => handleSelectPrediction(partido.id, 'empate')}
                            disabled={isLocked}
                            className={`py-2 px-2 rounded-xl text-sm font-bold border transition-all ${
                              myPick === 'empate' 
                                ? 'bg-emerald-500 text-white border-emerald-400' 
                                : isLocked ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Empate
                          </button>
                          <button 
                            onClick={() => handleSelectPrediction(partido.id, 'visitante')}
                            disabled={isLocked}
                            className={`py-2 px-2 rounded-xl text-sm font-bold border transition-all ${
                              myPick === 'visitante' 
                                ? 'bg-emerald-500 text-white border-emerald-400' 
                                : isLocked ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            Visita
                          </button>
                        </div>
                        
                        {/* Indicador de acierto */}
                        {isFinished && myPick && (
                          <div className={`mt-3 text-center text-xs font-bold py-1 rounded-lg ${myPick === partido.resultadoReal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {myPick === partido.resultadoReal ? '¡Acertaste! +1 Punto' : 'Fallaste (0 Puntos)'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VISTA: LEADERBOARD */}
        {activeTab === 'posiciones' && (
          <div className="animate-in fade-in duration-300 max-w-2xl mx-auto">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900/50 p-6 border-b border-slate-700 text-center">
                <h2 className="text-2xl font-black mb-1">Tabla de Posiciones</h2>
                <p className="text-slate-400 text-sm">Actualización en tiempo real</p>
              </div>
              
              <div className="p-2">
                {leaderboard.length === 0 && (
                  <p className="text-center p-8 text-slate-500">Aún no hay jugadores registrados.</p>
                )}
                {leaderboard.map((jugador, index) => (
                  <div key={jugador.username} className={`flex items-center justify-between p-4 mb-2 rounded-2xl transition-colors ${jugador.username === profile.username ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-slate-700/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                        index === 0 ? 'bg-yellow-500 text-yellow-900' : 
                        index === 1 ? 'bg-slate-300 text-slate-800' : 
                        index === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {jugador.username} 
                          {jugador.username === profile.username && <span className="text-xs bg-emerald-500 px-2 py-0.5 rounded-full text-white font-bold">Tú</span>}
                        </div>
                        <div className="text-xs text-slate-400">{Object.keys(jugador.picks || {}).length} predicciones hechas</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-2xl text-emerald-400">{jugador.calculatedPoints}</div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VISTA: ADMIN / API */}
        {activeTab === 'admin' && (
          <div className="animate-in fade-in duration-300 max-w-2xl mx-auto space-y-6">
            
            <div className="bg-slate-800 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <h2 className="text-xl font-black mb-2 flex items-center gap-2"><Settings className="text-indigo-400"/> Panel de Conexión API</h2>
              <p className="text-slate-400 text-sm mb-6">En un entorno de producción, aquí se insertaría tu API Key de "API-Football". Para que pruebes esta aplicación AHORA MISMO, he creado un simulador que imita la respuesta de la API.</p>
              
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">API KEY (api-football.com)</label>
                <input type="password" value="************************" disabled className="w-full bg-transparent border-b border-slate-700 pb-2 text-slate-400 focus:outline-none" />
              </div>

              <button 
                onClick={simularResultadosAPI}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
              >
                <RefreshCw size={20} /> Simular Resultados en Vivo (Demo)
              </button>
              <p className="text-center text-xs text-slate-500 mt-4">Haz clic para generar resultados al azar de 5 partidos pendientes. Verás cómo la tabla de posiciones cambia en tiempo real automáticamente para todos.</p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
