// ========================================
// Cross Legends - Firebase Manager
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyB0_Kn5SBsksvxwLGz1JIUyCSJpDPX0h2Y",
    authDomain: "cross-legends.firebaseapp.com",
    projectId: "cross-legends",
    storageBucket: "cross-legends.firebasestorage.app",
    messagingSenderId: "867142787101",
    appId: "1:867142787101:web:737e0f91b3b15a19ade6f4",
    measurementId: "G-3SDYYDT28K"
};

class FirebaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
        this.currentUser = null;
    }

    // 初期化処理
    async init() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded.');
            return;
        }

        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }

        this.db = firebase.firestore();
        this.isInitialized = true;

        // 匿名認証
        try {
            const result = await firebase.auth().signInAnonymously();
            this.currentUser = result.user;
            console.log('Firebase Signed in anonymously:', this.currentUser.uid);
        } catch (error) {
            console.error('Firebase Authentication failed:', error);
        }
    }

    // クリアデータの保存
    async saveClearRecord(recordData) {
        if (!this.isInitialized || !this.currentUser) {
            console.warn('Firebase not initialized or user not signed in.');
            return;
        }

        try {
            // サーバー時刻を追加
            const data = {
                ...recordData,
                uid: this.currentUser.uid,
                clearedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // コレクションに追加
            await this.db.collection('clear_records').add(data);
            console.log('Record savec successfully!');
        } catch (error) {
            console.error('Error saving record:', error);
            throw error;
        }
    }

    // ランキングデータの取得
    async fetchLeaderboard(limit = 50) {
        if (!this.isInitialized) return [];

        try {
            // 難易度（降順） > 日時（降順） でソート
            // 複合インデックスが必要になる可能性があるが、まずはこの順序で試行
            // エラーが出る場合はコンソールのリンクからインデックスを作成する必要がある
            const snapshot = await this.db.collection('clear_records')
                .orderBy('difficulty', 'desc')
                .orderBy('clearedAt', 'desc')
                .limit(limit)
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // 日時はDateオブジェクトに変換
                if (data.clearedAt && data.clearedAt.toDate) {
                    data.clearedAt = data.clearedAt.toDate();
                }
                records.push(data);
            });

            return records;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            // インデックス未作成エラーの場合など
            return [];
        }
    }
}

// グローバルインスタンスを作成
const firebaseManager = new FirebaseManager();
