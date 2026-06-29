const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

// تأكد من استبدال <كلمة_المرور> بكلمة المرور الحقيقية الخاصة بك
const uri = "mongodb+srv://blackflower:<كلمة_المرور>@blackflower.vetfbrh.mongodb.net/?appName=BlackFlower";
const client = new MongoClient(uri, {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000
});

let db;

// دالة اتصال مع إعادة محاولة تلقائية
async function connectWithRetry() {
    try {
        await client.connect();
        db = client.db('DriverBoosterDB');
        console.log("تم الاتصال بـ MongoDB بنجاح.");
    } catch (err) {
        console.error("فشل الاتصال، جاري المحاولة بعد 5 ثوانٍ...", err.message);
        setTimeout(connectWithRetry, 5000);
    }
}
connectWithRetry();

app.get('/api/check', async (req, res) => {
    if (!db) {
        return res.status(503).json({ error: "قاعدة البيانات غير متاحة حالياً" });
    }
    try {
        const driverName = req.query.name;
        const driver = await db.collection('drivers').findOne({ name: driverName });
        res.json(driver || { hasUpdate: false });
    } catch (err) {
        res.status(500).json({ error: "خطأ أثناء البحث" });
    }
});

app.listen(3000, () => console.log('السيرفر يعمل على المنفذ 3000'));