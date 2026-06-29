const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

// رابط الاتصال بالسحابة
const uri = process.env.MONGO_URI || "mongodb+srv://blackflower:<كلمة_المرور>@blackflower.vetfbrh.mongodb.net/?appName=BlackFlower";

const client = new MongoClient(uri, {
    connectTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000
});

let db;

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

// دالة البحث المرنة
app.get('/api/check', async (req, res) => {
    if (!db) {
        return res.status(503).json({ error: "قاعدة البيانات غير متاحة حالياً" });
    }
    try {
        const driverName = req.query.name;
        if (!driverName) return res.status(400).json({ error: "يجب تحديد اسم الجهاز" });

        // البحث باستخدام Regex لجعل البحث أكثر مرونة (تجاهل حالة الأحرف وتطابق جزئي)
        // هذا يحل مشكلة المسافات والرموز التي كانت تمنع التطابق الدقيق
        const driver = await db.collection('drivers').findOne({ 
            name: { $regex: driverName.trim(), $options: 'i' } 
        });

        if (driver) {
            res.json(driver);
        } else {
            res.json({ hasUpdate: false });
        }
    } catch (err) {
        console.error("خطأ أثناء البحث:", err);
        res.status(500).json({ error: "خطأ داخلي في السيرفر" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`السيرفر يعمل على المنفذ ${PORT}`));
