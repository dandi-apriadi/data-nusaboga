// Middleware to verify if the user is authenticated
export const verifyUser = async (req, res, next) => {
    // Check if user is logged in (session validation)
    if (!req.session.user_id) {
        return res.status(401).json({ msg: "Mohon login ke Akun Anda!:" + req.session });
    }

    try {
        // Dynamic import of User model
        const { User } = await import("../models/userModel.js");
        const user = await User.findOne({
            where: {
                user_id: req.session.user_id
            }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        req.user_id = user.user_id;
        req.role = user.role;

        next();
    } catch (error) {
        console.error("Error verifying user:", error); // Log error for debugging
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
}

// Middleware to restrict access to admin users only
export const adminOnly = async (req, res, next) => {
    try {
        // Dynamic import of User model
        const { User } = await import("../models/userModel.js");
        
        const user = await User.findOne({
            where: {
                user_id: req.session.user_id
            }
        });

        // If user not found, return 404
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Anda Tidak Memiliki Akses ini" }); // Forbidden access
        }

        next();
    } catch (error) {
        console.error("Error checking admin role:", error); // Log error for debugging
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
}

// Middleware untuk guest checkout (tanpa perlu login)
export const verifyGuestCheckout = (req, res, next) => {
    try {
        const { guest_nama, guest_alamat, guest_whatsapp } = req.body;
        
        // Validasi guest data
        if (!guest_nama || !guest_nama.trim()) {
            return res.status(400).json({ msg: "Nama guest wajib diisi" });
        }
        if (!guest_alamat || !guest_alamat.trim()) {
            return res.status(400).json({ msg: "Alamat guest wajib diisi" });
        }
        if (!guest_whatsapp || !guest_whatsapp.trim()) {
            return res.status(400).json({ msg: "Nomor WhatsApp guest wajib diisi" });
        }
        
        // Validasi format WhatsApp (minimal 10 digit)
        const waNumber = guest_whatsapp.replace(/\D/g, '');
        if (waNumber.length < 10) {
            return res.status(400).json({ msg: "Nomor WhatsApp tidak valid (minimal 10 digit)" });
        }
        
        // Set guest info ke request untuk digunakan di controller
        req.guest_info = {
            nama: guest_nama.trim(),
            alamat: guest_alamat.trim(),
            whatsapp: waNumber // Clean WhatsApp number (hanya angka)
        };
        
        next();
    } catch (error) {
        console.error("Error verifying guest checkout:", error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
}
