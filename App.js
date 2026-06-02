import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Image, ImageBackground, TextInput, Dimensions, Animated, Linking, Platform, Alert, I18nManager, ActivityIndicator } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFonts } from 'expo-font';
import * as AmiriFont from '@expo-google-fonts/amiri';
import { getMessaging, requestPermission, getToken, AuthorizationStatus, onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import firestore, { collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, increment } from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const db = firestore();
const messagingInstance = getMessaging();

const { width } = Dimensions.get('window');
const SERVER_URL = 'https://superresturantb-production.up.railway.app';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const COLORS = {
  gold: '#F5C518',
  goldDark: '#D4A017',
  bg: '#0e0c0a',
  card: '#1c1810',
  text: '#fff',
  textMuted: '#a89880',
  red: '#e74c3c',
  green: '#27ae60',
};

const menuData = [
  { id: 1, name: 'كلاسيك بيف', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، جبنة تشيدر، سوبر صوص', price: 20, cat: 'burger', options: [{ name: 'جبنة تشيدر', price: 3 }, { name: 'جبنة موتزاريلا', price: 3 }, { name: 'بيض', price: 2 }, { name: 'لحم زيادة', price: 8 }, { name: 'صوص', price: 2 }] },
  { id: 2, name: 'BBQ برجر', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، جبنة تشيدر، باربيكيو صوص', price: 21, cat: 'burger', options: [{ name: 'جبنة تشيدر', price: 3 }, { name: 'بيبركيون', price: 3 }, { name: 'لحم زيادة', price: 8 }, { name: 'بيض', price: 2 }] },
  { id: 3, name: 'هالبينو بيف', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، جبنة تشيدر، شرائح هالبينو', price: 22, cat: 'burger', options: [{ name: 'جبنة تشيدر', price: 3 }, { name: 'هالبينو', price: 2 }, { name: 'لحم زيادة', price: 8 }, { name: 'جبن موتزاريلا', price: 3 }] },
  { id: 4, name: 'تكساس برجر', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، جبنة تشيدر، حلقات بصل مقلية', price: 24, cat: 'burger', options: [{ name: 'جبنة تشيدر', price: 3 }, { name: 'حلقات بصل', price: 3 }, { name: 'لحم زيادة', price: 8 }] },
  { id: 5, name: 'سوبر برجر', desc: '200غم لحم طازج، خس، مخلل، بندورة، سوبر صوص، جبنة تشيدر، جبنة موتزاريلا', price: 30, cat: 'burger', options: [{ name: 'لحم زيادة', price: 8 }, { name: 'بيض', price: 2 }, { name: 'تونس', price: 2 }] },
  { id: 6, name: 'مونستر برجر', desc: '320غم لحم طازج (قطعتين)، خس، مخلل، بندورة، بصل، سوبر صوص، جبنة تشيدر، جبنة موتزاريلا', price: 35, cat: 'burger', options: [{ name: 'لحم زيادة', price: 8 }, { name: 'جبنة تشيدر', price: 3 }] },
  { id: 7, name: 'هوت دوغ برجر', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، سوبر صوص، جبنة تشيدر وموتزاريلا، أصابع هوت دوغ مشوية', price: 25, cat: 'burger', options: [{ name: 'لحم زيادة', price: 8 }, { name: 'هوت دوغ', price: 3 }, { name: 'جبنة', price: 3 }] },
  { id: 8, name: 'بيروني برجر', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، جبنة تشيدر، سوبر صوص، شرائح بيروني مشوية', price: 25, cat: 'burger', options: [{ name: 'بيروني', price: 4 }, { name: 'لحم زيادة', price: 8 }] },
  { id: 9, name: 'موروكو برجر', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، سوبر صوص، حلقات البصل، قطع السلامي المشوي', price: 29, cat: 'burger', options: [{ name: 'سلامي', price: 5 }, { name: 'لحم زيادة', price: 8 }] },
  { id: 10, name: 'سلطع برجر', desc: '180غم لحم مدخن طازج، خس، مخلل، بصل، بندورة، باربيكيو صوص', price: 29, cat: 'burger', options: [{ name: 'لحم زيادة', price: 8 }, { name: 'خبز', price: 2 }] },
  { id: 11, name: 'ميلانو برجر', desc: '160غم لحم طازج، خس، مخلل، بندورة، بصل، سوبر صوص، جبنة تشيدر وموتزاريلا، أصبعين موتزاريلا، قطعة سالمي مشوية', price: 26, cat: 'burger', options: [{ name: 'سلامي', price: 5 }, { name: 'لحم زيادة', price: 8 }] },
  { id: 12, name: 'ماشروم برجر', desc: '160غم لحم طازج، خس، مخلل، بصل، جبنة موتزاريلا، صوص الماشروم الطازج', price: 26, cat: 'burger', options: [{ name: 'ماشروم', price: 3 }, { name: 'جبنة موتزاريلا', price: 3 }, { name: 'لحم زيادة', price: 8 }] },
  { id: 13, name: 'كلاسيك تشيكن', desc: 'صدر دجاج مقلي، خس، بندورة، مخلل، سوبر صوص، سويت تشيلي صوص', price: 16, cat: 'chicken', options: [{ name: 'صوص سويت تشيلي', price: 1 }, { name: 'صوص حار', price: 1 }, { name: 'جبنة', price: 2 }] },
  { id: 14, name: 'كريسبي تشيكن', desc: 'صدر دجاج مقلي بخلطة الكريسبي، خس، بندورة، مخلل، سوبر صوص، سويت تشيلي صوص', price: 17, cat: 'chicken', options: [{ name: 'صوص سويت تشيلي', price: 1 }, { name: 'صوص حار', price: 1 }] },
  { id: 15, name: 'ماشين تشيكن', desc: 'صدر دجاج مقلي بالخلطة السرية، خس، بندورة، مخلل، سوبر صوص، سويت تشيلي صوص', price: 21, cat: 'chicken', options: [{ name: 'صوص سويت تشيلي', price: 1 }, { name: 'صوص حار', price: 1 }] },
  { id: 16, name: 'دوريتوس تشيكن', desc: 'صدر دجاج مقلي بخلطة الدوريتوس، خس، بندورة، مخلل، سوبر صوص، سويت تشيلي صوص', price: 20, cat: 'chicken', options: [{ name: 'صوص سويت تشيلي', price: 1 }, { name: 'صوص حار', price: 1 }] },
  { id: 17, name: 'هالبينو تشيكن', desc: 'صدر دجاج مقلي، خس، بندورة، مخلل، قطع هالبينو، سوبر صوص، سويت تشيلي صوص، تشيلي صوص', price: 18, cat: 'chicken', options: [{ name: 'هالبينو', price: 2 }, { name: 'صوص حار', price: 1 }] },
  { id: 18, name: 'تشيكن ستربس', desc: 'قطع دجاج مقلية (متوفر حار أو عادي)', price: 15, cat: 'chicken', options: [{ name: 'حار', price: 0 }, { name: 'عادي', price: 0 }] },
  { id: 19, name: 'بطاطا', desc: 'بطاطا مقلية ذهبية', price: 6, cat: 'extras', options: [{ name: 'ملح', price: 0 }, { name: 'بابريكا', price: 1 }] },
  { id: 20, name: 'بطاطا مع جبنة', desc: 'بطاطا مقلية مع جبنة سائلة', price: 11, cat: 'extras', options: [] },
  { id: 21, name: 'حلقات البصل', desc: 'حلقات بصل مقلية مقرمشة', price: 10, cat: 'extras', options: [] },
  { id: 22, name: 'ودجز', desc: 'قطع بطاطا مقلية صغيرة', price: 10, cat: 'extras', options: [] },
  { id: 23, name: 'كرات البطاطا', desc: 'كرات بطاطا مقلية', price: 10, cat: 'extras', options: [] },
  { id: 24, name: 'أصابع الموتزاريلا', desc: 'أصابع جبنة موتزاريلا مقلية', price: 15, cat: 'extras', options: [] },
  { id: 25, name: 'كيرلي', desc: 'بطاطا مجعودة مقلية', price: 14, cat: 'extras', options: [] },
  { id: 26, name: 'سوبر بوكس', desc: 'بوكس سوبر برجر مع بطاطا ومشروب', price: 25, cat: 'extras', options: [] },
  { id: 27, name: 'جبنة سائلة', desc: 'صوص جبنة سائلة', price: 5, cat: 'extras', options: [] },
  { id: 28, name: 'كرات الجبنة بالهالبينو', desc: 'كرات جبنة محشوة بهالبينو', price: 15, cat: 'extras', options: [] },
  { id: 29, name: 'أجنحة الدجاج', desc: 'أجنحة دجاج مقلية (سويت وينجز، وينجز حار، باربيكيو وينجز، كرانش وينجز)', price: 15, cat: 'extras', options: [{ name: 'سويت وينجز', price: 0 }, { name: 'وينجز حار', price: 0 }, { name: 'باربيكيو', price: 1 }, { name: 'كرانش', price: 1 }] },
];

const categories = [
  { key: 'all', label: 'الكل' },
  { key: 'burger', label: 'برجر' },
  { key: 'chicken', label: 'دجاج' },
  { key: 'extras', label: 'إضافات' },
  { key: 'drinks', label: 'مشروبات' },
];

const ITEMS_PER_PAGE = 8;
const activeOrders = [];
const pastOrders = [];

export default function App() {
  const [activeTab, setActiveTab] = React.useState('home');
  const [selectedCat, setSelectedCat] = React.useState('all');
  const [menuCat, setMenuCat] = React.useState('all');
  const [searchText, setSearchText] = React.useState('');
  const [orderTab, setOrderTab] = React.useState('active');
  const [cartCount, setCartCount] = React.useState(0);
  const [cartTotal, setCartTotal] = React.useState(0);
  const [cartItems, setCartItems] = React.useState([]);
  const [toast, setToast] = React.useState('');
  const [notifData, setNotifData] = React.useState(null);
  const [confirmData, setConfirmData] = React.useState(null);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [verificationCode, setVerificationCode] = React.useState('');
  const [verificationId, setVerificationId] = React.useState(null);
  const [phoneStep, setPhoneStep] = React.useState('success'); // 'enterPhone' | 'enterCode' | 'success'
  const [otpSending, setOtpSending] = React.useState(false);
  const [showMenuModal, setShowMenuModal] = React.useState(false);
  
const [showSearch, setShowSearch] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [initializing, setInitializing] = React.useState(true);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [isLoginMode, setIsLoginMode] = React.useState(true);
  const [authPassword, setAuthPassword] = React.useState('');
  const [authName, setAuthName] = React.useState('');
  const [authPhone, setAuthPhone] = React.useState('');
  
  const [couponError, setCouponError] = React.useState(false);
  const [couponApplied, setCouponApplied] = React.useState(false);
  const [cop1Float, setCop1Float] = React.useState(new Animated.Value(0));

  const [coupons, setCoupons] = React.useState([]);
  const [appliedCouponId, setAppliedCouponId] = React.useState(null);
  const [showAddCoupon, setShowAddCoupon] = React.useState(false);
  const [newCouponCode, setNewCouponCode] = React.useState('');
  const [newCouponDiscount, setNewCouponDiscount] = React.useState('');
  const [newCouponMaxUses, setNewCouponMaxUses] = React.useState('');
  const [newCouponPerUser, setNewCouponPerUser] = React.useState('');
  const [newCouponExpiry, setNewCouponExpiry] = React.useState('');
  const [loyaltySettings, setLoyaltySettings] = React.useState({ targetAmount: 100, pointsPerReward: 5 });
  const [statSettings, setStatSettings] = React.useState({ delivery: '8', prepTime: '25', rating: '4.8' });
  const [statScale, setStatScale] = React.useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);
  const galleryAnim = React.useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const statOpacity = React.useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const heroAnim = React.useRef(new Animated.Value(0)).current;
  const sectionAnims = React.useRef([0,1,2,3,4,5].map(() => new Animated.Value(0))).current;
  const [galleryImages, setGalleryImages] = React.useState({ main: null, small1: null, small2: null, hero: null });
  const [mgmtView, setMgmtView] = React.useState(null);
  const [newItemImage, setNewItemImage] = React.useState('');

  const [pointsPrices, setPointsPrices] = React.useState({});
  const [loyaltyPage, setLoyaltyPage] = React.useState(1);

  const [copiedCoupon, setCopiedCoupon] = React.useState(false);
  const [userTotalSpent, setUserTotalSpent] = React.useState(0);
  const [couponInput, setCouponInput] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedItem, setExpandedItem] = React.useState(null);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const [showOptionsModal, setShowOptionsModal] = React.useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = React.useState(null);
  const [selectedOptions, setSelectedOptions] = React.useState([]);
  const [menuFromDB, setMenuFromDB] = React.useState([]);
  const [showMenuManagement, setShowMenuManagement] = React.useState(false);
  const [loginWarningItemId, setLoginWarningItemId] = React.useState(null);
  const [authError, setAuthError] = React.useState('');
  const [otpError, setOtpError] = React.useState('');
  const [editingItem, setEditingItem] = React.useState(null);
  const [newItemName, setNewItemName] = React.useState('');
  const [newItemDesc, setNewItemDesc] = React.useState('');
  const [newItemPrice, setNewItemPrice] = React.useState('');
  const [newItemCat, setNewItemCat] = React.useState('burger');
  const [newItemOptions, setNewItemOptions] = React.useState([]);
  const [newOptionName, setNewOptionName] = React.useState('');
  const [newOptionPrice, setNewOptionPrice] = React.useState('');

const [adminOrders, setAdminOrders] = React.useState([]);
  const [showAdminNotification, setShowAdminNotification] = React.useState(false);
  const [orderPrepTimes, setOrderPrepTimes] = React.useState({});
  const [orderOtpPending, setOrderOtpPending] = React.useState(false);

  const [showConfirmOrderModal, setShowConfirmOrderModal] = React.useState(false);

  

  React.useEffect(() => {
    I18nManager.forceRTL(true);
  }, []);

  React.useEffect(() => {
    const initCoupons = async () => {
      try {
        const snap = await getDocs(collection(db, 'coupons'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCoupons(list);
      } catch(e) {
        console.log('Init coupons error:', e);
      }
    };
    initCoupons();
  }, []);

  React.useEffect(() => {
    const initLoyalty = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'loyalty'));
        const data = snap.data();
        if (data) {
          setLoyaltySettings({ targetAmount: data.targetAmount || 100, pointsPerReward: data.pointsPerReward || 5 });
        }
      } catch(e) {
        console.log('Init loyalty error:', e);
      }
    };
    initLoyalty();
  }, []);

  React.useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.uid) {
            try {
              const userDoc = await getDoc(doc(db, 'users', parsed.uid));
              if (userDoc.exists) {
                const userData = userDoc.data();
                setCurrentUser({ uid: parsed.uid, ...userData });
                setIsAdmin(userData?.role === 'admin');
              } else {
                setCurrentUser(parsed);
              }
            } catch(e) {
              setCurrentUser(parsed);
            }
          } else {
            setCurrentUser(parsed);
          }
        }
      } catch(e) {
        console.log('Restore session error:', e);
      }
    };
    restoreSession();
  }, []);

  React.useEffect(() => {
    const loadGallery = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'gallery'));
        const data = snap.data();
        if (data) setGalleryImages(data);
      } catch(e) {
        console.log('Gallery load error:', e);
      }
    };
    loadGallery();
  }, []);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coupons'), (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(list);
    }, (err) => { console.log('Coupons snapshot error:', err?.message || err); });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'loyalty'), (snap) => {
      const data = snap.data();
      if (data) setLoyaltySettings({ targetAmount: data.targetAmount || 100, pointsPerReward: data.pointsPerReward || 5 });
    }, (err) => { console.log('Loyalty snapshot error:', err?.message || err); });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'stats'), (snap) => {
      const data = snap.data();
      if (data) setStatSettings({ delivery: String(data.delivery || '8'), prepTime: String(data.prepTime || '25'), rating: String(data.rating || '4.8') });
    }, (err) => { console.log('Stats snapshot error:', err?.message || err); });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    const anims = statScale.map((val, i) =>
      Animated.spring(val, { toValue: 1, friction: 4, tension: 40, delay: i * 200, useNativeDriver: true })
    );
    Animated.parallel(anims).start();
  }, []);

  React.useEffect(() => {
    const anims = galleryAnim.map((val, i) =>
      Animated.timing(val, { toValue: 1, duration: 600, delay: i * 300, useNativeDriver: true })
    );
    Animated.parallel(anims).start();
  }, []);

  React.useEffect(() => {
    const anims = statOpacity.map((val, i) =>
      Animated.timing(val, { toValue: 1, duration: 500, delay: i * 200, useNativeDriver: true })
    );
    Animated.parallel(anims).start();
  }, []);

  React.useEffect(() => {
    Animated.timing(heroAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    const anims = sectionAnims.map((val, i) =>
      Animated.timing(val, { toValue: 1, duration: 500, delay: 500 + i * 150, useNativeDriver: true })
    );
    Animated.parallel(anims).start();
  }, []);

const registerFCMToken = async (phone) => {
    if (!phone || phone === '00000000') {
      console.log('No valid phone number for token registration');
      return;
    }
    try {
      const token = await getToken(messagingInstance);
      console.log('FCM Token:', token);
      if (!token) {
        showToast('❌ لم يتم الحصول على التوكن');
        return;
      }
      const normalizedPhone = phone.startsWith('0') ? '970' + phone.slice(1) : phone;
      console.log('Registering with phone:', normalizedPhone, 'token:', token.substring(0, 20) + '...');
      const res = await fetch(SERVER_URL + '/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, phone: normalizedPhone })
      });
      const data = await res.json();
      console.log('Token registered:', data);
      if (data.success) {
        showToast('✅ تم تسجيل جهازك للإشعارات');
      } else {
        showToast('❌ خطأ: ' + (data.error || 'غير معروف'));
      }
    } catch(e) {
      console.log('FCM token error:', e.message);
      showToast('❌ خطأ في الاتصال');
    }
  };

  const sendPushNotification = async (phone, title, body) => {
    try {
      await fetch(SERVER_URL + '/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, title, body })
      });
      showToast('تم إرسال الإشعار!');
    } catch(e) {
      console.log('Notification error:', e.message);
      showToast('تم الإشعار!');
    }
  };

  React.useEffect(() => {
    // Background notification handler (for when app is closed)
    try {
      setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
        console.log('Background notification:', remoteMessage);
      });
    } catch(e) {
      console.log('Background handler not available');
    }
  }, []);

  React.useEffect(() => {
    // Request notification permission on app start
    const requestNotifPermission = async () => {
      const authStatus = await requestPermission(messagingInstance);
      const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Notification permission granted');
        const token = await getToken(messagingInstance);
        console.log('Device token:', token);
      }
    };
    requestNotifPermission();
  }, []);

  React.useEffect(() => {
    // Foreground notification handler - shows styled notification only
    const unsubscribe = onMessage(messagingInstance, async (remoteMessage) => {
      const title = remoteMessage.notification?.title || 'سوبر برجر';
      const body = remoteMessage.notification?.body || 'لديك إشعار جديد';
      setNotifData({ title, body });
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          const isAdminUser = userData?.role === 'admin';
          setCurrentUser({ uid: user.uid, ...userData });
          setIsAdmin(isAdminUser);
        } catch(e) {
          setCurrentUser({ uid: user.uid, email: user.email });
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      if (initializing) setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!currentUser?.phone) return;
    const q = query(collection(db, 'orders'), where('phone', '==', currentUser.phone));
    const unsub = onSnapshot(q, (snap) => {
      let total = 0;
      snap.docs.forEach(d => { const d2 = d.data(); if (d2.total && d2.status === 'completed') total += d2.total; });
      setUserTotalSpent(total);
    }, () => {});
    return () => unsub();
  }, [currentUser?.phone]);

  React.useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      const data = snap.data();
      if (data) {
        setCurrentUser(prev => ({ ...prev, loyaltyPoints: data.loyaltyPoints || 0, loyaltySpentAwarded: data.loyaltySpentAwarded || 0 }));
      }
    }, () => {});
    return () => unsub();
  }, [currentUser?.uid]);

  

  React.useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await requestPermission(messagingInstance);
      const enabled = authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('FCM Permission granted');
        try {
          const token = await getToken(messagingInstance);
          console.log('Got token:', token);
          // Don't save here - will be saved when user places order with phone number
        } catch(e) {
          console.log('Token error:', e.message);
        }
      }
    };
    requestPermission();
  }, []);

  React.useEffect(() => {
    if (!isAdmin) return;
    try {
      const unsubscribe = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), snapshot => {
          if (snapshot) {
            const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAdminOrders(orders.filter(o => o.status !== 'completed'));
          }
        });
      return () => unsubscribe();
    } catch(e) {
      console.log('Firestore listener error:', e.message);
    }
  }, [isAdmin]);

  React.useEffect(() => {
    if (isAdmin) {
      try {
        const unsubscribe = onSnapshot(collection(db, 'menu'), snapshot => {
            if (snapshot) {
              const menu = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              if (menu.length > 0) setMenuFromDB(menu);
            }
          });
        return () => unsubscribe();
      } catch(e) {
        console.log('Menu load error:', e.message);
      }
    }
  }, [isAdmin]);

  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(cop1Float, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(cop1Float, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
);
    anim.start();
    return () => anim.stop();
  }, []);

  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const toastTimeout = React.useRef(null);
  const loginTimeout = React.useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(''), 2000);
  };

  const handleRegister = async () => {
    setAuthError('');
    if (!authPhone || !authPassword || !authName) {
      setAuthError('املأ جميع الحقول');
      return;
    }
    try {
      const email = authPhone + '@app.superburger';
      const userCredential = await auth().createUserWithEmailAndPassword(email, authPassword);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: authName,
        phone: authPhone,
        role: 'user',
        createdAt: new Date().toISOString(),
        loyaltyPoints: 0,
        loyaltySpentAwarded: 0
      });
      setCurrentUser({ uid: userCredential.user.uid, name: authName, phone: authPhone, role: 'user' });
      setShowAuthModal(false);
      setAuthPassword('');
      setAuthName('');
      setAuthPhone('');
      setAuthError('');
      showToast('✅ تم التسجيل!');
      registerFCMToken(authPhone);
    } catch(e) {
      setAuthError(e.message.includes('email-already-in-use') ? 'رقم الهاتف مسجل مسبقاً' : 'خطأ: ' + e.message);
    }
  };

  const sendVerificationCode = async (phoneParam) => {
    setOtpError('');
    setOtpSending(true);
    const num = phoneParam || phoneNumber;
    const digits = num.replace(/[^0-9]/g, '');
    if (digits.length < 9) {
      setOtpError('أدخل رقم الهاتف صحيح');
      setOtpSending(false);
      return;
    }
    const phone = num.startsWith('+') ? num : num.startsWith('00') ? '+' + num.slice(2) : '+970' + digits.replace(/^0+/, '');
    setVerificationId(phone);
    try {
      const res = await fetch(`${SERVER_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
        signal: AbortSignal.timeout(15000)
      });
      const data = await res.json();
      if (data.success) {
        setPhoneStep('enterCode');
        setOtpError('');
      } else {
        setOtpError(data.error || 'فشل الإرسال');
      }
    } catch(e) {
      console.log('Send OTP error:', e.message);
      if (e.name?.includes('Timeout') || e.name?.includes('Abort') || e.message?.includes('Network') || e.message?.includes('network')) {
        setOtpError('السيرفر غير متاح، تحقق من اتصالك وحاول مرة أخرى');
      } else {
        setOtpError('فشل الاتصال بالسيرفر');
      }
    } finally {
      setOtpSending(false);
    }
  };

  const verifyCode = async () => {
    setOtpError('');
    setOtpSending(true);
    if (!verificationCode || verificationCode.length < 6) {
      setOtpError('أدخل الكود المكون من 6 أرقام');
      setOtpSending(false);
      return;
    }
    try {
      const res = await fetch(`${SERVER_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: verificationId, code: verificationCode }),
        signal: AbortSignal.timeout(15000)
      });
      const data = await res.json();
      if (data.success) {
        setPhoneStep('success');
        setVerificationCode('');
        setOtpError('');
        if (orderOtpPending && currentUser) {
          setOrderOtpPending(false);
          if (cartItems.length === 0) {
            showToast('السلة فارغة');
            return;
          }
          try {
            await updateDoc(doc(db, 'users', currentUser.uid), { verifiedForOrdering: true });
            setCurrentUser({ ...currentUser, verifiedForOrdering: true });
            await placeOrder();
          } catch(e) {
            showToast('خطأ: ' + e.message);
          }
        }
      } else {
        setOtpError('الكود غير صحيح');
      }
    } catch(e) {
      console.log('Verify error:', e.message);
      if (e.name?.includes('Timeout') || e.name?.includes('Abort') || e.message?.includes('Network') || e.message?.includes('network')) {
        setOtpError('السيرفر غير متاح، تحقق من اتصالك وحاول مرة أخرى');
      } else {
        setOtpError('فشل الاتصال بالسيرفر');
      }
    } finally {
      setOtpSending(false);
    }
  };

  const handleLogin = async () => {
    setAuthError('');
    if (!authPhone || !authPassword) {
      setAuthError('املأ رقم الهاتف وكلمة المرور');
      return;
    }
    try {
      const phoneEmail = authPhone + '@app.superburger';
      let userCredential;
      try {
        userCredential = await auth().signInWithEmailAndPassword(phoneEmail, authPassword);
      } catch(e) {
        const code = e.code || e.message || '';
        console.log('Login first attempt error:', code);
        if (code.includes('user-not-found')) {
          const q = query(collection(db, 'users'), where('phone', '==', authPhone));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const userData = snap.docs[0].data();
            if (userData.email) {
              userCredential = await auth().signInWithEmailAndPassword(userData.email, authPassword);
            } else {
              setAuthError('الحساب موجود لكن بدون بريد، سجل من جديد');
              return;
            }
          } else {
            setAuthError('الحساب غير موجود، سجل أولاً');
            return;
          }
        } else {
          throw e;
        }
      }
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      const isAdminUser = userData?.role === 'admin';
      setCurrentUser({ uid: userCredential.user.uid, ...userData, role: userData?.role });
      setIsAdmin(isAdminUser);
      setShowAuthModal(false);
      setAuthPassword('');
      setAuthName('');
      setAuthPhone('');
      setAuthError('');
      showToast(isAdminUser ? '✅ مرحباً يا مدير!' : '✅ مرحباً ' + (userData?.name || ''));
      registerFCMToken(userData?.phone || authPhone);
    } catch(e) {
      const code = e.code || e.message || '';
      console.log('Login error:', code);
      let errorMsg = 'حدث خطأ';
      if (code.includes('wrong-password')) errorMsg = 'كلمة المرور خطأ';
      else if (code.includes('too-many-requests')) errorMsg = 'حاول لاحقاً';
      else if (code.includes('network-request-failed')) errorMsg = 'تحقق من اتصالك';
      setAuthError(errorMsg);
    }
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      setCurrentUser(null);
      showToast('✅ تم تسجيل الخروج');
    } catch(e) {
      showToast('خطأ: ' + e.message);
    }
  };

  const applyCoupon = () => {
    const match = coupons.find(c => c.code?.toUpperCase() === couponInput.trim().toUpperCase() && c.active !== false);
    if (match) {
      if (match.expiresAt && new Date(match.expiresAt) < new Date()) {
        setCouponError(true);
        showToast('❌ انتهت صلاحية الكوبون');
        return;
      }
      if (match.maxUses > 0 && (match.currentUses || 0) >= match.maxUses) {
        setCouponError(true);
        showToast('❌ الكوبون نفذ');
        return;
      }
      if (match.maxPerUser > 0 && currentUser?.uid) {
        const userCount = (match.usedBy && match.usedBy[currentUser.uid]) || 0;
        if (userCount >= match.maxPerUser) {
          setCouponError(true);
          showToast('❌ لقد استنفذت حد استخدام هذا الكوبون');
          return;
        }
      }
      setAppliedCouponId(match.id);
      setCouponApplied(true);
      setCouponError(false);
      showToast(`✅ تم تطبيق خصم ${match.discount}%`);
    } else {
      setCouponError(true);
      showToast('❌ كوبون غير صالح');
    }
  };

  const getDiscountedPrice = (price) => {
    const coupon = coupons.find(c => c.id === appliedCouponId);
    if (couponApplied && coupon) return Math.round(price * (100 - coupon.discount) / 100);
    return price;
  };

  const addMenuItem = async () => {
    const price = parseInt(newItemPrice);
    if (!newItemName || !newItemPrice || isNaN(price) || price <= 0) {
      showToast('املأ الاسم والسعر (رقم صحيح)');
      return;
    }
    try {
      await addDoc(collection(db, 'menu'), {
        name: newItemName,
        desc: newItemDesc,
        price,
        cat: newItemCat,
        options: newItemOptions,
        image: newItemImage || '',
        createdAt: new Date().toISOString()
      });
      showToast('✅ تم إضافة الصنف');
      setNewItemName('');
      setNewItemDesc('');
      setNewItemPrice('');
      setNewItemOptions([]);
      setNewItemImage('');
    } catch(e) {
      showToast('Error: ' + e.message);
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'menu', id));
      showToast('✅ تم الحذف');
    } catch(e) {
      showToast('Error: ' + e.message);
    }
  };

  const updateMenuItem = async () => {
    if (!editingItem) return;
    const price = parseInt(editingItem.price);
    if (isNaN(price) || price <= 0) {
      showToast('السعر غير صحيح');
      return;
    }
    try {
      await updateDoc(doc(db, 'menu', editingItem.id), {
        name: editingItem.name,
        desc: editingItem.desc,
        price,
        cat: editingItem.cat,
        options: editingItem.options
      });
      showToast('✅ تم التحديث');
      setEditingItem(null);
    } catch(e) {
      showToast('Error: ' + e.message);
    }
  };

  const getCartTotal = () => {
    const total = cartItems.reduce((sum, item) => sum + (item.finalPrice || item.price), 0);
    const coupon = coupons.find(c => c.id === appliedCouponId);
    if (couponApplied && coupon) return Math.round(total * (100 - coupon.discount) / 100);
    return total;
  };

  const placeOrder = async () => {
    try {
      let token = '';
      try { token = await getToken(messagingInstance); } catch(e) {}
      const items = cartItems.map(i => ({
        name: i.name,
        price: i.price,
        finalPrice: i.finalPrice || i.price,
        selectedOptions: i.selectedOptions || []
      }));
      // Try server-side order placement first
      try {
        const res = await fetch(`${SERVER_URL}/place-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.uid || null,
            name: currentUser?.name || 'ضيف',
            phone: currentUser?.phone || '00000000',
            fcmToken: token,
            items,
            couponId: couponApplied ? appliedCouponId : null
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast('✅ تم إرسال الطلب!');
          setCouponApplied(false);
          setAppliedCouponId(null);
          setCouponInput('');
          setCartItems([]);
          setCartCount(0);
          setCartTotal(0);
          return;
        }
        console.log('Server order failed, falling back:', data.error);
      } catch(e) {
        console.log('Server order error, falling back:', e.message);
      }
      // Fallback: place directly to Firestore
      const orderTotal = getCartTotal();
      await addDoc(collection(db, 'orders'), {
        userId: currentUser?.uid || null,
        userName: currentUser?.name || 'ضيف',
        name: currentUser?.name || 'ضيف',
        phone: currentUser?.phone || '00000000',
        fcmToken: token || null,
        deliveryLocation: '',
        orderType: 'pickup',
        items,
        total: orderTotal,
        serverTotal: orderTotal,
        discount: couponApplied ? (coupons.find(c => c.id === appliedCouponId)?.discount || 0) : 0,
        couponId: couponApplied ? appliedCouponId : null,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      showToast('✅ تم إرسال الطلب!');
      if (couponApplied && appliedCouponId) {
        try {
          const updateData = { currentUses: increment(1) };
          if (currentUser?.uid) {
            updateData[`usedBy.${currentUser.uid}`] = increment(1);
          }
          await updateDoc(doc(db, 'coupons', appliedCouponId), updateData);
        } catch(e) { console.log('Coupon usage error:', e.message); }
      }
      setCouponApplied(false);
      setAppliedCouponId(null);
      setCouponInput('');
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    } catch(e) { showToast('❌ فشل إرسال الطلب'); }
  };

  const handleOrderConfirm = async () => {
    if (!currentUser) {
      setAuthError('يجب تسجيل الدخول أولاً');
      setShowAuthModal(true);
      return;
    }
    if (!currentUser.uid) {
      showToast('خطأ: بيانات المستخدم غير مكتملة');
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      if (!userData) {
        showToast('خطأ: حساب المستخدم غير موجود');
        return;
      }
      if (userData.verifiedForOrdering) {
        setShowConfirmOrderModal(true);
      } else {
        if (!currentUser.phone) {
          showToast('خطأ: رقم الهاتف غير مسجل');
          return;
        }
          // Try OTP — if server is down, skip verification
        setOrderOtpPending(true);
        setPhoneNumber(currentUser.phone);
        setPhoneStep('enterPhone');
        try {
          const res = await fetch(`${SERVER_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone }),
            signal: AbortSignal.timeout(8000)
          });
          const data = await res.json();
          if (data.success) {
            setPhoneStep('enterCode');
            setOtpError('');
          } else {
            throw new Error(data.error || 'OTP failed');
          }
        } catch(e) {
          setPhoneStep('');
          setOrderOtpPending(false);
          setShowConfirmOrderModal(true);
        }
      }
    } catch(e) {
      showToast('خطأ: ' + e.message);
    }
  };

  const addToCart = (item) => {
    if (!currentUser) {
      setLoginWarningItemId(item.id);
      if (loginTimeout.current) clearTimeout(loginTimeout.current);
      loginTimeout.current = setTimeout(() => setLoginWarningItemId(null), 3000);
      return;
    }
    setLoginWarningItemId(null);
    if (item.options && item.options.length > 0) {
      setSelectedMenuItem(item);
      setSelectedOptions([]);
      setShowOptionsModal(true);
    } else {
      setCartItems([...cartItems, { ...item, selectedOptions: [], optionsTotal: 0, finalPrice: item.price }]);
      setCartCount(c => c + 1);
      setCartTotal(t => t + item.price);
      showToast(`تم اضافة: ${item.name}`);
    }
  };

  const redeemLoyaltyItem = async (item) => {
    if (!currentUser) {
      setLoginWarningItemId(item.id);
      if (loginTimeout.current) clearTimeout(loginTimeout.current);
      loginTimeout.current = setTimeout(() => setLoginWarningItemId(null), 3000);
      return;
    }
    const pts = item.pointsPrice || 0;
    if (pts <= 0) return;
    if ((currentUser.loyaltyPoints || 0) < pts) {
      showToast('❌ نقاط ولاء غير كافية');
      return;
    }
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { loyaltyPoints: (currentUser.loyaltyPoints || 0) - pts });
      setCurrentUser(prev => ({ ...prev, loyaltyPoints: (prev.loyaltyPoints || 0) - pts }));
      setCartItems(prev => [...prev, { ...item, selectedOptions: [], optionsTotal: 0, finalPrice: 0, isLoyaltyRedeem: true }]);
      setCartCount(c => c + 1);
      setCartTotal(t => t);
      showToast(`✅ تم استبدال ${item.name} بنقاط الولاء!`);
    } catch(e) {
      showToast('❌ خطأ: ' + e.message);
    }
  };

  const confirmAddWithOptions = () => {
    if (!currentUser) {
      setShowOptionsModal(false);
      setSelectedOptions([]);
      setSelectedMenuItem(null);
      setAuthError('يجب تسجيل الدخول أولاً');
      setShowAuthModal(true);
      return;
    }
    const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const fullItem = {
      ...selectedMenuItem,
      selectedOptions: selectedOptions,
      optionsTotal: optionsTotal,
      finalPrice: selectedMenuItem.price + optionsTotal
    };
    setCartItems(prev => [...prev, fullItem]);
    setCartCount(c => c + 1);
    setCartTotal(t => t + fullItem.finalPrice);
    setShowOptionsModal(false);
    setSelectedOptions([]);
    setSelectedMenuItem(null);
    showToast(`تم اضافة: ${selectedMenuItem.name}`);
  };

  const removeFromCart = (index) => {
    const item = cartItems[index];
    setCartItems(prev => prev.filter((_, i) => i !== index));
    setCartCount(c => c - 1);
    setCartTotal(t => t - (item.finalPrice || item.price));
    if (item.isLoyaltyRedeem && item.pointsPrice > 0 && currentUser?.uid) {
      const userRef = doc(db, 'users', currentUser.uid);
      updateDoc(userRef, { loyaltyPoints: increment(item.pointsPrice) });
      setCurrentUser(prev => ({ ...prev, loyaltyPoints: (prev.loyaltyPoints || 0) + item.pointsPrice }));
    }
  };

  const pickItemImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.5 });
    if (!result.canceled) {
      setNewItemImage('data:image/jpeg;base64,' + result.assets[0].base64);
    }
  };

  const pickGalleryImage = async (key) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.4,
      base64: true,
    });
    if (!result.canceled) {
      const base64 = 'data:image/jpeg;base64,' + result.assets[0].base64;
      setGalleryImages(prev => ({ ...prev, [key]: base64 }));
    }
  };

  const searchResultPress = (item) => {
    setSelectedItem(item.id);
    setActiveTab('menu');
    setMenuCat(item.cat);
    setShowSearch(false);
    setSearchQuery('');
  };

  const renderHome = () => (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: heroAnim, transform: [{ translateY: heroAnim.interpolate({ inputRange: [0,1], outputRange: [40,0] }) }] }}>
      <View style={styles.hero}>
        <ImageBackground source={galleryImages.hero ? { uri: galleryImages.hero } : require('./assets/hero_image.jpg')} style={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.homeHeader}>
            {showSearch ? (
              <View style={styles.searchBarInline}>
                <TextInput
                  style={styles.searchBarInlineInput}
                  placeholder="ابحث عن وجبة..."
                  placeholderTextColor="#fff"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
                  <Feather name="x" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.logoBox}>
                <Image source={require('./assets/logo.png')} style={styles.logoImg} />
                <Text style={styles.logoName}>سوبر برجر</Text>
              </View>
            )}
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.hicon} onPress={() => setShowMenuModal(true)}>
                <Ionicons name="menu-outline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hicon} onPress={() => { setShowSearch(true); setShowNotifications(false); }}>
                <Feather name="search" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.hicon} onPress={() => { setShowNotifications(true); setShowSearch(false); }}>
                <Ionicons name="notifications-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.heroText}>
            <View style={styles.heroTag}><Text style={{ color: '#000', fontWeight: '900', fontSize: 10 }}>THE BEST EVER</Text></View>
            <Text style={styles.heroTitle}>ألذّ برجر<Text style={styles.goldText}> في قلقيلية</Text></Text>
            <Text style={styles.heroSub}>طازج • مشوي على الفحم • محتكر بحب</Text>
          </View>
        </ImageBackground>
      </View>
      </Animated.View>

      {showNotifications && (
        <View style={styles.notifCard}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle}>الإشعارات</Text>
            <TouchableOpacity style={styles.notifCloseBtn} onPress={() => setShowNotifications(false)}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.notifEmpty}>لا توجد إشعارات جديدة</Text>
        </View>
      )}

      {showSearch && searchQuery.length > 0 && menuData.filter(i => i.name.includes(searchQuery) || i.desc.includes(searchQuery)).length > 0 && (
        <View style={styles.searchResultsCard}>
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsTitle}>نتائج البحث</Text>
            <TouchableOpacity style={styles.searchCloseBtn} onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <Ionicons name="close" size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.searchResultsScroll} nestedScrollEnabled>
          {menuData.filter(i => i.name.includes(searchQuery) || i.desc.includes(searchQuery)).map((item) => (
            <TouchableOpacity key={item.id} style={styles.searchResultItem} onPress={() => searchResultPress(item)}>
              <Text style={styles.searchResultName}>{item.name}</Text>
              <Text style={styles.searchResultPrice}>₪{item.price}</Text>
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>
      )}

      <Animated.View style={{ opacity: sectionAnims[0], transform: [{ translateY: sectionAnims[0].interpolate({ inputRange: [0,1], outputRange: [30,0] }) }] }}>
      <View style={styles.statsRow}>
        {[
          { icon: 'bicycle-outline', val: statSettings.delivery + ' ₪', label: 'التوصيل', key: 'delivery' },
          { icon: 'time-outline', val: statSettings.prepTime + ' د', label: 'التحضير', key: 'prepTime' },
          { icon: 'star-outline', val: statSettings.rating, label: 'التقييم', key: 'rating' },
        ].map((s, i) => (
          <Animated.View key={i} style={[styles.statCard, { transform: [{ scale: statScale[i] }] }]}>
            <View style={styles.statIconWrap}>
              <Ionicons name={s.icon} size={22} color={COLORS.bg} />
            </View>
            <Text style={styles.statVal}>{s.val}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Animated.View>
        ))}
      </View>
      </Animated.View>

      <Animated.View style={{ opacity: sectionAnims[1], transform: [{ translateY: sectionAnims[1].interpolate({ inputRange: [0,1], outputRange: [30,0] }) }] }}>
      <View style={styles.gallerySection}>
        <Text style={styles.galleryTitle}>شو رأيك تجرب وجبتنا اليوم</Text>
        <View style={styles.galleryLineWrap}>
          <View style={styles.galleryLine} />
        </View>
        <View style={styles.galleryRow}>
          <View style={styles.galleryMain}>
            <Image source={galleryImages.main ? { uri: galleryImages.main } : require('./assets/a.jpg')} style={styles.galleryMainImg} />
          </View>
          <View style={styles.gallerySmallCol}>
            <View style={styles.gallerySmall}>
              <Image source={galleryImages.small1 ? { uri: galleryImages.small1 } : require('./assets/asset.jpg')} style={styles.gallerySmallImg} />
            </View>
            <View style={styles.gallerySmall}>
              <Image source={galleryImages.small2 ? { uri: galleryImages.small2 } : require('./assets/whySuper.jpg')} style={styles.gallerySmallImg} />
            </View>
          </View>
        </View>
      </View>
      </Animated.View>


      <Animated.View style={{ opacity: sectionAnims[2], transform: [{ translateY: sectionAnims[2].interpolate({ inputRange: [0,1], outputRange: [30,0] }) }] }}>
      <View style={styles.couponPremium}>
        {(() => {
          const activeCoupon = coupons.find(c => c.active !== false && (!c.expiresAt || new Date(c.expiresAt) >= new Date()) && (!c.maxUses || (c.currentUses || 0) < c.maxUses));
          return activeCoupon ? (
            <><View style={styles.couponPremiumBadge}>
                <Text style={styles.couponPremiumPct}>{activeCoupon.discount}%</Text>
                <Text style={styles.couponPremiumOff}>خصم</Text>
              </View>
              <View style={styles.couponPremiumInfo}>
                <Text style={styles.couponPremiumTitle}>كود الخصم</Text>
                <Text style={styles.couponPremiumDesc}>استخدم الكود واحصل على خصم {activeCoupon.discount}%{activeCoupon.expiresAt ? ` - ينتهي ${new Date(activeCoupon.expiresAt).toLocaleDateString('ar-SA')}` : ''}</Text>
                <View style={styles.couponPremiumCodeRow}>
                  <TouchableOpacity style={styles.couponPremiumCopy} onPress={() => { setCopiedCoupon(true); setTimeout(() => setCopiedCoupon(false), 2000); }}>
                    <Text style={styles.couponPremiumCopyText}>{copiedCoupon ? 'تم النسخ' : 'نسخ'}</Text>
                    <Ionicons name={copiedCoupon ? 'checkmark' : 'copy'} size={14} color={copiedCoupon ? '#000' : COLORS.gold} />
                  </TouchableOpacity>
                  <View style={styles.couponPremiumCodeBox}>
                    <Text style={styles.couponPremiumCode}>{activeCoupon.code}</Text>
                  </View>
                </View>
              </View></>
          ) : (
            <View style={{ padding: 20, alignItems: 'center', width: '100%' }}>
              <Ionicons name="pricetag" size={24} color={COLORS.textMuted} />
              <Text style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 8 }}>لا توجد كوبونات متاحة حالياً</Text>
            </View>
          );
        })()}
      </View>
      </Animated.View>

      <Animated.View style={{ opacity: sectionAnims[3], transform: [{ translateY: sectionAnims[3].interpolate({ inputRange: [0,1], outputRange: [30,0] }) }] }}>
      <View style={styles.loyaltyHow}>
        <Text style={styles.loyaltyHowTitle}>برنامج الولاء</Text>
        <View style={styles.loyaltyHowStep}>
          <View style={styles.loyaltyHowStepNum}><Text style={styles.loyaltyHowStepNumText}>1</Text></View>
          <View style={styles.loyaltyHowStepInfo}>
            <Text style={styles.loyaltyHowStepTitle}>اطلب من القائمة</Text>
            <Text style={styles.loyaltyHowStepDesc}>اختر الوجبة اللي بدك إياها من قائمة الطعام</Text>
          </View>
        </View>
        <View style={styles.loyaltyHowStep}>
          <View style={styles.loyaltyHowStepNum}><Text style={styles.loyaltyHowStepNumText}>2</Text></View>
          <View style={styles.loyaltyHowStepInfo}>
            <Text style={styles.loyaltyHowStepTitle}>اشتري بقيمة ₪{loyaltySettings.targetAmount}</Text>
            <Text style={styles.loyaltyHowStepDesc}>كل ما تزيد قيمة طلبك، كلما زادت نقاط ولائك</Text>
          </View>
        </View>
        <View style={styles.loyaltyHowStep}>
          <View style={styles.loyaltyHowStepNum}><Text style={styles.loyaltyHowStepNumText}>3</Text></View>
          <View style={styles.loyaltyHowStepInfo}>
            <Text style={styles.loyaltyHowStepTitle}>احصل على نقاط ولاء</Text>
            <Text style={styles.loyaltyHowStepDesc}>تجمّع نقاط ولاء وتستبدلها بأصناف من القائمة</Text>
          </View>
        </View>
      </View>
      </Animated.View>

      <Animated.View style={{ opacity: sectionAnims[4], transform: [{ translateY: sectionAnims[4].interpolate({ inputRange: [0,1], outputRange: [30,0] }) }] }}>
      <View style={styles.loyaltyProgressCard}>
        <View style={styles.loyaltyProgressHeader}>
          <View style={styles.loyaltyProgressRight}>
            <Text style={styles.loyaltyProgressTitle}>رصيد نقاط الولاء</Text>
            <Text style={styles.loyaltyProgressSub}>اجمع النقاط واستبدلها بأصناف من القائمة</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ backgroundColor: COLORS.gold, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#000' }}>{currentUser?.loyaltyPoints || 0}</Text>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#000', marginTop: -2 }}>نقطة</Text>
            </View>
            <View style={styles.loyaltyProgressIconWrap}>
              <MaterialCommunityIcons name="star" size={24} color={COLORS.gold} />
            </View>
          </View>
        </View>
        <View style={styles.loyaltyProgressDivider} />
        {(() => { const cycleSpent = Math.max(0, userTotalSpent - (currentUser?.loyaltySpentAwarded || 0)); return (
        <><View style={styles.loyaltyProgressRow}>
          <View style={styles.loyaltyProgressAmount}>
            <Text style={styles.loyaltyProgressAmountLabel}>أنفقت في هذه الدورة</Text>
            <Text style={styles.loyaltyProgressAmountVal}>₪{cycleSpent}</Text>
          </View>
          <View style={styles.loyaltyProgressTarget}>
            <Text style={styles.loyaltyProgressTargetLabel}>الهدف</Text>
            <Text style={styles.loyaltyProgressTargetVal}>₪{loyaltySettings.targetAmount}</Text>
          </View>
        </View>
        <View style={styles.loyaltyProgressBarWrap}>
          <View style={styles.loyaltyProgressBg}>
            <View style={[styles.loyaltyProgressFill, { width: Math.min((cycleSpent / loyaltySettings.targetAmount) * 100, 100) + '%' }]} />
          </View>
          <View style={styles.loyaltyProgressDotWrap}>
            <View style={[styles.loyaltyProgressDot, { left: Math.min((cycleSpent / loyaltySettings.targetAmount) * 100, 100) + '%' }]} />
          </View>
        </View>
        {cycleSpent >= loyaltySettings.targetAmount ? (
          <TouchableOpacity style={styles.loyaltyRedeemBtn} onPress={async () => {
            if (!currentUser?.uid) return;
            try {
              const userRef = doc(db, 'users', currentUser.uid);
              const userSnap = await getDoc(userRef);
              const uData = userSnap.data();
              if (!uData) return;
              const pts = uData.loyaltyPoints || 0;
              const awarded = uData.loyaltySpentAwarded || 0;
              const cycleCount = Math.floor((userTotalSpent) / (loyaltySettings.targetAmount || 100));
              const alreadyAwarded = Math.floor(awarded / (loyaltySettings.targetAmount || 100));
              const newCycles = cycleCount - alreadyAwarded;
              if (newCycles <= 0) { showToast('⚠️ تم استبدال النقاط مسبقاً'); return; }
              const addPoints = newCycles * (loyaltySettings.pointsPerReward || 5);
              const newAwardedVal = cycleCount * (loyaltySettings.targetAmount || 100);
              await updateDoc(userRef, { loyaltyPoints: pts + addPoints, loyaltySpentAwarded: newAwardedVal });
              showToast(`✅ تم إضافة ${addPoints} نقاط ولاء!`);
            } catch(e) { showToast('❌ خطأ: ' + e.message); }
          }}>
            <MaterialCommunityIcons name="gift" size={16} color={COLORS.bg} />
            <Text style={styles.loyaltyRedeemText}>استبدل نقاطك</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.loyaltyRemainRow}>
            <MaterialCommunityIcons name="information" size={14} color={COLORS.textMuted} />
            <Text style={styles.loyaltyRemainText}>متبقي ₪{Math.max(0, loyaltySettings.targetAmount - cycleSpent)} لتحصل على النقاط</Text>
          </View>
        )}</>
        );})()}
      </View>
      </Animated.View>

      <Animated.View style={{ opacity: sectionAnims[5], transform: [{ translateY: sectionAnims[5].interpolate({ inputRange: [0,1], outputRange: [30,0] }) }] }}>
      <View style={styles.contactSection}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactTitle}>تواصل معنا</Text>
          <View style={styles.contactLine} />
        </View>

        <View style={styles.contactCard}>
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('tel:0593221500')}>
            <View style={styles.contactIconBox}>
              <Ionicons name="call" size={22} color={COLORS.bg} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>اتصل بنا</Text>
              <Text style={styles.contactText}>0593221500</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.contactDivider} />

          <View style={styles.contactRow}>
            <View style={styles.contactIconBox}>
              <Ionicons name="location" size={22} color={COLORS.bg} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>الموقع</Text>
              <Text style={styles.contactText}>قلقيلية{'\n'}شارع حبلة القديم - بالقرب من مبنى المحافظة</Text>
            </View>
          </View>

          <View style={styles.contactDivider} />

          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('https://wa.me/970593221500')}>
            <View style={[styles.contactIconBox, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>واتساب</Text>
              <Text style={styles.contactText}>تواصل معنا مباشرة</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
      </Animated.View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderMenu = () => (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.menuPageHeader}>
        <Text style={styles.menuPageTitle}>القائمة الكاملة</Text>
        <View style={styles.menuSearch}>
          <Feather name="search" size={18} color={COLORS.textMuted} />
          <TextInput style={styles.searchInput} placeholder="ابحث عن صنف..." placeholderTextColor={COLORS.textMuted} value={searchText} onChangeText={setSearchText} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll}>
        {categories.map((c) => (
          <TouchableOpacity key={c.key} style={[styles.catPill, menuCat === c.key && styles.catPillActive]} onPress={() => setMenuCat(c.key)}>
            <Text style={[styles.catPillText, menuCat === c.key && styles.catPillTextActive]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.menuCouponCard}>
        <Text style={styles.menuCouponTitle}>هل لديك كوبون؟</Text>
        <View style={styles.menuCouponRow}>
          <TextInput style={styles.menuCouponInput} placeholder="أدخل كود الكوبون" placeholderTextColor="#666" value={couponInput} onChangeText={(t) => { setCouponInput(t); setCouponError(false); }} />
          <TouchableOpacity style={[styles.menuCouponBtn, couponApplied && { backgroundColor: COLORS.green }]} onPress={couponApplied ? () => { setCouponApplied(false); setAppliedCouponId(null); setCouponInput(''); showToast('تم إلغاء الكوبون'); } : applyCoupon}>
            <Text style={styles.menuCouponBtnText}>{couponApplied ? 'إلغاء' : 'تطبيق'}</Text>
          </TouchableOpacity>
        </View>
        {couponApplied && (() => { const c = coupons.find(c => c.id === appliedCouponId); return c ? <Text style={styles.menuCouponSuccess}>✅ تم تطبيق خصم {c.discount}%</Text> : null; })()}
        {couponError && !couponApplied && <Text style={styles.menuCouponError}>❌ الكوبون غير صحيح</Text>}
      </View>

      <View style={styles.menuList}>
        {(menuFromDB.length > 0 ? menuFromDB : menuData).filter(i => menuCat === 'all' || i.cat === menuCat).filter(i => !searchText || (i.name && i.name.includes(searchText))).map((item) => (
          <View key={item.id} style={[styles.menuCard, selectedItem === item.id && styles.menuCardHighlighted]}>
            {item.badge ? <View style={[styles.menuCardBadge, item.badge === 'جديد' && styles.menuCardBadgeNew]}><Text style={styles.menuCardBadgeText}>{item.badge}</Text></View> : null}
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.menuCardImage} />
            ) : (
              <View style={styles.menuCardImagePlaceholder}>
                <Ionicons name="fast-food" size={32} color="#444" />
              </View>
            )}
            <View style={styles.menuCardInfo}>
              <Text style={styles.menuCardName}>{item.name}</Text>
              <Text style={styles.menuCardDesc}>{item.desc}</Text>
              <View style={styles.menuCardFooter}>
                <Text style={styles.menuCardPrice}>₪{getDiscountedPrice(item.price)}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {item.pointsPrice > 0 && (
                    <TouchableOpacity style={styles.loyaltyMenuBtn} onPress={() => redeemLoyaltyItem(item)}>
                      <MaterialCommunityIcons name="gift" size={14} color="#000" />
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#000' }}>{item.pointsPrice}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                    <Text style={styles.addBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {loginWarningItemId === item.id && (
                <View style={{ backgroundColor: 'rgba(231,76,60,0.12)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginTop: 10, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' }}>
                  <Text style={{ color: '#ff6b6b', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>⚠ يجب تسجيل الدخول أولاً</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderOrders = () => (
    <View style={styles.page}>
      <View style={styles.ordersHeader}>
        <Text style={styles.ordersTitle}>السلة</Text>
        <Text style={styles.ordersSub}>أضف عناصر من القائمة</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {cartItems.length === 0 ? (
          <Text style={styles.emptyOrdersText}>السلة فارغة</Text>
        ) : (
          <View style={styles.ordersList}>
            {cartItems.map((item, index) => (
              <View key={`${item.id}-${index}`} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderItems}>{item.name}</Text>
                  <TouchableOpacity onPress={() => removeFromCart(index)}>
                    <Text style={{ color: COLORS.red, fontSize: 18 }}>×</Text>
                  </TouchableOpacity>
                </View>
                {item.selectedOptions && item.selectedOptions.length > 0 && (
                  <Text style={styles.orderItemSub}>+ {item.selectedOptions.map(o => o.name).join(', ')}</Text>
                )}
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>₪{getDiscountedPrice(item.finalPrice || item.price)}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.confirmOrderBtn} onPress={handleOrderConfirm}>
              <Text style={styles.confirmOrderBtnText}>تأكيد الطلب</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && activeTab !== 'orders' && (
        <TouchableOpacity style={styles.cartOverlay} onPress={() => setActiveTab('orders')}>
          <View style={styles.cartBar}>
            <View style={styles.cartBarInfo}>
              <View style={styles.cartCount}>
                <Text style={styles.cartCountText}>{cartItems.length}</Text>
              </View>
              <Text style={styles.cartBarText}>العناصر</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Text style={styles.cartBarTotal}>₪{getCartTotal()}</Text>
              <Text style={styles.cartBarText}>إتمام الطلب</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}


    </View>
  );

  const renderMenuManagement = () => {
    const allMenuItems = menuFromDB;
    const mgmtCards = [
      { key: 'menu', icon: 'fast-food', label: 'تعديل القائمة', desc: 'إضافة وحذف وتعديل أصناف القائمة', color: COLORS.gold },
      { key: 'loyalty', icon: 'gift', label: 'مكافآت الولاء', desc: 'إدارة مكافآت نقاط الولاء', color: COLORS.gold },
      { key: 'gallery', icon: 'images', label: 'معرض الصور', desc: 'تغيير صور المعرض في الرئيسية', color: COLORS.gold },
      { key: 'stats', icon: 'analytics', label: 'بيانات المطعم', desc: 'تعديل مدة التحضير وسعر التوصيل', color: COLORS.gold },
      { key: 'orders', icon: 'clipboard', label: 'إدارة الطلبات', desc: 'عرض وإدارة طلبات العملاء', color: COLORS.gold },
      { key: 'coupons', icon: 'pricetag', label: 'الكوبونات', desc: 'تعديل نسبة الخصم وكود الكوبون', color: COLORS.gold },
    ];

    if (mgmtView === 'menu') {
      return (
        <View style={styles.page}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>تعديل القائمة</Text>
            <TouchableOpacity onPress={() => setMgmtView(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            <View style={styles.menuMgmtSection}>
              <Text style={styles.menuMgmtTitle}>إضافة صنف جديد</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <TouchableOpacity style={{ width: 80, height: 80, backgroundColor: '#2a2418', borderRadius: 12, borderWidth: 1, borderColor: '#444', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }} onPress={pickItemImage}>
                  {newItemImage ? (
                    <Image source={{ uri: newItemImage }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Ionicons name="camera" size={28} color="#666" />
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <TextInput style={styles.menuMgmtInput} placeholder="اسم الصنف" placeholderTextColor="#666" value={newItemName} onChangeText={setNewItemName} />
                  <TextInput style={styles.menuMgmtInput} placeholder="الوصف" placeholderTextColor="#666" value={newItemDesc} onChangeText={setNewItemDesc} />
                  <TextInput style={styles.menuMgmtInput} placeholder="السعر" placeholderTextColor="#666" keyboardType="numeric" value={newItemPrice} onChangeText={setNewItemPrice} />
                </View>
              </View>
              <View style={styles.menuMgmtCatRow}>
                {['burger', 'chicken', 'extras'].map(cat => (
                  <TouchableOpacity key={cat} style={[styles.menuMgmtCatBtn, newItemCat === cat && styles.menuMgmtCatBtnActive]} onPress={() => setNewItemCat(cat)}>
                    <Text style={[styles.menuMgmtCatBtnText, newItemCat === cat && styles.menuMgmtCatBtnTextActive]}>
                      {cat === 'burger' ? 'برجر' : cat === 'chicken' ? 'دجاج' : 'إضافات'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.menuMgmtTitle, { fontSize: 14, marginTop: 8 }]}>الإضافات (اختياري)</Text>
              <View style={styles.optionsInputRow}>
                <TextInput style={[styles.menuMgmtInput, { flex: 1 }]} placeholder="اسم الإضافة (مثال: جبنة)" placeholderTextColor="#666" value={newOptionName || ''} onChangeText={(text) => setNewOptionName(text)} />
                <TextInput style={[styles.menuMgmtInput, { width: 70 }]} placeholder="السعر" placeholderTextColor="#666" keyboardType="numeric" value={newOptionPrice || ''} onChangeText={(text) => setNewOptionPrice(text)} />
                <TouchableOpacity style={styles.addOptionBtn} onPress={() => {
                  if (newOptionName && newOptionPrice) {
                    setNewItemOptions([...newItemOptions, { name: newOptionName, price: parseInt(newOptionPrice) }]);
                    setNewOptionName('');
                    setNewOptionPrice('');
                  }
                }}>
                  <Ionicons name="add" size={20} color="#000" />
                </TouchableOpacity>
              </View>
              {newItemOptions.length > 0 && (
                <View style={styles.optionsList}>
                  {newItemOptions.map((opt, idx) => (
                    <View key={idx} style={styles.optionTag}>
                      <Text style={styles.optionTagText}>{opt.name} +₪{opt.price}</Text>
                      <TouchableOpacity onPress={() => setNewItemOptions(newItemOptions.filter((_, i) => i !== idx))}>
                        <Ionicons name="close" size={14} color="#000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity style={styles.menuMgmtAddBtn} onPress={addMenuItem}>
                <Text style={styles.menuMgmtAddBtnText}>إضافة</Text>
              </TouchableOpacity>
            </View>

            {editingItem && (
              <View style={styles.menuMgmtSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.menuMgmtTitle}>تعديل: {editingItem.name}</Text>
                  <TouchableOpacity onPress={() => setEditingItem(null)}>
                    <Ionicons name="close" size={22} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                <TextInput style={styles.menuMgmtInput} placeholder="اسم الصنف" placeholderTextColor="#666" value={editingItem.name} onChangeText={(t) => setEditingItem({...editingItem, name: t})} />
                <TextInput style={styles.menuMgmtInput} placeholder="الوصف" placeholderTextColor="#666" value={editingItem.desc || ''} onChangeText={(t) => setEditingItem({...editingItem, desc: t})} />
                <TextInput style={styles.menuMgmtInput} placeholder="السعر" placeholderTextColor="#666" keyboardType="numeric" value={String(editingItem.price)} onChangeText={(t) => setEditingItem({...editingItem, price: t})} />
                <TouchableOpacity style={styles.menuMgmtAddBtn} onPress={updateMenuItem}>
                  <Text style={styles.menuMgmtAddBtnText}>حفظ التعديلات</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.adminSectionTitle, { marginTop: 20 }]}>الأصناف الحالية ({allMenuItems.length})</Text>
            {allMenuItems.map((item) => (
              <View key={item.id || item.name} style={styles.menuMgmtItem}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.menuMgmtItemImage} />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuMgmtItemName}>{item.name}</Text>
                  <Text style={styles.menuMgmtItemPrice}>₪{item.price}</Text>
                  {item.options && item.options.length > 0 && (
                    <Text style={styles.menuMgmtItemOptions}>إضافات: {item.options.length}</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity style={styles.menuMgmtEditBtn} onPress={() => setEditingItem(item)}>
                    <Ionicons name="create" size={18} color={COLORS.gold} />
                  </TouchableOpacity>
                  {item.id && (
                    <TouchableOpacity style={styles.menuMgmtDeleteBtn} onPress={() => deleteMenuItem(item.id)}>
                      <Ionicons name="trash" size={18} color={COLORS.red} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    if (mgmtView === 'loyalty') {
      return (
        <View style={styles.page}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>إدارة مكافآت النقاط</Text>
            <TouchableOpacity onPress={() => setMgmtView(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={styles.menuMgmtSection}>
              <Text style={styles.menuMgmtTitle}>إعدادات برنامج الولاء</Text>
              <TextInput style={styles.menuMgmtInput} placeholder="المبلغ المستهدف (شيكل)" placeholderTextColor="#666" keyboardType="numeric" value={String(loyaltySettings.targetAmount)} onChangeText={(t) => setLoyaltySettings({ ...loyaltySettings, targetAmount: parseInt(t) || 0 })} />
              <TextInput style={styles.menuMgmtInput} placeholder="النقاط لكل هدف" placeholderTextColor="#666" keyboardType="numeric" value={String(loyaltySettings.pointsPerReward)} onChangeText={(t) => setLoyaltySettings({ ...loyaltySettings, pointsPerReward: parseInt(t) || 0 })} />
              <TouchableOpacity style={styles.menuMgmtAddBtn} onPress={async () => {
                if (!loyaltySettings.targetAmount || !loyaltySettings.pointsPerReward) { showToast('املأ جميع الحقول'); return; }
                try {
                  await setDoc(doc(db, 'settings', 'loyalty'), { targetAmount: loyaltySettings.targetAmount, pointsPerReward: loyaltySettings.pointsPerReward });
                  showToast('✅ تم تحديث إعدادات الولاء!');
                } catch(e) { showToast('Error: ' + e.message); }
              }}>
                <Text style={styles.menuMgmtAddBtnText}>حفظ الإعدادات</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuMgmtSection}>
              <Text style={styles.menuMgmtTitle}>تسعير الأصناف بنقاط الولاء</Text>
              {menuFromDB.length === 0 && <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: 'center' }}>لا توجد أصناف في القائمة</Text>}
              {menuFromDB.slice((loyaltyPage - 1) * ITEMS_PER_PAGE, loyaltyPage * ITEMS_PER_PAGE).map(item => {
                const pts = pointsPrices[item.id] !== undefined ? pointsPrices[item.id] : (item.pointsPrice || '');
                return (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuMgmtItemName}>{item.name}</Text>
                    <Text style={styles.menuMgmtItemPrice}>₪{item.price}</Text>
                    {item.pointsPrice > 0 && <Text style={{ fontSize: 11, color: COLORS.gold }}>{item.pointsPrice} نقطة</Text>}
                  </View>
                  <TextInput style={{ backgroundColor: '#111', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, color: COLORS.gold, fontSize: 13, width: 70, textAlign: 'center' }} placeholder="نقاط" placeholderTextColor="#666" keyboardType="number-pad" value={String(pts)} onChangeText={(t) => setPointsPrices({ ...pointsPrices, [item.id]: t })} />
                  <TouchableOpacity style={{ backgroundColor: COLORS.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 }} onPress={async () => {
                    try { await updateDoc(doc(db, 'menu', item.id), { pointsPrice: parseInt(pointsPrices[item.id]) || 0 }); showToast('✅ تم الحفظ'); }
                    catch(e) { showToast('خطأ: ' + e.message); }
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#000' }}>حفظ</Text>
                  </TouchableOpacity>
                </View>
                );
              })}
              {menuFromDB.length > ITEMS_PER_PAGE && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 12 }}>
                  <TouchableOpacity style={{ backgroundColor: loyaltyPage <= 1 ? '#333' : COLORS.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }} disabled={loyaltyPage <= 1} onPress={() => setLoyaltyPage(p => Math.max(1, p - 1))}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: loyaltyPage <= 1 ? '#666' : '#000' }}>السابق</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 13, color: COLORS.textMuted, textAlignVertical: 'center' }}>{loyaltyPage} / {Math.ceil(menuFromDB.length / ITEMS_PER_PAGE)}</Text>
                  <TouchableOpacity style={{ backgroundColor: loyaltyPage >= Math.ceil(menuFromDB.length / ITEMS_PER_PAGE) ? '#333' : COLORS.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }} disabled={loyaltyPage >= Math.ceil(menuFromDB.length / ITEMS_PER_PAGE)} onPress={() => setLoyaltyPage(p => p + 1)}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: loyaltyPage >= Math.ceil(menuFromDB.length / ITEMS_PER_PAGE) ? '#666' : '#000' }}>التالي</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    if (mgmtView === 'gallery') {
      return (
        <View style={styles.page}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>معرض الصور</Text>
            <TouchableOpacity onPress={() => setMgmtView(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={styles.galleryEditDesc}>اضغط على الصورة لتغييرها</Text>

            <Text style={[styles.adminSectionTitle, { marginTop: 0, marginBottom: 10 }]}>صورة الهيدر</Text>
            <TouchableOpacity style={styles.galleryEditHero} onPress={() => pickGalleryImage('hero')}>
              <Image source={galleryImages.hero ? { uri: galleryImages.hero } : require('./assets/hero_image.jpg')} style={styles.galleryEditHeroImg} />
              <View style={styles.galleryEditOverlay}>
                <Ionicons name="camera" size={28} color="#fff" />
                <Text style={styles.galleryEditOverlayText}>تغيير صورة الهيدر</Text>
              </View>
            </TouchableOpacity>

            <Text style={[styles.adminSectionTitle, { marginTop: 20, marginBottom: 10 }]}>صور المعرض</Text>
            <View style={styles.galleryEditPreview}>
              <TouchableOpacity style={styles.galleryEditMain} onPress={() => pickGalleryImage('main')}>
                <Image source={galleryImages.main ? { uri: galleryImages.main } : require('./assets/a.jpg')} style={styles.galleryEditImgFull} />
                <View style={styles.galleryEditOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.galleryEditOverlayText}>تغيير</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.galleryEditSmallCol}>
                <TouchableOpacity style={styles.galleryEditSmall} onPress={() => pickGalleryImage('small1')}>
                  <Image source={galleryImages.small1 ? { uri: galleryImages.small1 } : require('./assets/asset.jpg')} style={styles.galleryEditImgFull} />
                  <View style={styles.galleryEditOverlay}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.galleryEditSmall} onPress={() => pickGalleryImage('small2')}>
                  <Image source={galleryImages.small2 ? { uri: galleryImages.small2 } : require('./assets/whySuper.jpg')} style={styles.galleryEditImgFull} />
                  <View style={styles.galleryEditOverlay}>
                    <Ionicons name="camera" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.menuMgmtAddBtn} onPress={async () => {
              try {
                await setDoc(doc(db, 'settings', 'gallery'), galleryImages);
                showToast('✅ تم حفظ صور المعرض!');
              } catch(e) { showToast('خطأ: ' + e.message); }
            }}>
              <Text style={styles.menuMgmtAddBtnText}>حفظ التغييرات</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    if (mgmtView === 'stats') {
      return (
        <View style={styles.page}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>بيانات المطعم</Text>
            <TouchableOpacity onPress={() => setMgmtView(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={styles.menuMgmtSection}>
              <Text style={styles.menuMgmtTitle}>معلومات التوصيل والتحضير</Text>
              <TextInput style={styles.menuMgmtInput} placeholder="سعر التوصيل (شيكل)" placeholderTextColor="#666" keyboardType="numeric" value={statSettings.delivery} onChangeText={(t) => setStatSettings({ ...statSettings, delivery: t })} />
              <TextInput style={styles.menuMgmtInput} placeholder="مدة التحضير (دقائق)" placeholderTextColor="#666" keyboardType="numeric" value={statSettings.prepTime} onChangeText={(t) => setStatSettings({ ...statSettings, prepTime: t })} />
              <TextInput style={styles.menuMgmtInput} placeholder="التقييم (مثال: 4.8)" placeholderTextColor="#666" keyboardType="decimal-pad" value={statSettings.rating} onChangeText={(t) => setStatSettings({ ...statSettings, rating: t })} />
              <TouchableOpacity style={styles.menuMgmtAddBtn} onPress={async () => {
                try {
                  await setDoc(doc(db, 'settings', 'stats'), { delivery: parseInt(statSettings.delivery) || 0, prepTime: parseInt(statSettings.prepTime) || 0, rating: parseFloat(statSettings.rating) || 0 });
                  showToast('✅ تم تحديث بيانات المطعم!');
                } catch(e) { showToast('Error: ' + e.message); }
              }}>
                <Text style={styles.menuMgmtAddBtnText}>حفظ التغييرات</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      );
    }

    if (mgmtView === 'coupons') {
      return (
        <View style={styles.page}>
          <View style={styles.ordersHeader}>
            <Text style={styles.ordersTitle}>إدارة الكوبونات</Text>
            <TouchableOpacity onPress={() => setMgmtView(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {showAddCoupon && (
              <View style={styles.menuMgmtSection}>
                <Text style={styles.menuMgmtTitle}>إضافة كوبون جديد</Text>
                <TextInput style={styles.menuMgmtInput} placeholder="كود الكوبون" placeholderTextColor="#666" value={newCouponCode} onChangeText={setNewCouponCode} autoCapitalize="characters" />
                <TextInput style={styles.menuMgmtInput} placeholder="نسبة الخصم (%)" placeholderTextColor="#666" keyboardType="numeric" value={newCouponDiscount} onChangeText={setNewCouponDiscount} />
                <TextInput style={styles.menuMgmtInput} placeholder="عدد مرات الاستخدام (0 = غير محدود)" placeholderTextColor="#666" keyboardType="numeric" value={newCouponMaxUses} onChangeText={setNewCouponMaxUses} />
                <TextInput style={styles.menuMgmtInput} placeholder="مرات الاستخدام لكل مستخدم (0 = غير محدود)" placeholderTextColor="#666" keyboardType="numeric" value={newCouponPerUser} onChangeText={setNewCouponPerUser} />
                <TextInput style={styles.menuMgmtInput} placeholder="تاريخ الانتهاء (YYYY-MM-DD)" placeholderTextColor="#666" value={newCouponExpiry} onChangeText={setNewCouponExpiry} />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: '#333', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }} onPress={() => { setShowAddCoupon(false); setNewCouponCode(''); setNewCouponDiscount(''); setNewCouponMaxUses(''); setNewCouponPerUser(''); setNewCouponExpiry(''); }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>إلغاء</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }} onPress={async () => {
                    if (!newCouponCode || !newCouponDiscount) { showToast('املأ الكود ونسبة الخصم'); return; }
                    try {
                      await addDoc(collection(db, 'coupons'), {
                        code: newCouponCode.toUpperCase(),
                        discount: parseInt(newCouponDiscount) || 0,
                        maxUses: parseInt(newCouponMaxUses) || 0,
                        maxPerUser: parseInt(newCouponPerUser) || 0,
                        usedBy: {},
                        expiresAt: newCouponExpiry || '',
                        currentUses: 0,
                        active: true,
                        createdAt: new Date().toISOString()
                      });
                      showToast('✅ تم إضافة الكوبون!');
                      setShowAddCoupon(false);
                      setNewCouponCode('');
                      setNewCouponDiscount('');
                      setNewCouponMaxUses('');
                      setNewCouponPerUser('');
                      setNewCouponExpiry('');
                    } catch(e) { showToast('Error: ' + e.message); }
                  }}>
                    <Text style={{ color: '#000', fontSize: 14, fontWeight: '700' }}>حفظ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <TouchableOpacity style={[styles.menuMgmtAddBtn, { marginBottom: 16, flexDirection: 'row', gap: 6 }]} onPress={() => setShowAddCoupon(true)}>
              <Ionicons name="add" size={18} color="#000" />
              <Text style={styles.menuMgmtAddBtnText}> إضافة كوبون جديد</Text>
            </TouchableOpacity>
            {coupons.length === 0 ? (
              <Text style={{ color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 }}>لا توجد كوبونات</Text>
            ) : (
              coupons.map(coupon => (
                <View key={coupon.id} style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: coupon.active !== false ? COLORS.gold : '#333', opacity: coupon.active !== false ? 1 : 0.5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.gold, letterSpacing: 1 }}>{coupon.code}</Text>
                      <View style={{ backgroundColor: COLORS.gold, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#000' }}>{coupon.discount}%</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={{ padding: 6 }} onPress={async () => {
                      try {
                        await updateDoc(doc(db, 'coupons', coupon.id), { active: coupon.active === false ? true : false });
                        showToast(coupon.active !== false ? '✅ تم تعطيل الكوبون' : '✅ تم تفعيل الكوبون');
                      } catch(e) { showToast('Error: ' + e.message); }
                    }}>
                      <Ionicons name={coupon.active !== false ? 'toggle' : 'toggle-outline'} size={28} color={coupon.active !== false ? COLORS.gold : COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 12, color: COLORS.textMuted }}>استخدام: {coupon.currentUses || 0}{coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : ''}</Text>
                    {coupon.maxPerUser > 0 && <Text style={{ fontSize: 12, color: COLORS.textMuted }}>لكل مستخدم: {coupon.maxPerUser}</Text>}
                    {coupon.expiresAt && <Text style={{ fontSize: 12, color: COLORS.textMuted }}>ينتهي: {new Date(coupon.expiresAt).toLocaleDateString('ar-SA')}</Text>}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <TouchableOpacity style={{ flex: 1, backgroundColor: '#333', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }} onPress={async () => {
                      try { await deleteDoc(doc(db, 'coupons', coupon.id)); showToast('✅ تم حذف الكوبون'); } catch(e) { showToast('Error: ' + e.message); }
                    }}>
                      <Text style={{ color: COLORS.red, fontSize: 13, fontWeight: '700' }}>حذف</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.page}>
        <View style={styles.mgmtDashboardHeader}>
          <Text style={styles.mgmtDashboardTitle}>إدارة المطعم</Text>
          <Text style={styles.mgmtDashboardSub}>اختر إحدى الأدوات</Text>
        </View>
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
          <View style={styles.mgmtCardsGrid}>
            {mgmtCards.map((card) => (
              <TouchableOpacity key={card.key} style={styles.mgmtCardNew} onPress={() => {
                if (card.key === 'orders') { setActiveTab('admin'); return; }
                setMgmtView(card.key);
              }}>
                <View style={styles.mgmtCardNewIcon}>
                  <Ionicons name={card.icon} size={24} color={COLORS.gold} />
                </View>
                <View style={styles.mgmtCardNewInfo}>
                  <Text style={styles.mgmtCardNewLabel}>{card.label}</Text>
                  <Text style={styles.mgmtCardNewDesc}>{card.desc}</Text>
                </View>
                <Ionicons name="chevron-back" size={18} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderAdmin = () => (
    <View style={styles.page}>
      <View style={styles.ordersHeader}>
        <Text style={styles.ordersTitle}>لوحة التحكم</Text>
        <Text style={styles.ordersSub}>إدارة الطلبات</Text>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        <Text style={styles.adminSectionTitle}>الطلبات ({adminOrders.length})</Text>
        {adminOrders.length === 0 ? (
          <Text style={styles.emptyOrdersText}>لا توجد طلبات</Text>
        ) : (
          <View style={styles.ordersList}>
            {adminOrders.map((order, index) => (
              <View key={index} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <Text style={styles.orderItems}>{order.name}</Text>
                  <Text style={{ color: COLORS.gold, fontWeight: '900' }}>₪{order.total}</Text>
                </View>
                <Text style={styles.orderItems}>{order.phone}</Text>
                {order.items && order.items.map((item, i) => (
                  <View key={i}>
                    <Text style={styles.orderItemSub}>• {item.name} - ₪{item.price || item.finalPrice}</Text>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <Text style={{ color: COLORS.gold, fontSize: 11, marginLeft: 10 }}>
                        + {item.selectedOptions.map(o => o.name).join(', ')}
                      </Text>
                    )}
                  </View>
                ))}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
                  <TextInput 
                    style={{ backgroundColor: '#222', color: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, width: 60, textAlign: 'center', fontSize: 14 }}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="number-pad"
                    value={orderPrepTimes[index] || ''}
                    onChangeText={(val) => setOrderPrepTimes({...orderPrepTimes, [index]: val})}
                  />
                  <Text style={{ color: '#888', fontSize: 12 }}>دقيقة</Text>
                  <TouchableOpacity style={styles.whatsappBtn} onPress={async () => { 
                  const time = orderPrepTimes[index] || 25; 
                  let timeWord = 'دقائق';
                  if (parseInt(time) === 1) timeWord = 'دقيقة';
                  else if (parseInt(time) === 2) timeWord = 'دقيقتين';
                  else if (parseInt(time) >= 3 && parseInt(time) <= 10) timeWord = 'دقائق';
                  else timeWord = 'دقيقة';
                  // Send push notification instead of WhatsApp
                  const body = `طلبك سيتم تجهيزه خلال ${time} ${timeWord} - سوبر برجر 🍔`;
                  try {
                    const res = await fetch(SERVER_URL + '/send-notification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: order.fcmToken || null, phone: order.phone, title: '📦 سوبر برجر', body })
                    });
                    const data = await res.json();
                    showToast(data.success ? '✅ تم إرسال الإشعار!' : '❌ فشل');
                  } catch(e) {
                    showToast('Error: ' + e.message);
                  }
                }}>
                    <Text style={styles.whatsappBtnText}>إرسال</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ backgroundColor: '#ff4444', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginLeft: 8 }} onPress={() => { 
                    setConfirmData({ order, action: 'end' });
                  }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>إنهاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {showAdminNotification && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>تم إشعار الزبون!</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {activeTab === 'home' && renderHome()}
      {activeTab === 'menu' && renderMenu()}
      {activeTab === 'orders' && renderOrders()}

      {activeTab === 'admin' && renderAdmin()}
      {activeTab === 'menuMgmt' && renderMenuManagement()}

      {toast !== '' && <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>}
      {notifData && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#1c1810', borderWidth: 2, borderColor: COLORS.gold }]}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="notifications" size={50} color={COLORS.gold} />
              <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.gold, marginTop: 10 }}>{notifData.title}</Text>
              <Text style={{ fontSize: 16, color: '#fff', marginTop: 15, textAlign: 'center' }}>{notifData.body}</Text>
            </View>
            <TouchableOpacity style={[styles.confirmOrderBtn, { marginTop: 20 }]} onPress={() => setNotifData(null)}>
              <Text style={styles.confirmOrderBtnText}>تم</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {confirmData && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#1c1810', borderWidth: 2, borderColor: COLORS.gold }]}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="help-circle" size={50} color={COLORS.gold} />
              <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.gold, marginTop: 10 }}>إنهاء الطلب</Text>
               <Text style={{ fontSize: 16, color: '#fff', marginTop: 15, textAlign: 'center' }}>سيتم إرسال إشعار لـ {confirmData.order.phone}؟</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: '#333', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={() => setConfirmData(null)}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: '#ff4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={async () => {
                setConfirmData(null);
                try { 
                  await updateDoc(doc(db, 'orders', confirmData.order.id), { status: 'completed', completedAt: new Date().toISOString() });
                  setAdminOrders(adminOrders.filter(o => o.id !== confirmData.order.id));
                  if (confirmData.order.fcmToken || confirmData.order.phone) {
                    const notifRes = await fetch(SERVER_URL + '/send-notification', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token: confirmData.order.fcmToken || null, phone: confirmData.order.phone || null, title: 'سوبر برجر', body: 'طلبك جاهز! تعال استلمه الآن 🍔' })
                    });
                    const notifData_result = await notifRes.json();
                    showToast(notifData_result.success ? '✅ تم إرسال الإشعار!' : '❌ فشل');
                  } else {
                    showToast('✅ تم إنهاء الطلب');
                  }
                } catch(e) { showToast('Error: ' + e.message); }
                try {
                  const userId = confirmData.order.userId;
                  if (userId) {
                    const userDoc = await getDoc(doc(db, 'users', userId));
                    const userData = userDoc.data();
                    if (userData) {
                      const currentPoints = userData.loyaltyPoints || 0;
                      const currentAwarded = userData.loyaltySpentAwarded || 0;
                      const orderPhone = confirmData.order.phone;
                      let completedTotal = confirmData.order.total || 0;
                      if (orderPhone) {
                        const ordersSnap = await getDocs(query(collection(db, 'orders'), where('phone', '==', orderPhone)));
                        let sum = 0;
                        ordersSnap.docs.forEach(d => { const d2 = d.data(); if (d2.total && d2.status === 'completed') sum += d2.total; });
                        completedTotal = Math.max(completedTotal, sum);
                      }
                      const cyclesTotal = Math.floor(completedTotal / (loyaltySettings.targetAmount || 100));
                      const cyclesAwarded = Math.floor(currentAwarded / (loyaltySettings.targetAmount || 100));
                      const newCycles = cyclesTotal - cyclesAwarded;
                      if (newCycles > 0) {
                        const pointsToAdd = newCycles * (loyaltySettings.pointsPerReward || 5);
                        const newAwardedVal = cyclesTotal * (loyaltySettings.targetAmount || 100);
                        await updateDoc(doc(db, 'users', userId), {
                          loyaltyPoints: currentPoints + pointsToAdd,
                          loyaltySpentAwarded: newAwardedVal
                        });
                      }
                    }
                  }
                } catch(e) { console.log('Loyalty award error:', e.message); }
              }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>نعم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navBtn, activeTab === 'home' && styles.navBtnActive]} onPress={() => setActiveTab('home')}>
          <Ionicons name="home" size={24} color={activeTab === 'home' ? COLORS.gold : COLORS.textMuted} />
          <Text style={[styles.navBtnText, activeTab === 'home' && styles.navBtnTextActive]}>الرئيسية</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, activeTab === 'menu' && styles.navBtnActive]} onPress={() => setActiveTab('menu')}>
          <MaterialCommunityIcons name="food-variant" size={24} color={activeTab === 'menu' ? COLORS.gold : COLORS.textMuted} />
          <Text style={[styles.navBtnText, activeTab === 'menu' && styles.navBtnTextActive]}>القائمة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, activeTab === 'orders' && styles.navBtnActive]} onPress={() => setActiveTab('orders')}>
          <Ionicons name="cart" size={24} color={activeTab === 'orders' ? COLORS.gold : COLORS.textMuted} />
          <Text style={[styles.navBtnText, activeTab === 'orders' && styles.navBtnTextActive]}>السلة</Text>
        </TouchableOpacity>

        {isAdmin && (
          <>
            <TouchableOpacity style={[styles.navBtn, activeTab === 'menuMgmt' && styles.navBtnActive]} onPress={() => setActiveTab('menuMgmt')}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={activeTab === 'menuMgmt' ? COLORS.gold : COLORS.textMuted} />
              <Text style={[styles.navBtnText, activeTab === 'menuMgmt' && styles.navBtnTextActive]}>المطعم</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navBtn, activeTab === 'admin' && styles.navBtnActive]} onPress={() => setActiveTab('admin')}>
              <Ionicons name="settings" size={24} color={activeTab === 'admin' ? COLORS.gold : COLORS.textMuted} />
              <Text style={[styles.navBtnText, activeTab === 'admin' && styles.navBtnTextActive]}>الطلبات</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {showMenuModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.menuOption} onPress={() => { setShowMenuModal(false); setActiveTab('home'); }}>
              <Ionicons name="home" size={20} color={COLORS.gold} />
              <Text style={styles.menuOptionText}>الرئيسية</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOption} onPress={() => { setShowMenuModal(false); setActiveTab('menu'); }}>
              <MaterialCommunityIcons name="food-variant" size={20} color={COLORS.gold} />
              <Text style={styles.menuOptionText}>القائمة</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuOption} onPress={() => { setShowMenuModal(false); setShowAuthModal(true); }}>
              <Ionicons name="person" size={20} color={COLORS.gold} />
              <Text style={styles.menuOptionText}>{currentUser ? `مرحباً ${currentUser.name}` : 'دخول / تسجيل'}</Text>
            </TouchableOpacity>
            {currentUser && (
              <TouchableOpacity style={styles.menuOption} onPress={() => { handleLogout(); setShowMenuModal(false); }}>
                <Ionicons name="log-out" size={20} color={COLORS.red} />
                <Text style={styles.menuOptionText}>تسجيل خروج</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowMenuModal(false)}>
              <Text style={styles.modalCloseBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showOptionsModal && selectedMenuItem && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.optionModalCard]}>
            <View style={styles.optionModalHeader}>
              <View style={styles.optionModalIconWrap}>
                <MaterialCommunityIcons name="food" size={28} color={COLORS.gold} />
              </View>
              <View style={styles.optionModalHeaderInfo}>
                <Text style={styles.optionModalHeaderTitle}>{selectedMenuItem.name}</Text>
                <Text style={styles.optionModalHeaderSub}>خصص وجبتك</Text>
              </View>
              <TouchableOpacity style={styles.optionModalCloseBtn} onPress={() => { setShowOptionsModal(false); setSelectedOptions([]); setSelectedMenuItem(null); }}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionModalScroll} showsVerticalScrollIndicator={false}>
              {selectedMenuItem.options.map((opt, idx) => {
                const isSelected = selectedOptions.some(o => o.name === opt.name);
                return (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedOptions(selectedOptions.filter(o => o.name !== opt.name));
                      } else {
                        setSelectedOptions([...selectedOptions, opt]);
                      }
                    }}
                  >
                    <View style={styles.optionItemLeft}>
                      <View style={[styles.optionCheckbox, isSelected && styles.optionCheckboxSelected]}>
                        {isSelected && <Ionicons name="checkmark" size={16} color="#000" />}
                      </View>
                      <Text style={[styles.optionItemText, isSelected && styles.optionItemTextSelected]}>{opt.name}</Text>
                    </View>
                    {opt.price > 0 && (
                      <View style={[styles.optionPriceBadge, isSelected && styles.optionPriceBadgeSelected]}>
                        <Text style={[styles.optionItemPrice, isSelected && styles.optionItemPriceSelected]}>+₪{opt.price}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.optionModalFooter}>
              <TouchableOpacity style={styles.optionCancelBtn} onPress={() => { setShowOptionsModal(false); setSelectedOptions([]); setSelectedMenuItem(null); }}>
                <Text style={styles.optionCancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
              <View style={styles.optionTotalBox}>
                <Text style={styles.optionTotalLabel}>المجموع</Text>
                <Text style={styles.optionTotalPrice}>₪{selectedMenuItem.price + selectedOptions.reduce((s, o) => s + o.price, 0)}</Text>
              </View>
              <TouchableOpacity style={styles.optionAddBtn} onPress={confirmAddWithOptions}>
                <Ionicons name="cart" size={18} color="#000" />
                <Text style={styles.optionAddBtnText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showConfirmOrderModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: '#1c1810', borderWidth: 2, borderColor: COLORS.gold }]}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="help-circle" size={50} color={COLORS.gold} />
              <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.gold, marginTop: 10 }}>تأكيد الطلب</Text>
              <Text style={{ fontSize: 16, color: '#fff', marginTop: 15, textAlign: 'center', lineHeight: 24 }}>
                هل أنت متأكد من طلبك؟{'\n'}سوف يتوجه طلبك إلى المطعم مباشرة
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: '#333', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={() => setShowConfirmOrderModal(false)}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>لا</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }} onPress={async () => {
                setShowConfirmOrderModal(false);
                await placeOrder();
              }}>
                <Text style={{ color: '#000', fontSize: 16, fontWeight: '700' }}>نعم</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showAuthModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'}</Text>
            
            {authError !== '' && (
              <View style={{ backgroundColor: 'rgba(231,76,60,0.12)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' }}>
                <Text style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>⚠ {authError}</Text>
              </View>
            )}

            {!isLoginMode && (
              <TextInput style={styles.customerInput} placeholder="الاسم" placeholderTextColor="#666" value={authName} onChangeText={(t) => { setAuthName(t); setAuthError(''); }} />
            )}
            <TextInput style={styles.customerInput} placeholder="رقم الهاتف" placeholderTextColor="#666" value={authPhone} onChangeText={(t) => { setAuthPhone(t); setAuthError(''); }} keyboardType="phone-pad" />
            <TextInput style={styles.customerInput} placeholder="كلمة المرور" placeholderTextColor="#666" value={authPassword} onChangeText={(t) => { setAuthPassword(t); setAuthError(''); }} secureTextEntry />
            
            <TouchableOpacity style={styles.confirmOrderBtn} onPress={isLoginMode ? handleLogin : handleRegister}>
              <Text style={styles.confirmOrderBtnText}>{isLoginMode ? 'دخول' : 'تسجيل'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => { setIsLoginMode(!isLoginMode); setAuthError(''); }}>
              <Text style={{ color: COLORS.gold, textAlign: 'center' }}>
                {isLoginMode ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب؟ سجل دخول'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setShowAuthModal(false); setAuthError(''); }}>
              <Text style={styles.modalCloseBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {phoneStep === 'enterPhone' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📱 تسجيل برقم الهاتف</Text>
            <Text style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>سيصلك كود عبر SMS</Text>
            {otpError !== '' && (
              <View style={{ backgroundColor: 'rgba(231,76,60,0.12)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' }}>
                <Text style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>⚠ {otpError}</Text>
                {otpError.includes('السيرفر') && (
                  <TouchableOpacity style={{ marginTop: 8 }} onPress={() => sendVerificationCode()}>
                    <Text style={{ color: COLORS.gold, textAlign: 'center', fontWeight: '700', fontSize: 13 }}>إعادة المحاولة</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <TextInput 
              style={styles.customerInput} 
              placeholder="رقم الهاتف (مثال: 0599123456)" 
              placeholderTextColor="#666" 
              value={phoneNumber} 
              onChangeText={(t) => { setPhoneNumber(t); setOtpError(''); }} 
              keyboardType="phone-pad" 
              editable={!otpSending}
            />
            <TouchableOpacity style={[styles.confirmOrderBtn, otpSending && { opacity: 0.5 }]} onPress={() => sendVerificationCode()} disabled={otpSending}>
              {otpSending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.confirmOrderBtnText}>إرسال كود التحقق</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setPhoneStep('success'); setOtpError(''); }}>
              <Text style={styles.modalCloseBtnText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {phoneStep === 'enterCode' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔢 أدخل الكود</Text>
            <Text style={{ color: '#888', textAlign: 'center', marginBottom: 16 }}>أدخل الكود المرسل لرقمك</Text>
            {otpError !== '' && (
              <View style={{ backgroundColor: 'rgba(231,76,60,0.12)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' }}>
                <Text style={{ color: '#ff6b6b', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>⚠ {otpError}</Text>
              </View>
            )}
            <TextInput 
              style={[styles.customerInput, { fontSize: 24, textAlign: 'center', letterSpacing: 8 }]} 
              placeholder="000000" 
              placeholderTextColor="#666" 
              value={verificationCode} 
              onChangeText={(t) => { setVerificationCode(t); setOtpError(''); }} 
              keyboardType="number-pad" 
              maxLength={6}
              editable={!otpSending}
            />
            <TouchableOpacity style={[styles.confirmOrderBtn, otpSending && { opacity: 0.5 }]} onPress={() => verifyCode()} disabled={otpSending}>
              {otpSending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.confirmOrderBtnText}>تحقق</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={async () => {
              setVerificationCode('');
              setOtpError('');
              await sendVerificationCode(verificationId);
            }}>
              <Text style={{ color: COLORS.gold, textAlign: 'center' }}>إعادة إرسال الكود</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setPhoneStep('success'); setOtpError(''); }}>
              <Text style={styles.modalCloseBtnText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  page: { flex: 1, backgroundColor: COLORS.bg },
  goldText: { color: COLORS.gold },
  homeHeader: { position: 'absolute', top: Platform.OS === 'ios' ? 90 : 70, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 16, paddingVertical: 8 },
  logoBox: { flexDirection: 'row', alignItems: 'center' },
  logoImg: { width: 30, height: 30, resizeMode: 'contain', marginRight: 8 },
  logoName: { fontSize: 18, fontWeight: '900', color: COLORS.gold },
  headerIcons: { flexDirection: 'row', gap: 10 },
  hicon: { width: 36, height: 36, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  hero: { height: 240, position: 'relative', justifyContent: 'flex-end', overflow: 'hidden' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  heroImage: { position: 'absolute', top: -40, left: 0, right: 0, bottom: -40, width: '100%', height: '120%' },
  heroText: { position: 'absolute', bottom: 20, right: 20, left: 20 },
  heroTag: { backgroundColor: COLORS.gold, color: '#000', fontWeight: '900', fontSize: 10, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6 },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 36 },
  heroSub: { fontSize: 12, color: '#ccc', marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 4, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#1c1810', borderWidth: 1, borderColor: '#2a2418', borderRadius: 20, padding: 14, alignItems: 'center', shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  statIconWrap: { width: 40, height: 40, backgroundColor: COLORS.gold, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statVal: { fontSize: 18, fontWeight: '900', color: COLORS.gold },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  gallerySection: { marginHorizontal: 16, marginTop: 20 },
  galleryTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'center' },
  galleryLineWrap: { alignItems: 'center', marginBottom: 16 },
  galleryLine: { width: 100, height: 2, backgroundColor: COLORS.gold, borderRadius: 1 },
  galleryRow: { flexDirection: 'row', gap: 10, height: 200 },
  galleryMain: { flex: 2 },
  galleryMainImg: { width: '100%', height: '100%', borderRadius: 16 },
  gallerySmallCol: { flex: 1, gap: 10 },
  gallerySmall: { flex: 1 },
  galleryPlaceholder: { flex: 1, backgroundColor: '#1c1810', borderRadius: 16, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  gallerySmallImg: { width: '100%', height: '100%', borderRadius: 16 },
  galleryPlaceholderSmall: { width: '100%', height: '100%', backgroundColor: '#1c1810', borderRadius: 16, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  couponPremium: { marginHorizontal: 16, marginTop: 20, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: '#2a2418', flexDirection: 'row', overflow: 'hidden' },
  couponPremiumBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 20, paddingVertical: 24, justifyContent: 'center', alignItems: 'center', minWidth: 90 },
  couponPremiumPct: { fontSize: 28, fontWeight: '900', color: COLORS.bg },
  couponPremiumOff: { fontSize: 12, fontWeight: '700', color: COLORS.bg, marginTop: 2 },
  couponPremiumInfo: { flex: 1, padding: 16, alignItems: 'flex-end' },
  couponPremiumTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 4 },
  couponPremiumDesc: { fontSize: 11, color: COLORS.textMuted, marginBottom: 12, textAlign: 'right' },
  couponPremiumCodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  couponPremiumCodeBox: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 12, paddingVertical: 8 },
  couponPremiumCode: { fontSize: 12, fontWeight: '800', color: COLORS.gold, letterSpacing: 1, textAlign: 'center' },
  couponPremiumCopy: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.gold, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  couponPremiumCopyText: { fontSize: 11, fontWeight: '800', color: COLORS.bg },

  loyaltyHow: { marginHorizontal: 16, marginTop: 20, backgroundColor: '#1c1810', borderRadius: 20, borderWidth: 1, borderColor: '#2a2418', padding: 20 },
  loyaltyHowTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 18, textAlign: 'center' },
  loyaltyHowStep: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  loyaltyHowStepNum: { width: 32, height: 32, backgroundColor: COLORS.gold, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  loyaltyHowStepNumText: { fontSize: 14, fontWeight: '900', color: COLORS.bg },
  loyaltyHowStepInfo: { flex: 1, alignItems: 'flex-end' },
  loyaltyHowStepTitle: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 2 },
  loyaltyHowStepDesc: { fontSize: 11, color: COLORS.textMuted },
  loyaltyProgressCard: { marginHorizontal: 16, marginTop: 12, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: '#2a2418', padding: 20 },
  loyaltyProgressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  loyaltyProgressRight: { alignItems: 'flex-end', flex: 1 },
  loyaltyProgressTitle: { fontSize: 16, fontWeight: '900', color: '#fff', textAlign: 'right' },
  loyaltyProgressSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, textAlign: 'right' },
  loyaltyProgressIconWrap: { width: 40, height: 40, backgroundColor: COLORS.bg, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  loyaltyProgressDivider: { height: 1, backgroundColor: '#2a2418', marginVertical: 14 },
  loyaltyProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  loyaltyProgressAmount: { alignItems: 'flex-end' },
  loyaltyProgressAmountLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  loyaltyProgressAmountVal: { fontSize: 20, fontWeight: '900', color: COLORS.gold },
  loyaltyProgressTarget: { alignItems: 'flex-end' },
  loyaltyProgressTargetLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  loyaltyProgressTargetVal: { fontSize: 20, fontWeight: '900', color: COLORS.textMuted },
  loyaltyProgressBarWrap: { marginBottom: 14, position: 'relative' },
  loyaltyProgressBg: { height: 10, backgroundColor: COLORS.bg, borderRadius: 5, overflow: 'hidden' },
  loyaltyProgressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 5 },
  loyaltyProgressDotWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: 10 },
  loyaltyProgressDot: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.gold, top: -3, marginLeft: -8, borderWidth: 2, borderColor: COLORS.bg },
  loyaltyRedeemBtn: { backgroundColor: COLORS.gold, borderRadius: 14, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  loyaltyRedeemText: { fontSize: 14, fontWeight: '800', color: COLORS.bg },
  loyaltyRemainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  loyaltyRemainText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  contactSection: { marginHorizontal: 16, marginTop: 32 },
  contactCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: '#2a2418', overflow: 'hidden' },
  contactHeader: { alignItems: 'center', marginBottom: 20 },
  contactTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 10 },
  contactLine: { width: 80, height: 2, backgroundColor: COLORS.gold, borderRadius: 1 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 14 },
  contactDivider: { height: 1, backgroundColor: '#2a2418', marginHorizontal: 16 },
  contactIconBox: { width: 44, height: 44, backgroundColor: COLORS.gold, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1, alignItems: 'flex-start' },
  contactLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  contactText: { fontSize: 15, color: '#fff', fontWeight: '600', textAlign: 'right', lineHeight: 22 },
  bannerImage: { width: 150, height: 150, resizeMode: 'cover', borderRadius: 15 },
  bannerWrap: { marginLeft: 16, marginTop: 20 },
  whySuperCard: { marginHorizontal: 16, marginTop: 20, backgroundColor: '#1c1810', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  whySuperHeader: { alignItems: 'center', marginBottom: 20 },
  whySuperTitle: { fontSize: 28, fontWeight: '700', color: '#fff' },
  whySuperLineWrap: { marginTop: 10, alignItems: 'center', width: 120, shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 },
  whySuperLine: { height: 2, backgroundColor: COLORS.gold, width: 120, borderRadius: 1 },
  whySuperFeatures: { flexDirection: 'row', justifyContent: 'center', gap: 40 },
  whySuperFeature: { alignItems: 'center' },
  whySuperFeatureText: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
  whySuperSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  cop1Container: { marginLeft: 16, marginRight: 16, marginTop: 40, backgroundColor: '#000', borderRadius: 15, padding: 16, paddingTop: 20, borderWidth: 1, borderColor: '#333', position: 'relative', overflow: 'visible' },
  cop1TextWrap: { flex: 1, marginRight: 16 },
  cop1Title: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  cop1Sub: { fontSize: 12, color: COLORS.gold },
  cop1Image: { position: 'absolute', top: -35, right: 10, width: 100, height: 100, resizeMode: 'contain' },
  sectionTitleCentered: { fontSize: 18, fontWeight: '900', color: '#fff', textAlign: 'center', marginVertical: 16 },
  promoCard: { marginHorizontal: 16, backgroundColor: COLORS.gold, borderRadius: 24, padding: 24, alignItems: 'center', overflow: 'hidden', position: 'relative', borderWidth: 3, borderColor: '#D4A017' },
  promoDisc: { position: 'absolute', left: -50, top: -50, width: 200, height: 200, resizeMode: 'contain' },
  promoShine: { position: 'absolute', top: -50, right: -50, width: 120, height: 120, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 60 },
  promoShape1: { position: 'absolute', bottom: -30, left: -30, width: 100, height: 100, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 50 },
  promoShape2: { position: 'absolute', top: 10, right: -20, width: 60, height: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 30 },
  promoEmoji: { fontSize: 56, marginBottom: 8 },
  promoTop: { fontSize: 14, fontWeight: '700', color: '#1c1810', marginBottom: 4 },
  promoMain: { fontSize: 18, fontWeight: '900', color: '#1c1810', marginBottom: 12 },
  promoBadgeRow: { flexDirection: 'row', marginBottom: 12 },
  promoBadge: { backgroundColor: '#1c1810', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 8 },
  promoBadgeText: { fontSize: 36, fontWeight: '900', color: COLORS.gold },
  promoSub: { fontSize: 11, fontWeight: '600', color: '#1c1810', marginBottom: 12, textAlign: 'center' },
  promoDecorRow: { flexDirection: 'row', gap: 16 },
  promoDecor: { fontSize: 24 },
  hero2Card: { marginHorizontal: 16, backgroundColor: '#1c1810', borderRadius: 24, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: COLORS.gold, position: 'relative', overflow: 'hidden', marginTop: 20 },
  hero2Badge: { backgroundColor: COLORS.gold, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 6, position: 'absolute', top: -1, right: 20 },
  hero2BadgeText: { fontSize: 14, fontWeight: '900', color: '#000' },
  hero2Title: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: 16, marginBottom: 4 },
  hero2Sub: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },
  hero2CodeBox: { backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.gold, flexDirection: 'row', alignItems: 'center', gap: 10 },
  hero2CodeLabel: { fontSize: 12, color: COLORS.textMuted },
  hero2Code: { fontSize: 14, fontWeight: '900', color: COLORS.gold },
  hero2Decors: { flexDirection: 'row', gap: 20, marginTop: 16 },
  whySuperSection: { paddingHorizontal: 16, alignItems: 'center' },
  whySuperImage: { width: '100%', height: 200, resizeMode: 'cover', borderRadius: 10 },
  featuresRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 20, marginBottom: 16 },
  featureCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', padding: 14, alignItems: 'center' },
  featureTitle: { fontSize: 12, fontWeight: '900', color: '#fff', marginTop: 8, textAlign: 'center' },
  featureSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
  orderNowCard: { marginHorizontal: 16, backgroundColor: COLORS.card, borderRadius: 20, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: '#2a2418', marginBottom: 16, marginTop: 20, overflow: 'hidden' },
  orderNowBgIcon: { position: 'absolute', opacity: 0.1 },
  orderNowText: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  orderNowBtn: { backgroundColor: COLORS.gold, borderRadius: 30, paddingHorizontal: 24, paddingVertical: 8 },
  orderNowBtnText: { fontSize: 12, fontWeight: '900', color: '#000' },
  searchBarInline: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, paddingHorizontal: 16 },
  searchBarInlineInput: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 6 },
  searchResultsCard: { position: 'absolute', top: 120, left: 16, right: 16, backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.goldDark, padding: 16, zIndex: 20, maxHeight: 300 },
  searchResultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  searchCloseBtn: { width: 28, height: 28, backgroundColor: COLORS.gold, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  searchResultsTitle: { fontSize: 16, fontWeight: '900', color: '#fff', textAlign: 'center' },
  searchResultsScroll: { maxHeight: 220 },
  searchResultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.bg, borderRadius: 12, padding: 12, marginBottom: 8 },
  searchResultName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  searchResultPrice: { fontSize: 14, fontWeight: '900', color: COLORS.gold },
  notifCard: { position: 'absolute', top: 70, right: 16, backgroundColor: 'rgba(28,24,16,0.9)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16, zIndex: 20, width: 250 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  notifTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  notifCloseBtn: { width: 28, height: 28, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  notifEmpty: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  couponCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: '#2a2418', borderRadius: 16, padding: 16 },
  couponTitle: { fontSize: 14, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'right' },
  couponInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couponInput: { flex: 1, backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: '#333', borderRadius: 30, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 14, textAlign: 'right' },
  couponInputError: { borderColor: COLORS.red },
  couponInputSuccess: { borderColor: COLORS.green },
  couponBtn: { backgroundColor: COLORS.gold, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 10 },
  couponBtnApplied: { backgroundColor: COLORS.green },
  couponBtnText: { fontSize: 14, fontWeight: '900', color: '#000' },
  couponSuccessText: { fontSize: 12, fontWeight: '700', color: COLORS.green, marginTop: 10, textAlign: 'right' },
  catsScroll: { paddingHorizontal: 16, marginBottom: 14 },
  catPill: { flexShrink: 0, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 30, borderWidth: 1.5, borderColor: '#333', marginRight: 8, backgroundColor: COLORS.card },
  catPillActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  catPillText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center' },
  catPillTextActive: { color: '#000' },
  menuList: { paddingHorizontal: 16, gap: 12, paddingBottom: 20 },
  menuCouponCard: { margin: 16, backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.gold },
  menuCouponTitle: { fontSize: 18, fontWeight: '700', color: COLORS.gold, textAlign: 'center', marginBottom: 14 },
  menuCouponRow: { flexDirection: 'row', gap: 10 },
  menuCouponInput: { flex: 1, backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#333' },
  menuCouponBtn: { backgroundColor: COLORS.gold, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  menuCouponBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  menuCouponSuccess: { fontSize: 13, color: COLORS.green, textAlign: 'center', marginTop: 10 },
  menuCouponError: { fontSize: 13, color: COLORS.red, textAlign: 'center', marginTop: 10 },
  menuCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: '#2a2418', borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, flexWrap: 'wrap' },
  menuCardHighlighted: { backgroundColor: '#2a2410', borderWidth: 2, borderColor: COLORS.gold, borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  menuCardImage: { width: 80, height: 80, borderRadius: 12, resizeMode: 'cover' },
  menuCardImagePlaceholder: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#2a2418', justifyContent: 'center', alignItems: 'center' },
  menuCardInfo: { flex: 1, alignItems: 'flex-end' },
  menuCardName: { fontSize: 15, fontWeight: '900', color: '#fff' },
  menuCardDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, textAlign: 'right' },
  menuCardExpanded: { backgroundColor: COLORS.bg, borderRadius: 8, padding: 8, marginTop: 8 },
  menuCardDescExpanded: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', lineHeight: 18 },
  menuCardBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  menuCardBadgeNew: { backgroundColor: COLORS.red },
  menuCardBadgeText: { fontSize: 9, fontWeight: '900', color: '#000' },
  menuCardFooter: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  menuCardPrice: { fontSize: 17, fontWeight: '900', color: COLORS.gold },
  addBtn: { width: 30, height: 30, backgroundColor: COLORS.gold, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { fontSize: 20, fontWeight: '700', color: '#000' },
  loyaltyMenuBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 8, backgroundColor: '#f0c040', borderRadius: 12, height: 30 },
  menuPageHeader: { padding: 16, paddingTop: 50 },
  menuPageTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 12, textAlign: 'center' },
  menuSearch: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.card, borderWidth: 1, borderColor: '#333', borderRadius: 30, paddingHorizontal: 16, paddingVertical: 10 },
  searchInput: { flex: 1, backgroundColor: 'transparent', color: '#fff', fontSize: 14, textAlign: 'right' },
  ordersHeader: { padding: 20, paddingTop: 50, alignItems: 'flex-end' },
  ordersTitle: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center' },
  ordersSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
  orderTabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  orderTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#333' },
  orderTabActive: { borderBottomColor: COLORS.gold },
  orderTabText: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  orderTabTextActive: { color: COLORS.gold },
  ordersList: { paddingHorizontal: 16, gap: 14, paddingBottom: 20 },
  orderCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: '#2a2418', borderRadius: 16, padding: 14 },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontSize: 13, fontWeight: '900', color: COLORS.gold },
  orderStatus: { fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusPreparing: { backgroundColor: 'rgba(245,197,24,0.15)', color: COLORS.gold },
  statusDelivered: { backgroundColor: 'rgba(39,174,96,0.15)', color: COLORS.green },
  statusCancelled: { backgroundColor: 'rgba(231,76,60,0.15)', color: COLORS.red },
  orderItems: { fontSize: 13, color: COLORS.textMuted, textAlign: 'right', lineHeight: 22 },
  orderItemSub: { fontSize: 12, color: '#888', textAlign: 'right', marginTop: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2a2418' },
  orderDate: { fontSize: 11, color: COLORS.textMuted },
  orderTotal: { fontSize: 16, fontWeight: '900', color: COLORS.gold },
  reorderBtn: { backgroundColor: COLORS.gold, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  reorderBtnText: { fontSize: 12, fontWeight: '900', color: '#000' },
  emptyOrdersText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 40 },
  customerInput: { backgroundColor: '#1c1810', borderWidth: 1, borderColor: '#333', borderRadius: 10, padding: 12, color: '#fff', fontSize: 14, marginBottom: 12, textAlign: 'right' },
  completeOrderBtn: { backgroundColor: COLORS.green, borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 10 },
  completeOrderBtnText: { fontSize: 13, fontWeight: '900', color: '#fff' },
  confirmOrderBtn: { backgroundColor: COLORS.gold, borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  adminPrepRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  adminPrepInput: { flex: 1, backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: '#333', textAlign: 'center' },
  adminPrepBtn: { backgroundColor: COLORS.gold, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  adminPrepBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },
  whatsappBtn: { backgroundColor: '#25D366', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  whatsappBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  pickImageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 12, paddingVertical: 10, marginTop: 12 },
  verifySubText: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16, marginTop: -10 },
  verifyCodeInput: { backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', borderWidth: 1, borderColor: '#333', marginBottom: 16, letterSpacing: 8 },

  confirmOrderBtnText: { fontSize: 16, fontWeight: '900', color: '#000' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 300 },
  modalCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 20, padding: 24, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 20 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1c1810', borderWidth: 1, borderColor: '#2a2418', borderRadius: 12, padding: 14, marginBottom: 12 },
  paymentOptionText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalCloseBtn: { alignItems: 'center', marginTop: 10 },
  modalCloseBtnText: { fontSize: 14, color: COLORS.textMuted },
  menuOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2a2418' },
  menuOptionText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  menuDivider: { height: 1, backgroundColor: '#333', marginVertical: 8 },
  cartOverlay: { position: 'absolute', bottom: 70, left: 16, right: 16, zIndex: 50 },
  cartBar: { backgroundColor: COLORS.gold, borderRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 32, elevation: 8 },
  cartBarTotal: { fontSize: 16, fontWeight: '900', color: '#000' },
  cartBarText: { fontSize: 14, fontWeight: '900', color: '#000' },
  cartBarInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartCount: { width: 26, height: 26, backgroundColor: '#000', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  cartCountText: { fontSize: 12, fontWeight: '900', color: COLORS.gold },
  toast: { position: 'absolute', bottom: 150, alignSelf: 'center', backgroundColor: COLORS.gold, borderWidth: 1, borderColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, zIndex: 200 },
  toastText: { fontSize: 13, fontWeight: '700', color: '#000' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, paddingBottom: 8, backgroundColor: '#0e0c0a', borderTopWidth: 1, borderTopColor: '#2a2418', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 },
  navBtn: { alignItems: 'center', paddingVertical: 8 },
  navBtnActive: {},
  navBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, marginTop: 4 },
  navBtnTextActive: { color: COLORS.gold },
  adminSectionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.gold },
  adminSectionBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  adminSectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.gold, marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  adminDivider: { height: 1, backgroundColor: '#333', marginHorizontal: 16, marginVertical: 16 },
  galleryEditLabel: { fontSize: 14, fontWeight: '700', color: COLORS.gold, marginBottom: 8, marginTop: 12 },
  galleryEditImgBox: { height: 100, backgroundColor: '#1c1810', borderRadius: 12, borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
  galleryEditImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  galleryEditText: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  optionModalCard: { maxHeight: '75%', padding: 0, overflow: 'hidden', borderWidth: 0, borderRadius: 28, backgroundColor: '#151210' },
  optionModalHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  optionModalIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#1c1810', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a2418' },
  optionModalHeaderInfo: { flex: 1, marginHorizontal: 12 },
  optionModalHeaderTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  optionModalHeaderSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  optionModalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1c1810', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2a2418' },
  optionModalScroll: { maxHeight: 240, paddingHorizontal: 16, paddingTop: 12 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#1c1810', borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#252220', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  optionItemSelected: { borderColor: COLORS.gold, backgroundColor: '#1f1a10', shadowColor: COLORS.gold, shadowOpacity: 0.08, shadowRadius: 12 },
  optionItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  optionCheckbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: '#444', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  optionCheckboxSelected: { borderColor: COLORS.gold, backgroundColor: COLORS.gold },
  optionItemText: { fontSize: 14, color: '#ccc', fontWeight: '500' },
  optionItemTextSelected: { color: '#fff', fontWeight: '700' },
  optionPriceBadge: { backgroundColor: '#111', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#2a2418' },
  optionPriceBadgeSelected: { borderColor: COLORS.gold, backgroundColor: '#1f1a10' },
  optionItemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.gold },
  optionItemPriceSelected: { color: COLORS.gold },
  optionModalFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#222' },
  optionCancelBtn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#333', backgroundColor: '#1c1810' },
  optionCancelBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  optionTotalBox: { flex: 1, alignItems: 'center' },
  optionTotalLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginBottom: 2 },
  optionTotalPrice: { fontSize: 20, fontWeight: '900', color: COLORS.gold },
  optionAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.gold, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20 },
  optionAddBtnText: { fontSize: 14, fontWeight: '900', color: '#000' },
  menuMgmtSection: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 20 },
  menuMgmtTitle: { fontSize: 18, fontWeight: '900', color: COLORS.gold, marginBottom: 16 },
  menuMgmtInput: { backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 14, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  menuMgmtCatRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  menuMgmtCatBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#333', alignItems: 'center' },
  menuMgmtCatBtnActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  menuMgmtCatBtnText: { fontSize: 13, color: COLORS.textMuted },
  menuMgmtCatBtnTextActive: { color: '#000', fontWeight: '700' },
  menuMgmtAddBtn: { backgroundColor: COLORS.gold, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  menuMgmtAddBtnText: { fontSize: 16, fontWeight: '900', color: '#000' },
  menuMgmtItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 16, marginBottom: 10, gap: 12 },
  menuMgmtItemImage: { width: 48, height: 48, borderRadius: 8, resizeMode: 'cover' },
  menuMgmtItemName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  menuMgmtItemPrice: { fontSize: 14, color: COLORS.gold },
  menuMgmtItemOptions: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  menuMgmtDeleteBtn: { padding: 8 },
  menuMgmtEditBtn: { padding: 8 },
  optionsInputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addOptionBtn: { width: 44, height: 44, backgroundColor: COLORS.gold, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  optionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  optionTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
  optionTagText: { fontSize: 12, color: '#000', fontWeight: '600' },
  ordersTitleCentered: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 20 },
  ordersSubCentered: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' },
  galleryEditDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16 },
  galleryEditHero: { width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', position: 'relative', marginBottom: 8 },
  galleryEditHeroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  galleryEditPreview: { flexDirection: 'row', gap: 8, height: 220, marginBottom: 20 },
  galleryEditMain: { flex: 2, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  galleryEditSmallCol: { flex: 1, gap: 8 },
  galleryEditSmall: { flex: 1, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  galleryEditImgFull: { width: '100%', height: '100%', resizeMode: 'cover' },
  galleryEditOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  galleryEditOverlayText: { fontSize: 12, color: '#fff', fontWeight: '700', marginTop: 4 },
  galleryEditSection: { marginBottom: 16 },
  mgmtDashboardHeader: { padding: 20, paddingTop: 50, alignItems: 'flex-end' },
  mgmtDashboardTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  mgmtDashboardSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  mgmtCardsGrid: { gap: 10 },
  mgmtCardNew: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1810', borderRadius: 16, borderWidth: 1, borderColor: '#2a2418', padding: 16, gap: 14 },
  mgmtCardNewIcon: { width: 44, height: 44, backgroundColor: COLORS.bg, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  mgmtCardNewInfo: { flex: 1, alignItems: 'flex-end' },
  mgmtCardNewLabel: { fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 2 },
  mgmtCardNewDesc: { fontSize: 11, color: COLORS.textMuted },
});