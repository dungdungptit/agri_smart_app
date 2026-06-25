const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });

// T002: Module-level session constants — generated once per app process
export const SESSION_ID = generateUUID();
const GUEST_SESSION_UUID = generateUUID();

const CMS_BASE_URL = process.env.EXPO_PUBLIC_CMS_BASE_URL;
const CMS_HEADERS = {
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_APP_SECRET}`,
    'Content-Type': 'application/json',
};

// T003: Derive user_id — phone if logged in, guest UUID otherwise
export const getEffectiveUserId = (user) => user?.phoneNumber || GUEST_SESSION_UUID;

// T004: Heartbeat ping — call every 30s while app is in foreground
export const sendPing = (user, currentPage) => {
    fetch(`${CMS_BASE_URL}/api/ping`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({
            session_id: SESSION_ID,
            user_id: getEffectiveUserId(user),
            device: require('react-native').Platform.OS,
            page: currentPage || 'home',
        }),
    }).catch(err => console.warn('[CMS] ping error:', err));
};

// T005: Pageview — call on focus of each of the 4 tracked tab screens
export const trackPageview = (user, pageName) => {
    fetch(`${CMS_BASE_URL}/api/pageview`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({
            user_id: getEffectiveUserId(user),
            page: pageName,
            device: require('react-native').Platform.OS,
        }),
    }).catch(err => console.warn('[CMS] pageview error:', err));
};

// T006: Conversation — call once per chatbot session on first message
export const trackConversation = (user) => {
    fetch(`${CMS_BASE_URL}/api/conversation`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({
            user_id: getEffectiveUserId(user),
            message_count: 0,
            type: 'agriculture',
            started_at: new Date().toISOString(),
        }),
    }).catch(err => console.warn('[CMS] conversation error:', err));
};

// T007: Diagnosis — call once per completed pest diagnosis
export const trackDiagnosis = (user, cropType, result) => {
    fetch(`${CMS_BASE_URL}/api/diagnosis`, {
        method: 'POST',
        headers: CMS_HEADERS,
        body: JSON.stringify({
            user_id: getEffectiveUserId(user),
            crop_type: cropType || undefined,
            result: result || undefined,
            diagnosed_at: new Date().toISOString(),
        }),
    }).catch(err => console.warn('[CMS] diagnosis error:', err));
};
