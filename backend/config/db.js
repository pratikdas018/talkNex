import dns from "node:dns/promises";
import mongoose from "mongoose";

const getMongoHost = (mongoUrl) => {
    try {
        return new URL(mongoUrl).hostname;
    } catch {
        return null;
    }
};

const connectDb = async () => {
    const mongoUrl = process.env.MONGODB_URL;

    if (!mongoUrl) {
        throw new Error("MONGODB_URL is missing in backend/.env");
    }

    const mongoHost = getMongoHost(mongoUrl);
    const baseOptions = {
        serverSelectionTimeoutMS: 10000,
        tls: true,
    };

    try {
        if (mongoUrl.startsWith("mongodb+srv://") && mongoHost) {
            const srvRecord = `_mongodb._tcp.${mongoHost}`;
            await dns.resolveSrv(srvRecord);
        }

        await mongoose.connect(mongoUrl, baseOptions);

        console.log(`Db connected at: ${mongoose.connection.host}`);
    } catch (error) {
        const message = String(error?.message || "");
        const isTlsAlert =
            message.includes("tlsv1 alert internal error") ||
            message.includes("ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR");

        // Some networks/ISPs break IPv6 TLS paths for Atlas. Retry once on IPv4.
        if (isTlsAlert) {
            await mongoose.disconnect().catch(() => {});
            await mongoose.connect(mongoUrl, { ...baseOptions, family: 4 });
            console.log(`Db connected at: ${mongoose.connection.host} (IPv4 fallback)`);
            return;
        }

        if (error?.code === "ENOTFOUND" && mongoHost) {
            throw new Error(
                `MongoDB host not found: ${mongoHost}. Update MONGODB_URL with the current Atlas URI from "Connect > Drivers".`
            );
        }
        throw error;
    }
};

export default connectDb;
